import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUnlockedDaysBefore } from '@/db/queries/dayLog';
import { getEntriesForDate } from '@/db/queries/entries';
import { usePointsStore } from '@/stores/pointsStore';
import { checkAndUnlockBadges } from '@/utils/badgeChecker';
import { getTodayDateString } from '@/utils/date';
import { budgetRelevantEntries, sumSugarG } from '@/utils/sugarBudget';

const LAST_OPEN_KEY = 'suki_last_open_date';

/**
 * On app open, compares today to the last-open date. For each day in between that still has
 * unlocked points (`day_log.points_locked = 0` — i.e. it has entries but was never finalized):
 * calculate SP → lock it → credit the user → update the streak → check badges. Empty days need
 * no explicit handling — utils/streakCalculator.ts treats a day with no entries as a no-op, and
 * such days never get a day_log row to begin with (db/queries/dayLog.ts only creates one when
 * the first entry of a day is logged).
 */
export async function runMidnightCheck(): Promise<void> {
  const today = getTodayDateString();
  const lastOpen = await AsyncStorage.getItem(LAST_OPEN_KEY);

  if (lastOpen && lastOpen !== today) {
    const unlockedDays = await getUnlockedDaysBefore(today);
    for (const day of unlockedDays) {
      await usePointsStore.getState().runMidnightRollover(day.date);
      const entries = await getEntriesForDate(day.date);
      const dayTotalG = sumSugarG(budgetRelevantEntries(entries));
      await checkAndUnlockBadges({ dayTotalG });
    }
  }

  await AsyncStorage.setItem(LAST_OPEN_KEY, today);
}
