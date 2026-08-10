# PRD Addendum — Suki

> **This is not the canonical PRD.** Per CLAUDE.md §14, the source-of-truth BRD/PRD/UX-brief/TDD
> live in the project owner's Claude Projects workspace, not in this repo. This file exists
> because that workspace isn't reachable from this coding session — it's an addendum record of
> product decisions made *during implementation* that should be merged back into the canonical
> PRD by the project owner. Treat it as a diff, not a replacement.

## Addendum: Redemption Economy (2026-08-10)

**Context.** CLAUDE.md §11 originally locked the redemption price at a flat "sugar grams × 1
SP/gram" — the same rate at which SP is earned. In practice that makes redeeming a treat a pure
wash against an under-budget day: save 20g, bank ~20-25 SP, redeem a 20g treat, done. Nothing is
actually *earned* — it's a same-day shuffle, not a reward for restraint. Two related gaps showed
up alongside it during testing: nothing stopped a redeemed entry from being edited after the fact
(letting its logged sugar shrink without refunding the SP spent on it), and nothing capped how
many treats could be redeemed in a day.

**Decision.**
1. **Redemption costs a 25% premium**: `cost_SP = ceil(sugar_g × 1.25)`. Since `calculateDaySP`
   (CLAUDE.md §8) pays out at most ~25 SP even on an excellent day, a single mid-size treat now
   costs roughly a full good day's earnings — redemption reads as "I saved up for this," not
   "I moved a number sideways." See `utils/redeemPricing.ts`.
2. **One redemption per calendar day**, hard-capped (the UI disables the affordance once used,
   not just a warning). See `db/queries/entries.ts#hasRedeemedToday`, enforced in
   `app/redeem.tsx` and reflected in `app/(tabs)/points.tsx`.
3. **Redeemed entries (`entry.source = 'redeemed'`) are never editable**, at any age — only
   deletable, and deleting does not refund the SP spent. Editing would let the logged sugar be
   shrunk post-hoc while keeping the treat and the point cost already paid — a direct SP exploit.
   Regular logged entries remain editable for 48h and, when edited, re-run the Gemini estimate
   against the corrected food/quantity rather than asking the user to guess new grams by hand
   (the original ask that started this addendum — manual grams entry on edit defeated the point
   of quantity-based AI logging, CLAUDE.md §11 "Food logging").

**Why not solved with the schema instead.** No `entry` columns changed — this is pricing and UI
policy, not data model. `redeemed_treat` and `source='redeemed'` (CLAUDE.md §5) already carried
enough information to distinguish redemption entries from smart logs.

**Open question for the canonical PRD**: whether the 25% premium should scale with the user's
current streak or historical redemption frequency (e.g. cheaper for a first-time-this-week
redemption, pricier for a third in a row) rather than staying flat. Flat was chosen here for
launch simplicity — CLAUDE.md's "no hidden math" principle for the original 1:1 rate still
applies, just at a different ratio.

## Addendum: Redeemed sugar is leeway, not an added log (2026-08-11)

**The question that prompted this**: if a redeemed treat's grams get added to today's sugar
total the same as an organic log, what did the user actually gain by earning and spending
points on it? They paid SP *and* still get pushed toward (or into) recovery mode for the same
treat — a treat they specifically "earned." That's a double charge, and it directly undercuts
the BRD's "earn, don't just restrict" pillar (see BRD, or CLAUDE.md §2).

**Decision**: a redeemed treat's sugar is leeway — it does **not** add to the day's running
sugar total. Concretely, `entry.source = 'redeemed'` rows are excluded from every place "today's
sugar total" drives a decision:
- The sugar ring and `isOverLimit` on Home (`stores/logStore.ts`)
- The over-limit recovery trigger (a redeemed treat can never itself push the user into recovery
  mode)
- The day's SP-earning tier calculation, `calculateDaySP` (CLAUDE.md §8) — a redeemed treat can't
  also cost the user *that day's* earnings on top of the SP already spent on it
- History's calendar day status and the last-7-days bars (`app/(tabs)/history.tsx`)
- The "Under 20" badge's day-total check (`services/midnight.ts`)

It is **not** a "skip log" in the sense of being hidden — it still appears in the Today list
(with a gold "Redeemed" tag) so the record stays honest ("yes, you had a ghewar today, and it's
accounted for"), and it still counts toward the streak (showing up counts, same as any other
log — CLAUDE.md's streak mechanic was never sugar-total-based to begin with).

**Naming note for the canonical PRD**: internally this is implemented as a *filter* applied to
"budget-relevant" totals (`utils/sugarBudget.ts`), not a new entry type or a literal "skip" log
row — `redeemed` was already a distinct `entry.source` value (CLAUDE.md §5), so no schema change
was needed. Worth deciding in the canonical PRD whether the product-facing language should be
"doesn't count toward your limit" (current in-app copy) or something closer to "leeway" per this
request — currently the app uses the former.
