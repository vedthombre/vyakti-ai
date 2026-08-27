/**
 * POST /api/payment/verify
 *
 * Called by the client after Razorpay Checkout.js returns a success callback.
 * The callback itself is NEVER trusted — this route recomputes the HMAC
 * signature server-side, which is the only source of truth for PAID status
 * (locked decision #6). Updates the audit entry created at create-order time.
 */

import { NextRequest, NextResponse } from "next/server";
import { VerifyPaymentRequestSchema } from "@/lib/schemas/payment";
import { verifySignature } from "@/lib/payments/razorpay";
import { updateAuditEntryStatus } from "@/lib/audit/auditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyPaymentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const result = verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    await updateAuditEntryStatus({
      orderId: result.orderId,
      status: result.status === "PAID" ? "PAID" : "FAILED",
      paymentId: result.paymentId,
      failureReason: result.failureReason,
    });

    return NextResponse.json({
      success: result.status === "PAID",
      status: result.status,
      error: result.failureReason,
    });
  } catch (err) {
    console.error("[verify] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}