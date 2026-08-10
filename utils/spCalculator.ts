import type { Entry } from '@/db/types';

/** Verbatim from CLAUDE.md §8, adapted to the camelCase Entry shape used elsewhere in the app. */
export function calculateDaySP(entries: Entry[], dailyLimitG: number): number {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, e) => sum + e.sugarG, 0);
  let sp = 5; // logged at least once
  if (total < dailyLimitG * 0.75) sp += 15;
  else if (total < dailyLimitG) sp += 10;
  if (entries.length >= 3) sp += 5; // granular tracking bonus
  return sp;
}

export function calculateStreakBonusSP(streakLength: number): number {
  if (streakLength === 3) return 10;
  if (streakLength === 7) return 25;
  if (streakLength === 14) return 40;
  if (streakLength === 30) return 75;
  return 0;
}
