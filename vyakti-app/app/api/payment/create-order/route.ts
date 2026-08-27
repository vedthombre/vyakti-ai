/**
 * POST /api/payment/create-order
 *
 * Called only after the user has tapped "Approve & Pay" in AWAITING_APPROVAL.
 * Client sends productId + sessionId only — never an amount (locked decision #6).
 */

import { NextRequest, NextResponse } from "next/server";
import { CreateOrderRequestSchema } from "@/lib/schemas/payment";
import { createOrder } from "@/lib/payments/razorpay";
import { createAuditEntry } from "@/lib/audit/auditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { productId, sessionId, intent, decision, transcript } = parsed.data;
    const order = await createOrder(productId);

    // Write the initial audit entry now — this IS the consent artifact
    // (decision #7): proof the approval gate fired before create-order ran.
    await createAuditEntry({
      orderId: order.orderId,
      sessionId,
      intent,
      decision,
      transcript,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // public key_id — safe for client
    });
  } catch (err) {
    console.error("[create-order] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}