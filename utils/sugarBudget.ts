import type { Entry } from '@/db/types';

/**
 * Redeemed treats (`entry.source === 'redeemed'`) are already paid for with Suki Points — a
 * separate resource from the daily sugar budget. Counting their grams against the ring/limit
 * too would be double-charging: the user spent points specifically so this treat wouldn't be
 * "just another log" pushing them over. Amended 2026-08-11 — see docs/prd/02-PRD-Suki.md
 * "Redemption Economy" and CLAUDE.md §11.1.
 *
 * Everywhere "today's sugar total" feeds the ring, isOverLimit, recovery trigger, SP calc, or a
 * day's under/over status, filter through this first.
 */
export function budgetRelevantEntries(entries: Entry[]): Entry[] {
  return entries.filter((e) => e.source !== 'redeemed');
}

export function sumSugarG(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + e.sugarG, 0);
}
