// api/_lib/rsvp-summary-adapter.js - read-only adapter for the workbook.
// The workbook's Chapter 2 imports this to render the RSVP Command Center.
// NEVER writes. Returns ONLY redacted rows - no email, no phone, no surname.

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`missing_required_env:${name}`);
  }
  return value.trim();
}

function rpcBaseUrl() {
  const raw = requiredEnv('SUPABASE_RPC');
  return raw.endsWith('/') ? raw : `${raw}/`;
}

const DEFAULT_EVENT_ID = 'd0000000-0000-0000-0000-000000000002';

function rpcHeaders() {
  const anon = requiredEnv('SUPABASE_ANON');
  return {
    'Content-Type': 'application/json',
    apikey: anon,
    Authorization: `Bearer ${anon}`,
    'Content-Profile': 'work',
  };
}

async function callRpc(name, params) {
  const r = await fetch(`${rpcBaseUrl()}${name}`, {
    method: 'POST',
    headers: rpcHeaders(),
    body: JSON.stringify(params || {}),
  });
  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`rpc_${name}_http_${r.status}: ${detail.slice(0, 200)}`);
  }
  return r.json();
}

function redactName(full) {
  if (!full || typeof full !== 'string') return '';
  return full.trim().split(/\s+/)[0];
}

async function loadConfirmed(eventId = DEFAULT_EVENT_ID) {
  const rows = await callRpc('load_confirmed_rsvp', { p_event_id: eventId });
  const list = Array.isArray(rows) ? rows : (rows ? [rows] : []);
  return list.map(r => ({
    first_name:             redactName(r.guardian_name),
    children_count:         r.children_count ?? 0,
    age_range:              r.age_range ?? null,
    requested_service:      r.requested_service ?? null,
    arrival_window:         r.arrival_window ?? null,
    preferred_language:     r.preferred_language ?? 'en',
    accessibility_contact:  !!r.accessibility_contact,
    status:                 r.status ?? null,
    source:                 r.source ?? 'unknown',
    checked_in_at:          r.checked_in_at ?? null,
    haircut_completed_at:   r.haircut_completed_at ?? null,
    created_at:             r.created_at ?? null,
    updated_at:             r.updated_at ?? null,
  }));
}

async function loadSummary(eventId = DEFAULT_EVENT_ID) {
  const out = await callRpc('rsvp_summary', { p_event_id: eventId });
  const s = Array.isArray(out) ? out[0] : out;
  const num = (v) => Number(v ?? 0);
  return {
    total:              num(s && s.total),
    confirmed:          num(s && s.confirmed),
    waitlisted:         num(s && s.waitlisted),
    cancelled:          num(s && s.cancelled),
    checked_in:         num(s && s.checked_in),
    haircuts_completed: num(s && s.haircuts_completed),
    last_updated:       (s && s.last_updated) ?? null,
  };
}

module.exports = { loadConfirmed, loadSummary, DEFAULT_EVENT_ID };
