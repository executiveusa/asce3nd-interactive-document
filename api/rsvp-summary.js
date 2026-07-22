// api/rsvp-summary.js - Public read-only aggregate RSVP counts.
// Called by the workbook's Chapter 2 demand-signal panel. Returns ONLY
// aggregate numbers — no PII, no individual rows.

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

// CORS allow-list - same as api/rsvp.js
const DEFAULT_ORIGINS = ['https://asc3nd-interactive-document.vercel.app'];
function allowedOrigins() {
  const raw = process.env.RSVP_PUBLIC_ORIGIN;
  if (!raw || !raw.trim()) return DEFAULT_ORIGINS;
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

module.exports = async function handler(req, res) {
  // Aggregate counts are NOT sensitive. Cache briefly to protect the DB.
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const origin = req.headers.origin || '';
  if (origin && allowedOrigins().includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const r = await fetch(`${SUPABASE_RPC}rsvp_summary`, {
      method: 'POST',
      headers: rpcHeaders(),
      body: JSON.stringify({ p_event_id: DEFAULT_EVENT_ID }),
    });
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: 'rpc_unavailable' });
    }
    const out = await r.json();
    const s = Array.isArray(out) ? out[0] : out;
    const num = (v) => Number(v ?? 0);
    return res.status(200).json({
      ok: true,
      total:              num(s && s.total),
      confirmed:          num(s && s.confirmed),
      waitlisted:         num(s && s.waitlisted),
      cancelled:          num(s && s.cancelled),
      checked_in:         num(s && s.checked_in),
      haircuts_completed: num(s && s.haircuts_completed),
      last_updated:       (s && s.last_updated) ?? null,
    });
  } catch (err) {
    console.error('[rsvp-summary] error %s', err && err.message ? err.message : String(err));
    return res.status(502).json({ ok: false, error: 'rpc_unavailable' });
  }
};
