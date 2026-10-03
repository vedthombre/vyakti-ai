"use client";

import { useState } from "react";
import type { Decision } from "@/lib/schemas/decision";
import type { Intent } from "@/lib/schemas/intent";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (resp: unknown) => void) => void;
    };
  }
}

interface PaymentGateProps {
  decision: Decision;
  intent: Intent;
  sessionId: string;
  transcript?: string | null;
  /** Fired right before the Razorpay modal opens — caller sets AppState to PAYING. */
  onPaying: () => void;
  onPaid: (result: { orderId: string; paymentId: string }) => void;
  onFailed: (reason: string) => void;
  onDecline: () => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * The explicit approval gate (plan §9, decision #7). No create-order call
 * fires until the user taps "Approve & Pay" — this button only renders
 * once DecisionExplainer has already shown the product + reasoning.
 */
export default function PaymentGate({
  decision,
  intent,
  sessionId,
  transcript,
  onPaying,
  onPaid,
  onFailed,
  onDecline,
}: PaymentGateProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: decision.selected.productId,
          sessionId,
          intent,
          decision,
          transcript: transcript ?? null,
        }),
      });
      const createData = await createRes.json();

      if (!createData.success) {
        onFailed(createData.error ?? "Could not create payment order.");
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        onFailed("Could not load Razorpay checkout. Check your connection.");
        setLoading(false);
        return;
      }

      onPaying();

      const rzp = new window.Razorpay({
        key: createData.key,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.orderId,
        name: "Vyakti",
        description: decision.selected.name,
        handler: async (response: unknown) => {
          const r = response as {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          };
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...r, sessionId }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              onPaid({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id });
            } else {
              onFailed(verifyData.error ?? "Payment could not be verified.");
            }
          } catch {
            onFailed("Network error while verifying payment.");
          }
        },
        modal: {
          // Failure mode 1 of 4 (plan §11): user dismisses without paying.
          // Never silently swallowed.
          ondismiss: () => onFailed("Payment cancelled."),
        },
        theme: { color: "#22C55E" },
      });

      // Failure mode 2 of 4: Razorpay's own payment.failed event.
      rzp.on("payment.failed", (resp: unknown) => {
        const r = resp as { error?: { description?: string } };
        onFailed(r.error?.description ?? "Payment failed.");
      });

      rzp.open();
    } catch {
      onFailed("Network error while starting payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="w-full py-4 bg-[#22C55E] text-white rounded-[18px] text-[16px] font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
      >
        {loading ? "Preparing payment…" : `Approve & Pay ₹${decision.selected.price}`}
      </button>
      <button
        onClick={onDecline}
        disabled={loading}
        className="w-full py-3.5 bg-white border border-[#E5E7EB] rounded-[18px] text-[15px] font-semibold text-[#888780] active:scale-95 transition-transform disabled:opacity-60"
      >
        Decline
      </button>
    </div>
  );
}