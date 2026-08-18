import { createRemoteJWKSet, jwtVerify } from "jose";
import seedPart1 from "../data/seed.part1.js";
import seedPart2 from "../data/seed.part2.js";
import seedPart3 from "../data/seed.part3.js";
import seedPart4 from "../data/seed.part4.js";

const SEED_VERSION = 1;
const jwksCache = new Map();
let seedCache = null;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function normalizeTeamDomain(value) {
  if (!value) return "";
  return value.startsWith("http://") || value.startsWith("https://")
    ? value.replace(/\/$/, "")
    : `https://${value.replace(/\/$/, "")}`;
}

function unauthorizedResponse(isApi) {
  if (isApi) return json({ error: "Acesso não autenticado pela Cloudflare Access." }, 401);
  return new Response("Acesso restrito à equipe Adapta.", {
    status: 401,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

async function authenticate(request, env) {
  const teamDomain = normalizeTeamDomain(env.TEAM_DOMAIN);
  const audience = env.POLICY_AUD;

  // Temporário: enquanto o Access ainda não estiver configurado, o workers.dev
  // permanece utilizável. Ao definir TEAM_DOMAIN + POLICY_AUD, passa a exigir login.
  if (!teamDomain || !audience) {
    return { ok: true, email: "desenvolvimento@central.local", development: true };
  }

  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return { ok: false };

  try {
    let JWKS = jwksCache.get(teamDomain);
    if (!JWKS) {
      JWKS = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
      jwksCache.set(teamDomain, JWKS);
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: teamDomain,
      audience,
    });

    if (!payload.email) return { ok: false };
    return { ok: true, email: String(payload.email).toLowerCase(), payload };
  } catch (error) {
    console.error("Access JWT inválido", error);
    return { ok: false };
  }
}

async function ensureSchema(env) {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      revision INTEGER NOT NULL DEFAULT 0,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS state_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      revision INTEGER NOT NULL,
      state_json TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      changed_by TEXT
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_state_history_revision ON state_history(revision DESC)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS system_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
  ]);
}

async function loadSeed() {
  if (seedCache) return seedCache;

  const b64 = seedPart1 + seedPart2 + seedPart3 + seedPart4;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const text = await new Response(stream).text();
  seedCache = JSON.parse(text);
  return seedCache;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function mergeById(current, initial) {
  const now = Array.isArray(current) ? current : [];
  const base = Array.isArray(initial) ? initial : [];
  const ids = new Set(now.map((item) => item && item.id).filter(Boolean));
  const missing = base.filter((item) => item && item.id && !ids.has(item.id)).map(clone);
  return now.concat(missing);
}

function repairState(current, seed) {
  const state = current && typeof current === "object" && !Array.isArray(current)
    ? clone(current)
    : {};

  state.schemaVersion = Math.max(Number(state.schemaVersion || 0), Number(seed.schemaVersion || 0));
  state.contentCatalog = mergeById(state.contentCatalog, seed.contentCatalog);
  state.lines = mergeById(state.lines, seed.lines);
  state.holidays = mergeById(state.holidays, seed.holidays);
  state.calendarEntries = mergeById(state.calendarEntries, seed.calendarEntries);

  state.items = {
    ...(seed.items && typeof seed.items === "object" ? clone(seed.items) : {}),
    ...(state.items && typeof state.items === "object" ? state.items : {}),
  };

  for (const key of ["activity", "holidayRecords", "holidayCommunicationTasks", "holidayContents"]) {
    if (!Array.isArray(state[key])) state[key] = clone(seed[key] || []);
  }

  if (!state.visualGuideHtml && seed.visualGuideHtml) state.visualGuideHtml = seed.visualGuideHtml;
  state.settings = {
    ...(seed.settings && typeof seed.settings === "object" ? clone(seed.settings) : {}),
    ...(state.settings && typeof state.settings === "object" ? state.settings : {}),
  };

  return state;
}

async function getSeedVersion(env) {
  const row = await env.DB.prepare(
    "SELECT value FROM system_meta WHERE key = 'bootstrap_seed_version'"
  ).first();
  return Number(row?.value || 0);
}

async function markSeedVersion(env, version) {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO system_meta (key, value, updated_at)
    VALUES ('bootstrap_seed_version', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind(String(version), now).run();
}

async function initializeOrRepairState(env) {
  await ensureSchema(env);

  const seedVersion = await getSeedVersion(env);
  const row = await env.DB.prepare(
    "SELECT revision, state_json, updated_at, updated_by FROM app_state WHERE id = 1"
  ).first();

  if (seedVersion >= SEED_VERSION && row) return row;

  const seed = await loadSeed();
  const now = new Date().toISOString();

  if (!row) {
    const serialized = JSON.stringify(clone(seed));
    await env.DB.prepare(
      "INSERT INTO app_state (id, revision, state_json, updated_at, updated_by) VALUES (1, 1, ?, ?, ?)"
    ).bind(serialized, now, "seed:auto").run();
    await markSeedVersion(env, SEED_VERSION);
    return {
      revision: 1,
      state_json: serialized,
      updated_at: now,
      updated_by: "seed:auto",
    };
  }

  let currentState;
  try {
    currentState = JSON.parse(row.state_json);
  } catch {
    currentState = {};
  }

  const repaired = repairState(currentState, seed);
  const serialized = JSON.stringify(repaired);
  const currentRevision = Number(row.revision || 0);
  const nextRevision = currentRevision + 1;

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO state_history (revision, state_json, changed_at, changed_by) VALUES (?, ?, ?, ?)"
    ).bind(currentRevision, row.state_json, row.updated_at || now, row.updated_by || "seed:auto"),
    env.DB.prepare(
      "UPDATE app_state SET revision = ?, state_json = ?, updated_at = ?, updated_by = ? WHERE id = 1"
    ).bind(nextRevision, serialized, now, "seed:auto"),
    env.DB.prepare(
      "DELETE FROM state_history WHERE id NOT IN (SELECT id FROM state_history ORDER BY id DESC LIMIT 50)"
    ),
  ]);

  await markSeedVersion(env, SEED_VERSION);

  return {
    revision: nextRevision,
    state_json: serialized,
    updated_at: now,
    updated_by: "seed:auto",
  };
}

async function getState(env) {
  const row = await initializeOrRepairState(env);

  let state;
  try {
    state = JSON.parse(row.state_json);
  } catch {
    throw new Error("Estado salvo no banco está inválido.");
  }

  return {
    state,
    revision: Number(row.revision || 0),
    updatedAt: row.updated_at || null,
    updatedBy: row.updated_by || null,
  };
}

async function putState(request, env, actor) {
  await initializeOrRepairState(env);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !body.state || typeof body.state !== "object") {
    return json({ error: "Estado inválido." }, 400);
  }

  const serialized = JSON.stringify(body.state);
  if (serialized.length > 1_500_000) {
    return json({ error: "O estado ultrapassou o limite de segurança de 1,5 MB." }, 413);
  }

  const baseRevision = Number(body.baseRevision || 0);
  const current = await env.DB.prepare(
    "SELECT revision, state_json, updated_at, updated_by FROM app_state WHERE id = 1"
  ).first();

  const currentRevision = Number(current?.revision || 0);
  if (!current || baseRevision !== currentRevision) {
    let currentState = null;
    try { currentState = current ? JSON.parse(current.state_json) : null; } catch {}
    return json({
      error: "revision_conflict",
      revision: currentRevision,
      state: currentState,
      updatedAt: current?.updated_at || null,
      updatedBy: current?.updated_by || null,
    }, 409);
  }

  const nextRevision = currentRevision + 1;
  const now = new Date().toISOString();

  const update = await env.DB.prepare(
    "UPDATE app_state SET revision = ?, state_json = ?, updated_at = ?, updated_by = ? WHERE id = 1 AND revision = ?"
  ).bind(nextRevision, serialized, now, actor, currentRevision).run();

  if (!update.meta?.changes) {
    const latest = await getState(env);
    return json({ error: "revision_conflict", ...latest }, 409);
  }

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO state_history (revision, state_json, changed_at, changed_by) VALUES (?, ?, ?, ?)"
    ).bind(currentRevision, current.state_json, current.updated_at || now, current.updated_by || actor),
    env.DB.prepare(
      "DELETE FROM state_history WHERE id NOT IN (SELECT id FROM state_history ORDER BY id DESC LIMIT 50)"
    ),
  ]);

  return json({ ok: true, revision: nextRevision, updatedAt: now, updatedBy: actor });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isApi = url.pathname.startsWith("/api/");

    const auth = await authenticate(request, env);
    if (!auth.ok) return unauthorizedResponse(isApi);

    if (url.pathname === "/api/session" && request.method === "GET") {
      return json({ email: auth.email, development: Boolean(auth.development) });
    }

    if (url.pathname === "/api/state" && request.method === "GET") {
      try {
        return json(await getState(env));
      } catch (error) {
        console.error(error);
        return json({ error: "Falha ao carregar a Central." }, 500);
      }
    }

    if (url.pathname === "/api/state" && request.method === "PUT") {
      try {
        return await putState(request, env, auth.email);
      } catch (error) {
        console.error(error);
        return json({ error: "Falha ao salvar a Central." }, 500);
      }
    }

    if (isApi) return json({ error: "Rota não encontrada." }, 404);
    return env.ASSETS.fetch(request);
  },
};
