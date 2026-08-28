import baseWorker from "./worker-auto-seed.js";

const RECOVERY_KEY = "holiday_recovery_20260828_v2";
const STATUS_PATH = "/__holiday-recovery-status-20260828";
const HOLIDAY_KEYS = [
  "holidays",
  "holidayRecords",
  "holidayCommunicationTasks",
  "holidayContents",
];

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function holidaySnapshot(state) {
  const out = {};
  for (const key of HOLIDAY_KEYS) out[key] = clone(state?.[key]);
  return out;
}

function stableSnapshotJson(state) {
  return JSON.stringify(holidaySnapshot(state));
}

async function writeMeta(env, value) {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO system_meta (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind(RECOVERY_KEY, JSON.stringify(value), now).run();
}

async function readMeta(env) {
  const row = await env.DB.prepare("SELECT value FROM system_meta WHERE key = ?").bind(RECOVERY_KEY).first();
  if (!row?.value) return null;
  try { return JSON.parse(row.value); } catch { return { status: "applied" }; }
}

async function recoverHolidayState(env) {
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
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS system_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
  ]);

  const existing = await readMeta(env);
  if (existing) return existing;

  const currentRow = await env.DB.prepare(
    "SELECT revision, state_json, updated_at, updated_by FROM app_state WHERE id = 1"
  ).first();
  const previousRow = await env.DB.prepare(
    "SELECT id, revision, state_json, changed_at, changed_by FROM state_history ORDER BY id DESC LIMIT 1"
  ).first();

  if (!currentRow?.state_json || !previousRow?.state_json) {
    const result = {
      status: "no_previous_snapshot",
      currentRevision: Number(currentRow?.revision || 0),
      appliedAt: new Date().toISOString(),
    };
    await writeMeta(env, result);
    return result;
  }

  let currentState;
  let previousState;
  try {
    currentState = JSON.parse(currentRow.state_json);
    previousState = JSON.parse(previousRow.state_json);
  } catch {
    const result = { status: "invalid_snapshot", appliedAt: new Date().toISOString() };
    await writeMeta(env, result);
    return result;
  }

  const currentHolidayJson = stableSnapshotJson(currentState);
  const previousHolidayJson = stableSnapshotJson(previousState);

  if (currentHolidayJson === previousHolidayJson) {
    const result = {
      status: "identical",
      currentRevision: Number(currentRow.revision || 0),
      previousRevision: Number(previousRow.revision || 0),
      appliedAt: new Date().toISOString(),
    };
    await writeMeta(env, result);
    return result;
  }

  // The user requested recovery of the immediately previous holiday state.
  // Only holiday-related fields are replaced. Every other current field stays intact.
  const recoveredState = clone(currentState);
  const previousHoliday = holidaySnapshot(previousState);
  for (const key of HOLIDAY_KEYS) recoveredState[key] = previousHoliday[key];

  const currentRevision = Number(currentRow.revision || 0);
  const nextRevision = currentRevision + 1;
  const now = new Date().toISOString();
  const serialized = JSON.stringify(recoveredState);

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO state_history (revision, state_json, changed_at, changed_by) VALUES (?, ?, ?, ?)"
    ).bind(currentRevision, currentRow.state_json, currentRow.updated_at || now, currentRow.updated_by || "holiday-recovery:auto"),
    env.DB.prepare(
      "UPDATE app_state SET revision = ?, state_json = ?, updated_at = ?, updated_by = ? WHERE id = 1 AND revision = ?"
    ).bind(nextRevision, serialized, now, "holiday-recovery:auto", currentRevision),
    env.DB.prepare(
      "DELETE FROM state_history WHERE id NOT IN (SELECT id FROM state_history ORDER BY id DESC LIMIT 50)"
    ),
  ]);

  const result = {
    status: "restored",
    fromHistoricalRevision: Number(previousRow.revision || 0),
    previousCurrentRevision: currentRevision,
    newRevision: nextRevision,
    appliedAt: now,
  };
  await writeMeta(env, result);
  return result;
}

export default {
  async fetch(request, env, ctx) {
    let recovery;
    try {
      recovery = await recoverHolidayState(env);
    } catch (error) {
      console.error("Falha na recuperação de feriados", error);
      recovery = { status: "error", message: String(error?.message || error) };
    }

    const url = new URL(request.url);
    if (url.pathname === STATUS_PATH) {
      return new Response(JSON.stringify(recovery), {
        status: recovery.status === "error" ? 500 : 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    return baseWorker.fetch(request, env, ctx);
  },
};
