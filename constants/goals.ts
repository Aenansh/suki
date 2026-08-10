/** Exact copy from the design's `goalDefs` (see docs/design/tokens.md). Shapes nudge copy, not the budget. */
export type GoalId = 'cut_crash' | 'manage_pcos' | 'train_better' | 'just_curious';

export const GOALS: { id: GoalId; title: string; sub: string }[] = [
  { id: 'cut_crash', title: 'Cut the crash', sub: 'Steadier energy through the day' },
  { id: 'manage_pcos', title: 'Manage PCOS', sub: 'Gentler, insulin-aware nudges' },
  { id: 'train_better', title: 'Train better', sub: 'Fuel around workouts, not against them' },
  { id: 'just_curious', title: 'Just curious', sub: 'See where the sugar actually hides' },
];

export function getGoalLabel(id: string | null): string {
  return GOALS.find((g) => g.id === id)?.title ?? 'Not set';
}
