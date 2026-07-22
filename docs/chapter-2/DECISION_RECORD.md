# ASC3ND Chapter 2 — Decision Record (V1)

Single source of truth for every locked decision. New agents entering with zero context read this first.

**Owner / release approver:** Jeremy
**Builder/Orchestrator:** GLM 5.2 (this agent)
**Last updated:** 2026-07-21

---

## Locked decisions

### D-001 — Canonical Vercel project
**Decision:** `asc3nd-interactive-document` (no extra 'e'), project ID `prj_9jk2ti63lLOesif9LKKhWJAl6aAr`, team `the-pauli-effect`.
**Implication:** The `asce3nd-interactive-document` (with 'e') project is deprecated. Never deploy there.
**Set by:** Jeremy, 2026-07-21.

### D-002 — Founder identities and genders
**Decision:** Founders are **Otha Minnifield (female)** and **Elisha Minnifield (male)**, husband and wife.
**Implication:** All interview pronouns, portraits, captions, and ES translations must reflect this. Existing code is reversed and is a P0 bug.
**Set by:** Jeremy, 2026-07-21. Cross-confirmed by Anton camera brief §03.

### D-003 — Camera brief delivery
**Decision:** Printable **export** from the workbook, not a separate Vercel project.
**Implication:** A "Generate Camera Handoff" action emits a standalone, printable, consent-safe HTML/PDF. The export contains shot matrix, technical rules, prohibited list, deliverables — never founder interview answers.
**Set by:** Jeremy, 2026-07-21.

### D-004 — RSVP source of truth
**Decision:** No real RSVP system exists yet.
**Implication:** The workbook's manual RSVP table must be explicitly labeled "PLANNING DATA — not live registrations." Phase 06 builds the real system: public form → secure endpoint → Supabase → workbook read-adapter.
**Set by:** Jeremy, 2026-07-21.

### D-005 — RSVP promise to families
**Decision:** **"While supplies last. No promises."** RSVP is a demand-signal / capacity forecast, not a reservation.
**Implication:** No haircut-window locking, no guaranteed-slot emails, no waitlist promises. Approved confirmation copy is in Phase 06 of the build contract.
**Set by:** Jeremy, 2026-07-21.

### D-006 — Approved venue image
**Decision:** Real photograph of Tangles & Locs exterior (`tangles-locs-exterior.webp`, 812×1020) is the only approved Chapter 2 cover image.
**Implication:** No AI-generated replacement. Stored at `public/images/community-cuts/tangles-locs-exterior.webp`, original preserved at `assets-source/`.
**Set by:** Asset manifest §04 + Jeremy, 2026-07-21.

### D-007 — Chapter 1 preservation
**Decision:** Chapter 1 (17 steps: welcome → summary) is immutable in this build.
**Implication:** Every Chapter 2 change must prove byte-for-byte equality of Chapter 1 steps before merge. `blank()` shape for ch1 keys cannot change.
**Set by:** Build contract §4.

### D-008 — Brand system
**Decision:** Black `#0a0a0a` / white `#ffffff` / gold `#F5A617` (one flourish per screen). Lucide icons only. No emojis.
**Implication:** The "Asc3nd orange/dark charcoal" palette mentioned in the prior ChatGPT recovery brief is WRONG and must not be used. AGENTS.md §2 is authoritative.
**Set by:** AGENTS.md §2.

---

## Event facts (from contract §1)

| Field | Value |
|---|---|
| Name | Community Cuts for Kids |
| Slogan | Fresh Fade, Fresh Grade |
| Date | Sunday, August 30, 2026 |
| Time | 12:00 PM – 3:00 PM |
| Venue | Tangles & Locs |
| Address | 7425 Hardeson Rd, Everett, WA |
| Founders | Otha & Elisha Minnifield |
| Org | ASC3ND Collective |
| Ops email (to verify) | asc3ndcollective@gmail.com |
| Barbers | 5 |
| Stations | 5 |
| Service time | 25–30 min |
| Services | basic haircut, line-up, fade, trim |
| Theoretical cuts | ~30–36 (NOT a public 40 promise) |
| Public rule | First come, first served. RSVP holds no queue place. |
| Supplies/food | Free while supplies last |
| Children | Must be present; guardian must remain |
| Founder interview | Friday July 24, 2026, 18:00, founder residence |

---

## Stop conditions currently active

- **BLOCK-01:** Email/SMS provider credentials absent. Phase 06 implements signed-email cancellation, places SMS behind feature flag, stops at provider decision gate.
- **BLOCK-02:** Public landing-page repo not supplied. Phase 10 ships integration instructions + test fixtures only; landing-page bead stays blocked.
- **BLOCK-03:** No event insurance identified. Readiness engine must keep this as a visible HOLD risk, not silently cleared.
