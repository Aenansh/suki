# Design reference (pulled from Claude Design project `861fbdd1-95c6-4ca1-a69b-ab0b0603abfa`)

Source: "Suki mobile app prototype" — `Suki.dc.html` (screens) + `SukiBunny.dc.html` (mascot) +
`_ds/organic-.../{readme.md,styles.css}` (the "Organic" design system).
This is a web mockup (custom `sc-if`/`sc-for`/`dc-import` tags), not RN — values below are
hand-translated into `constants/theme.ts`. Re-fetch via `DesignSync.get_file` on that project if
these notes go stale.

## System character
Warm, rounded, playful. Cream ground, terracotta accent + sage second accent. Caprasimo
(headings) over Figtree (body). 16px base radius that grows into pills (999px) on buttons/
inputs/tags. Photos desaturated via `.washed`. Icons: Lucide, stroke-width 2.75.

## Base tokens (light, from styles.css :root)
- `--color-bg` #f5ead8, `--color-surface` #ebddc5, `--color-text` #201e1d
- `--color-accent` #c67139, `--color-accent-2` #7a8a5e
- neutral ramp 100→900: #f9f4ed #eee7db #dcd3c4 #c0b6a5 #a19786 #82796a #645c50 #474238 #2e2b25
- accent ramp 100→900: #fff2eb #ffe1d0 #ffc6a5 #f6a06b #d67f48 #b2622d #8c491a #643312 #402310
- accent-2 ramp 100→900: #f0fae1 #e1eecc #ccdbb2 #aebf92 #8fa073 #728157 #56633f #3d472b #272e1b
- fonts: `--font-heading` Caprasimo 400, `--font-body` Figtree (400/600/700)
- spacing (×1.10 density baked in): 4.4 / 8.8 / 13.2 / 17.6 / 26.4 / 35.2 px
- radii: sm 8px, md 16px, lg 28px (cards/dialogs use `lg*1.15` ≈ 32px; buttons/inputs/tags/seg → 999px pill)
- shadows: sm `0 1px 2px rgba(46,43,37,.14)`, md `0 3px 10px rgba(46,43,37,.16)`, lg `0 12px 32px rgba(46,43,37,.22)`

## Semantic screen tokens — exact light/dark maps (from Suki.dc.html's inline `<script>`)
| token | light | dark |
|---|---|---|
| `--s-page` | #eee7db | #211d18 |
| `--s-bg` | #f5ead8 | #2b2620 |
| `--s-surf` | #ebddc5 | #37312a |
| `--s-track` | #dcd3c4 | #474238 |
| `--s-text` | #201e1d | #f5ead8 |
| `--s-muted` | #645c50 | #c0b6a5 |
| `--s-faint` | #82796a | #a19786 |
| `--s-line` | #dcd3c4 | #474238 |
| `--s-accent` | #c67139 | #d67f48 |
| `--s-accent-bg` | #ffe1d0 | #4a3524 |
| `--s-accent-ink` | #8c491a | #ffc6a5 |
| `--s-sage` | #7a8a5e | #8fa073 |
| `--s-sage-bg` | #e1eecc | #333c26 |
| `--s-sage-ink` | #3d472b | #ccdbb2 |
| `--s-sage-ink2` | #56633f | #aebf92 |
| `--s-gold-bg` | #f6e6c4 | #463a1e |
| `--s-gold-ink` | #7a5710 | #e8c98a |
| `--s-sos-bg` | #3d472b | #272e1b |
| `--s-toast` | #2e2b25 | #0f0e0c |

These are used as: page bg behind cards (`--s-page`), card/sheet surface (`--s-surf`), screen bg
(`--s-bg`), progress-ring track (`--s-track`), primary/secondary/tertiary text (`--s-text`/
`--s-muted`/`--s-faint`), hairlines (`--s-line`), terracotta accent + its tint bg + ink-on-tint
(`--s-accent*`), sage second accent + tint + two ink weights (`--s-sage*`), gold tint pair for
points (`--s-gold*`), SOS screen's dark sage background (`--s-sos-bg`), toast bg (`--s-toast`).

## Component shapes (from styles.css component layer)
- `.btn-primary`: solid accent fill, bg text on it, pill radius, hover→accent-600, active→accent-700
- `.btn-secondary`: 1px divider border, hover/active = translucent ink tint
- `.btn-ghost`: accent text, no border, translucent accent tint on hover/active
- `.card`: surface fill, lg*1.15 radius, `.card-kicker` uppercase accent 10px label
- `.tag-accent`/`.tag-accent-2`/`.tag-neutral`: 100-step bg + 800-step ink; `.tag-outline`: accent border+text
- `.input`: surface fill, divider border, pill radius, accent border on focus
- `.dialog`: surface fill, shadow-lg, lg*1.15 radius, backdrop = neutral-900 @ 50%
- focus ring: 2px solid accent, 2px offset (never default blue)
- disabled: 45% opacity

## Screens present in the mockup (`Suki.dc.html`)
Onboarding (`ob` 0–4: welcome / limit / goal / api-key / done), Home (ring + status banner +
over-limit recovery card + SOS card + quick tiles + entries list + sticky log button), SOS
(breathing circle, relief cards, resisted +15pt / gave-in → opens log sheet), Streak (streak
count, week strip, badge grid), Points (balance, earn rules, redeem shelf + open search →
redeem sheet), History (month calendar + last-7-days bars), Settings (limit/goal/reminder +
API key row → key sheet). Log/redeem/key are **bottom sheets** (`state.sheet`), not routes, in
the mockup — CLAUDE.md's nav map makes them their own modal routes (`/log`, `/redeem`), which
is what we build instead.

## Business-logic reference pulled from the mockup's `<script>` (for M5/M6/M9, not needed yet)
- Quantity parsing (`servings(qty)`): "half"/"aadha" → 0.5×; a trailing `g/gm/gram/grams/ml`
  number → `max(0.2, n/100)`×; `katori/bowl/cup/glass` → `n * 1.5`×; else bare number → `n`×;
  empty → 1×.
- Stand-in food→sugar-per-serving table (mirrors what a real Gemini lookup should return in the
  same ballpark): gulab jamun 15g, rasgulla 12g, jalebi 18g, ladoo 14g, halwa 20g, mysore pak 17g,
  ghewar 22g, barfi 13g, kheer 16g, ice cream 21g, cola 39g, chocolate bar 24g, oat latte 12g,
  masala chai 9g, granola bar 9g, banana 14g, mango 23g, biscuit 5g, greek yoghurt 6g,
  dark chocolate 8g, bubble tea 34g, pastry 26g, ketchup 4g.
- Quantity chip presets: "1 piece", "2 pieces", "1 katori", "250 gm", "half a bowl".
- SOS resisted → +15 SP, toast "+15 points. That craving lost — nice work."; gave-in → opens
  log sheet directly. **Deviation (2026-08-10, user request):** the built app awards no SP for
  SOS at all (a free-tap SP exploit) and drops the third "Move a little" card. "Swap it" and
  "Wait ten" are the only two, and both are real: Swap it asks what you're craving (or "Just
  something sweet") and calls `services/gemini.ts#suggestSwap` for a live low-sugar alternative,
  with static offline fallbacks; Wait ten is a real 10-minute countdown (meditation-app style
  ring + mm:ss + pause/resume). Completing the full timer still counts toward the "Rode It Out"
  badge via `utils/sosCounter.ts` — just no currency, so there's nothing to farm.
- Redeem cost = 1 SP per gram (matches CLAUDE.md §11); insufficient-balance state shows
  "Need N more SP" in accent-faint color instead of the primary accent button color.

## Onboarding goal options (`goalDefs`, exact copy — used by `app/onboarding/goal.tsx`)
1. **Cut the crash** — Steadier energy through the day
2. **Manage PCOS** — Gentler, insulin-aware nudges
3. **Train better** — Fuel around workouts, not against them
4. **Just curious** — See where the sugar actually hides

## Badge definitions (`badgeDefs`, for M10 — name / sub / icon-path-key / unlocked-in-mockup)
- Week One — "7 days logged" (flame icon), unlocked
- Swap Star — "10 smart swaps" (swap icon), unlocked
- Rode It Out — "5 SOS wins" (leaf icon), unlocked
- Fortnight — "14 days logged" (lock icon), locked
- Under 20 — "A day below 20g" (lock icon), locked
- Century — "100 pts banked" (lock icon), locked

## Mascot (`SukiBunny.dc.html`) — 4 moods, plain SVG (viewBox `0 0 100 118`)
`happy` (default/content), `cheer` (arms-up celebrating — closed happy eyes, raised brows,
sparkle dots), `warm` (soft concerned — worried brows, small frown, used on the over-limit
recovery card), `calm` (sleepy/breathing — half-lid eyes, small "o" mouth, used in SOS). Each is
two rotated ear ellipses (outer #f9f4ed w/ #dcd3c4 stroke, inner tint) + a #f9f4ed head circle +
blush ellipses + eyes/mouth paths. Full SVG paths copied into `components/mascot/`.
CLAUDE.md's mood vocabulary (excited/thoughtful/celebrating/encouraging) maps onto these four:
excited/celebrating→`cheer`, thoughtful/encouraging→`happy`, and `warm`/`calm` are used as-is for
recovery/SOS. Do not invent a 5th mood — reuse these four everywhere.
