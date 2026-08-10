import { create } from 'zustand';

import * as userQueries from '@/db/queries/user';

interface UserState {
  dailyLimitG: number;
  goal: string | null;
  onboardingComplete: boolean;
  sukiPoints: number;
  loaded: boolean;
  loadUser: () => Promise<void>;
  setLimit: (g: number) => Promise<void>;
  setGoal: (goal: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addPoints: (sp: number) => Promise<void>;
  deductPoints: (sp: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  dailyLimitG: 25,
  goal: null,
  onboardingComplete: false,
  sukiPoints: 0,
  loaded: false,

  loadUser: async () => {
    const user = await userQueries.getUser();
    set({
      dailyLimitG: user.dailyLimitG,
      goal: user.goal,
      onboardingComplete: user.onboardingComplete,
      sukiPoints: user.sukiPoints,
      loaded: true,
    });
  },

  setLimit: async (g) => {
    await userQueries.setDailyLimit(g);
    set({ dailyLimitG: g });
  },

  setGoal: async (goal) => {
    await userQueries.setGoal(goal);
    set({ goal });
  },

  completeOnboarding: async () => {
    await userQueries.setOnboardingComplete(true);
    set({ onboardingComplete: true });
  },

  addPoints: async (sp) => {
    await userQueries.adjustPoints(sp);
    set({ sukiPoints: get().sukiPoints + sp });
  },

  deductPoints: async (sp) => {
    await userQueries.adjustPoints(-sp);
    set({ sukiPoints: get().sukiPoints - sp });
  },
}));
