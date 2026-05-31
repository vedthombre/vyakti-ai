"use client";

import type { Intent } from "@/lib/schemas/intent";
import type { OndcSeller } from "@/lib/mock/ondcMock";

// ── Seller Card ───────────────────────────────────────────────────────────────

interface SellerCardProps {
  seller: OndcSeller;
  isCheapest: boolean;
  quantity: number;
}

function SellerCard({ seller, isCheapest, quantity }: SellerCardProps) {
  const { logoEmoji, platform, price, currency, eta, rating } = seller;
  const totalPrice = price * quantity;

  return (
    <div
      className={[
        "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
        isCheapest
          ? "bg-blue-600/[0.12] border border-blue-400/[0.45]"
          : "bg-[rgba(8,15,26,0.8)] border border-[rgba(30,80,180,0.2)]",
      ].join(" ")}
    >
      {/* Left — platform info */}
      <div className="flex items-center gap-2.5">
        <span className="text-[22px]">{logoEmoji}</span>
        <div>
          <div
            className={[
              "font-semibold text-sm",
              isCheapest ? "text-[var(--accent-hi)]" : "text-[var(--text)]",
            ].join(" ")}
          >
            {platform}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            ⭐ {rating} · {eta}
          </div>
        </div>
      </div>

      {/* Right — pricing */}
      <div className="text-right">
        <div
          className={[
            "font-bold text-[18px]",
            isCheapest ? "text-[var(--neon)]" : "text-[var(--text)]",
          ].join(" ")}
        >
          {currency}{totalPrice}
        </div>

        {quantity > 1 && (
          <div className="text-[10px] text-[var(--muted)] mt-px">
            {currency}{price} × {quantity}
          </div>
        )}

        {isCheapest && (
          <div className="text-[10px] text-[var(--accent-hi)] font-semibold uppercase tracking-[0.05em]">
            Best Price
          </div>
        )}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MarketplaceSurfaceProps {
  intent: Intent;
  sellers: OndcSeller[];
  cheapest: OndcSeller | null;
  onCheckout: () => void;
  onReset: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarketplaceSurface({
  intent,
  sellers,
  cheapest,
  onCheckout,
  onReset,
}: MarketplaceSurfaceProps) {
  const qty = intent.quantity ?? 1;
  const isONDC = intent.routing === "ONDC_SEARCH";
  const isDirect = intent.routing === "DIRECT_APP";
  const isUnknown = intent.routing === "UNKNOWN";

  return (
    <div className="animate-card-rise isolate w-full h-auto rounded-[18px] bg-gradient-to-br from-[rgba(8,15,26,0.95)] to-[rgba(13,22,43,0.9)] border border-blue-400/30 px-8 py-6 flex flex-col gap-5 overflow-hidden">

      {/* ── UNKNOWN / Clarification branch ─────────────────────────────── */}
      {isUnknown ? (
        <>
          <div className="flex items-center gap-2.5">
            <span className="text-[28px]">🤔</span>
            <div>
              <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.1em]">
                Clarification Needed
              </div>
              <div className="text-[18px] font-bold text-[var(--text)] mt-0.5">
                I need more details
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

          <div className="px-4 py-3.5 rounded-xl bg-amber-400/[0.08] border border-amber-400/25 text-amber-400 text-[15px] leading-relaxed font-medium">
            {intent.clarification_needed ?? "Could you tell me what product you'd like to order?"}
          </div>

          <button
            id="speak-again-btn"
            onClick={onReset}
            className="w-full py-3.5 rounded-xl font-bold text-[15px] tracking-wide text-white
              bg-gradient-to-br from-blue-700 to-sky-700 shadow-[0_4px_20px_rgba(37,99,235,0.5)]
              flex items-center justify-center gap-2
              hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(37,99,235,0.65)]
              active:scale-[0.98] transition-all duration-150"
          >
            🎙 Speak Again
          </button>
        </>
      ) : (
        <>
          {/* ── Header row ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.1em]">
                {isONDC ? "ONDC Open Network" : "Direct App"}
              </div>
              <div className="text-[20px] font-bold text-[var(--text)] mt-0.5 capitalize">
                {qty > 1 ? `${qty}× ` : ""}
                {intent.item_name ?? "Item"}
                {intent.brand_preference ? ` · ${intent.brand_preference}` : ""}
              </div>
            </div>

            {/* Routing badge */}
            <div
              className={[
                "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.08em]",
                isONDC
                  ? "bg-blue-600/15 border border-blue-400/40 text-blue-400"
                  : "bg-emerald-500/15 border border-emerald-400/40 text-emerald-400",
              ].join(" ")}
            >
              {intent.routing}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

          {/* ── ONDC seller list ──────────────────────────────────────── */}
          {isONDC && (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-[var(--muted)] font-medium">
                Sellers found on ONDC
              </div>
              {sellers
                .filter((s) => s.inStock)
                .slice(0, 3)
                .map((seller, i) => (
                  <SellerCard
                    key={seller.id}
                    seller={seller}
                    isCheapest={i === 0}
                    quantity={qty}
                  />
                ))}
            </div>
          )}

          {/* ── Direct App single seller ──────────────────────────────── */}
          {isDirect && cheapest && (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-[var(--muted)] font-medium">
                Routing to {intent.store_brand}
              </div>
              <SellerCard
                seller={{ ...cheapest, platform: intent.store_brand ?? cheapest.platform }}
                isCheapest
                quantity={qty}
              />
            </div>
          )}

          {/* ── Order total ───────────────────────────────────────────── */}
          {cheapest && (
            <div className="flex items-center justify-between px-4 py-3 rounded-[10px] bg-blue-600/[0.06] border border-blue-600/15">
              <span className="text-[var(--muted)] text-[13px]">Total Payable</span>
              <span className="font-extrabold text-[22px] text-[var(--neon)]">
                {cheapest.currency}{cheapest.price * qty}
              </span>
            </div>
          )}

          {/* ── Action buttons ────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 mt-2">
            {cheapest && (
              <button
                id="checkout-btn"
                onClick={onCheckout}
                className="w-full py-5 rounded-xl font-bold text-[15px] tracking-wide text-white
                  bg-gradient-to-br from-blue-700 to-sky-700 shadow-[0_4px_20px_rgba(37,99,235,0.5)]
                  hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(37,99,235,0.65)]
                  active:scale-[0.98] transition-all duration-150"
              >
                Pay Now →
              </button>
            )}
            <button
              id="new-order-btn"
              onClick={onReset}
              className="w-full py-4 rounded-xl text-[13px] font-medium text-[var(--muted)]
                bg-transparent border border-[rgba(30,80,180,0.35)]
                hover:border-blue-400/50 hover:text-[var(--accent-hi)]
                active:scale-[0.98] transition-all duration-200"
            >
              New Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
