import { create } from 'zustand';

import * as frequentPickQueries from '@/db/queries/frequentPicks';
import type { FrequentPick } from '@/db/types';

interface FrequentPicksState {
  picks: FrequentPick[]; // top 5, sorted by log_count desc
  loadPicks: () => Promise<void>;
  /** `trusted`: true only for a real Gemini estimate — see db/queries/frequentPicks.ts. A
   * manual-fallback grams entry must still pass `trusted: false` so it doesn't poison the cache
   * that estimateSugar() checks before ever calling the API. */
  recordLog: (foodName: string, quantity: string, sugarG: number, trusted: boolean) => Promise<void>;
}

export const useFrequentPicksStore = create<FrequentPicksState>((set, get) => ({
  picks: [],

  loadPicks: async () => {
    const picks = await frequentPickQueries.getTopFrequentPicks(5);
    set({ picks });
  },

  recordLog: async (foodName, quantity, sugarG, trusted) => {
    await frequentPickQueries.recordFrequentPick(foodName, quantity, sugarG, trusted);
    await get().loadPicks();
  },
}));
