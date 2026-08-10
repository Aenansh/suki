import { create } from 'zustand';

import * as dayLogQueries from '@/db/queries/dayLog';
import * as entryQueries from '@/db/queries/entries';
import { calculateDaySP, calculateStreakBonusSP } from '@/utils/spCalculator';
import { budgetRelevantEntries } from '@/utils/sugarBudget';

import { useLogStore } from './logStore';
import { useStreakStore } from './streakStore';
import { useUserStore } from './userStore';

interface PointsState {
  pendingSpToday: number; // live preview before midnight
  computePendingSP: () => Promise<void>;
  runMidnightRollover: (date: string) => Promise<void>;
}

export const usePointsStore = create<PointsState>((set) => ({
  pendingSpToday: 0,

  computePendingSP: async () => {
    const { todayEntries } = useLogStore.getState();
    const { dailyLimitG } = useUserStore.getState();
    // Redeemed treats don't count toward "did you stay under budget" — they already cost SP.
    set({ pendingSpToday: calculateDaySP(budgetRelevantEntries(todayEntries), dailyLimitG) });
  },

  /** Finalizes one unlocked past day: locks its SP, credits the user, updates the streak.
   * Called once per unlocked day by services/midnight.ts (M13) — safe to call directly for a
   * single date too. Badge unlocking is wired in once badgeDefinitions.ts lands (M10). */
  runMidnightRollover: async (date) => {
    const { dailyLimitG } = useUserStore.getState();
    const entries = await entryQueries.getEntriesForDate(date);
    const daySP = calculateDaySP(budgetRelevantEntries(entries), dailyLimitG);

    await useStreakStore.getState().checkAndUpdateStreak(date);
    const streakBonus = calculateStreakBonusSP(useStreakStore.getState().currentStreak);

    const totalSP = daySP + streakBonus;
    await dayLogQueries.lockDayPoints(date, totalSP);
    await useUserStore.getState().addPoints(totalSP);
  },
}));
