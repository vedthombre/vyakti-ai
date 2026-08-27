import { z } from "zod";

// ── Decision candidate ──────────────────────────────────────────────────────
// A single scored product option, flattened for direct UI consumption so
// DecisionExplainer/PaymentGate (Stage 8) don't need to re-join
// Brand/Variant/Product themselves.

export const DecisionCandidateSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  brandId: z.string(),
  brandName: z.string(),
  name: z.string(),   // variant display name, e.g. "Amul Taaza Toned Milk 1L"
  image: z.string(),  // emoji, from Brand.emoji
  price: z.number(),
  currency: z.string(),
  unit: z.string(),
  inStock: z.boolean(),
});
export type DecisionCandidate = z.infer<typeof DecisionCandidateSchema>;

// ── Decision ─────────────────────────────────────────────────────────────────
// Output of the deterministic decision engine (lib/marketplace/aggregator.ts).
// `selected` is never chosen by an LLM — locked project decision #3.

export const DecisionSchema = z.object({
  selected: DecisionCandidateSchema,
  reasoning: z.array(z.string()),
  alternatives: z.array(DecisionCandidateSchema),
});
export type Decision = z.infer<typeof DecisionSchema>;