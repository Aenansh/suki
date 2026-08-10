import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

import { SCHEMA_SQL } from './schema';

const DB_NAME = 'suki.db';
const MIGRATION_FLAG = 'suki_migration_clear_frequent_pick_v1';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** SQLite singleton — opens once, applies schema + seed rows, then reuses the connection. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync(SCHEMA_SQL);
  // `user` and `streak` are single-row tables (id=1) — seed them so every query.ts
  // can assume the row exists instead of null-checking everywhere.
  await db.execAsync(`
    INSERT OR IGNORE INTO user (id) VALUES (1);
    INSERT OR IGNORE INTO streak (id) VALUES (1);
  `);
  await clearPoisonedFrequentPickCache(db);
  return db;
}

/**
 * One-time cleanup (2026-08-11): `recordFrequentPick` used to cache manual-fallback grams as if
 * they were a trusted Gemini estimate, so once a food was logged manually once, `estimateSugar`
 * would keep reusing that guess forever instead of calling Gemini again. The write path is
 * fixed, but rows written before the fix are still sitting in the DB with a poisoned
 * `last_sugar_g`. `frequent_pick` is purely a convenience cache — wiping it loses nothing but
 * quick-tap chip ordering, so a silent one-time clear is safe. Gated by an AsyncStorage flag so
 * it only ever runs once per install.
 */
async function clearPoisonedFrequentPickCache(db: SQLite.SQLiteDatabase): Promise<void> {
  const alreadyRan = await AsyncStorage.getItem(MIGRATION_FLAG);
  if (alreadyRan) return;
  await db.execAsync('DELETE FROM frequent_pick;');
  await AsyncStorage.setItem(MIGRATION_FLAG, '1');
}
