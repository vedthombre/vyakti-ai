"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { AppState } from "@/lib/types/appState";

import HoldToTalkButton    from "@/components/HoldToTalkButton";
import TextInputField      from "@/components/TextInputField";
import ChainOfThought      from "@/components/ChainOfThought";
import MarketplaceSurface  from "@/components/MarketplaceSurface";

import {
  runIntentPipeline,
  runIntentFromText,
  getFriendlyError,
} from "@/lib/agent/intentParser";

import { getOndcSellers, getCheapestSeller } from "@/lib/mock/ondcMock";
import type { OndcSeller }                   from "@/lib/mock/ondcMock";
import { searchProducts }                    from "@/lib/mock/productSearch";
import type { ProductVariant, ProductCategory } from "@/lib/mock/productSearch";
import type { Intent }                       from "@/lib/schemas/intent";

// ── CoT drip helper (pure async, no React deps) ───────────────────────────────

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
  // ── State ──────────────────────────────────────────────────────────────
  const [appState,   setAppState]   = useState<AppState>("IDLE");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [cotSteps,   setCotSteps]   = useState<string[]>([]);
  const [intent,     setIntent]     = useState<Intent | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [variants,   setVariants]   = useState<ProductVariant[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductVariant | null>(null);
  const [sellers,    setSellers]    = useState<OndcSeller[]>([]);
  const [cheapest,   setCheapest]   = useState<OndcSeller | null>(null);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);

  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest";

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setAppState("IDLE");
    setTranscript(null);
    setCotSteps([]);
    setIntent(null);
    setCategories([]);
    setVariants([]);
    setSelectedProduct(null);
    setSellers([]);
    setCheapest(null);
    setErrorMsg(null);
  }, []);

  // ── Shared post-parse finalisation ────────────────────────────────────
  const finalizeIntent = useCallback(async (resolvedIntent: Intent) => {
    setCotSteps([]);
    setAppState("THINKING");

    await dripSteps(resolvedIntent.steps ?? [], (step) => {
      setCotSteps((prev) => [...prev, step]);
    });

    setIntent(resolvedIntent);
    
    // Simulate product search
    const searchRes = searchProducts(resolvedIntent.item_name || "");
    
    if (searchRes.categories && searchRes.categories.length > 0) {
      setCategories(searchRes.categories);
      setAppState("CLARIFY_CATEGORY");
    } else if (searchRes.exactMatch) {
      setSelectedProduct(searchRes.exactMatch);
      setSellers(getOndcSellers(searchRes.exactMatch));
      setCheapest(getCheapestSeller(searchRes.exactMatch));
      setAppState("READY_TO_PAY");
    } else {
      setVariants(searchRes.variants);
      setAppState("CLARIFY_VARIANT");
    }
  }, []);

  const handleVariantSelect = useCallback((variant: ProductVariant) => {
    setSelectedProduct(variant);
    setSellers(getOndcSellers(variant));
    setCheapest(getCheapestSeller(variant));
    setAppState("READY_TO_PAY");
  }, []);

  const handleCategorySelect = useCallback((category: ProductCategory) => {
    const searchRes = searchProducts(category.name);
    setVariants(searchRes.variants);
    setAppState("CLARIFY_VARIANT");
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
      setAppState("TRANSCRIBING"); // Using transcribing state to trigger thinking UI
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

  // Checkout functionality has been replaced by direct merchant redirection

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <main className="w-full min-h-dvh flex flex-col overflow-hidden relative agent-shell" style={{ backgroundColor: "#FFFFFF" }}>
      
      {/* ── Dynamic Main Content Area ── */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center px-6 py-6 relative z-10 min-h-dvh">

        {/* ── State: IDLE | RECORDING ────────────────────────────────────── */}
        {(appState === "IDLE" || appState === "ERROR" || appState === "RECORDING") && (
          <div className="w-full flex flex-col justify-between h-full pt-4 pb-8 animate-transcript-in">
            {/* Header / Greeting */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] font-medium text-[#888780]">Good afternoon</p>
                <h1 className="text-[32px] font-bold text-[#1A1A1A] tracking-tight -mt-1">{userName}</h1>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#16A34A] font-bold text-xl overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* System Status Pill */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E5E7EB] shadow-sm self-start">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[14px] font-semibold text-[#1A1A1A]">vyakti</span>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-[14px] text-[#888780]">Running low on anything?</span>
            </div>

            {/* Main Mic Section */}
            <div className="flex-1 flex flex-col items-center justify-center my-10">
              <HoldToTalkButton
                appState={appState}
                onRecordingStart={handleRecordingStart}
                onError={setErrorMsg}
              />
              <div className="mt-8 text-center">
                <h2 className="text-[22px] font-bold text-[#1A1A1A]">{appState === "RECORDING" ? "Listening..." : "Tap and speak"}</h2>
                <p className="text-[15px] text-[#888780] mt-1">{appState === "RECORDING" ? "Tap again to stop" : "Groceries · Medicine · Food · Anything"}</p>
              </div>
            </div>

            {/* Quick Reorder Chips */}
            <div className={`flex flex-col gap-3 transition-opacity ${appState === "RECORDING" ? "opacity-50 pointer-events-none" : ""}`}>
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Quick Reorder</span>
              <div className="flex flex-wrap items-center gap-3 pb-2">
                <button
                  className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#D1D5DB] transition-all active:scale-95"
                  onClick={() => handleTextSubmit("milk and eggs")}
                >
                  <span>🛒</span>
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">Milk & Eggs</span>
                </button>
                <button
                  className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#D1D5DB] transition-all active:scale-95"
                  onClick={() => handleTextSubmit("medicines")}
                >
                  <span>💊</span>
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">Medicines</span>
                </button>
                <button
                  className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#D1D5DB] transition-all active:scale-95"
                  onClick={() => handleTextSubmit("groceries")}
                >
                  <span>📦</span>
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">Groceries</span>
                </button>
              </div>
            </div>
            
            {/* Text Input Fallback */}
            <div className={`mt-6 w-full pb-safe-bottom transition-opacity ${appState === "RECORDING" ? "opacity-50 pointer-events-none" : ""}`}>
              <TextInputField onSubmit={handleTextSubmit} disabled={appState === "RECORDING"} />
            </div>
          </div>
        )}

        {/* ── State: TRANSCRIBING | THINKING ─────────────── */}
        {(appState === "TRANSCRIBING" || appState === "THINKING") && (
          <div className="w-full flex flex-col items-center justify-center gap-10 min-h-[60vh]">
            <ChainOfThought steps={cotSteps} appState={appState} transcript={transcript} />
          </div>
        )}

        {/* ── State: CLARIFY_VARIANT ────────────────────────────────────── */}
        {appState === "CLARIFY_VARIANT" && (
          <div className="w-full flex flex-col items-center justify-center gap-6 mt-10 animate-transcript-in">
            <h2 className="text-[22px] font-bold text-[#1A1A1A] text-center">
              I found a few {intent?.item_name || "item"} variants. Which one?
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg">
              {variants.map(v => (
                <button 
                  key={v.id} 
                  onClick={() => handleVariantSelect(v)} 
                  className="px-4 py-3 rounded-full bg-white border border-[#E5E7EB] text-[14px] font-semibold text-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#D1D5DB] active:scale-95 transition-all"
                >
                  {v.name}
                </button>
              ))}
            </div>
            
            {/* Fallback to search again */}
            <button
              onClick={reset}
              className="mt-6 flex items-center gap-1.5 text-[15px] font-medium text-[#888780] hover:text-[#1A1A1A] transition-colors"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Start over
            </button>
          </div>
        )}

        {/* ── State: CLARIFY_CATEGORY ───────────────────────────────────── */}
        {appState === "CLARIFY_CATEGORY" && (
          <div className="w-full flex flex-col items-center justify-center gap-6 mt-10 animate-transcript-in">
            <h2 className="text-[22px] font-bold text-[#1A1A1A] text-center">
              What kind of groceries do you need?
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 max-w-lg">
              {categories.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => handleCategorySelect(c)} 
                  className="px-6 py-4 rounded-2xl bg-white border border-[#E5E7EB] text-[16px] font-semibold text-[#1A1A1A] shadow-sm hover:border-[#D1D5DB] hover:shadow-md active:scale-95 transition-all flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
            
            {/* Fallback to search again */}
            <button
              onClick={reset}
              className="mt-6 flex items-center gap-1.5 text-[15px] font-medium text-[#888780] hover:text-[#1A1A1A] transition-colors"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Start over
            </button>
          </div>
        )}

        {/* ── State: READY TO PAY (Marketplace) ──────────────────────── */}
        {appState === "READY_TO_PAY" && intent && (
          <div className="w-full flex flex-col justify-center h-full py-8">
            <MarketplaceSurface
              intent={intent}
              selectedProduct={selectedProduct}
              sellers={sellers}
              cheapest={cheapest}
              onReset={reset}
            />
          </div>
        )}
      </div>

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] px-4 py-3 rounded-xl text-[14px] text-center shadow-lg z-50 animate-transcript-in flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="p-1 hover:bg-[#FEE2E2] rounded-full transition-colors"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </main>
  );
}
