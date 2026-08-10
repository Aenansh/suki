import { getDb } from '../client';
import type { FrequentPick } from '../types';

type FrequentPickDbRow = {
  food_name: string;
  log_count: number;
  last_quantity_used: string | null;
  last_sugar_g: number | null;
};

function mapRow(row: FrequentPickDbRow): FrequentPick {
  return {
    foodName: row.food_name,
    logCount: row.log_count,
    lastQuantityUsed: row.last_quantity_used,
    lastSugarG: row.last_sugar_g,
  };
}

export async function getTopFrequentPicks(limit = 5): Promise<FrequentPick[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<FrequentPickDbRow>(
    'SELECT * FROM frequent_pick ORDER BY log_count DESC LIMIT ?',
    limit
  );
  return rows.map(mapRow);
}

/**
 * Upserts a pick and bumps its log_count — called every time a food is logged. `trusted` gates
 * whether `sugarG` overwrites `last_sugar_g` (the Gemini-estimate cache getCachedSugar reads).
 * A manual-fallback grams entry (no key, or Gemini failed) is a guess, not an estimate — caching
 * it would make the NEXT attempt at the same food silently skip Gemini forever, using that guess
 * instead. Untrusted logs still update log_count/last_quantity_used, just never last_sugar_g.
 */
export async function recordFrequentPick(
  foodName: string,
  quantity: string,
  sugarG: number,
  trusted: boolean
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO frequent_pick (food_name, log_count, last_quantity_used, last_sugar_g)
     VALUES (?, 1, ?, ?)
     ON CONFLICT(food_name) DO UPDATE SET
       log_count = log_count + 1,
       last_quantity_used = excluded.last_quantity_used,
       last_sugar_g = CASE WHEN ? THEN ? ELSE last_sugar_g END`,
    foodName,
    quantity,
    trusted ? sugarG : null,
    trusted ? 1 : 0,
    sugarG
  );
}

/** Cached estimate for a known food — lets the Gemini service skip the API call. */
export async function getCachedSugar(foodName: string): Promise<number | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ last_sugar_g: number | null }>(
    'SELECT last_sugar_g FROM frequent_pick WHERE food_name = ?',
    foodName
  );
  return row?.last_sugar_g ?? null;
}
