const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole calendar days between two 'YYYY-MM-DD' dates, parsed as UTC to dodge DST drift. */
function daysBetween(earlier: string, later: string): number {
  const a = new Date(`${earlier}T00:00:00Z`).getTime();
  const b = new Date(`${later}T00:00:00Z`).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

type ComputeNewStreakParams = {
  currentStreak: number;
  lastLoggedDate: string | null;
  today: string;
  todayHasEntries: boolean;
  graceDaysUsedThisWeek: number;
};

/**
 * KEY RULE: streak breaks on no-log days ONLY — never on over-limit days (sugar totals never
 * enter this function). Grace: 1 missed calendar day preserved, max once per week.
 *
 * A no-log day doesn't break the streak here — it just leaves `lastLoggedDate` and
 * `currentStreak` unchanged. The break/grace decision happens the next time a day *with*
 * entries rolls over and we see how large the resulting gap is. Callers own resetting
 * `graceDaysUsedThisWeek` to 0 at each week boundary before calling this.
 */
export function computeNewStreak(params: ComputeNewStreakParams): { newStreak: number; newGraceDaysUsed: number } {
  const { currentStreak, lastLoggedDate, today, todayHasEntries, graceDaysUsedThisWeek } = params;

  if (!todayHasEntries) {
    return { newStreak: currentStreak, newGraceDaysUsed: graceDaysUsedThisWeek };
  }

  if (!lastLoggedDate) {
    return { newStreak: 1, newGraceDaysUsed: graceDaysUsedThisWeek };
  }

  const gap = daysBetween(lastLoggedDate, today);

  if (gap <= 0) {
    // Already counted (or an out-of-order call) — leave the streak as-is.
    return { newStreak: currentStreak, newGraceDaysUsed: graceDaysUsedThisWeek };
  }
  if (gap === 1) {
    // Consecutive day — streak continues.
    return { newStreak: currentStreak + 1, newGraceDaysUsed: graceDaysUsedThisWeek };
  }
  if (gap === 2 && graceDaysUsedThisWeek < 1) {
    // Exactly one calendar day missed, and this week's single grace day is unused.
    return { newStreak: currentStreak + 1, newGraceDaysUsed: graceDaysUsedThisWeek + 1 };
  }
  // Two or more days missed with no grace left — streak restarts today.
  return { newStreak: 1, newGraceDaysUsed: graceDaysUsedThisWeek };
}
