/** Names/copy from the design's `badgeDefs` (docs/design/tokens.md). The design only ever shows
 * three of these unlocked (flame/swap/leaf) — the other three stayed permanently locked in its
 * demo, so it never revealed what icon they'd use once earned. Icons for those three (and the
 * unlock math for "Swap Star"/"Rode It Out", which the design never defined either) are mine —
 * documented per-badge in utils/badgeChecker.ts. The screen always shows a plain lock while a
 * badge is locked, regardless of the icon below. */
export type BadgeIcon = 'flame' | 'swap' | 'leaf' | 'target' | 'star';

export interface BadgeDefinition {
  id: string;
  name: string;
  sub: string;
  icon: BadgeIcon;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'week_one', name: 'Week One', sub: '7 days logged', icon: 'flame' },
  { id: 'swap_star', name: 'Swap Star', sub: '10 smart swaps', icon: 'swap' },
  { id: 'rode_it_out', name: 'Rode It Out', sub: '5 SOS wins', icon: 'leaf' },
  { id: 'fortnight', name: 'Fortnight', sub: '14 days logged', icon: 'flame' },
  { id: 'under_20', name: 'Under 20', sub: 'A day below 20g', icon: 'target' },
  { id: 'century', name: 'Century', sub: '100 pts banked', icon: 'star' },
];
