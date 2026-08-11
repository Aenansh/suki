import { generateId } from '@/utils/id';

import { getDb } from '../client';
import type { Entry, EntryInput } from '../types';
import { ensureDayLog } from './dayLog';

type EntryDbRow = {
  id: string;
  date: string;
  timestamp: string;
  food_name: string | null;
  quantity_description: string | null;
  sugar_g: number;
  sugar_g_source: Entry['sugarGSource'];
  source: Entry['source'];
  redeemed_treat: string | null;
};

function mapRow(row: EntryDbRow): Entry {
  return {
    id: row.id,
    date: row.date,
    timestamp: row.timestamp,
    foodName: row.food_name,
    quantityDescription: row.quantity_description,
    sugarG: row.sugar_g,
    sugarGSource: row.sugar_g_source,
    source: row.source,
    redeemedTreat: row.redeemed_treat,
  };
}

export async function getEntriesForDate(date: string): Promise<Entry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<EntryDbRow>('SELECT * FROM entry WHERE date = ? ORDER BY timestamp ASC', date);
  return rows.map(mapRow);
}

export async function addEntry(date: string, input: EntryInput): Promise<Entry> {
  const db = await getDb();
  await ensureDayLog(date); // entry.date has a FK to day_log.date

  const entry: Entry = {
    id: generateId(),
    date,
    timestamp: new Date().toISOString(),
    foodName: input.foodName ?? null,
    quantityDescription: input.quantityDescription ?? null,
    sugarG: input.sugarG,
    sugarGSource: input.sugarGSource,
    source: input.source,
    redeemedTreat: input.redeemedTreat ?? null,
  };

  await db.runAsync(
    `INSERT INTO entry (id, date, timestamp, food_name, quantity_description, sugar_g, sugar_g_source, source, redeemed_treat)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    entry.id,
    entry.date,
    entry.timestamp,
    entry.foodName,
    entry.quantityDescription,
    entry.sugarG,
    entry.sugarGSource,
    entry.source,
    entry.redeemedTreat
  );

  return entry;
}

/** Looks up a single entry regardless of date — needed because edit mode (app/log.tsx) can be
 * opened from any day's list (components/home/EntryRow.tsx on Home *and* a past day's detail
 * view, app/day/[date].tsx), not just today's in-memory store data. */
export async function getEntryById(id: string): Promise<Entry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<EntryDbRow>('SELECT * FROM entry WHERE id = ?', id);
  return row ? mapRow(row) : null;
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM entry WHERE id = ?', id);
}

export async function updateEntry(id: string, updates: Partial<EntryInput>): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.foodName !== undefined) {
    fields.push('food_name = ?');
    values.push(updates.foodName);
  }
  if (updates.quantityDescription !== undefined) {
    fields.push('quantity_description = ?');
    values.push(updates.quantityDescription);
  }
  if (updates.sugarG !== undefined) {
    fields.push('sugar_g = ?');
    values.push(updates.sugarG);
  }
  if (updates.sugarGSource !== undefined) {
    fields.push('sugar_g_source = ?');
    values.push(updates.sugarGSource);
  }
  if (updates.source !== undefined) {
    fields.push('source = ?');
    values.push(updates.source);
  }
  if (updates.redeemedTreat !== undefined) {
    fields.push('redeemed_treat = ?');
    values.push(updates.redeemedTreat);
  }
  if (fields.length === 0) return;

  await db.runAsync(`UPDATE entry SET ${fields.join(', ')} WHERE id = ?`, ...values, id);
}

/** Entries logged via smart (AI-estimated) quantity lookup at a light sugar weight — the proxy
 * this app uses for a "smart swap" (see constants/badgeDefinitions.ts). */
export async function countLightSmartLogs(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM entry WHERE source = 'smart_log' AND sugar_g_source = 'ai_estimated' AND sugar_g < 10"
  );
  return row?.n ?? 0;
}

/** At most one redemption per calendar day (docs/prd/02-PRD-Suki.md "Redemption Economy") — keeps
 * treats a deliberate, rate-limited reward rather than something spammable. */
export async function hasRedeemedToday(date: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync("SELECT 1 FROM entry WHERE date = ? AND source = 'redeemed' LIMIT 1", date);
  return !!row;
}

export async function getEntriesBetween(startDate: string, endDate: string): Promise<Entry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<EntryDbRow>(
    'SELECT * FROM entry WHERE date >= ? AND date <= ? ORDER BY date ASC, timestamp ASC',
    startDate,
    endDate
  );
  return rows.map(mapRow);
}
