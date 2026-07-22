# Chapter 2 - Data Contract (Phase 06)

**Owner / release approver:** Jeremy
**Builder:** GLM 5.2
**Last updated:** 2026-07-21

This contract governs where data lives, who writes it, who reads it, and
what wins when sources disagree. Authority for the Phase 06 RSVP backend
and the workbook read side that will follow.

---

## 1. Source of truth

```
PUBLIC FORM  ──>  /api/rsvp  ──>  Supabase RPC (create_rsvp)
                                          |
                                          v
                                 rsvp_registrations  (RLS-protected)
                                          |
              ┌───────────────────────────┴───────────────────────────┐
              v                                                       v
   load_confirmed_rsvp RPC                                  rsvp_summary RPC
              \                                                     /
               `---------  api/_lib/rsvp-summary-adapter  ---------'
                                          |
                                          v
                          Workbook Chapter 2 (Command Center)
```

- **Writes happen in exactly one place:** the public form, via
  `/api/rsvp`, via the `create_rsvp` RPC. No other path inserts or
  updates `rsvp_registrations`.
- **The workbook never writes registrations.** It imports
  `api/_lib/rsvp-summary-adapter.js` and reads redacted rows + aggregate
  counts.
- **Chapter 1 is immutable.** Its `blank()` keys and 17 steps are frozen
  (D-007). This contract adds Chapter 2 surfaces only.

---

## 2. State precedence

When two sources disagree, the resolution order is fixed:

1. **Server truth** (Supabase `rsvp_registrations`) - authoritative.
2. **Local cache** (browser / workbook `localStorage`) - display only.
3. **Defaults** (hardcoded fallbacks in the workbook) - last resort.

A stale local cache may **never** overwrite newer server data.

This mirrors the Phase 02 state contract: **server truth > local cache >
defaults**. Visible sync states required: Saved / Saving / Offline-cached /
Sync failed / Conflict-requires-review / Last-updated timestamp.

---

## 3. No-PII-in-workbook rule

The workbook never sees, stores, or renders:

- email
- phone (any form)
- `cancel_token`
- full guardian surname (adapter truncates to first name)
- audit JSONB
- raw timestamps beyond `checked_in_at`, `haircut_completed_at`,
  `created_at`

`load_confirmed_rsvp` enforces this at the DB boundary. The adapter
enforces it again at the JS boundary (`first_name` only). The camera
operator especially must never see readable RSVP records - locked in
AGENTS.md §8.4.

---

## 4. Field dictionary (workbook-visible)

| Field | Type | Source | Notes |
|---|---|---|---|
| `first_name` | string | `load_confirmed_rsvp.guardian_name` (truncated) | First token only. |
| `children_count` | int 0-10 | `rsvp_registrations.children_count` | |
| `age_range` | enum | `0-4`/`5-8`/`9-12`/`13-17`/null | |
| `requested_service` | enum | `haircut`/`lineup`/`fade`/`trim`/`unsure`/null | |
| `arrival_window` | enum | `12-1`/`1-2`/`2-3`/`unsure`/null | |
| `preferred_language` | enum | `en`/`es` | Default `en`. |
| `accessibility_contact` | bool | | Family asked to be contacted about accessibility. |
| `status` | enum | `rsvp_registration_status` | Workbook sees only confirmed/attended states. |
| `checked_in_at` | timestamptz / null | | Set day-of by future check-in RPC. |
| `haircut_completed_at` | timestamptz / null | | Set day-of by future check-in RPC. |
| `created_at` | timestamptz | | RSVP received timestamp. |

Aggregate counts from `rsvp_summary`:
`total, confirmed, waitlisted, cancelled, checked_in, haircuts_completed,
last_updated`.

---

## 5. Lifecycle & state transitions

```
                       create_rsvp
                            |
                            v
                         NEW
                          |  \
              confirm_rsvp |   \ cancel_rsvp
                          v    \
              ATTENDANCE_CONFIRMED \
                          |        v
              (day-of)    |     CANCELLED
              check-in    |
                          v
                     CHECKED_IN
                          |
              (barber done)|
                          v
                  HAIRCUT_COMPLETED

   also possible: ATTENDED_NO_HAIRCUT, NO_SHOW, NEEDS_REVIEW,
                  WAITLISTED, FOLLOWUP_REQUIRED
```

- `create_rsvp` is idempotent on `(event_id, normalized email | phone)`;
  resubmissions **merge** into the existing row and return
  `is_duplicate: true`.
- A `CANCELLED` row is **not** resurrected by `confirm_rsvp`.
- Re-registering after cancel inserts a **fresh** row.

---

## 6. Identity & IDs

| Constant | Value | Purpose |
|---|---|---|
| Workbook project id | `d0000000-0000-0000-0000-000000000001` | Existing workbook persistence. Unchanged. |
| Event id (this system) | `d0000000-0000-0000-0000-000000000002` | Phase 06 RSVP event. Pinned in `api/rsvp.js` and seeded in `rsvp_events`. |

The two IDs are deliberately different. Do not collapse them.

---

## 7. Backwards compatibility

- Chapter 1 keys in `blank()` are unchanged. Storage key `asc3nd-wb-v3` unchanged.
- The existing `save_submission` / `load_submission` RPCs and
  `api/health-supabase.js`, `api/document.js`, `api/workbook.js`,
  `sql/schema.sql`, `index.html`, `vercel.json`, `AGENTS.md`,
  `package.json` are **not modified** by Phase 06.
- `sql/rsvp.sql` is additive only: CREATE statements with IF NOT EXISTS;
  no DROP/ALTER of pre-existing objects. Re-running is safe.

---

## 8. Failure modes

| Scenario | Behavior |
|---|---|
| Supabase RPC network error | `/api/rsvp` returns 500 `rpc_network_error`. Family sees retry prompt. |
| RPC returns `ok:false` | 500 with RPC error code; no PII in body. |
| Email provider missing | Mailer returns `no_provider`; request still 200; `email_skipped` logged. |
| SMS disabled | Mailer returns `sms_disabled`; request still 200. |
| Rate limit (5 / 10 min / IP) | 429 `rate_limited`. Per-instance; documented limitation. |
| Honeypot tripped | 200 with no write; indistinguishable from success to the bot. |
| Invalid/expired verify or cancel token | 200 HTML neutral copy; never 4xx; anti-enumeration. |
| Workbook read fails | Adapter throws; workbook surfaces "Sync failed" and falls back to last cache. |

---

## 9. Change protocol for this contract

Any change to §1-§3 (source of truth, precedence, no-PII rule) requires
Jeremy's written approval and a new entry in `DECISION_RECORD.md`. Field
dictionary additions (§4) require a schema migration review but not
re-approval of this contract.
