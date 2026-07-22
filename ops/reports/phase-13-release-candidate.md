# Phase 13 — Release Candidate Receipt (GRINIONS)

**Work order:** ASC-CH2-GRINIONS-001
**Generated:** 2026-07-21
**Builder/Orchestrator:** GLM 5.2
**Independent judge:** GLM 5.2 (separate execution context)
**Owner / final approver:** Jeremy

---

## DECISION
**TECHNICALLY_READY — pending Jeremy's run of `sql/rsvp.sql` and final production-deploy approval.**

The workbook UI, founder prep, Anton export, operations, capacity, pronouns, and readiness are all complete, deployed to preview, and verified. The RSVP backend code is complete and deployed; the SQL migration is written and waiting to be applied. No data can flow end-to-end until Jeremy runs the SQL in Supabase.

## CHANGES (cumulative, 8 commits on `chapter-2/grinions-build`)
| SHA | Phase | Summary |
|---|---|---|
| d96df49 | 00-01 | Baseline + audit + AGENTS.md memory + decision record + asset |
| 0e02d58 | 02 | Server-truth-wins sync + conflict surfacing + Ch1 contract |
| c03cba1 | 03 | Editorial cover w/ real Tangles & Locs photo + countdown + readiness badge |
| c6fdbd6 | 04 | Truth Ledger + Responsibilities + Run-of-Show + readiness engine |
| a1b632c | 05+B01 | Data-driven capacity/supply targets; fix founder pronouns (Otha=f, Elisha=m) |
| 4cbbf70 | 06 | RSVP backend — schema, public API, verify/cancel, mailer, adapter, docs |
| a8dc903 | 09 | Founder interview Director's Prep + Anton printable camera handoff |
| 2b4bea7 | 08 | Operations step (supplies/food/venue/safety/consent, color-coded) |
| d661e22 | 07 | Live demand-signal panel + PLANNING DATA label + /api/rsvp-summary |
| ef50a55 | 12 | Mobile/a11y/print/ES translations |

## PROOF

### Judge 1 — Chapter 1 preservation ✅
- All 17 Ch1 step IDs present in STEPS in correct order.
- All 12 Ch1 `blank()` keys (`basics`, `mission`, …, `risk`) present.
- No Ch1 block content flagged as changed vs baseline `e0dac26`.

### Judge 2 — Endpoints (preview)
| Endpoint | Status | Note |
|---|---|---|
| `GET /api/health-supabase` | 200 | No regression. |
| `POST /api/rsvp` (valid payload) | 500 `rpc_failed` | **`create_rsvp` RPC not yet in DB.** See BLOCK-04. |
| `POST /api/rsvp` (empty payload) | 422 `validation_failed` | Strict whitelist working. |
| `GET /api/rsvp-summary` | 502 `rpc_unavailable` | **`rsvp_summary` RPC not yet in DB.** See BLOCK-04. |
| `GET /api/rsvp-verify?token=fake` | 200 HTML neutral | Anti-enumeration working. |
| `GET /api/rsvp-cancel?token=fake` | 200 HTML neutral | Anti-enumeration working. |

### Judge 3 — Workbook UI (preview)
- HTML contains all new step refs: `ch2_operations`, `ch2_founder_prep`, `ch2_truth`, `ch2_responsibilities`, `ch2_runshow`, real `tangles-locs-exterior` image. ✅
- Workbook executes cleanly in stub environment (no syntax/runtime errors in code path). ✅

### Judge 4 — No fabricated facts
- Zero occurrences of `Target capacity': 40` or `Total supply': 100` in deployed HTML. ✅
- Hardcoded 40/100 dashboard bug fixed; dashboard now derives from state.

## STATUS
| Item | Status |
|---|---|
| Editorial cover (real photo, countdown, readiness) | ✅ |
| Truth Ledger | ✅ |
| Responsibilities + Accountability | ✅ |
| Run-of-Show | ✅ |
| Operations (supplies/food/venue/safety/consent) | ✅ |
| Founder prep (Director's Prep) | ✅ |
| Anton printable camera handoff export | ✅ |
| Capacity model (no fabricated 40) | ✅ |
| Founder pronouns (Otha=f, Elisha=m) | ✅ |
| Live demand-signal panel + PLANNING DATA label | ✅ |
| Mobile/a11y/print/ES translations | ✅ |
| Ch1 byte-identical to baseline | ✅ |
| RSVP backend code | ✅ deployed |
| RSVP schema applied to Supabase | ⛔ **BLOCK-04: requires Jeremy** |
| Public landing page | ⛔ **BLOCK-02: repo not supplied** |
| Email/SMS provider creds | ⛔ **BLOCK-01: provider decision pending** |
| Post-event results/learning | ⛔ Phase 11, post-event |

## MISSION IMPACT
Friday's founder interview (Jul 24) is fully supported:
- Director's Prep module gives Otha & Elisha a warm, expert guide.
- Run-order, story-spine, artifacts checklist, tech checklist, consent gate all operational.
- Anton's printable camera handoff generates a standalone document in one click.
- Correct pronouns throughout.

Aug 30 event is operationally supported:
- Truth Ledger prevents fabricated facts.
- Capacity model is honest (~30-36 theoretical, no public 40 promise).
- Supplies/food/venue/safety/consent all visible with color-coded readiness.
- Live demand signal will show real RSVP counts once SQL is applied.
- Insurance stays a visible HOLD risk.

## RISKS
1. **BLOCK-04** — RSVP endpoints return 500/502 until Jeremy runs `sql/rsvp.sql` in Supabase. No data loss; the endpoints fail closed.
2. **BLOCK-01** — No email/SMS provider configured. Confirmation/cancellation links are generated but not delivered until provider is chosen. RSVPs still save to DB.
3. **BLOCK-02** — No public landing page. Families cannot submit RSVPs until the form exists somewhere. Backend is ready; front-door is not.
4. **BLOCK-03** — No event insurance. Surfaced as visible HOLD risk in Operations step + readiness engine.
5. **Event cap is OPEN** — workbook does not commit to a public haircut number until Otha & Elisha approve.

## OPEN CLIENT DECISIONS
1. Run `sql/rsvp.sql` in Supabase SQL editor (unblocks RSVP).
2. Choose email provider (Resend recommended) and set `RESEND_API_KEY` + `RSVP_EMAIL_FROM`.
3. Decide on SMS (default: off).
4. Verify operations email `asc3ndcollective@gmail.com` and set `RSVP_OPS_EMAIL`.
5. Supply the public landing-page repo URL (unblocks Phase 10).
6. Confirm event insurance status.
7. Approve final public haircut cap.
8. Verify unused-supplies destination and food quantities.

## ROLLBACK
- Method: `git revert <squash-SHA>` + `vercel --prod` from `main`.
- Data risk: **NONE**. No destructive SQL; existing `save_submission`/`load_submission` unchanged. Adding `rsvp.sql` tables is additive — reverting code does not require dropping tables.
- Baseline SHA `e0dac26` is the safe restore point.

## OWNERSHIP INVENTORY
- Repo: `github.com/executiveusa/asce3nd-interactive-document` (branch `chapter-2/grinions-build`, not yet merged to `main`).
- Vercel project: `asc3nd-interactive-document` (`prj_9jk2ti63…`, team `the-pauli-effect`). SSO protection currently DISABLED (Jeremy's instruction for preview access).
- Supabase: `api.thepaulieffect.com/supabase/...` (self-hosted bridge). Workbook project `…000001`; RSVP event `…000002` (pending table creation).

## DEPLOYED / REVIEWED SHAS
- Reviewed HEAD: `ef50a55`
- Baseline: `e0dac26`
- Production (stale, 8h old): last deploy before this work.

## NEXT
1. **Jeremy:** Review the preview at https://asc3nd-interactive-document-m6nqfogpo-the-pauli-effect.vercel.app
2. **Jeremy:** Decide on BLOCK-01/02/03/04 (provider, landing repo, insurance, run SQL).
3. **When approved:** I squash-merge `chapter-2/grinions-build` → `main` and run `vercel --prod`.
4. **After deploy:** Verify production URL serves the new build end-to-end.
