/**
 * lib/audit/auditLog.ts
 *
 * Append-only Firestore writer/reader for the audit trail.
 * Collection: "auditTrail", document id == razorpay orderId.
 */

import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import type { AuditEntry } from "@/lib/schemas/audit";
import type { Intent } from "@/lib/schemas/intent";
import type { Decision } from "@/lib/schemas/decision";

const COLLECTION = "auditTrail";

/** Consent artifact hash (decision #7) — proof of what was approved and when. */
export function computeConsentHash(intent: Intent, decision: Decision): string {
  const payload = JSON.stringify({
    item_name: intent.item_name,
    brand_preference: intent.brand_preference,
    unit: intent.unit,
    quantity: intent.quantity,
    selectedProductId: decision.selected.productId,
    price: decision.selected.price,
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/** Called by create-order at approval time — writes the initial CREATED entry. */
export async function createAuditEntry(params: {
  orderId: string;
  sessionId: string;
  intent: Intent;
  decision: Decision;
  transcript?: string | null;
}): Promise<void> {
  const now = new Date().toISOString();
  const entry: AuditEntry = {
    id: params.orderId,
    sessionId: params.sessionId,
    userId: null, // wired in Stage 9 once we pass the NextAuth session through
    timestamp: now,
    transcript: params.transcript ?? null,
    intent: params.intent,
    decision: params.decision,
    approvalTimestamp: now,
    consentHash: computeConsentHash(params.intent, params.decision),
    razorpayOrderId: params.orderId,
    razorpayPaymentId: null,
    status: "CREATED",
    failureReason: null,
  };

  const db = getAdminDb();
  await db.collection(COLLECTION).doc(params.orderId).set(entry);
}

/** Called by verify route — updates the existing entry to PAID or FAILED. */
export async function updateAuditEntryStatus(params: {
  orderId: string;
  status: "PAID" | "FAILED";
  paymentId?: string;
  failureReason?: string;
}): Promise<void> {
  const db = getAdminDb();
  await db
    .collection(COLLECTION)
    .doc(params.orderId)
    .update({
      status: params.status,
      razorpayPaymentId: params.paymentId ?? null,
      failureReason: params.failureReason ?? null,
    });
}

/** Used by the optional GET /api/audit route. */
export async function getAuditTrail(sessionId: string): Promise<AuditEntry[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTION)
    .where("sessionId", "==", sessionId)
    .orderBy("timestamp", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as AuditEntry);
}