import { getDb } from '../client';

/** Wipes today's entries only — the lightweight "start today over" option in Settings. */
export async function clearTodayEntries(date: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM entry WHERE date = ?', date);
  await db.runAsync('UPDATE day_log SET points_earned = 0, points_locked = 0 WHERE date = ?', date);
}

/** Resets all logged progress (entries, day logs, badges, streak, points) but keeps the user's
 * configured limit/goal/onboarding state and their API key — a "fresh start", not a factory reset. */
export async function resetAllProgress(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM entry;
    DELETE FROM day_log;
    DELETE FROM frequent_pick;
    DELETE FROM badge;
    UPDATE user SET suki_points = 0 WHERE id = 1;
    UPDATE streak SET current_streak = 0, last_logged_date = NULL, grace_days_used_this_week = 0, week_start_date = NULL WHERE id = 1;
  `);
}
