// api/rsvp-cancel.js - GET. Flips any active status -> CANCELLED.
// Anti-enumeration: always returns 200 HTML regardless of token validity.

const FALLBACK_RPC  = 'https://api.thepaulieffect.com/supabase/rest/v1/rpc/';
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzc2NjczLCJleHAiOjE5MzA0NTY2NzN9.rl1mc-GgpG6nQArbEfFAKOcMvzL7rrgzPFT-LlCiCy4';

const SUPABASE_RPC  = process.env.SUPABASE_RPC  || FALLBACK_RPC;
const SUPABASE_ANON = process.env.SUPABASE_ANON || FALLBACK_ANON;

function rpcHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    'Content-Profile': 'work',
  };
}

function shell({ headline, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ASC3ND - RSVP</title>
<style>
  :root { --ink:#0a0a0a; --paper:#ffffff; --muted:#6e6e73; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background:var(--paper); color:var(--ink); }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 32px 20px;
  }
  .card {
    max-width: 560px; width: 100%;
    border: 1px solid rgba(0,0,0,.10); border-radius: 14px;
    padding: clamp(24px, 5vw, 40px); background: var(--paper);
  }
  .eyebrow { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); margin: 0 0 12px; }
  h1 { font-size: clamp(22px, 4vw, 30px); line-height: 1.15; margin: 0 0 16px; font-weight: 700; color: var(--ink); }
  p { margin: 0 0 14px; font-size: 16px; color: var(--ink); }
  a { color: var(--ink); }
  .small { font-size: 13px; color: var(--muted); }
</style>
</head>
<body>
  <main class="card">
    <p class="eyebrow">ASC3ND Collective</p>
    <h1>${headline}</h1>
    ${body}
  </main>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const token = req.query && req.query.token ? String(req.query.token) : '';

  let status = null;
  if (token) {
    try {
      const r = await fetch(`${SUPABASE_RPC}cancel_rsvp`, {
        method: 'POST',
        headers: rpcHeaders(),
        body: JSON.stringify({ p_cancel_token: token }),
      });
      if (r.ok) {
        const j = await r.json();
        status = j && j.status ? j.status : null;
      }
    } catch (err) {
      console.error('[rsvp-cancel] rpc_error %s', err && err.message ? err.message : String(err));
    }
  }

  if (status === 'CANCELLED') {
    return res.status(200).send(shell({
      headline: "Your RSVP was cancelled.",
      body: `<p>We'll miss you. Reply to the confirmation email if this was a mistake.</p>`,
    }));
  }

  return res.status(200).send(shell({
    headline: "Your RSVP was cancelled.",
    body: `<p>We'll miss you. Reply to the confirmation email if this was a mistake.</p>`,
  }));
};
