/**
 * Redemption pricing — amended 2026-08-10 (superseding CLAUDE.md §11's original flat
 * "sugar grams × 1 SP/gram"). A 1:1 rate makes redeeming a pure wash against what an
 * under-budget day just earned you — no real trade-off, nothing "earned". A treat should cost
 * more than the grams it contains, so banking points across a few good days is what it actually
 * takes to afford one — see docs/prd/02-PRD-Suki.md "Redemption Economy" for the full rationale.
 */
const REDEMPTION_PREMIUM = 1.25; // 25% over the sugar-gram cost

export function calculateRedeemCost(sugarG: number): number {
  return Math.max(1, Math.ceil(sugarG * REDEMPTION_PREMIUM));
}
