// api/_lib/rsvp-summary-adapter.js - read-only adapter for the workbook.
// The workbook's Chapter 2 imports this to render the RSVP Command Center.
// NEVER writes. Returns ONLY redacted rows - no email, no phone, no surname.

const FALLBACK_RPC  = 'https://api.thepaulieffect.com/supabase/rest/v1/rpc/';
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzc2NjczLCJleHAiOjE5MzA0NTY2NzN9.rl1mc-GgpG6nQArbEfFAKOcMvzL7rrgzPFT-LlCiCy4';

const SUPABASE_RPC  = process.env.SUPABASE_RPC  || FALLBACK_RPC;
const SUPABASE_ANON = process.env.SUPABASE_ANON || FALLBACK_ANON;

const DEFAULT_EVENT_ID = 'd0000000-0000-0000-0000-000000000002';

function rpcHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    'Content-Profile': 'work',
  };
}

async function callRpc(name, params) {
  const r = await fetch(`${SUPABASE_RPC}${name}`, {
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
    first_name:            redactName(r.guardian_name),
    children_count:        r.children_count ?? 0,
    age_range:             r.age_range ?? null,
    requested_service:     r.requested_service ?? null,
    arrival_window:        r.arrival_window ?? null,
    preferred_language:    r.preferred_language ?? 'en',
    accessibility_contact: !!r.accessibility_contact,
    status:                r.status ?? null,
    checked_in_at:         r.checked_in_at ?? null,
    haircut_completed_at:  r.haircut_completed_at ?? null,
    created_at:            r.created_at ?? null,
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
