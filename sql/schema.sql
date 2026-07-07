-- ASC3ND COLLECTIVE × Macs Digital Media
-- Supabase SQL Migration
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- ── CLIENTS TABLE ──
-- Tracks Macs Digital Media clients. Each client can have multiple workbooks.

CREATE TABLE IF NOT EXISTS clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  email       TEXT DEFAULT '',
  org_name    TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  notes       TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);

-- ── WORKBOOKS TABLE ──

CREATE TABLE IF NOT EXISTS workbooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL DEFAULT 'ASC3ND Workbook',
  state       JSONB NOT NULL DEFAULT '{}',
  lang        TEXT NOT NULL DEFAULT 'en',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  TEXT NOT NULL DEFAULT 'Macs Digital Media',
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  is_public   BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_workbooks_slug ON workbooks(slug);
CREATE INDEX IF NOT EXISTS idx_workbooks_client ON workbooks(client_id);
CREATE INDEX IF NOT EXISTS idx_workbooks_updated ON workbooks(updated_at DESC);

-- Enable Row Level Security (optional — API key access is simpler for this use case)
-- ALTER TABLE workbooks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- ── SEED: Insert ASC3ND as a client ──
INSERT INTO clients (name, slug, org_name, notes)
VALUES (
  'ASC3ND COLLECTIVE',
  'asc3nd-collective',
  'ASC3ND COLLECTIVE',
  'Client since 2025 | 90-Day Social Presence Builder | $2,450 total ($995 down + 3×$485)'
)
ON CONFLICT (slug) DO NOTHING;