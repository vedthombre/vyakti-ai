"use client";

import type { Intent } from "@/lib/schemas/intent";
import type { OndcSeller } from "@/lib/mock/ondcMock";

// ── Props ─────────────────────────────────────────────────────────────────────

interface ManifestationScreenProps {
  intent: Intent | null;
  cheapest: OndcSeller | null;
  onNewIntent: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManifestationScreen({
  intent,
  cheapest,
  onNewIntent,
}: ManifestationScreenProps) {
  const qty = intent?.quantity ?? 1;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 px-5 py-12 relative">

      {/* ── Background neon glow ──────────────────────────────────────── */}
      <div
        aria-hidden
        className="animate-manifest-glow pointer-events-none absolute w-[320px] h-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(37,99,235,0.08) 40%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
        }}
      />

      {/* ── Checkmark circle ─────────────────────────────────────────── */}
      <div
        className="animate-check-pop relative z-10 mb-3 flex items-center justify-center
          w-[72px] h-[72px] rounded-full
          bg-gradient-to-br from-blue-600/20 to-sky-400/15
          border-2 border-sky-400/40"
      >
        <svg
          width={32}
          height={32}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* ── Title ────────────────────────────────────────────────────── */}
      <h2
        className="animate-manifest-fade relative z-10 font-black italic tracking-tight text-center leading-[1.1]"
        style={{
          fontSize: "clamp(28px, 7vw, 40px)",
          background: "linear-gradient(135deg, #e2e8f0 0%, #60a5fa 50%, #38bdf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Manifestation Completed
      </h2>

      {/* ── Tagline ───────────────────────────────────────────────────── */}
      <p
        className="animate-manifest-fade relative z-10 text-sm text-[var(--muted)] tracking-[0.04em] text-center mt-1"
        style={{ animationDelay: "0.3s", opacity: 0 }}
      >
        Vyakti — The Manifestation of Intent
      </p>

      {/* ── Order summary card ────────────────────────────────────────── */}
      {intent && cheapest && (
        <div
          className="animate-manifest-fade relative z-10 mt-5 px-5 py-3 rounded-xl text-center
            bg-blue-600/[0.06] border border-blue-600/15"
          style={{ animationDelay: "0.5s", opacity: 0 }}
        >
          <div className="text-[13px] text-[var(--muted)] mb-1">Order Placed</div>
          <div className="text-base font-bold text-[var(--text)]">
            {qty > 1 ? `${qty}× ` : ""}
            {intent.item_name ?? "Item"}
            {intent.brand_preference ? ` · ${intent.brand_preference}` : ""}
          </div>
          <div className="text-[13px] text-[var(--neon)] font-semibold mt-1">
            {cheapest.currency}{cheapest.price * qty} · {cheapest.platform} · {cheapest.eta}
          </div>
        </div>
      )}

      {/* ── New Intent button ─────────────────────────────────────────── */}
      <button
        id="new-intent-btn"
        onClick={onNewIntent}
        className="animate-manifest-fade relative z-10 mt-7 px-7 py-3 rounded-[10px] text-[13px]
          font-medium tracking-[0.05em] text-[var(--muted)] bg-transparent
          border border-sky-400/25
          hover:border-sky-400/60 hover:text-[var(--neon)] hover:bg-sky-400/[0.06]
          active:scale-[0.97] transition-all duration-200"
        style={{ animationDelay: "0.7s", opacity: 0 }}
      >
        New Intent
      </button>
    </div>
  );
}
