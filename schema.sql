-- Central Adapta · estado compartilhado
CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS state_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  revision INTEGER NOT NULL,
  state_json TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  changed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_state_history_revision ON state_history(revision DESC);
