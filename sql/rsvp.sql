-- ═══════════════════════════════════════════════════════════════════════
-- ASC3ND Chapter 2 — Phase 06 RSVP schema
-- Event: Community Cuts for Kids (Sun Aug 30, 2026, 12-3 PM PT)
-- Venue: Tangles & Locs, 7425 Hardeson Rd, Everett WA
-- ═══════════════════════════════════════════════════════════════════════
--
-- PURPOSE
--   Self-contained RSVP system. The public form posts to /api/rsvp which
--   calls these RPCs. The workbook NEVER writes here; it only READS via
--   load_confirmed_rsvp / rsvp_summary through a separate redacting adapter
--   (api/_lib/rsvp-summary-adapter.js).
--
-- ADDITIVE ONLY
--   CREATE statements only. No DROP, no ALTER of pre-existing objects.
--   All CREATEs use IF NOT EXISTS. The single DROP TRIGGER IF EXISTS below
--   only affects a trigger created by THIS migration (idempotent re-run).
--
-- IDS
--   Workbook project id : d0000000-0000-0000-0000-000000000001
--   EVENT id (this sys) : d0000000-0000-0000-0000-000000000002
--
-- SECURITY MODEL (read this before touching anything)
--   * Row Level Security (RLS) is ENABLED on every table.
--   * The anon role has NO direct grants and NO matching policies, so by
--     default Postgres DENIES all SELECT/INSERT/UPDATE/DELETE to anon.
--   * All anon access flows through SECURITY DEFINER RPCs that run as the
--     function owner (postgres) and therefore bypass RLS. These RPCs are
--     the SINGLE chokepoint for every read/write.
--   * Every RPC explicitly pins WHERE event_id = p_event_id to prevent
--     cross-event leakage via parameter injection.
--   * PII columns (email, phone, phone_e164) are NEVER returned by the
--     workbook-facing read function (load_confirmed_rsvp).
--   * The service-role key (server-side only) retains full access for
--     ops/admin tooling.
-- ═══════════════════════════════════════════════════════════════════════

-- Required extensions (idempotent) --------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid(), gen_random_bytes()

-- Enum: registration lifecycle -----------------------------------------
DO $$ BEGIN
  CREATE TYPE rsvp_registration_status AS ENUM (
    'NEW',
    'NEEDS_REVIEW',
    'ATTENDANCE_CONFIRMED',
    'WAITLISTED',
    'CANCELLED',
    'CHECKED_IN',
    'HAIRCUT_COMPLETED',
    'ATTENDED_NO_HAIRCUT',
    'NO_SHOW',
    'FOLLOWUP_REQUIRED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rsvp_events (
  id                    UUID PRIMARY KEY,
  slug                  TEXT UNIQUE,
  name                  TEXT,
  starts_at             TIMESTAMPTZ,
  timezone              TEXT DEFAULT 'America/Los_Angeles',
  capacity_theoretical  INT,
  capacity_public       INT,
  status                TEXT DEFAULT 'ACTIVE',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rsvp_registrations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id              UUID REFERENCES rsvp_events(id),
  guardian_name         TEXT NOT NULL,
  email                 TEXT,
  phone                 TEXT,
  phone_e164            TEXT,
  children_count        INT DEFAULT 0,
  age_range             TEXT,
  requested_service     TEXT,
  arrival_window        TEXT,
  preferred_language    TEXT DEFAULT 'en',
  accessibility_contact BOOLEAN DEFAULT FALSE,
  contact_privately     BOOLEAN DEFAULT FALSE,
  source                TEXT DEFAULT 'web',
  status                rsvp_registration_status NOT NULL DEFAULT 'NEW',
  confirmation_code     TEXT UNIQUE,
  cancel_token          TEXT UNIQUE,
  cancel_token_expires  TIMESTAMPTZ,
  verified_at           TIMESTAMPTZ,
  checked_in_at         TIMESTAMPTZ,
  haircut_completed_at  TIMESTAMPTZ,
  row_version           INT DEFAULT 1,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  audit                 JSONB DEFAULT '[]'
);

-- Indexes ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rsvp_reg_event_status
  ON rsvp_registrations (event_id, status);
CREATE INDEX IF NOT EXISTS idx_rsvp_reg_event_email
  ON rsvp_registrations (event_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_rsvp_reg_event_phone
  ON rsvp_registrations (event_id, phone_e164);
CREATE INDEX IF NOT EXISTS idx_rsvp_reg_confirm_code
  ON rsvp_registrations (confirmation_code);
CREATE INDEX IF NOT EXISTS idx_rsvp_reg_cancel_token
  ON rsvp_registrations (cancel_token);

-- Seed the event row (idempotent) --------------------------------------
-- capacity_public is intentionally NULL: "while supplies last, no promises".
INSERT INTO rsvp_events (
  id, slug, name, starts_at, timezone,
  capacity_theoretical, capacity_public, status
) VALUES (
  'd0000000-0000-0000-0000-000000000002',
  'community-cuts-for-kids-2026',
  'Community Cuts for Kids',
  '2026-08-30 12:00:00-07',           -- PDT (America/Los_Angeles in August)
  'America/Los_Angeles',
  36,                                  -- internal theoretical (~5 barbers x ~7 cuts)
  NULL,                                -- public capacity: never promised
  'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- updated_at + optimistic-concurrency trigger ---------------------------
CREATE OR REPLACE FUNCTION rsvp_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.row_version := COALESCE(OLD.row_version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- This DROP only ever affects the trigger created by this same migration.
DROP TRIGGER IF EXISTS trg_rsvp_reg_touch ON rsvp_registrations;
CREATE TRIGGER trg_rsvp_reg_touch
  BEFORE UPDATE ON rsvp_registrations
  FOR EACH ROW EXECUTE FUNCTION rsvp_touch_updated_at();

-- Helpers ---------------------------------------------------------------

-- 6-char base32 confirmation code: CC-XXXXXX (no I/O/0/1 to avoid confusion)
CREATE OR REPLACE FUNCTION rsvp_make_confirmation_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  s TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    s := s || substr(chars, 1 + floor(random() * char_length(chars))::INT, 1);
  END LOOP;
  RETURN 'CC-' || s;
END;
$$ LANGUAGE plpgsql;

-- Normalize/validate email -> lowercased+trimmed, or NULL if invalid.
CREATE OR REPLACE FUNCTION rsvp_normalize_email(p_email TEXT)
RETURNS TEXT AS $$
BEGIN
  IF p_email IS NULL THEN RETURN NULL; END IF;
  p_email := btrim(lower(p_email));
  IF p_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN p_email;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Normalize/validate phone -> E.164, or NULL if uncoercible.
CREATE OR REPLACE FUNCTION rsvp_normalize_phone(p_phone TEXT)
RETURNS TEXT AS $$
BEGIN
  IF p_phone IS NULL THEN RETURN NULL; END IF;
  p_phone := regexp_replace(p_phone, '[^0-9+]', '', 'g');
  IF p_phone ~ '^\+1[2-9][0-9]{8}$'              THEN RETURN p_phone; END IF;
  IF p_phone ~ '^[2-9][0-9]{9}$'                 THEN RETURN '+1' || p_phone; END IF;
  IF p_phone ~ '^1[2-9][0-9]{8}$'                THEN RETURN '+1' || substring(p_phone from 2); END IF;
  IF p_phone ~ '^\+[1-9][0-9]{6,14}$'            THEN RETURN p_phone; END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Append an audit entry to a row's audit JSONB array.
CREATE OR REPLACE FUNCTION rsvp_audit_push(p_row rsvp_registrations, p_action TEXT, p_detail JSONB DEFAULT NULL)
RETURNS JSONB AS $$
BEGIN
  RETURN p_row.audit
    || jsonb_build_array(
         jsonb_build_object(
           'at', NOW(),
           'action', p_action,
           'detail', COALESCE(p_detail, '{}'::jsonb)
         )
       );
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════
-- RPC: create_rsvp
--   Idempotent insert-or-merge on (event_id, normalized email | phone_e164).
--   Duplicates (same event + same contact, status NOT in CANCELLED/NO_SHOW)
--   UPDATE the existing row and return its id; fresh rows get new codes.
--   Returns: {ok, registration_id, confirmation_code, cancel_token,
--             is_duplicate, status}
--   cancel_token is server-only: the API never echoes it to the browser;
--   it is delivered only via the email/SMS channel through the mailer.
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION create_rsvp(
  p_event_id              UUID,
  p_guardian_name         TEXT,
  p_email                 TEXT,
  p_phone                 TEXT,
  p_children_count        INT,
  p_age_range             TEXT,
  p_requested_service     TEXT,
  p_arrival_window        TEXT,
  p_preferred_language    TEXT,
  p_accessibility_contact BOOLEAN,
  p_contact_privately     BOOLEAN
) RETURNS JSONB AS $$
DECLARE
  v_norm_email   TEXT := rsvp_normalize_email(p_email);
  v_norm_phone   TEXT := rsvp_normalize_phone(p_phone);
  v_existing     rsvp_registrations%ROWTYPE;
  v_code         TEXT;
  v_token        TEXT;
  v_status       rsvp_registration_status := 'NEW';
BEGIN
  -- 1. Event exists and is ACTIVE (cross-event injection guard)
  IF NOT EXISTS (
    SELECT 1 FROM rsvp_events
    WHERE id = p_event_id AND status = 'ACTIVE'
  ) THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'event_not_active');
  END IF;

  -- 2. Required-field validation (defense in depth; the API also enforces)
  IF p_guardian_name IS NULL OR btrim(p_guardian_name) = '' THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'guardian_name_required');
  END IF;
  IF v_norm_email IS NULL AND v_norm_phone IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'contact_required');
  END IF;
  IF p_children_count IS NULL OR p_children_count < 0 OR p_children_count > 10 THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_children_count');
  END IF;
  IF p_age_range         IS NOT NULL AND p_age_range         NOT IN ('0-4','5-8','9-12','13-17') THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_age_range');
  END IF;
  IF p_requested_service IS NOT NULL AND p_requested_service NOT IN ('haircut','lineup','fade','trim','unsure') THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_service');
  END IF;
  IF p_arrival_window    IS NOT NULL AND p_arrival_window    NOT IN ('12-1','1-2','2-3','unsure') THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_arrival_window');
  END IF;
  IF p_preferred_language IS NOT NULL AND p_preferred_language NOT IN ('en','es') THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_language');
  END IF;

  -- 3. Duplicate detection (first match wins, oldest first)
  SELECT * INTO v_existing
  FROM rsvp_registrations r
  WHERE r.event_id = p_event_id
    AND r.status NOT IN ('CANCELLED','NO_SHOW')
    AND (
      (v_norm_email IS NOT NULL AND lower(r.email) = v_norm_email)
      OR
      (v_norm_phone IS NOT NULL AND r.phone_e164 = v_norm_phone)
    )
  ORDER BY created_at ASC
  LIMIT 1;

  IF FOUND THEN
    -- Merge: keep original id/code/token, update with newly-provided fields.
    UPDATE rsvp_registrations SET
      guardian_name         = COALESCE(NULLIF(btrim(p_guardian_name), ''), guardian_name),
      email                 = COALESCE(v_norm_email, email),
      phone                 = COALESCE(p_phone, phone),
      phone_e164            = COALESCE(v_norm_phone, phone_e164),
      children_count        = COALESCE(p_children_count, children_count),
      age_range             = COALESCE(p_age_range, age_range),
      requested_service     = COALESCE(p_requested_service, requested_service),
      arrival_window        = COALESCE(p_arrival_window, arrival_window),
      preferred_language    = COALESCE(NULLIF(p_preferred_language, ''), preferred_language),
      accessibility_contact = COALESCE(p_accessibility_contact, accessibility_contact),
      contact_privately     = COALESCE(p_contact_privately, contact_privately),
      audit                 = rsvp_audit_push(v_existing, 'duplicate_resubmit',
                                jsonb_build_object('email_provided', v_norm_email IS NOT NULL,
                                                   'phone_provided', v_norm_phone IS NOT NULL))
    WHERE id = v_existing.id
    RETURNING * INTO v_existing;

    RETURN jsonb_build_object(
      'ok', TRUE,
      'registration_id',   v_existing.id,
      'confirmation_code', v_existing.confirmation_code,
      'cancel_token',      v_existing.cancel_token,
      'is_duplicate',      TRUE,
      'status',            v_existing.status::TEXT
    );
  END IF;

  -- 4. Fresh insert (with one collision-retry on the unique code/token)
  v_code  := rsvp_make_confirmation_code();
  v_token := encode(gen_random_bytes(24), 'hex');

  BEGIN
    INSERT INTO rsvp_registrations (
      event_id, guardian_name, email, phone, phone_e164,
      children_count, age_range, requested_service, arrival_window,
      preferred_language, accessibility_contact, contact_privately,
      source, status, confirmation_code, cancel_token, cancel_token_expires, audit
    ) VALUES (
      p_event_id, btrim(p_guardian_name), v_norm_email, p_phone, v_norm_phone,
      p_children_count, p_age_range, p_requested_service, p_arrival_window,
      COALESCE(NULLIF(p_preferred_language, ''), 'en'),
      COALESCE(p_accessibility_contact, FALSE),
      COALESCE(p_contact_privately, FALSE),
      'web', v_status, v_code, v_token,
      NOW() + INTERVAL '14 days',
      jsonb_build_array(jsonb_build_object('at', NOW(), 'action', 'created',
        'detail', jsonb_build_object('source','web')))
    )
    RETURNING * INTO v_existing;
  EXCEPTION WHEN unique_violation THEN
    v_code  := rsvp_make_confirmation_code();
    v_token := encode(gen_random_bytes(24), 'hex');
    INSERT INTO rsvp_registrations (
      event_id, guardian_name, email, phone, phone_e164,
      children_count, age_range, requested_service, arrival_window,
      preferred_language, accessibility_contact, contact_privately,
      source, status, confirmation_code, cancel_token, cancel_token_expires, audit
    ) VALUES (
      p_event_id, btrim(p_guardian_name), v_norm_email, p_phone, v_norm_phone,
      p_children_count, p_age_range, p_requested_service, p_arrival_window,
      COALESCE(NULLIF(p_preferred_language, ''), 'en'),
      COALESCE(p_accessibility_contact, FALSE),
      COALESCE(p_contact_privately, FALSE),
      'web', v_status, v_code, v_token,
      NOW() + INTERVAL '14 days',
      jsonb_build_array(jsonb_build_object('at', NOW(), 'action', 'created',
        'detail', jsonb_build_object('source','web','retry', TRUE)))
    )
    RETURNING * INTO v_existing;
  END;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'registration_id',   v_existing.id,
    'confirmation_code', v_existing.confirmation_code,
    'cancel_token',      v_existing.cancel_token,
    'is_duplicate',      FALSE,
    'status',            v_existing.status::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- ═══════════════════════════════════════════════════════════════════════
-- RPC: confirm_rsvp(p_cancel_token)
--   NEW -> ATTENDANCE_CONFIRMED, stamps verified_at. Idempotent.
--   Will NOT resurrect a CANCELLED row (page surfaces that state).
--   Returns {ok, status}.
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION confirm_rsvp(p_cancel_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_row rsvp_registrations%ROWTYPE;
BEGIN
  IF p_cancel_token IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_token');
  END IF;

  SELECT * INTO v_row
  FROM rsvp_registrations
  WHERE cancel_token = p_cancel_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_token');
  END IF;

  UPDATE rsvp_registrations SET
    status      = CASE WHEN status = 'CANCELLED' THEN status
                       ELSE 'ATTENDANCE_CONFIRMED' END,
    verified_at = CASE WHEN status = 'CANCELLED' THEN verified_at
                       ELSE COALESCE(verified_at, NOW()) END,
    audit       = CASE WHEN status = 'CANCELLED' THEN audit
                       ELSE rsvp_audit_push(v_row, 'confirmed') END
  WHERE id = v_row.id
  RETURNING * INTO v_row;

  RETURN jsonb_build_object('ok', TRUE, 'status', v_row.status::TEXT);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- ═══════════════════════════════════════════════════════════════════════
-- RPC: cancel_rsvp(p_cancel_token)
--   Any active status -> CANCELLED. Idempotent.
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION cancel_rsvp(p_cancel_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_row rsvp_registrations%ROWTYPE;
BEGIN
  IF p_cancel_token IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_token');
  END IF;

  SELECT * INTO v_row
  FROM rsvp_registrations
  WHERE cancel_token = p_cancel_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'invalid_token');
  END IF;

  UPDATE rsvp_registrations SET
    status = 'CANCELLED',
    audit  = rsvp_audit_push(v_row, 'cancelled')
  WHERE id = v_row.id
  RETURNING * INTO v_row;

  RETURN jsonb_build_object('ok', TRUE, 'status', v_row.status::TEXT);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- ═══════════════════════════════════════════════════════════════════════
-- RPC: load_confirmed_rsvp(p_event_id)
--   Workbook-facing READ. Returns ONLY redacted, non-PII columns for rows
--   in active/attended states. NO email, NO phone, NO contact details.
--   guardian_name is returned in full; the JS adapter truncates to first
--   name at the boundary (see api/_lib/rsvp-summary-adapter.js).
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION load_confirmed_rsvp(p_event_id UUID)
RETURNS TABLE (
  guardian_name        TEXT,
  children_count       INT,
  age_range            TEXT,
  requested_service    TEXT,
  arrival_window       TEXT,
  preferred_language   TEXT,
  accessibility_contact BOOLEAN,
  status               TEXT,
  checked_in_at        TIMESTAMPTZ,
  haircut_completed_at TIMESTAMPTZ,
  created_at           TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.guardian_name,
    r.children_count,
    r.age_range,
    r.requested_service,
    r.arrival_window,
    r.preferred_language,
    r.accessibility_contact,
    r.status::TEXT,
    r.checked_in_at,
    r.haircut_completed_at,
    r.created_at
  FROM rsvp_registrations r
  WHERE r.event_id = p_event_id
    AND r.status IN ('ATTENDANCE_CONFIRMED','CHECKED_IN','HAIRCUT_COMPLETED','ATTENDED_NO_HAIRCUT')
  ORDER BY r.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- ═══════════════════════════════════════════════════════════════════════
-- RPC: rsvp_summary(p_event_id)
--   Aggregate counts for the workbook Command Center.
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION rsvp_summary(p_event_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total       INT;
  v_confirmed   INT;
  v_waitlisted  INT;
  v_cancelled   INT;
  v_checked_in  INT;
  v_haircuts    INT;
  v_last        TIMESTAMPTZ;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'ATTENDANCE_CONFIRMED'),
    COUNT(*) FILTER (WHERE status = 'WAITLISTED'),
    COUNT(*) FILTER (WHERE status = 'CANCELLED'),
    COUNT(*) FILTER (WHERE status IN ('CHECKED_IN','HAIRCUT_COMPLETED','ATTENDED_NO_HAIRCUT')),
    COUNT(*) FILTER (WHERE status = 'HAIRCUT_COMPLETED'),
    MAX(updated_at)
  INTO v_total, v_confirmed, v_waitlisted, v_cancelled,
       v_checked_in, v_haircuts, v_last
  FROM rsvp_registrations
  WHERE event_id = p_event_id;

  RETURN jsonb_build_object(
    'total',              COALESCE(v_total, 0),
    'confirmed',          COALESCE(v_confirmed, 0),
    'waitlisted',         COALESCE(v_waitlisted, 0),
    'cancelled',          COALESCE(v_cancelled, 0),
    'checked_in',         COALESCE(v_checked_in, 0),
    'haircuts_completed', COALESCE(v_haircuts, 0),
    'last_updated',       v_last
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- ═══════════════════════════════════════════════════════════════════════
-- Row Level Security
--   ENABLED on every table. No policies are defined, so the anon and
--   authenticated roles are DENIED all direct access (RLS default-deny).
--   All anon access MUST go through the SECURITY DEFINER RPCs above,
--   which execute as the function owner and bypass RLS.
--   The service-role key (server-side only) retains full access.
-- ═══════════════════════════════════════════════════════════════════════
ALTER TABLE rsvp_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_registrations ENABLE ROW LEVEL SECURITY;

-- End of rsvp.sql
