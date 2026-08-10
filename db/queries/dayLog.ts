import { getDb } from '../client';
import type { DayLog, RecoveryOption } from '../types';

type DayLogDbRow = {
  date: string;
  points_earned: number;
  recovery_option: RecoveryOption | null;
  points_locked: number;
  recovery_modal_shown: number;
};

function mapRow(row: DayLogDbRow): DayLog {
  return {
    date: row.date,
    pointsEarned: row.points_earned,
    recoveryOption: row.recovery_option,
    pointsLocked: row.points_locked === 1,
    recoveryModalShown: row.recovery_modal_shown === 1,
  };
}

/** Creates the day_log row if it doesn't exist yet. entry.date has a FK to day_log.date, so
 * this must run before the first entry of a day is inserted. */
export async function ensureDayLog(date: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR IGNORE INTO day_log (date) VALUES (?)', date);
}

export async function getDayLog(date: string): Promise<DayLog | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<DayLogDbRow>('SELECT * FROM day_log WHERE date = ?', date);
  return row ? mapRow(row) : null;
}

export async function setRecoveryModalShown(date: string): Promise<void> {
  const db = await getDb();
  await ensureDayLog(date);
  await db.runAsync('UPDATE day_log SET recovery_modal_shown = 1 WHERE date = ?', date);
}

export async function setRecoveryOption(date: string, option: RecoveryOption): Promise<void> {
  const db = await getDb();
  await ensureDayLog(date);
  await db.runAsync('UPDATE day_log SET recovery_option = ? WHERE date = ?', option, date);
}

/** Locks a day's points after midnight rollover so they can't be earned twice. */
export async function lockDayPoints(date: string, pointsEarned: number): Promise<void> {
  const db = await getDb();
  await ensureDayLog(date);
  await db.runAsync('UPDATE day_log SET points_earned = ?, points_locked = 1 WHERE date = ?', pointsEarned, date);
}

export async function getUnlockedDaysBefore(today: string): Promise<DayLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<DayLogDbRow>(
    'SELECT * FROM day_log WHERE date < ? AND points_locked = 0 ORDER BY date ASC',
    today
  );
  return rows.map(mapRow);
}

export async function getDayLogsBetween(startDate: string, endDate: string): Promise<DayLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<DayLogDbRow>(
    'SELECT * FROM day_log WHERE date >= ? AND date <= ? ORDER BY date ASC',
    startDate,
    endDate
  );
  return rows.map(mapRow);
}
