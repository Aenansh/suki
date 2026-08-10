/** Verbatim from CLAUDE.md §5 — the locked schema. Do not add columns without updating the doc. */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS user (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  daily_limit_g         REAL    NOT NULL DEFAULT 25,
  goal                  TEXT,
  onboarding_complete   INTEGER NOT NULL DEFAULT 0,
  notifications_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_time         TEXT,
  suki_points           REAL    NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS day_log (
  date                  TEXT    PRIMARY KEY,  -- YYYY-MM-DD
  points_earned         REAL    NOT NULL DEFAULT 0,
  recovery_option       TEXT,                 -- 'tighter_tomorrow'|'activity'|'reset'|NULL
  points_locked         INTEGER NOT NULL DEFAULT 0,
  recovery_modal_shown  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entry (
  id                    TEXT    PRIMARY KEY,  -- UUID
  date                  TEXT    NOT NULL,
  timestamp             TEXT    NOT NULL,     -- ISO 8601
  food_name             TEXT,
  quantity_description  TEXT,                 -- "2 pieces", "250g"
  sugar_g               REAL    NOT NULL,
  sugar_g_source        TEXT    NOT NULL,     -- 'ai_estimated'|'user_entered'|'photo'|'manual_fallback'
  source                TEXT    NOT NULL,     -- 'smart_log'|'photo'|'redeemed'|'manual_fallback'
  redeemed_treat        TEXT,
  FOREIGN KEY (date) REFERENCES day_log(date)
);

CREATE INDEX IF NOT EXISTS idx_entry_date ON entry(date);

CREATE TABLE IF NOT EXISTS frequent_pick (
  food_name             TEXT    PRIMARY KEY,
  log_count             INTEGER NOT NULL DEFAULT 1,
  last_quantity_used    TEXT,
  last_sugar_g          REAL
);

CREATE TABLE IF NOT EXISTS badge (
  badge_id              TEXT    PRIMARY KEY,
  unlocked_at           TEXT
);

CREATE TABLE IF NOT EXISTS streak (
  id                        INTEGER PRIMARY KEY DEFAULT 1,
  current_streak            INTEGER NOT NULL DEFAULT 0,
  last_logged_date          TEXT,
  grace_days_used_this_week INTEGER NOT NULL DEFAULT 0,
  week_start_date           TEXT
);
`;
