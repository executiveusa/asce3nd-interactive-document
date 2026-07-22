// api/rsvp.js - Phase 06 RSVP intake (Vercel serverless, Node 18+)
// Public endpoint: accepts the family RSVP form, calls create_rsvp RPC,
// dispatches best-effort notifications, returns approved copy + confirmation_code.

const { sendRsvpConfirmation, sendOpsAlert } = require('./_lib/mailer');

// -- Supabase bridge config (mirrors api/health-supabase.js, prefers env) --
const FALLBACK_RPC  = 'https://api.thepaulieffect.com/supabase/rest/v1/rpc/';
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzc2NjczLCJleHAiOjE5MzA0NTY2NzN9.rl1mc-GgpG6nQArbEfFAKOcMvzL7rrgzPFT-LlCiCy4';

const SUPABASE_RPC  = process.env.SUPABASE_RPC  || FALLBACK_RPC;
const SUPABASE_ANON = process.env.SUPABASE_ANON || FALLBACK_ANON;

// Locked event id (Phase 06 build contract).
const EVENT_ID = 'd0000000-0000-0000-0000-000000000002';

// CORS allow-list. Default-deny. Configure via RSVP_PUBLIC_ORIGIN (comma list).
const DEFAULT_ORIGINS = ['https://asc3nd-interactive-document.vercel.app'];
function allowedOrigins() {
  const raw = process.env.RSVP_PUBLIC_ORIGIN;
  if (!raw || !raw.trim()) return DEFAULT_ORIGINS;
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// Strict field whitelist. Rejects anything not listed (P0 fix for the
// "anything Asc3nd should know?" open-notes bug class).
const ALLOWED_FIELDS = new Set([
  'guardian_name',
  'email',
  'phone',
  'children_count',
  'age_range',
  'requested_service',
  'arrival_window',
  'preferred_language',
  'accessibility_contact',
  'contact_privately',
  'company_website', // honeypot: accepted, never written
]);

const AGE_RANGES      = new Set(['0-4','5-8','9-12','13-17']);
const SERVICES        = new Set(['haircut','lineup','fade','trim','unsure']);
const ARRIVAL_WINDOWS = new Set(['12-1','1-2','2-3','unsure']);
const LANGUAGES       = new Set(['en','es']);

// Approved confirmation copy - LOCKED. Do not reword.
const CONFIRMATION_MESSAGE =
  "Thank you for registering for Community Cuts for Kids. Your RSVP helps ASC3ND plan for the event, but it does not reserve or guarantee a haircut. Haircuts are free, limited, and provided first come, first served while barber capacity lasts. Children must be present and remain with a parent or guardian. Backpacks, school supplies, and food are free while supplies last. ASC3ND will send event updates using the contact information you provided. Use the cancellation link or reply CANCEL to the confirmation text if your plans change.";

// -- In-memory rate limit (per Vercel instance, IP bucket) -----------------
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RATE_MAX_HITS  = 5;
const rateBuckets = new Map();

function rateLimitHit(ip) {
  const now = Date.now();
  let b = rateBuckets.get(ip);
  if (!b || now - b.windowStart > RATE_WINDOW_MS) {
    b = { count: 0, windowStart: now };
    rateBuckets.set(ip, b);
  }
  b.count += 1;
  return b.count > RATE_MAX_HITS;
}

// -- Helpers --------------------------------------------------------------
function redact(value) {
  if (!value || typeof value !== 'string') return '***';
  return value.slice(0, 2) + '***';
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function rpcHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    'Content-Profile': 'work',
  };
}

function applyCors(res, origin) {
  if (origin && allowedOrigins().includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function validate(body) {
  const errors = [];
  for (const key of Object.keys(body || {})) {
    if (!ALLOWED_FIELDS.has(key)) errors.push({ field: key, code: 'field_not_allowed' });
  }
  if (errors.length) return { ok: false, errors };

  const guardian_name = typeof body.guardian_name === 'string' ? body.guardian_name.trim() : '';
  if (!guardian_name) errors.push({ field: 'guardian_name', code: 'required' });
  else if (guardian_name.length > 120) errors.push({ field: 'guardian_name', code: 'too_long' });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!email && !phone) errors.push({ field: 'contact', code: 'email_or_phone_required' });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push({ field: 'email', code: 'invalid' });
  if (phone && !/^[0-9+()\-.\s]{7,20}$/.test(phone)) errors.push({ field: 'phone', code: 'invalid' });

  const children_count = Number(body.children_count);
  if (!Number.isInteger(children_count) || children_count < 0 || children_count > 10) {
    errors.push({ field: 'children_count', code: 'invalid' });
  }
  if (body.age_range && !AGE_RANGES.has(body.age_range))            errors.push({ field: 'age_range', code: 'invalid' });
  if (body.requested_service && !SERVICES.has(body.requested_service)) errors.push({ field: 'requested_service', code: 'invalid' });
  if (body.arrival_window && !ARRIVAL_WINDOWS.has(body.arrival_window)) errors.push({ field: 'arrival_window', code: 'invalid' });
  if (body.preferred_language && !LANGUAGES.has(body.preferred_language)) errors.push({ field: 'preferred_language', code: 'invalid' });

  const accessibility_contact = body.accessibility_contact === true || body.accessibility_contact === 'true';
  const contact_privately     = body.contact_privately === true || body.contact_privately === 'true';

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    values: {
      guardian_name,
      email: email || null,
      phone: phone || null,
      children_count,
      age_range:          body.age_range          || null,
      requested_service:  body.requested_service  || null,
      arrival_window:     body.arrival_window     || null,
      preferred_language: body.preferred_language || 'en',
      accessibility_contact,
      contact_privately,
    },
  };
}

// -- Handler --------------------------------------------------------------
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const origin = req.headers.origin || '';
  applyCors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(origin && allowedOrigins().includes(origin) ? 204 : 403).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed', code: 'method' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(422).json({ ok: false, error: 'invalid_json', code: 'parse' });
  }

  if (body && typeof body.company_website === 'string' && body.company_website.trim() !== '') {
    return res.status(200).json({ ok: true, confirmation_code: null, message: CONFIRMATION_MESSAGE });
  }

  const ip = clientIp(req);
  if (rateLimitHit(ip)) {
    console.warn('[rsvp] rate_limited ip=%s', redact(ip));
    return res.status(429).json({ ok: false, error: 'rate_limited', code: 'rate' });
  }

  const v = validate(body);
  if (!v.ok) {
    return res.status(422).json({ ok: false, error: 'validation_failed', code: 'validation', fields: v.errors });
  }
  const vals = v.values;

  let rpcJson;
  try {
    const r = await fetch(`${SUPABASE_RPC}create_rsvp`, {
      method: 'POST',
      headers: rpcHeaders(),
      body: JSON.stringify({
        p_event_id:              EVENT_ID,
        p_guardian_name:         vals.guardian_name,
        p_email:                 vals.email,
        p_phone:                 vals.phone,
        p_children_count:        vals.children_count,
        p_age_range:             vals.age_range,
        p_requested_service:     vals.requested_service,
        p_arrival_window:        vals.arrival_window,
        p_preferred_language:    vals.preferred_language,
        p_accessibility_contact: vals.accessibility_contact,
        p_contact_privately:     vals.contact_privately,
      }),
    });
    const text = await r.text();
    try { rpcJson = JSON.parse(text); } catch { rpcJson = null; }
    if (!r.ok || !rpcJson || rpcJson.ok !== true) {
      console.error('[rsvp] rpc_failed status=%s email=%s phone=%s body=%s',
        r.status, redact(vals.email || ''), redact(vals.phone || ''), (text || '').slice(0, 200));
      return res.status(500).json({ ok: false, error: 'rpc_failed', code: 'rpc' });
    }
  } catch (err) {
    console.error('[rsvp] rpc_network_error %s', err && err.message ? err.message : String(err));
    return res.status(500).json({ ok: false, error: 'rpc_network_error', code: 'rpc' });
  }

  const confirmation_code = rpcJson.confirmation_code || null;
  const registration_id   = rpcJson.registration_id   || null;
  const cancel_token      = rpcJson.cancel_token      || null;
  const is_duplicate      = rpcJson.is_duplicate === true;

  console.log('[rsvp] saved id=%s code=%s dup=%s email=%s phone=%s',
    registration_id, confirmation_code, is_duplicate,
    redact(vals.email || ''), redact(vals.phone || ''));

  const base = process.env.RSVP_PUBLIC_BASE_URL || 'https://asc3nd-interactive-document.vercel.app';
  const verify_url = cancel_token ? `${base}/api/rsvp-verify?token=${encodeURIComponent(cancel_token)}` : null;
  const cancel_url = cancel_token ? `${base}/api/rsvp-cancel?token=${encodeURIComponent(cancel_token)}` : null;

  try {
    await sendRsvpConfirmation({
      to_email: vals.email,
      to_phone: vals.phone,
      confirmation_code,
      verify_url,
      cancel_url,
      preferred_language: vals.preferred_language,
    });
  } catch (err) {
    console.warn('[rsvp] notification_failed (non-blocking) %s',
      err && err.message ? err.message : String(err));
  }

  if (!is_duplicate) {
    try {
      await sendOpsAlert({
        to_ops_email: process.env.RSVP_OPS_EMAIL || null,
        registration_summary: {
          event: 'community-cuts-for-kids-2026',
          confirmation_code,
          children_count: vals.children_count,
          age_range: vals.age_range,
          requested_service: vals.requested_service,
          arrival_window: vals.arrival_window,
          accessibility_contact: vals.accessibility_contact,
          contact_privately: vals.contact_privately,
          preferred_language: vals.preferred_language,
        },
      });
    } catch (err) {
      console.warn('[rsvp] ops_alert_failed (non-blocking) %s',
        err && err.message ? err.message : String(err));
    }
  }

  return res.status(200).json({
    ok: true,
    confirmation_code,
    is_duplicate,
    message: CONFIRMATION_MESSAGE,
  });
};
