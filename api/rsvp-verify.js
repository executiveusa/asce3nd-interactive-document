// api/rsvp-verify.js - GET. Flips NEW -> ATTENDANCE_CONFIRMED.
// Anti-enumeration: always returns 200 HTML regardless of token validity.

const FALLBACK_RPC  = 'https://api.thepaulieffect.com/supabase/rest/v1/rpc/';
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyNzc2NjczLCJleHAiOjE5MzA0NTY2NzN9.rl1mc-GgpG6nQArbEfFAKOcMvzL7rrgzPFT-LlCiCy4';

const SUPABASE_RPC  = process.env.SUPABASE_RPC  || FALLBACK_RPC;
const SUPABASE_ANON = process.env.SUPABASE_ANON || FALLBACK_ANON;

const CONFIRMATION_MESSAGE =
  "Thank you for registering for Community Cuts for Kids. Your RSVP helps ASC3ND plan for the event, but it does not reserve or guarantee a haircut. Haircuts are free, limited, and provided first come, first served while barber capacity lasts. Children must be present and remain with a parent or guardian. Backpacks, school supplies, and food are free while supplies last. ASC3ND will send event updates using the contact information you provided. Use the cancellation link or reply CANCEL to the confirmation text if your plans change.";

function rpcHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    'Content-Profile': 'work',
  };
}

function shell({ headline, headlineColor, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ASC3ND - RSVP</title>
<style>
  :root { --ink:#0a0a0a; --paper:#ffffff; --gold:#F5A617; --muted:#6e6e73; }
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
  h1 { font-size: clamp(22px, 4vw, 30px); line-height: 1.15; margin: 0 0 16px; font-weight: 700; color: ${headlineColor || 'var(--ink)'}; }
  p { margin: 0 0 14px; font-size: 16px; color: var(--ink); }
  .note { color: var(--muted); font-size: 14px; margin-top: 18px; padding-top: 18px; border-top: 1px solid rgba(0,0,0,.08); }
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
      const r = await fetch(`${SUPABASE_RPC}confirm_rsvp`, {
        method: 'POST',
        headers: rpcHeaders(),
        body: JSON.stringify({ p_cancel_token: token }),
      });
      if (r.ok) {
        const j = await r.json();
        status = j && j.status ? j.status : null;
      }
    } catch (err) {
      console.error('[rsvp-verify] rpc_error %s', err && err.message ? err.message : String(err));
    }
  }

  if (status === 'ATTENDANCE_CONFIRMED' || status === 'CHECKED_IN' ||
      status === 'HAIRCUT_COMPLETED'    || status === 'ATTENDED_NO_HAIRCUT') {
    return res.status(200).send(shell({
      headlineColor: 'var(--gold)',
      headline: "You're confirmed - see you August 30.",
      body: `
        <p>${CONFIRMATION_MESSAGE}</p>
        <p class="note"><strong>This is interest, not a guaranteed haircut.</strong> Haircuts are first come, first served while barber capacity lasts.</p>
        <p class="small">If your plans change, use the cancellation link from your confirmation message.</p>
      `,
    }));
  }

  if (status === 'CANCELLED') {
    return res.status(200).send(shell({
      headline: "This RSVP was already cancelled.",
      body: `<p>If this was a mistake, please re-register or contact ASC3ND.</p>`,
    }));
  }

  return res.status(200).send(shell({
    headline: "This link is invalid or has expired.",
    body: `<p>Please re-register or contact ASC3ND.</p>`,
  }));
};
