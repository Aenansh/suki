import { getDb } from '../client';
import type { StreakRow } from '../types';

type StreakDbRow = {
  current_streak: number;
  last_logged_date: string | null;
  grace_days_used_this_week: number;
  week_start_date: string | null;
};

function mapRow(row: StreakDbRow): StreakRow {
  return {
    currentStreak: row.current_streak,
    lastLoggedDate: row.last_logged_date,
    graceDaysUsedThisWeek: row.grace_days_used_this_week,
    weekStartDate: row.week_start_date,
  };
}

export async function getStreak(): Promise<StreakRow> {
  const db = await getDb();
  const row = await db.getFirstAsync<StreakDbRow>('SELECT * FROM streak WHERE id = 1');
  if (!row) throw new Error('streak row missing — db/client.ts should have seeded it');
  return mapRow(row);
}

export async function updateStreak(update: {
  currentStreak: number;
  lastLoggedDate: string;
  graceDaysUsedThisWeek: number;
  weekStartDate: string;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE streak SET current_streak = ?, last_logged_date = ?, grace_days_used_this_week = ?, week_start_date = ?
     WHERE id = 1`,
    update.currentStreak,
    update.lastLoggedDate,
    update.graceDaysUsedThisWeek,
    update.weekStartDate
  );
}
