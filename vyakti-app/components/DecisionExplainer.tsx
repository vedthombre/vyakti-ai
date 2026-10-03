"use client";

import ChainOfThought from "@/components/ChainOfThought";
import type { Decision } from "@/lib/schemas/decision";
import type { AppState } from "@/lib/types/appState";

interface DecisionExplainerProps {
  decision: Decision;
  /** Passed straight through to ChainOfThought — used there for its own
   * THINKING/TRANSCRIBING animation checks. DecisionExplainer itself only
   * ever renders during DECIDING/AWAITING_APPROVAL, but doesn't assume that. */
  appState: AppState;
}

/**
 * "Why this product" card, shown during DECIDING/AWAITING_APPROVAL.
 * Reuses ChainOfThought (KEEP list, plan §1-3) for the reasoning drip —
 * its `steps: string[]` prop is generic enough for the AI buyer's
 * decision reasoning, not just intent parsing.
 */
export default function DecisionExplainer({ decision, appState }: DecisionExplainerProps) {
  const { selected, reasoning, alternatives } = decision;

  return (
    <div className="w-full flex flex-col gap-4 animate-transcript-in">
        <ChainOfThought steps={reasoning} appState={appState} />

      {/* Selected product card — visual language matches the old
          MarketplaceSurface "Best Pick" card (border, badge, shadow) */}
      <div
        className="relative flex flex-col pt-3 pb-4 px-4 bg-white border-2 border-[#22C55E] rounded-2xl"
        style={{ boxShadow: "0 4px 14px rgba(34,197,94,0.12)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-9 bg-[#22C55E] rounded-t-xl flex items-center px-4">
          <div className="flex items-center gap-1.5 text-white font-bold text-[11px] tracking-[0.05em] uppercase">
            <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            AI Buyer&apos;s Pick
          </div>
        </div>

        <div className="flex items-center gap-3 mt-9">
          <div className="w-14 h-14 rounded-2xl bg-[#F1EFE8] flex items-center justify-center text-3xl shrink-0">
            {selected.image}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[17px] text-[#1A1A1A]">{selected.name}</h3>
            <p className="text-[13px] text-[#888780] mt-0.5">
              {selected.brandName} · {selected.unit}
            </p>
            <span className="font-extrabold text-[22px] text-[#1A1A1A] mt-1 block">
              ₹{selected.price}
            </span>
          </div>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-[#888780] font-medium uppercase tracking-wide px-1">
            Also considered
          </p>
          {alternatives.map((alt) => (
            <div
              key={alt.productId}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-[14px]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F1EFE8] flex items-center justify-center text-lg shrink-0">
                {alt.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">{alt.name}</p>
              </div>
              <span className="text-[14px] font-bold text-[#888780]">₹{alt.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}