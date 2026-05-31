"use client";

import { useState, useCallback } from "react";

import HoldToTalkButton    from "@/components/HoldToTalkButton";
import TextInputField      from "@/components/TextInputField";
import ChainOfThought      from "@/components/ChainOfThought";
import MarketplaceSurface  from "@/components/MarketplaceSurface";
import CheckoutSurface     from "@/components/CheckoutSurface";
import ManifestationScreen from "@/components/ManifestationScreen";

import {
  runIntentPipeline,
  runIntentFromText,
  getFriendlyError,
} from "@/lib/agent/intentParser";

import { getOndcSellers, getCheapestSeller } from "@/lib/mock/ondcMock";
import type { OndcSeller }                   from "@/lib/mock/ondcMock";
import type { Intent }                       from "@/lib/schemas/intent";

// ── State Machine ─────────────────────────────────────────────────────────────

export type AppState =
  | "IDLE"
  | "RECORDING"
  | "TRANSCRIBING"
  | "THINKING"
  | "READY_TO_PAY"
  | "PROCESSING"
  | "MANIFESTED"
  | "ERROR";

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

export default function Home() {
  // ── State ──────────────────────────────────────────────────────────────
  const [appState,   setAppState]   = useState<AppState>("IDLE");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [cotSteps,   setCotSteps]   = useState<string[]>([]);
  const [intent,     setIntent]     = useState<Intent | null>(null);
  const [sellers,    setSellers]    = useState<OndcSeller[]>([]);
  const [cheapest,   setCheapest]   = useState<OndcSeller | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  // ── Reset ──────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setAppState("IDLE");
    setTranscript(null);
    setCotSteps([]);
    setIntent(null);
    setSellers([]);
    setCheapest(null);
    setError(null);
  }, []);

  // ── Shared post-parse finalisation ────────────────────────────────────
  // Called by both voice and text paths once we have a resolved Intent.
  const finalizeIntent = useCallback(async (resolvedIntent: Intent) => {
    setCotSteps([]);
    setAppState("THINKING");

    await dripSteps(resolvedIntent.steps ?? [], (step) => {
      setCotSteps((prev) => [...prev, step]);
    });

    setIntent(resolvedIntent);
    setSellers(getOndcSellers(resolvedIntent.item_name));
    setCheapest(getCheapestSeller(resolvedIntent.item_name));
    setAppState("READY_TO_PAY");
  }, []);

  // ── Voice recording callback — HoldToTalkButton hands us a Promise<Blob> ─
  // intentParser.runIntentPipeline(blob) handles both STT (Groq Whisper)
  // and intent parsing (LLaMA 3.3) in a single validated call.
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
          setError(getFriendlyError(err));
          setAppState("ERROR");
        });
    },
    [finalizeIntent]
  );

  // ── Text fallback ──────────────────────────────────────────────────────
  // intentParser.runIntentFromText(text) skips STT and goes straight
  // to the LLaMA intent parser.
  const handleTextSubmit = useCallback(
    async (text: string) => {
      setTranscript(text);
      try {
        const { intent: parsedIntent } = await runIntentFromText(text);
        await finalizeIntent(parsedIntent);
      } catch (err: unknown) {
        setError(getFriendlyError(err));
        setAppState("ERROR");
      }
    },
    [finalizeIntent]
  );

  // ── Checkout ───────────────────────────────────────────────────────────
  const handleCheckout = useCallback(() => setAppState("PROCESSING"), []);
  const handlePayNow   = useCallback(() => setAppState("MANIFESTED"),  []);
  const handleBack     = useCallback(() => setAppState("READY_TO_PAY"), []);

  // ── Derived flags ──────────────────────────────────────────────────────
  const isIdle         = appState === "IDLE"       || appState === "ERROR";
  const isThinkingPhase =
    appState === "TRANSCRIBING" || appState === "THINKING";
  const showMarketplace = appState === "READY_TO_PAY";
  const showCheckout    = appState === "PROCESSING";
  const showManifested  = appState === "MANIFESTED";
  const inputDisabled   =
    appState !== "IDLE" && appState !== "ERROR" && appState !== "READY_TO_PAY";

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <main
      className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10"
      aria-label="Vyakti commerce agent"
    >
      {/* ── Layout shell ────────────────────────────────────────────────── */}
      <div className="w-full max-w-[420px] flex flex-col items-center gap-8 overflow-hidden">

        {/* ── Logo / Header ─────────────────────────────────────────────── */}
        <header className="flex flex-col items-center gap-1.5 select-none">
          <h1
            className="font-black italic tracking-tight leading-none"
            style={{
              fontSize: "clamp(40px, 10vw, 56px)",
              background: "linear-gradient(135deg, #e2e8f0 0%, #60a5fa 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            VYAKTI
          </h1>
          <p className="text-[12px] tracking-[0.18em] text-[var(--muted)] uppercase font-medium">
            व्यक्ति — Agentic Commerce Engine
          </p>
        </header>

        {/* ════════════════════════════════════════════════════════════════
            MANIFESTED screen — full-screen success state
        ═══════════════════════════════════════════════════════════════════ */}
        {showManifested && (
          <ManifestationScreen
            intent={intent}
            cheapest={cheapest}
            onNewIntent={reset}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            CHECKOUT surface
        ═══════════════════════════════════════════════════════════════════ */}
        {showCheckout && intent && cheapest && (
          <CheckoutSurface
            intent={intent}
            cheapest={cheapest}
            onPayNow={handlePayNow}
            onBack={handleBack}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            MARKETPLACE surface
        ═══════════════════════════════════════════════════════════════════ */}
        {showMarketplace && intent && (
          <MarketplaceSurface
            intent={intent}
            sellers={sellers}
            cheapest={cheapest}
            onCheckout={handleCheckout}
            onReset={reset}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            THINKING / TRANSCRIBING — CoT panel
        ═══════════════════════════════════════════════════════════════════ */}
        {isThinkingPhase && (
          <div className="w-full flex flex-col gap-4 animate-transcript-in">

            {/* Transcript pill */}
            {transcript && (
              <div
                className="glass flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ borderColor: "rgba(56,189,248,0.35)" }}
              >
                {/* Mic icon */}
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="var(--neon)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden className="shrink-0"
                >
                  <rect x="9" y="2" width="6" height="11" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
                <p className="text-sm text-[var(--text)] font-medium leading-snug flex-1">
                  &ldquo;{transcript}&rdquo;
                </p>
              </div>
            )}

            {/* Spinner while transcribing (no steps yet) */}
            {appState === "TRANSCRIBING" && (
              <div className="flex items-center gap-3 px-1">
                <div
                  className="animate-spin-slow w-4 h-4 rounded-full border-2 shrink-0"
                  style={{ borderColor: "var(--neon)", borderTopColor: "transparent" }}
                />
                <span className="text-sm text-[var(--neon)]">Transcribing voice...</span>
              </div>
            )}

            {/* CoT steps */}
            <ChainOfThought steps={cotSteps} appState={appState} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            IDLE / ERROR — Hold-to-Talk orb + text input
        ═══════════════════════════════════════════════════════════════════ */}
        {(isIdle || appState === "RECORDING" || isThinkingPhase) && !showManifested && (
          <div
            className={[
              "flex flex-col items-center gap-6 w-full transition-opacity duration-300",
              isThinkingPhase ? "opacity-0 pointer-events-none h-0 overflow-hidden" : "opacity-100",
            ].join(" ")}
          >
            {/* Aurora bloom */}
            <div className="relative flex items-center justify-center">
              <div
                aria-hidden
                className="animate-aurora-pulse pointer-events-none absolute rounded-full"
                style={{
                  width: 260,
                  height: 260,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background:
                    "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(56,189,248,0.10) 45%, transparent 70%)",
                }}
              />
              <HoldToTalkButton
                appState={appState}
                onRecordingStart={handleRecordingStart}
                onError={(msg) => { setError(msg); setAppState("ERROR"); }}
              />
            </div>

            {/* Error banner */}
            {error && (
              <div
                className="w-full px-4 py-3 rounded-xl text-sm text-red-400 text-center leading-snug"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                {error}
              </div>
            )}

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-[11px] text-[var(--muted)] uppercase tracking-[0.15em]">or</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Text input fallback */}
            <TextInputField
              onSubmit={handleTextSubmit}
              disabled={inputDisabled}
            />
          </div>
        )}

        {/* ── Status strip ──────────────────────────────────────────────── */}
        {isIdle && !error && (
          <footer className="flex items-center gap-1.5 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[11px] text-[var(--muted)] tracking-[0.1em]">
              ONDC Network · 200ms latency · 4 platforms
            </p>
          </footer>
        )}

      </div>
    </main>
  );
}