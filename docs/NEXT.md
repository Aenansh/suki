# Next session — 2026-08-11

Everything through M0–M13 plus the redemption-economy amendments is built, committed, and
verified live on-device (Android via Expo Go). Git is initialized (13 milestone commits). This
file is the handoff for tomorrow — supersede/delete once it's stale.

---

## P0 — today's asks

### 1. Can't see/edit previous days — need day navigation from Home *and* History
Home only ever queries `getTodayDateString()` (`stores/logStore.ts`); there's no route for "a
given day's" entries. History's calendar (`app/(tabs)/history.tsx`) renders day cells but they're
inert — tapping one does nothing.

Likely shape: a shared `app/day/[date].tsx` (or similar) showing that day's ring-less entry list
— reachable by (a) tapping a calendar cell in History, and (b) prev/next-day arrows somewhere on
Home (probably flanking the date header). Editing on that screen reuses the *existing* 48h-window
edit machinery (`utils/entryEditWindow.ts`, `app/log.tsx`'s edit mode) — it already doesn't care
whether the entry is "today's," just whether it's <48h old, so the edit flow itself shouldn't need
new logic, only a new entry point into it for non-today entries. `db/queries/entries.ts` already
has `getEntriesBetween` to build this from.

### 2. Validate API key during onboarding, not just Settings
`services/apiKey.ts#validateApiKey` (live-pings Gemini) is already wired into Settings' save flow
but **not** into `app/onboarding/api-key.tsx`, which currently saves whatever's typed with zero
feedback. Needs: a checking/valid/invalid UI state during onboarding (matching Settings' pattern —
never *blocks* saving on failure, since offline-first means a key that can't be verified right now
might still be correct). Open question to settle tomorrow: should onboarding be stricter than
Settings (e.g. require at least an attempt at validation before "Continue" enables), or identical
non-blocking behavior? Lean toward identical, for consistency — but ask/decide before building.

### 3. SOS "Swap it" — structured 3-option flow instead of one suggestion
Currently `services/gemini.ts#suggestSwap` returns a single plain-text sentence. New shape:
1. Gemini returns a short description + **3** concrete alternatives (name + suggested quantity)
   in one structured call (JSON, same pattern as `estimateSugar`'s prompt) — include an approx
   `sugar_g` per option so picking one doesn't need a second round-trip.
2. User can adjust an option's quantity (chips/stepper, same UI language as `app/log.tsx`) and can
   **shuffle** for 3 new options (re-calls Gemini with the same craving).
3. Picking one goes straight to a confirm-and-log step *inside* `app/sos.tsx` — calls
   `useLogStore.addEntry` directly, no detour through `/log`. Closing the loop this way is the
   main point: right now "gave in" dumps you into the full `/log` flow from scratch, which is the
   friction this request is trying to remove.

This is the biggest item — budget real time for it.

---

## P1

### 1. Stray circle, top-right of the SOS header
Real bug, already root-caused: `app/sos.tsx`'s header has a right-side spacer `View` that reuses
`styles.backBtn` to balance the flexbox around the centered "CRAVING MODE" label — but
`backBtn` carries a visible `borderWidth`/`borderColor`, so the "invisible" spacer renders as an
empty ringed circle. Fix: give the spacer its own borderless `{ width: 40, height: 40 }` style
instead of sharing `backBtn`. Two-minute fix, just didn't happen tonight.

### 2. Custom icons for the redeem-shelf treats (Indian sweets specifically)
`constants/starterTreats.ts` currently maps all 8 treats (gulab jamun, rasgulla, ice cream, cola,
chocolate bar, halwa, ladoo, jalebi) onto 4 generic Lucide icons (Droplet/CupSoda/Star/Leaf) as
placeholders — there was never real per-treat iconography. Needs actual small illustrated icons
per treat, in the Organic system's voice (rounded, warm, 2.75 stroke weight — see
`docs/design/tokens.md`), at minimum for the Indian sweets (gulab jamun, rasgulla, jalebi, ladoo,
halwa) since generic Western icons for those read as a placeholder. Real asset work, not a config
change — scope as its own session.

---

## P2

### 1. Optional AI follow-up questions when logging
E.g. logging "1 cup chai" → Gemini could ask one optional clarifying question ("with milk? how
much sugar, if you remember?") to sharpen the estimate, always skippable, never blocking. Would
extend `app/log.tsx`'s `qty → busy → confirm` flow with an optional step in between. Nice-to-have,
no urgency.

---

## Carried over from before (not part of today's list, still open)

- **Notification reminders don't actually work.** Settings' toggle/time-chips are local state
  only — never persisted (`setNotificationsEnabled` exists in `db/queries/user.ts`, nothing calls
  it) and there's no real scheduled notification (no `expo-notifications` at all). Convincing UI,
  no-op underneath.
- **M15 — feature walkthrough** (added to the plan 2026-08-10, never started): skippable coach-mark
  tour across Home/Points/History after onboarding's `done` step.
- **M14 — polish & build**: no `eas.json` / build profiles yet — no path to a real Android APK or
  iOS build. Everything so far has only run through Expo Go.
- **Photo-based food logging** (P1 per CLAUDE.md §12): still a "coming soon" stub in the log sheet.
- **iOS is completely untested** — everything verified on Android via Expo Go only; no Mac/
  simulator in this loop yet.
- **PRD addendum needs manual merge** into the owner's canonical Claude Projects doc — I don't
  have write access there. See `docs/prd/02-PRD-Suki.md`.

## Housekeeping
Git is initialized and 13 commits deep (`Add CLAUDE.md project spec` through `M12: Settings`) but
never pushed anywhere — no remote configured yet. Set one up whenever ready to back this up off
the one machine.
