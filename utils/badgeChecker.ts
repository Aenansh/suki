import { countLightSmartLogs } from '@/db/queries/entries';
import { isBadgeUnlocked, unlockBadge } from '@/db/queries/badges';
import { useStreakStore } from '@/stores/streakStore';
import { useUserStore } from '@/stores/userStore';
import { getSosResistCount } from './sosCounter';

/**
 * Evaluates every badge in constants/badgeDefinitions.ts against current state and unlocks any
 * newly-met ones. Call after events that could move the needle: SOS resisted, and once per day
 * during midnight rollover (pass `dayTotalG` for that finalized day to check "Under 20").
 * Returns the ids of badges unlocked by this call (empty if none — never throws).
 */
export async function checkAndUnlockBadges(context?: { dayTotalG?: number }): Promise<string[]> {
  const streak = useStreakStore.getState().currentStreak;
  const points = useUserStore.getState().sukiPoints;
  const [sosCount, lightLogCount] = await Promise.all([getSosResistCount(), countLightSmartLogs()]);

  const checks: { id: string; met: boolean }[] = [
    { id: 'week_one', met: streak >= 7 },
    { id: 'fortnight', met: streak >= 14 },
    { id: 'century', met: points >= 100 },
    { id: 'rode_it_out', met: sosCount >= 5 },
    { id: 'swap_star', met: lightLogCount >= 10 },
    { id: 'under_20', met: context?.dayTotalG != null && context.dayTotalG < 20 },
  ];

  const newlyUnlocked: string[] = [];
  for (const check of checks) {
    if (!check.met) continue;
    if (await isBadgeUnlocked(check.id)) continue;
    await unlockBadge(check.id);
    newlyUnlocked.push(check.id);
  }
  return newlyUnlocked;
}
