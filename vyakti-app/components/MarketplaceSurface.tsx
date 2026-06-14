"use client";

import type { ProductVariant, PlatformListing } from "@/lib/mock/catalog";
import type { ScrapedProduct } from "@/lib/scraper/merchantSearch";

// ── Normalised listing (works for both live + fallback data) ──────────────────

type AnyListing = {
  platform: string;
  price: number;
  eta: string;
  inStock: boolean;
  deepLink: string;
};

function normalise(item: PlatformListing | ScrapedProduct): AnyListing {
  return {
    platform: item.platform,
    price:    item.price,
    eta:      item.eta,
    inStock:  item.inStock,
    deepLink: "deepLink" in item ? item.deepLink : (item as PlatformListing).deepLink,
  };
}

// ── Platform Config ────────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<string, { bg: string; text: string; initial: string }> = {
  Blinkit:   { bg: "#FFD000", text: "#000000", initial: "B" },
  Zepto:     { bg: "#7A28CB", text: "#FFFFFF", initial: "Z" },
  Swiggy:    { bg: "#FC8019", text: "#FFFFFF", initial: "S" },
  BigBasket: { bg: "#84C225", text: "#FFFFFF", initial: "BB" },
  JioMart:   { bg: "#00529B", text: "#FFFFFF", initial: "JM" },
};

// ── Listing Card ───────────────────────────────────────────────────────────────

function ListingCard({
  listing,
  isCheapest,
  productName,
}: {
  listing: AnyListing;
  isCheapest: boolean;
  productName: string;
}) {
  const colors = PLATFORM_CONFIG[listing.platform] ?? { bg: "#E5E7EB", text: "#1A1A1A", initial: listing.platform[0] };

  const handleOpen = () => window.open(listing.deepLink, "_blank");

  return (
    <div
      className={[
        "relative flex flex-col pt-3 pb-4 px-4 transition-all duration-200",
        isCheapest
          ? "bg-white border-2 border-[#22C55E] rounded-2xl"
          : "bg-white border border-[#E5E7EB] rounded-[18px]",
      ].join(" ")}
      style={isCheapest
        ? { boxShadow: "0 4px 14px rgba(34,197,94,0.12)" }
        : { boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}
    >
      {/* Best Pick Banner */}
      {isCheapest && (
        <div className="absolute top-0 left-0 right-0 h-9 bg-[#22C55E] rounded-t-xl flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5 text-white font-bold text-[11px] tracking-[0.05em] uppercase">
            <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Best Pick · Cheapest
          </div>
        </div>
      )}

      <div className={["flex items-center gap-3", isCheapest ? "mt-9" : ""].join(" ")}>
        {/* Platform Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm"
          style={{ background: colors.bg, color: colors.text }}
        >
          {colors.initial}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[17px] text-[#1A1A1A]">{listing.platform}</h3>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-[#1A1A1A]">
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {listing.eta}
            </div>
          </div>
          <p className="text-[13px] text-[#888780] mt-0.5 truncate pr-2">{productName}</p>

          <div className="flex items-end justify-between mt-2.5">
            <span className="font-extrabold text-[22px] text-[#1A1A1A]">₹{listing.price}</span>
            <button
              onClick={handleOpen}
              className={[
                "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-[13px] transition-transform active:scale-95",
                isCheapest ? "bg-[#22C55E] text-white" : "bg-[#1A1A1A] text-white",
              ].join(" ")}
            >
              Open in {listing.platform}
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

// ── Component ─────────────────────────────────────────────────────────────────

interface MarketplaceSurfaceProps {
  variant: ProductVariant;
  listings: (PlatformListing | ScrapedProduct)[];
  source?: "live" | "cache" | "fallback";
  onReset: () => void;
}

export default function MarketplaceSurface({
  variant,
  listings: rawListings,
  source = "fallback",
  onReset,
}: MarketplaceSurfaceProps) {
  const listings = rawListings.map(normalise).filter(l => l.inStock);
  const cheapestPrice = listings[0]?.price;

  return (
    <div className="w-full flex flex-col gap-4 animate-transcript-in">

      {/* Back Button */}
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

      {/* Product Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-[14px] bg-[#F1EFE8] flex items-center justify-center text-3xl shrink-0">
          {variant.image}
        </div>
        <div>
          <p className="text-[12px] text-[#888780] font-medium uppercase tracking-wide">You selected</p>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] leading-tight">{variant.name}</h2>
          <p className="text-[13px] text-[#1D9E75] font-semibold mt-0.5">{variant.sku}</p>
        </div>
      </div>

      {/* Summary row: pill + data source badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full bg-[#E0F2E9] text-[#16A34A] text-[12px] font-semibold border border-[#22C55E]/30">
          <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          {listings.length} stores · from ₹{cheapestPrice} · cheapest first
        </div>

        {/* Data source badge */}
        {source === "live" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            Live prices
          </span>
        )}
        {source === "cache" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] text-[#6D28D9] text-[11px] font-semibold">
            ⚡ Cached
          </span>
        )}
        {source === "fallback" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] text-[11px] font-semibold">
            ~ Estimated prices
          </span>
        )}
      </div>

      {/* Platform Listing Cards */}
      <div className="flex flex-col gap-3 mt-1">
        {listings.map((listing, i) => (
          <ListingCard
            key={listing.platform}
            listing={listing}
            isCheapest={i === 0}
            productName={`${variant.name} · ${variant.sku}`}
          />
        ))}
      </div>

      {/* Search Again */}
      <button
        onClick={onReset}
        className="mt-2 w-full py-4 bg-white border border-[#E5E7EB] rounded-[18px] text-[15px] font-semibold text-[#1A1A1A] shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
        Search something else
      </button>

    </div>
  );
}
