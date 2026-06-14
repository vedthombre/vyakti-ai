"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { AppState } from "@/lib/types/appState";

import HoldToTalkButton   from "@/components/HoldToTalkButton";
import TextInputField     from "@/components/TextInputField";
import ChainOfThought     from "@/components/ChainOfThought";
import MarketplaceSurface from "@/components/MarketplaceSurface";
import type { ScrapedProduct } from "@/lib/scraper/merchantSearch";

import {
  runIntentPipeline,
  runIntentFromText,
  getFriendlyError,
} from "@/lib/agent/intentParser";

import {
  findBrands,
  getVariantsForBrand,
  getListings,
} from "@/lib/mock/catalog";
import type { Brand, ProductVariant, PlatformListing } from "@/lib/mock/catalog";
import type { Intent } from "@/lib/schemas/intent";

// ── CoT drip helper ───────────────────────────────────────────────────────────

async function dripSteps(
  steps: string[],
  onStep: (step: string) => void
): Promise<void> {
  for (const step of steps) {
    onStep(step);
    await new Promise<void>((r) => setTimeout(r, 820));
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AgentPage() {
  const [appState,        setAppState]        = useState<AppState>("IDLE");
  const [transcript,      setTranscript]      = useState<string | null>(null);
  const [cotSteps,        setCotSteps]        = useState<string[]>([]);
  const [intent,          setIntent]          = useState<Intent | null>(null);
  const [brands,          setBrands]          = useState<Brand[]>([]);
  const [selectedBrand,   setSelectedBrand]   = useState<Brand | null>(null);
  const [variants,        setVariants]        = useState<(ProductVariant & { listings: PlatformListing[] })[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [listings,        setListings]        = useState<PlatformListing[] | ScrapedProduct[]>([]);
  const [listingSource,   setListingSource]   = useState<"live" | "cache" | "fallback">("fallback");
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);

  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest";

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setAppState("IDLE");
    setTranscript(null);
    setCotSteps([]);
    setIntent(null);
    setBrands([]);
    setSelectedBrand(null);
    setVariants([]);
    setSelectedVariant(null);
    setListings([]);
    setListingSource("fallback");
    setErrorMsg(null);
  }, []);

  // ── After intent parsed → show brands ────────────────────────────────
  const finalizeIntent = useCallback(async (resolvedIntent: Intent) => {
    setCotSteps([]);
    setAppState("THINKING");

    await dripSteps(resolvedIntent.steps ?? [], (step) => {
      setCotSteps((prev) => [...prev, step]);
    });

    setIntent(resolvedIntent);

    if (resolvedIntent.routing === "UNKNOWN") {
      setAppState("CLARIFY_INTENT");
      return;
    }

    const foundBrands = findBrands(resolvedIntent.item_name || "");
    if (foundBrands && foundBrands.length > 0) {
      setBrands(foundBrands);
      setAppState("CLARIFY_BRAND");
    } else {
      setErrorMsg(`Could not find "${resolvedIntent.item_name}" in our catalog.`);
      setAppState("ERROR");
    }
  }, []);

  // ── User selected a brand → show variants ───────────────────────────
  const handleBrandSelect = useCallback((brand: Brand) => {
    setSelectedBrand(brand);
    // Extract a size hint from the transcript (e.g. "2 litre", "500ml")
    const sizeHint = transcript?.match(/(\d+\s*(ml|l|litre|liter|g|kg))/i)?.[1] || undefined;
    const brandVariants = getVariantsForBrand(brand.id, sizeHint);
    setVariants(brandVariants);
    setAppState("CLARIFY_VARIANT");
  }, [transcript]);

  // ── User selected a variant → live search then show price comparison ──
  const handleVariantSelect = useCallback(async (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setAppState("THINKING");
    setCotSteps(["Checking live prices across Blinkit, Zepto & Swiggy..."]);

    try {
      // Build a specific query: brand + product name + sku (e.g. "Amul Gold Full Cream Milk 2L")
      const searchQuery = `${variant.name} ${variant.sku}`;
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, variantId: variant.id }),
      });

      const data = await res.json();

      if (data.success && data.listings?.length > 0) {
        setListings(data.listings);
        setListingSource(data.source);
      } else {
        // Firecrawl returned nothing → use catalog fallback
        console.warn("[page] Live search empty, falling back to catalog");
        const fallback = getListings(variant.id);
        setListings(fallback);
        setListingSource("fallback");
      }
    } catch (e) {
      console.error("[page] Search API error:", e);
      // Still show UI using catalog data
      const fallback = getListings(variant.id);
      setListings(fallback);
      setListingSource("fallback");
    }

    setCotSteps([]);
    setAppState("READY_TO_PAY");
  }, []);

  // ── Voice recording callback ───────────────────────────────────────────
  const handleRecordingStart = useCallback(
    (blobPromise: Promise<Blob>) => {
      setAppState("RECORDING");
      blobPromise
        .then(async (blob) => {
          setAppState("TRANSCRIBING");
          const { transcript: tx, intent: parsedIntent } = await runIntentPipeline(blob);
          setTranscript(tx);
          await finalizeIntent(parsedIntent);
        })
        .catch((err: unknown) => {
          setErrorMsg(getFriendlyError(err));
          setAppState("ERROR");
        });
    },
    [finalizeIntent]
  );

  // ── Text fallback ──────────────────────────────────────────────────────
  const handleTextSubmit = useCallback(
    async (text: string) => {
      setTranscript(text);
      setAppState("TRANSCRIBING");
      try {
        const { intent: parsedIntent } = await runIntentFromText(text);
        await finalizeIntent(parsedIntent);
      } catch (err: unknown) {
        setErrorMsg(getFriendlyError(err));
        setAppState("ERROR");
      }
    },
    [finalizeIntent]
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <main className="w-full min-h-dvh flex flex-col overflow-hidden relative" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center px-6 py-6 relative z-10 min-h-dvh">

        {/* ── IDLE | RECORDING | ERROR ── */}
        {(appState === "IDLE" || appState === "ERROR" || appState === "RECORDING") && (
          <div className="w-full flex flex-col justify-between h-full pt-4 pb-8 animate-transcript-in">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-[#888780]">Good afternoon</p>
                <h1 className="text-[32px] font-bold text-[#1A1A1A] tracking-tight -mt-1">{userName}</h1>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#16A34A] font-bold text-xl overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
                ) : userName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E5E7EB] shadow-sm self-start">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[14px] font-semibold text-[#1A1A1A]">vyakti</span>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-[14px] text-[#888780]">Running low on anything?</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center my-10">
              <HoldToTalkButton appState={appState} onRecordingStart={handleRecordingStart} onError={setErrorMsg} />
              <div className="mt-8 text-center">
                <h2 className="text-[22px] font-bold text-[#1A1A1A]">{appState === "RECORDING" ? "Listening..." : "Tap and speak"}</h2>
                <p className="text-[15px] text-[#888780] mt-1">{appState === "RECORDING" ? "Tap again to stop" : "Groceries · Medicine · Food · Anything"}</p>
              </div>
            </div>

            <div className={`flex flex-col gap-3 transition-opacity ${appState === "RECORDING" ? "opacity-50 pointer-events-none" : ""}`}>
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Quick Reorder</span>
              <div className="flex flex-wrap items-center gap-3 pb-2">
                {[
                  { emoji: "🛒", label: "Milk & Eggs", query: "milk and eggs" },
                  { emoji: "💊", label: "Medicines",   query: "medicines" },
                  { emoji: "🍞", label: "Bread",       query: "bread" },
                ].map(({ emoji, label, query }) => (
                  <button
                    key={label}
                    className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#D1D5DB] transition-all active:scale-95"
                    onClick={() => handleTextSubmit(query)}
                  >
                    <span>{emoji}</span>
                    <span className="text-[14px] font-semibold text-[#1A1A1A]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`mt-6 w-full pb-safe-bottom transition-opacity ${appState === "RECORDING" ? "opacity-50 pointer-events-none" : ""}`}>
              <TextInputField onSubmit={handleTextSubmit} disabled={appState === "RECORDING"} />
            </div>
          </div>
        )}

        {/* ── TRANSCRIBING | THINKING ── */}
        {(appState === "TRANSCRIBING" || appState === "THINKING") && (
          <div className="w-full flex flex-col items-center justify-center gap-10 min-h-[60vh]">
            <ChainOfThought steps={cotSteps} appState={appState} transcript={transcript} />
          </div>
        )}

        {/* ── CLARIFY_INTENT ── */}
        {appState === "CLARIFY_INTENT" && (
          <div className="w-full flex flex-col items-center justify-center gap-6 min-h-[60vh] animate-transcript-in">
            <div className="text-5xl">🤔</div>
            <h2 className="text-[22px] font-bold text-[#1A1A1A] text-center max-w-sm">
              {intent?.clarification_needed || "I didn't catch what you wanted to order."}
            </h2>
            <p className="text-[14px] text-[#888780] text-center">Please say or type the product name clearly.</p>
            <div className="flex flex-col items-center gap-4 mt-4">
              <HoldToTalkButton appState="IDLE" onRecordingStart={handleRecordingStart} onError={setErrorMsg} />
              <p className="text-[13px] text-[#888780]">Tap and speak again</p>
            </div>
            <div className="w-full max-w-md mt-2">
              <TextInputField onSubmit={handleTextSubmit} disabled={false} />
            </div>
            <button onClick={reset} className="mt-2 flex items-center gap-1.5 text-[14px] font-medium text-[#888780] hover:text-[#1A1A1A] transition-colors">
              ← Start over
            </button>
          </div>
        )}

        {/* ── CLARIFY_BRAND ── */}
        {appState === "CLARIFY_BRAND" && (
          <div className="w-full flex flex-col gap-6 animate-transcript-in">
            <div>
              <p className="text-[13px] text-[#888780]">You asked for</p>
              <h2 className="text-[26px] font-bold text-[#1A1A1A] tracking-tight">{intent?.item_name}</h2>
            </div>
            <p className="text-[15px] text-[#444441] font-medium">Which brand do you prefer?</p>
            <div className="grid grid-cols-2 gap-3">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand)}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:border-[#1D9E75] hover:shadow-md active:scale-95 transition-all"
                >
                  <span className="text-4xl">{brand.emoji}</span>
                  <span className="text-[15px] font-bold text-[#1A1A1A]">{brand.name}</span>
                </button>
              ))}
            </div>
            <button onClick={reset} className="mt-2 flex items-center gap-1.5 text-[14px] font-medium text-[#888780] hover:text-[#1A1A1A] transition-colors">
              ← Start over
            </button>
          </div>
        )}

        {/* ── CLARIFY_VARIANT ── */}
        {appState === "CLARIFY_VARIANT" && selectedBrand && (
          <div className="w-full flex flex-col gap-6 animate-transcript-in">
            <div>
              <button onClick={() => { setBrands(brands); setAppState("CLARIFY_BRAND"); }} className="text-[13px] text-[#888780] hover:text-[#1A1A1A] transition-colors">
                ← {selectedBrand.name}
              </button>
              <h2 className="text-[22px] font-bold text-[#1A1A1A] mt-1">Which variant?</h2>
            </div>
            <div className="flex flex-col gap-3">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleVariantSelect(v)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#1D9E75] shadow-sm active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{v.image}</span>
                    <div className="text-left">
                      <p className="text-[14px] font-bold text-[#1A1A1A]">{v.name}</p>
                      <p className="text-[12px] text-[#888780]">{v.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-[#1D9E75]">
                      from ₹{Math.min(...v.listings.map(l => l.price))}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF]">
                      {v.listings.filter(l => l.inStock).length} stores
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={reset} className="mt-2 flex items-center gap-1.5 text-[14px] font-medium text-[#888780] hover:text-[#1A1A1A] transition-colors">
              ← Start over
            </button>
          </div>
        )}

        {/* ── READY_TO_PAY ── */}
        {appState === "READY_TO_PAY" && selectedVariant && (
          <div className="w-full flex flex-col justify-center h-full py-8">
            <MarketplaceSurface
              variant={selectedVariant}
              listings={listings}
              source={listingSource}
              onReset={reset}
            />
          </div>
        )}

      </div>

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] px-4 py-3 rounded-xl text-[14px] text-center shadow-lg z-50 animate-transcript-in flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-[#FEE2E2] rounded-full transition-colors">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </main>
  );
}
