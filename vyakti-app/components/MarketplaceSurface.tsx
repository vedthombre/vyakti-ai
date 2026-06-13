"use client";

import type { Intent } from "@/lib/schemas/intent";
import type { OndcSeller } from "@/lib/mock/ondcMock";
import type { ProductVariant } from "@/lib/mock/productSearch";

// ── Seller Card ───────────────────────────────────────────────────────────────

interface SellerCardProps {
  seller: OndcSeller;
  isCheapest: boolean;
  quantity: number;
  productName: string;
}

function SellerCard({ seller, isCheapest, quantity, productName }: SellerCardProps) {
  const { platform, price, currency, eta, redirectUrl } = seller;
  const totalPrice = price * quantity;
  
  // Hardcoded platform colors to match Figma screenshots roughly
  const platformColors: Record<string, { bg: string; text: string; initial: string }> = {
    Blinkit: { bg: "#FFD000", text: "#000000", initial: "B" },
    Zepto:   { bg: "#7A28CB", text: "#FFFFFF", initial: "Z" },
    Swiggy:  { bg: "#FC8019", text: "#FFFFFF", initial: "S" },
  };
  
  const colors = platformColors[platform] || { bg: "#E5E7EB", text: "#1A1A1A", initial: platform[0] };

  return (
    <div
      className={[
        "relative flex flex-col pt-3 pb-4 px-4 transition-all duration-200",
        isCheapest
          ? "bg-white border-2 border-[#22C55E] rounded-2xl"
          : "bg-white border border-[#E5E7EB] rounded-[18px]",
      ].join(" ")}
      style={isCheapest ? { boxShadow: "0 4px 14px rgba(34,197,94,0.12)" } : { boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}
    >
      {/* BEST PICK Header */}
      {isCheapest && (
        <div className="absolute top-0 left-0 right-0 h-9 bg-[#22C55E] rounded-t-xl flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5 text-white font-bold text-[11px] tracking-[0.05em] uppercase">
            <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Best Pick
          </div>
          {/* Example fake savings */}
          <div className="text-white font-semibold text-[11px]">
            Save {currency}13
          </div>
        </div>
      )}

      <div className={["flex items-center gap-3", isCheapest ? "mt-9" : ""].join(" ")}>
        {/* App Icon */}
        <div className="relative">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm"
            style={{ background: colors.bg, color: colors.text }}
          >
            {colors.initial}
          </div>
          {isCheapest && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#22C55E] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
              1
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[17px] text-[#1A1A1A]">{platform}</h3>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-[#1A1A1A]">
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {eta}
            </div>
          </div>
          <p className="text-[13px] text-[#888780] mt-0.5 pr-2 truncate">
            {productName}
          </p>

          <div className="flex items-end justify-between mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-[22px] text-[#1A1A1A]">{currency}{totalPrice}</span>
              {isCheapest && <span className="text-[14px] font-medium text-[#D1D5DB] line-through">{currency}{totalPrice + 13}</span>}
            </div>
            
            <button
              onClick={() => window.open(redirectUrl, "_blank")}
              className={[
                "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-[13px] transition-transform active:scale-95",
                isCheapest ? "bg-[#22C55E] text-white" : "bg-[#1A1A1A] text-white"
              ].join(" ")}
            >
              Continue in {platform}
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MarketplaceSurfaceProps {
  intent: Intent;
  selectedProduct: ProductVariant | null;
  sellers: OndcSeller[];
  cheapest: OndcSeller | null;
  onReset: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarketplaceSurface({
  intent,
  selectedProduct,
  sellers,
  cheapest,
  onReset,
}: MarketplaceSurfaceProps) {
  const qty = intent.quantity ?? 1;
  const displayName = selectedProduct?.name || intent.item_name || "milk and eggs";

  return (
    <div className="w-full flex flex-col gap-4 animate-transcript-in">
      
      {/* Header */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-[15px] font-medium text-[#888780] hover:text-[#1A1A1A] transition-colors"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          New search
        </button>
      </div>

      <div className="flex items-start gap-4">
        {/* Fake Cart Icon */}
        <div className="w-12 h-12 rounded-[14px] bg-white border border-[#E5E7EB] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] shrink-0">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        
        <div>
          <p className="text-[13px] text-[#888780] font-medium">You asked for</p>
          <h2 className="text-[26px] font-bold text-[#1A1A1A] leading-[1.1] tracking-tight mt-0.5">
            {displayName}
          </h2>
        </div>
      </div>

      {/* Sorting Pill */}
      <div className="inline-flex w-fit items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E0F2E9] text-[#16A34A] text-[12px] font-semibold border border-[#22C55E]/30">
        <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        3 options · sorted by speed
      </div>

      {/* Sellers List */}
      <div className="flex flex-col gap-3 mt-1">
        {sellers
          .filter((s) => s.inStock)
          .slice(0, 3)
          .map((seller, i) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              isCheapest={i === 0}
              quantity={qty}
              productName={displayName}
            />
          ))}
      </div>

      {/* Bottom Search Again Button */}
      <button
        onClick={onReset}
        className="mt-2 w-full py-4 bg-white border border-[#E5E7EB] rounded-[18px] text-[15px] font-semibold text-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
        Search again
      </button>

    </div>
  );
}
