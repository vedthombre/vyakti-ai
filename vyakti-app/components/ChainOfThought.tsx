"use client";

import { useState, useEffect } from "react";
import type { AppState } from "@/lib/types/appState";

// ── Waveform bars — shown during RECORDING ────────────────────────────────────

const BAR_COUNT = 18;
const BAR_HEIGHTS = [0.3, 0.5, 0.8, 1.0, 0.7, 0.9, 0.6, 1.0, 0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7, 1.0, 0.4, 0.3];

function Waveform() {
  return (
    <div className="flex items-center justify-center gap-[3px] h-[48px]">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: `${BAR_HEIGHTS[i % BAR_HEIGHTS.length] * 48}px`,
            borderRadius: 2,
            background: i % 4 === 2 ? "#22C55E" : "rgba(34,197,94,0.35)",
            animation: `wave-bar ${0.8 + (i % 5) * 0.12}s ease-in-out ${i * 0.06}s infinite`,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

// ── Arc Spinner — shown during TRANSCRIBING / THINKING ───────────────────────

function ArcSpinner() {
  return (
    <div className="relative w-[52px] h-[52px]">
      {/* Grey track */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: "3px solid #E5E7EB" }}
      />
      {/* Green arc */}
      <div
        className="absolute inset-0 rounded-full animate-spin-slow"
        style={{
          border: "3px solid transparent",
          borderTopColor: "#22C55E",
          borderRightColor: "rgba(34,197,94,0.3)",
        }}
      />
    </div>
  );
}

// ── Single CoT Step ───────────────────────────────────────────────────────────

function CoTStep({ text, index }: { text: string; index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 800);
    return () => clearTimeout(t);
  }, [index]);

  if (!visible) return null;

  return (
    <div className="animate-step-in text-[13px] text-[#888780] leading-relaxed">
      {text}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ChainOfThoughtProps {
  steps: string[];
  appState: AppState;
  transcript?: string | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChainOfThought({ steps, appState, transcript }: ChainOfThoughtProps) {
  const isThinking     = appState === "THINKING";
  const isTranscribing = appState === "TRANSCRIBING";
  const isRecording    = appState === "RECORDING";

  // Waveform during recording
  if (isRecording) {
    return (
      <div className="w-full flex flex-col items-center gap-5 animate-transcript-in">
        {/* Listening pill */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[13px] font-medium text-[#22C55E]">Listening</span>
        </div>

        <Waveform />
      </div>
    );
  }

  // Processing state — transcript card + spinner
  if (isTranscribing || (isThinking && steps.length === 0)) {
    return (
      <div className="w-full flex flex-col items-center gap-5 animate-transcript-in">
        {/* Transcript card */}
        {transcript && (
          <div
            className="w-full rounded-2xl px-5 py-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <p className="text-[17px] font-semibold text-[#1A1A1A]">
              &ldquo;{transcript}&rdquo;
            </p>
            <p className="text-[12px] text-[#888780] mt-1">You said this</p>
          </div>
        )}

        <ArcSpinner />

        <div className="text-center">
          <p className="text-[17px] font-semibold text-[#1A1A1A]">Understanding your request...</p>
          <p className="text-[13px] text-[#888780] mt-1">Finding stores near you...</p>
          <p className="text-[13px] text-[#888780]">Comparing prices & delivery...</p>
        </div>

        {/* Location pill */}
        <div
          className="flex items-center gap-1.5 px-4 py-2 rounded-full"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-[13px] font-medium text-[#22C55E]">Koramangala, Bangalore</span>
        </div>
      </div>
    );
  }

  // Thinking with steps
  if (isThinking && steps.length > 0) {
    return (
      <div className="w-full flex flex-col gap-3 animate-transcript-in">
        {transcript && (
          <div
            className="w-full rounded-2xl px-5 py-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <p className="text-[17px] font-semibold text-[#1A1A1A]">
              &ldquo;{transcript}&rdquo;
            </p>
            <p className="text-[12px] text-[#888780] mt-1">You said this</p>
          </div>
        )}

        <div className="flex items-center justify-center">
          <ArcSpinner />
        </div>

        <div className="text-center">
          <p className="text-[15px] font-semibold text-[#1A1A1A]">Understanding your request...</p>
          <div className="flex flex-col gap-0.5 mt-1">
            {steps.map((step, i) => <CoTStep key={i} text={step} index={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
