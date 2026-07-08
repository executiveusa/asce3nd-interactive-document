-- ASC3ND COLLECTIVE × Macs Digital Media
-- No database needed. The workbook uses URL hash encoding for sharing.
-- State is embedded in the URL: #state=<base64-encoded-json>
-- This schema is only for reference if you want to add a database later.

-- Optional: Run this in Supabase SQL Editor to enable cloud sync
-- See: https://supabase.com/dashboard/project/_/sql/new

CREATE TABLE IF NOT EXISTS workbooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL DEFAULT 'ASC3ND Workbook',
  state       JSONB NOT NULL DEFAULT '{}',
  lang        TEXT NOT NULL DEFAULT 'en',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  TEXT NOT NULL DEFAULT 'Macs Digital Media',
  is_public   BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_workbooks_slug ON workbooks(slug);