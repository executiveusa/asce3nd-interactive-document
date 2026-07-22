// api/_lib/mailer.js - provider adapter for RSVP notifications.
// Best-effort: never throws into the request path. Logs redacted reasons only.

const CONFIRMATION_MESSAGE =
  "Thank you for registering for Community Cuts for Kids. Your RSVP helps ASC3ND plan for the event, but it does not reserve or guarantee a haircut. Haircuts are free, limited, and provided first come, first served while barber capacity lasts. Children must be present and remain with a parent or guardian. Backpacks, school supplies, and food are free while supplies last. ASC3ND will send event updates using the contact information you provided. Use the cancellation link or reply CANCEL to the confirmation text if your plans change.";

function hasResend() {
  return Boolean(process.env.RESEND_API_KEY);
}

// SMS is fully behind the feature flag AND a provider gate.
function smsEnabled() {
  return process.env.RSVP_SMS_ENABLED === 'true'
    && Boolean(process.env.RSVP_SMS_PROVIDER);
}

function safeLog(label, detail) {
  console.log('[mailer] %s %s', label, detail || '');
}

async function sendEmailViaResend({ to, subject, html, text }) {
  const key  = process.env.RESEND_API_KEY;
  const from = process.env.RSVP_EMAIL_FROM || 'ASC3ND RSVP <rsvp@asc3ndcollective.org>';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`resend_http_${r.status}: ${detail.slice(0, 200)}`);
  }
  return { ok: true, provider: 'resend' };
}

async function sendSmsViaProvider({ to_e164, body }) {
  // When RSVP_SMS_PROVIDER is set (e.g. 'twilio'), dispatch here.
  throw new Error('sms_provider_not_configured');
}

async function sendRsvpConfirmation({
  to_email,
  to_phone,
  confirmation_code,
  verify_url,
  cancel_url,
  preferred_language,
}) {
  const results = { email: null, sms: null };

  if (to_email) {
    if (hasResend()) {
      try {
        const subject = confirmation_code
          ? `Your ASC3ND RSVP - ${confirmation_code}`
          : 'Your ASC3ND RSVP';
        const html = [
          `<p>Thank you for registering for <strong>Community Cuts for Kids</strong>.</p>`,
          confirmation_code ? `<p>Your confirmation code: <strong>${escapeHtml(confirmation_code)}</strong></p>` : '',
          verify_url ? `<p><a href="${escapeAttr(verify_url)}">Confirm your RSVP</a></p>` : '',
          cancel_url ? `<p><a href="${escapeAttr(cancel_url)}">Cancel your RSVP</a></p>` : '',
          `<p>${escapeHtml(CONFIRMATION_MESSAGE)}</p>`,
        ].join('');
        const text = CONFIRMATION_MESSAGE +
          (verify_url ? `\n\nConfirm: ${verify_url}` : '') +
          (cancel_url ? `\nCancel: ${cancel_url}` : '');
        results.email = await sendEmailViaResend({ to: to_email, subject, html, text });
      } catch (err) {
        safeLog('email_failed', err && err.message ? err.message : String(err));
        results.email = { ok: false, reason: 'send_failed' };
      }
    } else {
      safeLog('email_skipped', 'no_provider');
      results.email = { ok: false, reason: 'no_provider' };
    }
  }

  if (to_phone) {
    if (smsEnabled()) {
      try {
        const body = [
          'ASC3ND Community Cuts for Kids - RSVP received.',
          confirmation_code ? `Code ${confirmation_code}.` : '',
          verify_url ? `Confirm: ${verify_url}` : '',
          'Reply CANCEL to cancel.',
        ].filter(Boolean).join(' ');
        results.sms = await sendSmsViaProvider({ to_e164: to_phone, body });
      } catch (err) {
        safeLog('sms_failed', err && err.message ? err.message : String(err));
        results.sms = { ok: false, reason: 'send_failed' };
      }
    } else {
      safeLog('sms_skipped', 'sms_disabled');
      results.sms = { ok: false, reason: 'sms_disabled' };
    }
  }

  return { ok: true, delivered: { email: results.email, sms: results.sms } };
}

async function sendOpsAlert({ to_ops_email, registration_summary }) {
  if (!to_ops_email) {
    safeLog('ops_alert_skipped', 'no_ops_address');
    return { ok: false, reason: 'no_ops_address' };
  }
  if (!hasResend()) {
    safeLog('ops_alert_skipped', 'no_provider');
    return { ok: false, reason: 'no_provider' };
  }
  try {
    const subject = `[ASC3ND RSVP] New registration ${registration_summary.confirmation_code || ''}`;
    const json = JSON.stringify(registration_summary, null, 2);
    const html = `<pre style="font:14px/1.5 monospace">${escapeHtml(json)}</pre>`;
    return await sendEmailViaResend({ to: to_ops_email, subject, html, text: json });
  } catch (err) {
    safeLog('ops_alert_failed', err && err.message ? err.message : String(err));
    return { ok: false, reason: 'send_failed' };
  }
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeAttr(s) { return escapeHtml(s); }

module.exports = { sendRsvpConfirmation, sendOpsAlert };
