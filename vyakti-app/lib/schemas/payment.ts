
import { z } from "zod";
import { IntentSchema } from "@/lib/schemas/intent";
import { DecisionSchema } from "@/lib/schemas/decision";

/**
 * lib/schemas/payment.ts
 *
 * Request/response contracts for our own API routes:
 *   POST /api/payment/create-order
 *   POST /api/payment/verify
 *
 * Design rule (payment security): the client NEVER sends a price or amount.
 * It only ever sends which product it wants to pay for. The server looks up
 * the authoritative price from lib/mock/catalog.ts's PRODUCTS and computes
 * the Razorpay order amount itself.
 */

// ── POST /api/payment/create-order ──────────────────────────────────────────

export const CreateOrderRequestSchema = z.object({
  productId: z.string(),
  /** Ties this order back to the approving user's session — audit trail. */
  sessionId: z.string(),
  /** Snapshot of what the AI buyer decided, for the audit trail (plan §10). */
  intent: IntentSchema,
  decision: DecisionSchema,
  /** Raw transcript text, if available — optional since text-input flow has none. */
  transcript: z.string().nullable().optional(),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

export const CreateOrderResponseSchema = z.object({
  success: z.boolean(),
  orderId: z.string().optional(),
  amount: z.number().optional(),   // paise
  currency: z.string().optional(),
  key: z.string().optional(),      // Razorpay public key_id, safe for client
  error: z.string().optional(),
});
export type CreateOrderResponse = z.infer<typeof CreateOrderResponseSchema>;

// ── POST /api/payment/verify ─────────────────────────────────────────────────

export const VerifyPaymentRequestSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  sessionId: z.string(),
});
export type VerifyPaymentRequest = z.infer<typeof VerifyPaymentRequestSchema>;

export const VerifyPaymentResponseSchema = z.object({
  success: z.boolean(),
  status: z.enum(["PAID", "FAILED"]).optional(),
  error: z.string().optional(),
});
export type VerifyPaymentResponse = z.infer<typeof VerifyPaymentResponseSchema>;