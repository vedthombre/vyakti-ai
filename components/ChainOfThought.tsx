"use client";

import { useState, useEffect } from "react";
import type { AppState } from "@/app/page";

// ── Dot Loader ────────────────────────────────────────────────────────────────

function DotLoader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--neon)]"
            style={{ animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <span className="text-[var(--neon)] text-sm font-medium">{label}</span>
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
    <div className="animate-step-in flex items-start gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-blue-600/[0.08] border border-blue-600/[0.18]">
      <span className="text-[var(--accent-hi)] mt-px shrink-0 text-base leading-none">›</span>
      <span className="text-slate-400 text-[13px] leading-relaxed">{text}</span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ChainOfThoughtProps {
  steps: string[];
  appState: AppState;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChainOfThought({ steps, appState }: ChainOfThoughtProps) {
  const isThinking = appState === "THINKING";
  const isVisible = appState === "THINKING" || appState === "READY_TO_PAY";

  if (!isVisible || steps.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Section label */}
      <div className="text-[11px] tracking-[0.15em] text-[var(--muted)] uppercase font-semibold mb-1">
        Chain of Thought
      </div>

      {/* Steps — each staggered at index × 800 ms */}
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <CoTStep key={i} text={step} index={i} />
        ))}
      </div>

      {/* Trailing loader while still in THINKING state */}
      {isThinking && (
        <div className="mt-1">
          <DotLoader label="Finalising routing decision..." />
        </div>
      )}
    </div>
  );
}
