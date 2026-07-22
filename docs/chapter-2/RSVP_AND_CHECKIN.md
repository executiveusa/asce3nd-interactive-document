# Chapter 2 - RSVP & Check-in (Phase 06)

**Owner / release approver:** Jeremy
**Builder:** GLM 5.2
**Last updated:** 2026-07-21
**Status:** Backend implemented; email/SMS provider decision still pending (BLOCK-01).

---

## 1. The promise we keep out loud

> **"While supplies last. No promises."**

The RSVP is a **demand signal** that helps ASC3ND plan staffing, supplies,
and food. It is **not** a reservation, queue position, or guaranteed
haircut. Every surface that touches a family reiterates this - the API
response message, the confirmation email/SMS body, and the verify page.

This is locked in `DECISION_RECORD.md` D-005 and in the Phase 06 build
contract. Do not soften it.

---

## 2. Data flow (end to end)

```
Family browser
   |  POST /api/rsvp  (JSON, strict whitelist)
   v
api/rsvp.js  ── validate ──> Supabase RPC create_rsvp
   |                              |
   |                              +--> rsvp_registrations (RLS-protected)
   |
   +── best-effort ──> api/_lib/mailer.js
   |                       |
   |                       +--> Resend (if RESEND_API_KEY set)
   |                       +--> SMS    (if RSVP_SMS_ENABLED='true' AND provider set)
   |
   v
200 { ok, confirmation_code, is_duplicate, message }

Family email/text
   |  clicks /api/rsvp-verify?token=...  or  /api/rsvp-cancel?token=...
   v
confirm_rsvp / cancel_rsvp RPC  ──> status flip + audit push
   |
   v
200 HTML (brand-styled, anti-enumeration)

Workbook (Chapter 2, separate phase)
   |  imports api/_lib/rsvp-summary-adapter.js
   v
load_confirmed_rsvp / rsvp_summary RPCs  ──> redacted rows only
```

---

## 3. Schema (see `sql/rsvp.sql`)

Two tables, both RLS-enabled, no anon direct grants:

- **`rsvp_events`** - one row per event. Seeded with
  `d0000000-0000-0000-0000-000000000002` (Community Cuts for Kids).
  `capacity_public` is intentionally **NULL** - no public capacity promise.
  `capacity_theoretical` is 36 (internal planning only).

- **`rsvp_registrations`** - one row per family. Lifecycle tracked by the
  `rsvp_registration_status` enum:
  `NEW, NEEDS_REVIEW, ATTENDANCE_CONFIRMED, WAITLISTED, CANCELLED,
  CHECKED_IN, HAIRCUT_COMPLETED, ATTENDED_NO_HAIRCUT, NO_SHOW,
  FOLLOWUP_REQUIRED`.

  PII columns: `email`, `phone`, `phone_e164`. These never leave the table
  via any workbook-facing RPC.

  Operational handles: `confirmation_code` (e.g. `CC-AB3XK9`),
  `cancel_token` (24 random bytes hex, unguessable, used for both verify
  and cancel), `cancel_token_expires` (14 days), `verified_at`,
  `checked_in_at`, `haircut_completed_at`, `row_version` (optimistic
  concurrency), `audit` (JSONB append-only log).

---

## 4. RPCs (the single chokepoint)

All RPCs are `SECURITY DEFINER` with `SET search_path = public, pg_temp`,
and every query is pinned `WHERE event_id = p_event_id` to prevent
cross-event leakage.

| RPC | Input | Output | Notes |
|---|---|---|---|
| `create_rsvp` | 11 params | `{ok, registration_id, confirmation_code, cancel_token, is_duplicate, status}` | Idempotent merge on (event, normalized email \| phone). Returns `cancel_token` to the server only - never echoed to the browser. |
| `confirm_rsvp` | `p_cancel_token` | `{ok, status}` | `NEW` -> `ATTENDANCE_CONFIRMED`, stamps `verified_at`. Will not resurrect a `CANCELLED` row. |
| `cancel_rsvp` | `p_cancel_token` | `{ok, status}` | Any active status -> `CANCELLED`. Idempotent. |
| `load_confirmed_rsvp` | `p_event_id` | table of non-PII columns | Workbook read. **No email, no phone.** Adapter truncates to first name. |
| `rsvp_summary` | `p_event_id` | `{total, confirmed, waitlisted, cancelled, checked_in, haircuts_completed, last_updated}` | Aggregate counts. |

---

## 5. Security model

- **RLS enabled** on both tables. **No policies** = **DENY ALL** to `anon`/`authenticated`.
- The only anon-accessible paths are `SECURITY DEFINER` RPCs (bypass RLS).
- **Strict field whitelist** in `api/rsvp.js` - P0 fix for the open-notes bug class.
- **Anti-enumeration**: verify/cancel pages always return 200 HTML with neutral copy.
- **No PII in logs**: email/phone redacted to first 2 chars + `***`.

---

## 6. Verify & cancel flows (one shared token)

Both `confirm_rsvp` and `cancel_rsvp` take a single `p_cancel_token`. The
same row-level `cancel_token` is used for both actions.

Acceptable because: (1) tokens are 192 bits, not guessable; (2) delivered
only via the family's chosen channel, never in the API JSON; (3) worst
case is a self-cancel, recoverable by re-registering.

If Jeremy later wants distinct verify/cancel tokens, the schema needs a
second column (`verify_token`).

---

## 7. Duplicate-merge behavior

If a family submits twice with same email **or** normalized phone, and the
existing row is not in `CANCELLED` or `NO_SHOW`: the original row is
**updated in place** (new fields win, blanks preserve), `id`/`code`/`token`
preserved, `duplicate_resubmit` audit entry appended, `is_duplicate: true`
returned (suppresses ops alert).

If existing row is `CANCELLED` or `NO_SHOW`, a **fresh** row is inserted.

---

## 8. Notifications: provider decision gate (BLOCK-01)

- **Email**: Resend adapter active **only if** `RESEND_API_KEY` set. Else
  logs `[mailer] email_skipped` and returns `{ok:false, reason:'no_provider'}`
  without throwing. Request still returns 200.
- **SMS**: behind `RSVP_SMS_ENABLED==='true'` **AND** configured
  `RSVP_SMS_PROVIDER`. Either missing -> `{ok:false, reason:'sms_disabled'}`.
- **No invented credentials.** Stop condition BLOCK-01 active until Jeremy
  picks a provider.
- **Ops alert**: fires only on fresh registrations, only if `RSVP_OPS_EMAIL`
  configured. Payload contains no PII by construction.

---

## 9. Approved confirmation copy (LOCKED)

Every confirmation surface uses this exact paragraph. Do not reword:

> Thank you for registering for Community Cuts for Kids. Your RSVP helps
> ASC3ND plan for the event, but it does not reserve or guarantee a
> haircut. Haircuts are free, limited, and provided first come, first
> served while barber capacity lasts. Children must be present and remain
> with a parent or guardian. Backpacks, school supplies, and food are free
> while supplies last. ASC3ND will send event updates using the contact
> information you provided. Use the cancellation link or reply CANCEL to
> the confirmation text if your plans change.

The verify page additionally surfaces: **"This is interest, not a
guaranteed haircut."**

---

## 10. Check-in (operational, future phase)

The schema supports day-of check-in via `CHECKED_IN` /
`HAIRCUT_COMPLETED` / `ATTENDED_NO_HAIRCUT` statuses and timestamps. The
check-in UI lives in the workbook Stage 3 and mutates statuses via a
future authenticated RPC - never via the public `api/rsvp.js`.

---

## 11. Files in this phase

| File | Purpose |
|---|---|
| `sql/rsvp.sql` | Additive schema + RPCs + RLS. |
| `api/rsvp.js` | Public POST handler. Strict whitelist, rate limit, honeypot, CORS. |
| `api/rsvp-verify.js` | GET; `NEW` -> `ATTENDANCE_CONFIRMED`. Brand HTML, anti-enumeration. |
| `api/rsvp-cancel.js` | GET; -> `CANCELLED`. Brand HTML, anti-enumeration. |
| `api/_lib/mailer.js` | Provider adapter. Resend behind flag; SMS behind flag + provider gate. |
| `api/_lib/rsvp-summary-adapter.js` | Workbook read adapter (redacted). |
| `docs/chapter-2/DATA_CONTRACT.md` | Source-of-truth and precedence rules. |

---

## 12. Open items for Jeremy

1. **Production origin / custom domain** - currently assumed canonical Vercel URL. Override with `RSVP_PUBLIC_ORIGIN` + `RSVP_PUBLIC_BASE_URL`.
2. **Email provider** - BLOCK-01 open. Provide `RESEND_API_KEY` + `RSVP_EMAIL_FROM`.
3. **SMS provider** - gated off. Provide `RSVP_SMS_ENABLED=true` + `RSVP_SMS_PROVIDER`.
4. **Ops alert recipient** - set `RSVP_OPS_EMAIL` (verify `asc3ndcollective@gmail.com` first).
5. **Distinct verify/cancel tokens** - see §6; current single-token design matches contract.
6. **Public capacity number** - currently NULL ("no promises"). Set `rsvp_events.capacity_public` only if you choose to publish one.
