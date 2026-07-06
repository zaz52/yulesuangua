-- Cloudflare D1 schema for the production MVP.
-- Apply with:
-- wrangler d1 execute yulesuangua-prod --file=docs/startup-mvp-schema.sql

CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  skill TEXT NOT NULL,
  title TEXT NOT NULL,
  question TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL DEFAULT '{}',
  board_json TEXT,
  reading TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consultations_client_created
  ON consultations (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_skill_created
  ON consultations (skill, created_at DESC);

CREATE TABLE IF NOT EXISTS product_events (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL DEFAULT 'anonymous',
  event_name TEXT NOT NULL,
  subject_id TEXT,
  properties_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_events_client_created
  ON product_events (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_events_name_created
  ON product_events (event_name, created_at DESC);
