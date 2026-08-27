import { z } from "zod";
import { IntentSchema } from "@/lib/schemas/intent";
import { DecisionSchema } from "@/lib/schemas/decision";

/**
 * lib/schemas/audit.ts
 *
 * Append-only audit entry shape (plan §10). One entry per purchase attempt,
 * created at create-order time (status CREATED) and updated at verify time
 * (status PAID/FAILED) — never deleted, never overwritten wholesale.
 */

export const AuditStatusSchema = z.enum(["CREATED", "PAID", "FAILED"]);
export type AuditStatus = z.infer<typeof AuditStatusSchema>;

export const AuditEntrySchema = z.object({
  id: z.string(),               // == razorpay orderId, used as Firestore doc id
  sessionId: z.string(),
  userId: z.string().nullable().optional(),
  timestamp: z.string(),        // ISO, entry creation time
  transcript: z.string().nullable().optional(),
  intent: IntentSchema,
  decision: DecisionSchema,
  /** Consent artifact (decision #7): proof the approval gate actually fired. */
  approvalTimestamp: z.string(),
  consentHash: z.string(),      // hash of (intent + selected product) at approval time
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().nullable().optional(),
  status: AuditStatusSchema,
  failureReason: z.string().nullable().optional(),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;