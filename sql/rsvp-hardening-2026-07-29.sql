-- ASC3ND RSVP hardening migration — 2026-07-29
-- Apply to the same Postgres schema that contains the existing RSVP objects.
-- Additive: creates a durable rate-limit table and new RPCs; no RSVP data is removed.

-- Durable serverless-safe rate-limit buckets --------------------------------
CREATE TABLE IF NOT EXISTS rsvp_rate_limits (
  bucket_key   TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  hit_count    INT NOT NULL CHECK (hit_count >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rsvp_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rsvp_rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION consume_rsvp_rate_limit(
  p_bucket_key TEXT,
  p_window_seconds INT DEFAULT 600,
  p_max_hits INT DEFAULT 5
) RETURNS JSONB AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_row rsvp_rate_limits%ROWTYPE;
BEGIN
  IF p_bucket_key IS NULL OR p_bucket_key !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid_rate_limit_bucket';
  END IF;
  IF p_window_seconds < 60 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'invalid_rate_limit_window';
  END IF;
  IF p_max_hits < 1 OR p_max_hits > 1000 THEN
    RAISE EXCEPTION 'invalid_rate_limit_max_hits';
  END IF;

  INSERT INTO rsvp_rate_limits AS rl (
    bucket_key, window_start, hit_count, updated_at
  ) VALUES (
    p_bucket_key, v_now, 1, v_now
  )
  ON CONFLICT (bucket_key) DO UPDATE SET
    window_start = CASE
      WHEN rl.window_start <= v_now - make_interval(secs => p_window_seconds)
        THEN v_now
      ELSE rl.window_start
    END,
    hit_count = CASE
      WHEN rl.window_start <= v_now - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE rl.hit_count + 1
    END,
    updated_at = v_now
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'allowed', v_row.hit_count <= p_max_hits,
    'remaining', GREATEST(p_max_hits - v_row.hit_count, 0),
    'reset_at', v_row.window_start + make_interval(secs => p_window_seconds)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION consume_rsvp_rate_limit(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION consume_rsvp_rate_limit(TEXT, INT, INT) TO anon, authenticated;

-- Redacted RSVP read contract v2 --------------------------------------------
-- Adds source and updated_at without changing or dropping the existing RPC.
CREATE OR REPLACE FUNCTION load_confirmed_rsvp_v2(p_event_id UUID)
RETURNS TABLE (
  guardian_name         TEXT,
  children_count        INT,
  age_range             TEXT,
  requested_service     TEXT,
  arrival_window        TEXT,
  preferred_language    TEXT,
  accessibility_contact BOOLEAN,
  status                TEXT,
  source                TEXT,
  checked_in_at         TIMESTAMPTZ,
  haircut_completed_at  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ
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
    COALESCE(NULLIF(r.source, ''), 'unknown'),
    r.checked_in_at,
    r.haircut_completed_at,
    r.created_at,
    r.updated_at
  FROM rsvp_registrations r
  WHERE r.event_id = p_event_id
    AND r.status IN (
      'ATTENDANCE_CONFIRMED',
      'CHECKED_IN',
      'HAIRCUT_COMPLETED',
      'ATTENDED_NO_HAIRCUT'
    )
  ORDER BY r.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION load_confirmed_rsvp_v2(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION load_confirmed_rsvp_v2(UUID) TO anon, authenticated;

-- Optional maintenance index for pruning/monitoring old rate buckets.
CREATE INDEX IF NOT EXISTS idx_rsvp_rate_limits_updated_at
  ON rsvp_rate_limits (updated_at);
