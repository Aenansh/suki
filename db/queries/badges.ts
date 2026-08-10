import { getDb } from '../client';
import type { Badge } from '../types';

type BadgeDbRow = { badge_id: string; unlocked_at: string | null };

function mapRow(row: BadgeDbRow): Badge {
  return { badgeId: row.badge_id, unlockedAt: row.unlocked_at };
}

export async function getUnlockedBadges(): Promise<Badge[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<BadgeDbRow>('SELECT * FROM badge ORDER BY unlocked_at ASC');
  return rows.map(mapRow);
}

export async function isBadgeUnlocked(badgeId: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT 1 FROM badge WHERE badge_id = ?', badgeId);
  return !!row;
}

export async function unlockBadge(badgeId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO badge (badge_id, unlocked_at) VALUES (?, ?)',
    badgeId,
    new Date().toISOString()
  );
}
