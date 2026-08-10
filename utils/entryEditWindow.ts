import type { Entry } from '@/db/types';

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

/** Entries stay editable/deletable for 48 hours after logging, then lock — a grace window
 * generous enough to fix a same-day or next-day mistake without letting history be rewritten
 * indefinitely (which would undermine locked/rolled-over SP and streak math). */
export function canEditEntry(entry: Entry): boolean {
  return Date.now() - new Date(entry.timestamp).getTime() < EDIT_WINDOW_MS;
}
