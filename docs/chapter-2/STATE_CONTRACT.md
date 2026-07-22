# Phase 02 — State Contract & Chapter 1 Preservation

## Storage locations
| Layer | Key | Purpose |
|---|---|---|
| URL hash | `#state=<base64-json>` | One-shot share/import; consumed on load then cleared |
| localStorage | `asc3nd-wb-v3` | Local-first cache, written on every debounced edit |
| Supabase RPC | `save_submission` / `load_latest_submission` | Cross-device source of truth (project `d0000000-…000001`) |
| Device ID | `asc3nd-device-id-v1` (localStorage) | Identifies the device for save_submission scoping |

## Precedence (locked)
```
1. URL hash #state=     (one-shot, highest priority, consumed then cleared)
2. Server truth         (load_latest_submission, by saved_at timestamp)
3. Local cache          (localStorage asc3nd-wb-v3)
4. Defaults             (blank())
```

**A stale local cache may never overwrite newer server data.**

## Chapter 1 immutability contract
- The 17 ch1 step IDs (`welcome, followup, ch1, strategy, basics, mission, audience, voice, story, pillars, platforms, roadmap, rhythm, engagement, measurement, risk, summary`) and every ch1 key in `blank()` (basics, mission, audience, voice, story, pillars, platforms, roadmap, rhythm, engagement, measurement, risk) are IMMUTABLE in this build.
- Ch2 may ADD keys/objects to `blank()` (additive only) but must never rename, restructure, or remove ch1 keys.
- Verification gate before every phase merge: a snapshot of ch1 step rendering must be byte-identical before/after.

## Conflict handling (Phase 02 change)
Current `loadFromCloud` uses a `countFilled` heuristic — if local has more fields than cloud, cloud is ignored. This is wrong for the ch2 use case: a user editing ch2 on a fresh device would silently lose ch1 data stored on the server.

New behavior:
- Compare by `lastSaved` ISO timestamp, not field count.
- If `cloud.lastSaved > local.lastSaved` → adopt cloud, preserve local-only `eventDayMode` counters (those are operational, minute-by-minute, and should not be overwritten by a stale save from another device).
- If timestamps equal or local newer → keep local, trigger a background cloud push.
- If conflict can't be resolved (timestamps equal, content differs) → set `state.__syncState = 'CONFLICT_REQUIRES_REVIEW'` and surface in the save-status UI; do NOT auto-pick.

## Sync states surfaced in UI
| State | Save-msg label | Color |
|---|---|---|
| `SYNCED` | "Saved to cloud HH:MM" | ink (default) |
| `SAVING` | "Saving to cloud…" | muted |
| `OFFLINE_CACHED` | "Saved locally — cloud unavailable" | muted |
| `SYNC_FAILED` | "Cloud sync failed — local only" | red (semantic) |
| `CONFLICT_REQUIRES_REVIEW` | "Conflict — tap to review" | gold (single flourish) |
| `NEVER_SAVED` | "Not saved" | muted |

## Tests required before Phase 02 merge
1. Load with ch1-only data in cloud, empty local → ch1 returns, ch2 defaults.
2. Edit one ch2 field → save_submission fires, response 200, reload returns the ch2 value.
3. Ch1 keys remain byte-identical before/after.
4. Simulate older local timestamp + newer cloud → cloud wins.
5. Simulate equal timestamps, different content → CONFLICT state surfaces.
6. Offline (fetch rejects) → OFFLINE_CACHED, queued write does not clobber cloud on reconnect.
