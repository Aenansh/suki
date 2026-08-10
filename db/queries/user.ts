import { getDb } from '../client';
import type { UserRow } from '../types';

type UserDbRow = {
  daily_limit_g: number;
  goal: string | null;
  onboarding_complete: number;
  notifications_enabled: number;
  reminder_time: string | null;
  suki_points: number;
};

function mapRow(row: UserDbRow): UserRow {
  return {
    dailyLimitG: row.daily_limit_g,
    goal: row.goal,
    onboardingComplete: row.onboarding_complete === 1,
    notificationsEnabled: row.notifications_enabled === 1,
    reminderTime: row.reminder_time,
    sukiPoints: row.suki_points,
  };
}

export async function getUser(): Promise<UserRow> {
  const db = await getDb();
  const row = await db.getFirstAsync<UserDbRow>('SELECT * FROM user WHERE id = 1');
  if (!row) throw new Error('user row missing — db/client.ts should have seeded it');
  return mapRow(row);
}

export async function setDailyLimit(grams: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE user SET daily_limit_g = ? WHERE id = 1', grams);
}

export async function setGoal(goal: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE user SET goal = ? WHERE id = 1', goal);
}

export async function setOnboardingComplete(complete: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE user SET onboarding_complete = ? WHERE id = 1', complete ? 1 : 0);
}

export async function setNotificationsEnabled(enabled: boolean, reminderTime: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE user SET notifications_enabled = ?, reminder_time = ? WHERE id = 1',
    enabled ? 1 : 0,
    reminderTime
  );
}

/** Positive to earn, negative to spend — callers (userStore) expose addPoints/deductPoints separately. */
export async function adjustPoints(deltaSp: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE user SET suki_points = suki_points + ? WHERE id = 1', deltaSp);
}
