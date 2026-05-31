"use client";

import { useState } from "react";
import type { Intent } from "@/lib/schemas/intent";
import type { OndcSeller } from "@/lib/mock/ondcMock";

// ── Constants ─────────────────────────────────────────────────────────────────

const DELIVERY_FEE = 25;
const PLATFORM_FEE = 5;

const UPI_OPTIONS = [
  { id: "gpay", label: "Google Pay", emoji: "🟢" },
  { id: "phonepe", label: "PhonePe", emoji: "🟣" },
  { id: "paytm", label: "Paytm", emoji: "🔵" },
  { id: "bhim", label: "BHIM UPI", emoji: "🇮🇳" },
] as const;

type UpiId = (typeof UPI_OPTIONS)[number]["id"];

// ── Props ─────────────────────────────────────────────────────────────────────

interface CheckoutSurfaceProps {
  intent: Intent;
  cheapest: OndcSeller;
  /** Called when the user confirms payment — triggers PROCESSING → MANIFESTED */
  onPayNow: () => void;
  onBack: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CheckoutSurface({
  intent,
  cheapest,
  onPayNow,
  onBack,
}: CheckoutSurfaceProps) {
  const [selectedUpi, setSelectedUpi] = useState<UpiId>("gpay");

  const qty = intent.quantity ?? 1;
  const subtotal = cheapest.price * qty;
  const total = subtotal + DELIVERY_FEE + PLATFORM_FEE;
  const currency = cheapest.currency;

  return (
    <div className="animate-card-rise isolate w-full h-auto rounded-[18px] bg-gradient-to-br from-[rgba(8,15,26,0.98)] to-[rgba(13,22,43,0.95)] border border-blue-400/30 p-6 flex flex-col gap-6 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back to marketplace"
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-[rgba(30,80,180,0.3)]
            text-[var(--muted)] hover:text-[var(--accent-hi)] hover:border-blue-400/50
            transition-all duration-150 active:scale-95"
        >
          ‹
        </button>
        <div>
          <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.12em]">Checkout</div>
          <div className="text-base font-bold text-[var(--text)] mt-px">
            {qty > 1 ? `${qty}× ` : ""}
            {intent.item_name ?? "Item"}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

      {/* ── Order summary ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.12em] font-semibold mb-1">
          Order Summary
        </div>

        {/* Seller row */}
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span>{cheapest.logoEmoji}</span>
            <span>{cheapest.platform}</span>
          </span>
          <span className="text-[var(--text)] font-medium">{currency}{subtotal}</span>
        </div>

        {/* Delivery fee */}
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-400">Delivery fee</span>
          <span className="text-[var(--text)] font-medium">{currency}{DELIVERY_FEE}</span>
        </div>

        {/* Platform fee */}
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-400">Platform fee</span>
          <span className="text-[var(--text)] font-medium">{currency}{PLATFORM_FEE}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[rgba(30,80,180,0.2)] my-1" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[var(--muted)]">Total Payable</span>
          <span className="text-[22px] font-extrabold text-[var(--neon)]">
            {currency}{total}
          </span>
        </div>
      </div>

      {/* ── UPI payment selector ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.12em] font-semibold">
          Pay via UPI
        </div>

        <div className="grid grid-cols-2 gap-5">
          {UPI_OPTIONS.map((opt) => {
            const active = selectedUpi === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedUpi(opt.id)}
                className={[
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium",
                  "transition-all duration-150 active:scale-[0.97]",
                  active
                    ? "bg-blue-600/[0.18] border border-blue-400/50 text-[var(--accent-hi)]"
                    : "bg-[rgba(8,15,26,0.6)] border border-[rgba(30,80,180,0.2)] text-[var(--muted)]",
                ].join(" ")}
              >
                <span className="text-base">{opt.emoji}</span>
                <span>{opt.label}</span>
                {active && (
                  <span className="ml-auto">
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Pay Now button ──────────────────────────────────────────────── */}
      <button
        id="pay-now-btn"
        onClick={onPayNow}
        className="w-full py-5 rounded-xl font-bold text-[15px] tracking-wide text-white
          bg-gradient-to-br from-blue-700 to-sky-700
          shadow-[0_4px_20px_rgba(37,99,235,0.5)]
          hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(37,99,235,0.7)]
          active:scale-[0.98] transition-all duration-150
          flex items-center justify-center gap-2"
      >
        <span>Pay {currency}{total} via {UPI_OPTIONS.find((o) => o.id === selectedUpi)?.label}</span>
        <span>→</span>
      </button>

      {/* Footnote */}
      <p className="text-[11px] text-slate-600 text-center -mt-2">
        Secured by ONDC · mock payment for demo purposes
      </p>
    </div>
  );
}
