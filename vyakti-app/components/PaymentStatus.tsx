"use client";

import type { Decision } from "@/lib/schemas/decision";

interface PaymentStatusProps {
  status: "PAID" | "PAYMENT_FAILED";
  decision: Decision;
  orderId?: string;
  paymentId?: string;
  failureReason?: string;
  /** Failure modes 3/4 of §11 (signature mismatch, network/timeout) also land here. */
  onRetry: () => void;
  onStartOver: () => void;
}

export default function PaymentStatus({
  status,
  decision,
  orderId,
  paymentId,
  failureReason,
  onRetry,
  onStartOver,
}: PaymentStatusProps) {
  const isPaid = status === "PAID";

  return (
    <div className="w-full flex flex-col items-center gap-4 py-6 animate-transcript-in">
      <div
        className={[
          "w-16 h-16 rounded-full flex items-center justify-center text-3xl",
          isPaid ? "bg-[#E0F2E9]" : "bg-[#FEF2F2]",
        ].join(" ")}
      >
        {isPaid ? "✅" : "⚠️"}
      </div>

      <div className="text-center">
        <h2 className="text-[20px] font-bold text-[#1A1A1A]">
          {isPaid ? "Payment successful" : "Payment failed"}
        </h2>
        <p className="text-[14px] text-[#888780] mt-1">
          {isPaid
            ? `${decision.selected.name} · ₹${decision.selected.price}`
            : failureReason ?? "Something went wrong during payment."}
        </p>
      </div>

      {isPaid && orderId && (
        <div className="w-full flex flex-col gap-1 px-4 py-3 bg-[#F1EFE8] rounded-[14px] text-[12px] text-[#888780]">
          <span>Order ID: {orderId}</span>
          {paymentId && <span>Payment ID: {paymentId}</span>}
        </div>
      )}

      <div className="w-full flex flex-col gap-3 mt-2">
        {/* No silent auto-retry (plan §11) — retry is always user-initiated,
            and per plan does NOT re-run the decision engine, same product. */}
        {!isPaid && (
          <button
            onClick={onRetry}
            className="w-full py-4 bg-[#1A1A1A] text-white rounded-[18px] text-[15px] font-bold active:scale-95 transition-transform"
          >
            Retry payment
          </button>
        )}
        <button
          onClick={onStartOver}
          className="w-full py-3.5 bg-white border border-[#E5E7EB] rounded-[18px] text-[15px] font-semibold text-[#1A1A1A] active:scale-95 transition-transform"
        >
          {isPaid ? "Start new order" : "Start over"}
        </button>
      </div>
    </div>
  );
}