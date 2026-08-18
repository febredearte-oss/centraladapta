import { createRemoteJWKSet, jwtVerify } from "jose";

const jwksCache = new Map();

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

function setupResponse() {
  return new Response(`<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Central Adapta · configuração final</title>
<style>body{font-family:Arial,sans-serif;background:#f6f7f5;color:#17231d;margin:0;padding:40px}main{max-width:720px;margin:auto;background:#fff;border:1px solid #d8ded9;border-radius:16px;padding:30px}h1{font-family:Georgia,serif;font-weight:400}code{background:#eef3ef;padding:2px 6px;border-radius:5px}li{margin:10px 0}</style>
<main><h1>Central Adapta pronta para proteção</h1><p>O Worker foi publicado, mas a autenticação Cloudflare Access ainda não foi conectada.</p><ol><li>Ative <strong>Cloudflare Access</strong> para este Worker.</li><li>Copie o <strong>Application AUD</strong> e o domínio da equipe <code>https://...cloudflareaccess.com</code>.</li><li>Adicione ao Worker as variáveis <code>POLICY_AUD</code> e <code>TEAM_DOMAIN</code>.</li></ol><p>Até isso ser concluído, a Central real e os dados não são servidos.</p></main></html>`, {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
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

  // Desenvolvimento temporário: enquanto o Access ainda não foi configurado,
  // o workers.dev permanece utilizável pela equipe. Ao definir TEAM_DOMAIN e
  // POLICY_AUD, a autenticação passa automaticamente a exigir Cloudflare Access.
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

async function getState(env) {
  const row = await env.DB.prepare(
    "SELECT revision, state_json, updated_at, updated_by FROM app_state WHERE id = 1"
  ).first();

  if (!row) {
    return { state: null, revision: 0, updatedAt: null, updatedBy: null };
  }

  let state = null;
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

  if (!current) {
    if (baseRevision !== 0) {
      return json({ state: null, revision: 0 }, 409);
    }

    const now = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO app_state (id, revision, state_json, updated_at, updated_by) VALUES (1, 1, ?, ?, ?)"
    ).bind(serialized, now, actor).run();

    return json({ ok: true, revision: 1, updatedAt: now, updatedBy: actor });
  }

  const currentRevision = Number(current.revision || 0);
  if (baseRevision !== currentRevision) {
    let currentState = null;
    try { currentState = JSON.parse(current.state_json); } catch {}
    return json({
      error: "revision_conflict",
      revision: currentRevision,
      state: currentState,
      updatedAt: current.updated_at || null,
      updatedBy: current.updated_by || null,
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
    if (auth.setup) return setupResponse();
    if (!auth.ok) return unauthorizedResponse(isApi);

    if (url.pathname === "/api/session" && request.method === "GET") {
      return json({ email: auth.email });
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
