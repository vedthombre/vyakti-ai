import { z } from "zod";

// ── Routing Enum ─────────────────────────────────────────────────────────────
export const RoutingSchema = z.enum([
  "ONDC_SEARCH",
  "DIRECT_APP",
  "UNKNOWN",
]);
export type Routing = z.infer<typeof RoutingSchema>;

// ── Core Intent Schema ───────────────────────────────────────────────────────
export const IntentSchema = z.object({
  /** The canonical product name extracted from the utterance */
  item_name: z.string().nullable().optional(),

  /** Normalized quantity; defaults to 1 when not specified */
  quantity: z.number().int().positive().default(1),

  /** Preferred brand if explicitly mentioned ("Amul", "Bisleri", …) */
  brand_preference: z.string().nullable().optional(),

  /** Preferred unit of measure ("litre", "kg", "pack", …) */
  unit: z.string().nullable().optional(),

  /** How the agent should route this intent */
  routing: RoutingSchema,

  /**
   * When routing === "DIRECT_APP", the specific store to deep-link into.
   * Populated by the agent based on brand_preference or category rules.
   */
  store_brand: z.string().nullable().optional(),

  /**
   * Human-readable clarification question surfaced when routing === "UNKNOWN".
   * The UI renders this verbatim so it must be user-facing prose.
   */
  clarification_needed: z.string().nullable().optional(),

  /**
   * Ordered list of Chain-of-Thought reasoning steps produced by LangGraph.
   * Each entry is a single sentence summarising one agent decision.
   */
  steps: z.array(z.string()).default([]),
});

export type Intent = z.infer<typeof IntentSchema>;

// ── API Response Wrapper ─────────────────────────────────────────────────────
export const IntentResponseSchema = z.object({
  success: z.boolean(),
  intent: IntentSchema.optional(),
  error: z.string().optional(),
});

export type IntentResponse = z.infer<typeof IntentResponseSchema>;

// ── STT Response Schema ──────────────────────────────────────────────────────
export const STTResponseSchema = z.object({
  success: z.boolean(),
  text: z.string().optional(),
  error: z.string().optional(),
  details: z.string().optional(),
});

export type STTResponse = z.infer<typeof STTResponseSchema>;
