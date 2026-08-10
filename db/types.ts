export type SugarSource = 'ai_estimated' | 'user_entered' | 'photo' | 'manual_fallback';
export type EntrySource = 'smart_log' | 'photo' | 'redeemed' | 'manual_fallback';
export type RecoveryOption = 'tighter_tomorrow' | 'activity' | 'reset';

export interface Entry {
  id: string;
  date: string;
  timestamp: string;
  foodName: string | null;
  quantityDescription: string | null;
  sugarG: number;
  sugarGSource: SugarSource;
  source: EntrySource;
  redeemedTreat: string | null;
}

export interface EntryInput {
  foodName?: string;
  quantityDescription?: string;
  sugarG: number;
  sugarGSource: SugarSource;
  source: EntrySource;
  redeemedTreat?: string;
}

export interface DayLog {
  date: string;
  pointsEarned: number;
  recoveryOption: RecoveryOption | null;
  pointsLocked: boolean;
  recoveryModalShown: boolean;
}

export interface UserRow {
  dailyLimitG: number;
  goal: string | null;
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  reminderTime: string | null;
  sukiPoints: number;
}

export interface StreakRow {
  currentStreak: number;
  lastLoggedDate: string | null;
  graceDaysUsedThisWeek: number;
  weekStartDate: string | null;
}

export interface FrequentPick {
  foodName: string;
  logCount: number;
  lastQuantityUsed: string | null;
  lastSugarG: number | null;
}

export interface Badge {
  badgeId: string;
  unlockedAt: string | null;
}
