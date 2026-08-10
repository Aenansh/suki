# Suki — Claude Code Context

> Read this entire file before writing any code or making any decisions.

---

## 1. First Task — Import & Implement the Design

Before anything else, import the visual design from Claude Design and implement it.

```
Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login)
to import this project:
https://claude.ai/design/p/861fbdd1-95c6-4ca1-a69b-ab0b0603abfa?file=Suki.dc.html

Focus on these files (the whole project is readable):
- Suki.dc.html

Also read these files the selection imports:
- _ds/organic-7e59eb4d-43fd-4a82-917b-10d77c7d21cf/_ds_bundle.js
- _ds/organic-7e59eb4d-43fd-4a82-917b-10d77c7d21cf/styles.css
- ios-frame.jsx
- support.js

Implement: Suki.dc.html
```

Do not invent a design system. All colors, typography, spacing, component shapes, and the Suki bunny mascot come from the Claude Design output above. The docs below tell you *what* to build — the design tells you *how it looks*.

---

## 2. What is Suki?

Suki is a **gamified sugar intake tracker** for iOS and Android (React Native + Expo). Open source, solo developer (Naman Tomar / navoren).

**The problem it solves:** sugar trackers either feel like punishment (clinical calorie counters) or break your streak and kill motivation on a bad day (standard habit apps). Suki does neither.

**Three pillars:**
1. **No-guilt design** — bad days get a warm recovery flow, not a shame screen or broken streak
2. **Always-actionable** — every overage or craving gets a concrete next step
3. **Earn, don't just restrict** — Suki Points reframe sugar as a resource to manage, not a forbidden thing

---

## 3. Tech Stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React Native + Expo SDK 51+ | Managed workflow, no ejecting needed |
| Navigation | Expo Router v3 | File-based routing |
| State | Zustand | Lightweight, no Provider boilerplate |
| Structured storage | `expo-sqlite` | Local relational DB — entries, streaks, badges |
| Sensitive storage | `expo-secure-store` | Gemini API key only — NOT AsyncStorage |
| Preferences | `AsyncStorage` | Onboarding flag, lightweight settings |
| AI | Google Gemini API (BYO key) | User supplies their own key via Settings |
| Build | Expo EAS | APK (Android) + TestFlight (iOS) |
| Backend | **None in v1** | All data is local. No Supabase, no server, no auth. |

---

## 4. Project Structure

```
suki/
├── CLAUDE.md
├── app/                          ← Expo Router screens
│   ├── _layout.tsx               ← Root: DB init, font load, onboarding gate
│   ├── (tabs)/
│   │   ├── _layout.tsx           ← Tab bar
│   │   ├── index.tsx             ← Home dashboard
│   │   ├── points.tsx            ← Suki Points + Redeem
│   │   └── history.tsx           ← History & trends
│   ├── onboarding/
│   │   ├── _layout.tsx
│   │   ├── index.tsx             ← Welcome + mascot
│   │   ├── limit.tsx             ← Daily limit setup
│   │   ├── goal.tsx              ← Goal context
│   │   ├── api-key.tsx           ← Gemini API key setup
│   │   └── done.tsx              ← All set
│   ├── log.tsx                   ← Log entry (modal)
│   ├── sos.tsx                   ← SOS craving (modal)
│   ├── recovery.tsx              ← Recovery flow (modal)
│   ├── redeem.tsx                ← Redeem screen (modal)
│   ├── badges.tsx                ← Badge collection
│   └── settings.tsx              ← Settings
├── components/
│   ├── mascot/
│   │   ├── SukiBunny.tsx         ← Base mascot SVG (from Claude Design)
│   │   └── expressions/          ← excited, thoughtful, celebrating, encouraging
│   └── ui/                       ← Design system components (from Claude Design)
├── stores/
│   ├── userStore.ts
│   ├── logStore.ts
│   ├── pointsStore.ts
│   ├── streakStore.ts
│   └── frequentPicksStore.ts
├── db/
│   ├── client.ts                 ← SQLite singleton
│   ├── schema.ts                 ← CREATE TABLE + migrations
│   └── queries/
│       ├── user.ts
│       ├── entries.ts
│       ├── dayLog.ts
│       ├── frequentPicks.ts
│       ├── badges.ts
│       └── streak.ts
├── services/
│   ├── gemini.ts                 ← AI sugar estimation + photo recognition
│   ├── midnight.ts               ← SP rollover + streak update
│   └── apiKey.ts                 ← expo-secure-store wrapper
├── hooks/
│   ├── useLog.ts
│   ├── usePoints.ts
│   └── useMidnightCheck.ts
├── constants/
│   ├── starterTreats.ts          ← ~8 quick-tap treats for redeem shelf
│   ├── badgeDefinitions.ts
│   └── sosContent.ts
└── utils/
    ├── spCalculator.ts           ← Pure SP logic (unit testable)
    ├── streakCalculator.ts       ← Pure streak logic (unit testable)
    └── formatSugar.ts
```

**Three-layer rule — enforce strictly:**
- Screens → Zustand stores only
- Stores → `db/queries/` only
- No screen ever imports from `db/` directly

---

## 5. Database Schema

```sql
CREATE TABLE IF NOT EXISTS user (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  daily_limit_g         REAL    NOT NULL DEFAULT 25,
  goal                  TEXT,
  onboarding_complete   INTEGER NOT NULL DEFAULT 0,
  notifications_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_time         TEXT,
  suki_points           REAL    NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS day_log (
  date                  TEXT    PRIMARY KEY,  -- YYYY-MM-DD
  points_earned         REAL    NOT NULL DEFAULT 0,
  recovery_option       TEXT,                 -- 'tighter_tomorrow'|'activity'|'reset'|NULL
  points_locked         INTEGER NOT NULL DEFAULT 0,
  recovery_modal_shown  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entry (
  id                    TEXT    PRIMARY KEY,  -- UUID
  date                  TEXT    NOT NULL,
  timestamp             TEXT    NOT NULL,     -- ISO 8601
  food_name             TEXT,
  quantity_description  TEXT,                 -- "2 pieces", "250g"
  sugar_g               REAL    NOT NULL,
  sugar_g_source        TEXT    NOT NULL,     -- 'ai_estimated'|'user_entered'|'photo'|'manual_fallback'
  source                TEXT    NOT NULL,     -- 'smart_log'|'photo'|'redeemed'|'manual_fallback'
  redeemed_treat        TEXT,
  FOREIGN KEY (date) REFERENCES day_log(date)
);

CREATE INDEX IF NOT EXISTS idx_entry_date ON entry(date);

CREATE TABLE IF NOT EXISTS frequent_pick (
  food_name             TEXT    PRIMARY KEY,
  log_count             INTEGER NOT NULL DEFAULT 1,
  last_quantity_used    TEXT,
  last_sugar_g          REAL
);

CREATE TABLE IF NOT EXISTS badge (
  badge_id              TEXT    PRIMARY KEY,
  unlocked_at           TEXT
);

CREATE TABLE IF NOT EXISTS streak (
  id                        INTEGER PRIMARY KEY DEFAULT 1,
  current_streak            INTEGER NOT NULL DEFAULT 0,
  last_logged_date          TEXT,
  grace_days_used_this_week INTEGER NOT NULL DEFAULT 0,
  week_start_date           TEXT
);
```

---

## 6. Zustand Store Interfaces

```typescript
// userStore.ts
interface UserState {
  dailyLimitG: number
  goal: string | null
  onboardingComplete: boolean
  sukiPoints: number
  loadUser: () => Promise<void>
  setLimit: (g: number) => Promise<void>
  setGoal: (goal: string) => Promise<void>
  completeOnboarding: () => Promise<void>
  addPoints: (sp: number) => Promise<void>
  deductPoints: (sp: number) => Promise<void>
}

// logStore.ts
interface LogState {
  todayEntries: Entry[]
  todayTotal: number          // derived: sum of sugar_g
  isOverLimit: boolean        // derived: todayTotal > dailyLimitG
  recoveryModalShown: boolean
  loadToday: () => Promise<void>
  addEntry: (input: EntryInput) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  editEntry: (id: string, updates: Partial<Entry>) => Promise<void>
  markRecoveryShown: () => Promise<void>
  setRecoveryOption: (option: RecoveryOption) => Promise<void>
}

// pointsStore.ts
interface PointsState {
  pendingSpToday: number      // live preview before midnight
  computePendingSP: () => Promise<void>
  runMidnightRollover: (date: string) => Promise<void>
}

// streakStore.ts
interface StreakState {
  currentStreak: number
  lastLoggedDate: string | null
  loadStreak: () => Promise<void>
  checkAndUpdateStreak: (today: string) => Promise<void>
}

// frequentPicksStore.ts
interface FrequentPicksState {
  picks: FrequentPick[]       // top 5, sorted by log_count desc
  loadPicks: () => Promise<void>
  recordLog: (foodName: string, quantity: string, sugarG: number) => Promise<void>
}
```

---

## 7. Gemini Integration

```typescript
// services/gemini.ts
// Model: gemini-1.5-flash (fast, generous free tier, accurate for factual lookups)
// Amended 2026-08-10: actually shipped as gemini-2.5-flash, then that was deprecated by Google
// ("no longer available to new users") and bumped again to gemini-3.6-flash the same day — see
// the comment above MODEL in services/gemini.ts for the "if this breaks again" pointer. Google
// gives no auto-updating alias for this endpoint, so the pinned model id WILL need revisiting
// periodically; that's expected maintenance, not a regression.
// Temperature: 0.1 (factual query — keep responses consistent and parseable)

const SUGAR_PROMPT = `
You are a nutritional reference assistant.
Given a food item and quantity, return ONLY valid JSON:
{
  "sugar_g": <number, one decimal>,
  "confidence": <"high"|"medium"|"low">,
  "note": <string, max 8 words>
}
Food: {{food_name}}
Quantity: {{quantity}}
Return ONLY the JSON. No explanation, no markdown.
`.trim()

// On null return → caller shows manual grams fallback input
// Cache: if frequent_pick.last_sugar_g exists for same food → skip API call
```

**API key flow:**
```typescript
// services/apiKey.ts — the ONLY place the key is touched
import * as SecureStore from 'expo-secure-store'
const KEY = 'suki_gemini_key'
export const getApiKey   = () => SecureStore.getItemAsync(KEY)
export const setApiKey   = (v: string) => SecureStore.setItemAsync(KEY, v)
export const clearApiKey = () => SecureStore.deleteItemAsync(KEY)
```

**API key rules — never break these:**
- Key is NEVER in Zustand state
- Key is NEVER logged (`console.log`)
- Key is read fresh from SecureStore on every Gemini call
- Settings screen shows only `AIza••••••••XYZ9` (first 4 + last 4)

---

## 8. SP Calculation (pure functions — unit test these)

```typescript
// utils/spCalculator.ts
export function calculateDaySP(entries: Entry[], dailyLimitG: number): number {
  if (entries.length === 0) return 0
  const total = entries.reduce((sum, e) => sum + e.sugar_g, 0)
  let sp = 5 // logged at least once
  if (total < dailyLimitG * 0.75) sp += 15
  else if (total < dailyLimitG)   sp += 10
  if (entries.length >= 3)        sp += 5  // granular tracking bonus
  return sp
}

export function calculateStreakBonusSP(streakLength: number): number {
  if (streakLength === 3)  return 10
  if (streakLength === 7)  return 25
  if (streakLength === 14) return 40
  if (streakLength === 30) return 75
  return 0
}
```

**Midnight rollover:** On app open, compare today to last-open date (AsyncStorage). For each unlocked day in between: calculate SP → lock `day_log.points_locked = 1` → add to `user.suki_points` → update streak → check badges.

---

## 9. Streak Logic (pure functions — unit test these)

```typescript
// utils/streakCalculator.ts
// KEY RULE: streak breaks on no-log days ONLY — never on over-limit days
// Grace: 1 missed calendar day preserved, max once per week
export function computeNewStreak(params: {
  currentStreak: number
  lastLoggedDate: string | null
  today: string
  todayHasEntries: boolean
  graceDaysUsedThisWeek: number
}): { newStreak: number; newGraceDaysUsed: number }
```

---

## 10. Navigation Map

```
/onboarding/index   → Welcome
/onboarding/limit   → Daily limit
/onboarding/goal    → Goal context
/onboarding/api-key → Gemini key setup (skippable — shows consequence of skipping)
/onboarding/done    → All set

/(tabs)/index       → Home dashboard
/(tabs)/points      → SP balance + Redeem
/(tabs)/history     → History view

/log                → Log entry bottom sheet (modal)
/sos                → SOS craving (modal)
/recovery           → Recovery flow (modal — triggered when isOverLimit && !recoveryModalShown)
/redeem             → Open redeem (modal from points tab)
/badges             → Badge collection
/settings           → Settings (push from home header)
```

Onboarding gate in `app/_layout.tsx`: load user → if `!onboardingComplete` → `router.replace('/onboarding')`.

---

## 11. Architectural Decisions (locked — do not revisit)

| Decision | What was decided | Why |
|---|---|---|
| No backend | Local storage only, no Supabase in v1 | Offline-first, no auth, open source users need no server |
| BYO Gemini key | User supplies key, stored in SecureStore | Zero cost on both sides |
| SP rollover | Midnight, locked after rollover | Prevents retroactive gaming |
| Streak mechanic | Breaks on no-log only, not over-limit | Core no-guilt principle |
| Food logging | Quantity-based AI lookup, never manual grams | UX parity with HealthifyMe |
| Treat redeem | Open catalog (any sweet) via AI lookup | Supports indigenous items (ghewar, etc.) |
| ~~SP cost formula~~ SP cost formula | ~~sugar grams × 1 SP/gram~~ **sugar grams × 1.25, rounded up** — amended 2026-08-10 | A flat 1:1 rate makes redeeming a pure wash against what an under-budget day just earned — nothing is actually "earned". See §11.1. |
| Redemption cap | **1 redemption per calendar day** — added 2026-08-10 | Keeps a treat deliberate and rate-limited, not spammable now that SOS no longer gates it either |
| Entry edit/delete | Editable/deletable for 48h after logging, via `app/log.tsx` re-running the same Gemini estimate (never a bare manual-grams box) — added 2026-08-10 | A correction should be exactly as informed as the original log; 48h keeps locked SP/streak history from being rewritten indefinitely |
| Redeemed entries | Never editable (any age) — only deletable, with no SP refund — added 2026-08-10 | Editing a spent redemption after the fact (e.g. shrinking its logged grams) would let SP be gamed; deleting doesn't refund because a real day still holds only one redemption slot regardless |

### 11.1 Redemption Economy (added 2026-08-10)

**Formula:** `cost_SP = ceil(sugar_g × 1.25)` — see `utils/redeemPricing.ts`. The 25% premium is
the whole point: `calculateDaySP` (§8) pays out at most ~25 SP on an excellent day (5 base + 15
comfortably-under + 5 granular-tracking), so a single mid-size treat (~20g × 1.25 ≈ 25 SP) costs
roughly a full good day's earnings. Redemption is meant to feel like spending down a balance
you built up over several disciplined days, not a same-day wash.

**Once per day:** enforced in `app/redeem.tsx` (checked on screen open *and* re-checked
immediately before committing, via `db/queries/entries.ts#hasRedeemedToday`) and reflected in
`app/(tabs)/points.tsx` (treat shelf dims with "You've claimed today's treat — the shelf reopens
tomorrow" once the day's slot is used). This is a hard cap, not a soft nudge — the UI disables
the affordance entirely rather than warning after the fact.

**Redeemed entries are locked, not manual-grams-editable:** `entry.source === 'redeemed'` rows
never open for editing (`app/log.tsx`'s `locked` step, reached from `app/(tabs)/index.tsx` simply
not passing an `onPress` for them) — only deletion, with no point refund. A regular logged entry
*is* editable (48h window), and editing it re-runs the Gemini estimate against the edited
food/quantity rather than asking the user to eyeball new grams — see the `qty → busy → confirm`
flow in `app/log.tsx`.

**Redeemed sugar doesn't count against the daily budget — added 2026-08-11.** A redeemed treat
is already paid for with SP, a separate resource from the sugar ring/limit. Counting its grams
against `today_total` too would double-charge the user: pay points *and* get pushed toward — or
into — recovery mode for the same treat, which guts the entire "earn, don't just restrict" pillar
(§2). So `entry.source === 'redeemed'` rows are excluded everywhere "today's sugar total" feeds a
decision — the ring, `isOverLimit`, the recovery trigger, `calculateDaySP`'s tiers, and a
history/badge day's under-vs-over status — via `utils/sugarBudget.ts#budgetRelevantEntries`. They
still **appear** in the Today list (transparency — it happened, you paid for it) with a gold
"Redeemed" tag and a star chip instead of the food initial, plus a footnote on Home when one's
present, so it's visible *why* that row doesn't move the numbers. They still count for streak
purposes (`entries.length > 0` for the day) — redeeming is still "showing up."

---

## 12. Feature Priority

| Priority | Feature |
|---|---|
| P0 | Onboarding (5 steps incl. API key setup) |
| P0 | Smart food logging (frequent picks + quantity AI) |
| P0 | Daily dashboard (sugar ring, SP balance, log list) |
| P0 | Limit-exceeded recovery flow |
| P0 | Suki Points — earn (midnight rollover) |
| P0 | Suki Points — redeem (open catalog) |
| P0 | Settings (API key update is critical path) |
| P1 | SOS craving button |
| P1 | Photo-based food logging |
| P1 | Streaks & badges |
| P2 | History & trends |
| P2 | Notification reminders |

---

## 13. UX Rules (enforce in code)

1. **Log button always visible.** Never hidden or disabled, even when over limit.
2. **No red failure screens.** Over-limit = recovery mode banner. Not an error state.
3. **Offline first.** App fully functional with no internet. AI calls fail gracefully → manual fallback.
4. **Shame-free copy.** Grep for and reject: "failed", "bad day", "broke your streak", "you went over".
5. **Speed.** Logging < 5 seconds for a power user. Frequent picks + cached estimates make this possible.

---

## 14. Key Docs

| Doc | Path | Status |
|---|---|---|
| BRD | `docs/brd/01-BRD-Suki.md` | Locked — canonical copy lives in the owner's Claude Projects workspace, not this repo |
| PRD | `docs/prd/02-PRD-Suki.md` | v1.3 canonically (Claude Projects); this repo only has an **addendum** (redemption economy, 2026-08-10) pending merge |
| UX Design Brief | `docs/ux/03-UX-Design-Brief.md` | v1.1 — canonical copy lives in the owner's Claude Projects workspace, not this repo |
| TDD | `docs/tdd/04-TDD-Suki.md` | v1.0 — canonical copy lives in the owner's Claude Projects workspace, not this repo |

---

## 15. What NOT to Build in v1

- Social / friends / leaderboards
- Full nutrition tracking (calories, macros) — sugar only
- Backend / server sync / cloud backup
- Account creation or login
- Medical claims or diabetes management
- Wearable integrations
- Data export

---

## 16. Build

```bash
# Android APK
eas build --platform android --profile preview

# iOS TestFlight
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 17. Where to Start

1. Import and implement the Claude Design output (Section 1 above)
2. `db/schema.ts` — write and apply the SQLite schema
3. `db/client.ts` — singleton DB initialisation
4. `stores/userStore.ts` — first store, drives onboarding gate
5. `app/onboarding/` — first screens, validates the full stack end-to-end
6. `app/(tabs)/index.tsx` — home dashboard, the daily driver