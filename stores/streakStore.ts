import { create } from 'zustand';

import * as entryQueries from '@/db/queries/entries';
import * as streakQueries from '@/db/queries/streak';
import { computeNewStreak } from '@/utils/streakCalculator';
import { getWeekStart } from '@/utils/date';

interface StreakState {
  currentStreak: number;
  lastLoggedDate: string | null;
  loadStreak: () => Promise<void>;
  checkAndUpdateStreak: (today: string) => Promise<void>;
}

export const useStreakStore = create<StreakState>((set) => ({
  currentStreak: 0,
  lastLoggedDate: null,

  loadStreak: async () => {
    const streak = await streakQueries.getStreak();
    set({ currentStreak: streak.currentStreak, lastLoggedDate: streak.lastLoggedDate });
  },

  checkAndUpdateStreak: async (today) => {
    const streak = await streakQueries.getStreak();
    const entries = await entryQueries.getEntriesForDate(today);
    const todayHasEntries = entries.length > 0;

    // The weekly grace day resets whenever `today` lands in a new ISO week than the one on record.
    const weekStart = getWeekStart(today);
    const graceDaysUsedThisWeek = streak.weekStartDate === weekStart ? streak.graceDaysUsedThisWeek : 0;

    const { newStreak, newGraceDaysUsed } = computeNewStreak({
      currentStreak: streak.currentStreak,
      lastLoggedDate: streak.lastLoggedDate,
      today,
      todayHasEntries,
      graceDaysUsedThisWeek,
    });

    const newLastLoggedDate = todayHasEntries ? today : streak.lastLoggedDate;

    await streakQueries.updateStreak({
      currentStreak: newStreak,
      lastLoggedDate: newLastLoggedDate ?? today,
      graceDaysUsedThisWeek: newGraceDaysUsed,
      weekStartDate: weekStart,
    });

    set({ currentStreak: newStreak, lastLoggedDate: newLastLoggedDate });
  },
}));
