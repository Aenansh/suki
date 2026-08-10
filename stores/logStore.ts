import { create } from 'zustand';

import * as dayLogQueries from '@/db/queries/dayLog';
import * as entryQueries from '@/db/queries/entries';
import type { Entry, EntryInput, RecoveryOption } from '@/db/types';
import { getTodayDateString } from '@/utils/date';
import { budgetRelevantEntries, sumSugarG } from '@/utils/sugarBudget';

import { useUserStore } from './userStore';

interface LogState {
  todayEntries: Entry[];
  todayTotal: number; // derived: sum of sugar_g, excluding redeemed treats (utils/sugarBudget.ts)
  isOverLimit: boolean; // derived: todayTotal > dailyLimitG
  recoveryModalShown: boolean;
  loadToday: () => Promise<void>;
  addEntry: (input: EntryInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  editEntry: (id: string, updates: Partial<EntryInput>) => Promise<void>;
  markRecoveryShown: () => Promise<void>;
  setRecoveryOption: (option: RecoveryOption) => Promise<void>;
}

function deriveTotals(entries: Entry[]) {
  const todayTotal = sumSugarG(budgetRelevantEntries(entries));
  const dailyLimitG = useUserStore.getState().dailyLimitG;
  return { todayTotal, isOverLimit: todayTotal > dailyLimitG };
}

export const useLogStore = create<LogState>((set, get) => ({
  todayEntries: [],
  todayTotal: 0,
  isOverLimit: false,
  recoveryModalShown: false,

  loadToday: async () => {
    const today = getTodayDateString();
    const [entries, dayLog] = await Promise.all([
      entryQueries.getEntriesForDate(today),
      dayLogQueries.getDayLog(today),
    ]);
    set({ todayEntries: entries, ...deriveTotals(entries), recoveryModalShown: dayLog?.recoveryModalShown ?? false });
  },

  addEntry: async (input) => {
    const today = getTodayDateString();
    await entryQueries.addEntry(today, input);
    const entries = await entryQueries.getEntriesForDate(today);
    set({ todayEntries: entries, ...deriveTotals(entries) });
  },

  deleteEntry: async (id) => {
    await entryQueries.deleteEntry(id);
    const entries = get().todayEntries.filter((e) => e.id !== id);
    set({ todayEntries: entries, ...deriveTotals(entries) });
  },

  editEntry: async (id, updates) => {
    await entryQueries.updateEntry(id, updates);
    const today = getTodayDateString();
    const entries = await entryQueries.getEntriesForDate(today);
    set({ todayEntries: entries, ...deriveTotals(entries) });
  },

  markRecoveryShown: async () => {
    const today = getTodayDateString();
    await dayLogQueries.setRecoveryModalShown(today);
    set({ recoveryModalShown: true });
  },

  setRecoveryOption: async (option) => {
    const today = getTodayDateString();
    await dayLogQueries.setRecoveryOption(today, option);
  },
}));
