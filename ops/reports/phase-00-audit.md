# Phase 00 — Current-State Audit (ASC3ND Chapter 2)

> Evidence-based. No inferences from prior speculative briefs. Every row traced to a line in `index.html`, `api/document.js`, `sql/schema.sql`, or live deployment state on 2026-07-21.

## Baseline

| Field | Value |
|---|---|
| Repo | `github.com/executiveusa/asce3nd-interactive-document` |
| Default branch | `main` |
| Baseline SHA | `e0dac26659d4df868a5ea6ae26b63eaa42f0b535` |
| Production URL | `https://asc3nd-interactive-document.vercel.app/` |
| Vercel project | `asc3nd-interactive-document` (`prj_9jk2ti63…`, team `the-pauli-effect`) |
| Latest prod deploy | Ready, 14s build, ~5h old at audit |
| Working branch | `chapter-2/grinions-build` |

## Fork/divergence
A second Vercel project `asce3nd-interactive-document` (extra 'e') exists and was deployed ~4h ago. **Deprecated.** All future deploys target the no-'e' canonical project that matches the GitHub repo name.

---

## EXISTS NOW (in deployed code)

| Item | Location | Notes |
|---|---|---|
| 6 Chapter 2 steps | `STEPS` array, index.html:905 | ch2_cover → ch2_interview → ch2_readiness → ch2_eventday → ch2_results → ch2_buildon |
| Founder interview UI | `rCh2Interview` index.html:1516 | 8 Otha Qs + 8 Elisha Qs + 4 joint + 3 pickups |
| Camera brief modal | `openCameraBrief` index.html:1585 | 7 toggle checkboxes, fused inside interview step |
| Capacity planner | `rCh2Readiness` index.html:1661 | Math.min() of constraints, manual override |
| Supplies table | index.html:1699–1706 | Backpacks/Notebooks/Pencils/Calculators |
| RSVP CRUD table | index.html:1708–1718 + 1855–1889 | Manual add/edit/delete → localStorage → Supabase |
| Staffing table (10 roles) | index.html:1720–1729 + 1892–1899 | Event Lead … Float/Escalation |
| 7 recommendation cards | index.html:1731–1756 + 1902–1920 | ACCEPT/MODIFY/DECLINE/DISCUSS |
| Event-day counters (3) | `rCh2Eventday` index.html:1923 | Families / Haircuts / Backpacks + incident notes |
| Results step | `rCh2Results` index.html:1987 | 5 metric inputs + 2 approval checkboxes |
| Learnings step | `rCh2Buildon` index.html:2046 | 5 textareas |
| Persistence layer | `saveLocal`/`queueSave`/`saveToCloud`/`loadFromCloud` index.html:930–985 | localStorage + Supabase RPC, 10s auto-save |
| Spanish i18n | `ES` dict + `t()` index.html:775; `ES_EXTRA` in api/document.js:6 | Server-side string transform injects translations |
| Vercel healthcheck | `api/health-supabase.js` | Round-trip save/load RPC test |

## BROKEN NOW (verified defects)

| ID | Defect | Evidence | Severity |
|---|---|---|---|
| B-01 | **Founder gender pronouns reversed.** Code uses `he/his/him` for Otha and `her/she` for Elisha. Truth: Otha=female, Elisha=male. | index.html:1536–1553 + ES translations in api/document.js:83–100 | P0 — factual client error |
| B-02 | **Hardcoded "Target capacity: 40"** in event-day dashboard, ignores the capacity calc on prior step. | index.html:1944 | P0 — fabricated fact |
| B-03 | **Hardcoded "Total supply: 100"** in event-day dashboard, ignores state.chapter2.supplies. | index.html:1954 | P0 — fabricated fact |
| B-04 | **RSVP is a second database.** Writes directly to workbook state; no source-of-truth adapter. Violates contract §4 "Never build a second independent RSVP database." | index.html:1878–1889 | P0 — architecture |
| B-05 | **Override buffer uses wrong field.** `bCh2Readiness` writes buffer to `overrideReason` instead of a dedicated buffer field. | index.html:1829–1830 | P1 — data integrity |

## MISSING NOW (not in code, claimed elsewhere)

| Item | Source of false claim |
|---|---|
| Event Snapshot, Truth Ledger, Responsibilities/Accountability, Run-of-Show, Venue/Guest Flow, Safety/Consent/Incident, Communications/Approvals, Readiness Gate, Case Study, Evidence/Export/Rollback | ChatGPT recovery brief described these as existing — **none are in the code** |
| Founder interview prep module (warm-up, run-order, story-spine, consent gate) | Not built |
| Color-coded readiness (GO/GO WITH LIMITS/HOLD) | Not built |
| Anton printable shot-list export | Not built (only a modal) |
| Consent capture UI (despite safetyConsent{} object existing in blank()) | Not built |
| Public event landing page | Repo not supplied |
| Email/SMS notification system | No provider credentials |

## CONFIRMED BY JEREMY (locked decisions)

1. Canonical Vercel project = `asc3nd-interactive-document` (no-'e'), `prj_9jk2ti63lLOesif9LKKhWJAl6aAr`.
2. Otha Minnifield = female. Elisha Minnifield = male.
3. Camera brief = **printable export from workbook** (not a separate Vercel project).
4. RSVP source of truth = **none exists yet** → workbook must be labeled PLANNING DATA until real system built.
5. RSVP promise = **"while supplies last, no promises"** — demand-signal/forecast only.
6. Real Tangles & Locs image is approved and must be used (Phase 03).

## CONFIRMED BY CONTRACT (event facts)

- Event: Community Cuts for Kids · "Fresh Fade, Fresh Grade"
- Date: Sunday, August 30, 2026, 12:00–15:00
- Venue: Tangles & Locs, 7425 Hardeson Rd, Everett, WA
- 5 barbers, 5 stations, 25–30 min/cut → ~30–36 theoretical cuts (NOT 40 promise)
- Free, first-come-first-served, children must be present + guardian must remain
- Supplies/food free while supplies last
- Founder interview: Friday July 24, 2026, 18:00, founder residence
- Operations email (to verify before hardcode): `asc3ndcollective@gmail.com`

## OPEN CLIENT DECISIONS

- Operations notification email final confirmation
- Email/SMS provider choice + credentials
- Public landing-page repository URL (Phase 10 blocker)
- Final public haircut cap (after capacity model runs)
- Unused-supplies destination
- Food quantities / allergen lead
- Event insurance status (currently: no identified coverage — must stay a visible risk)

## RECOMMENDED DEFAULTS (if client doesn't decide in time)

- Email provider: Resend (free tier sufficient; clean adapter)
- SMS: behind feature flag, off until Twilio creds approved
- Public cap: 30 haircuts (low end of theoretical) until Otha/Elisha approve higher
- Landing page: temporary `/event/community-cuts` route in this repo until dedicated repo supplied (with Jeremy's sign-off)

## BLOCKERS (must resolve before merge/deploy)

- BLOCK-01: Email/SMS provider credentials absent — Phase 06 stops at provider gate.
- BLOCK-02: Landing-page repo unknown — Phase 10 cannot ship.
- BLOCK-03: No event insurance identified — must remain a visible HOLD signal in readiness engine, not silently cleared.
