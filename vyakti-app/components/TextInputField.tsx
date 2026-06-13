"use client";

import { useState, useRef } from "react";

// ── Component ─────────────────────────────────────────────────────────────────

export default function TextInputField({ onSubmit, disabled = false }: { onSubmit: (t: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 max-w-sm mx-auto">
      <div
        className={[
          "flex-1 flex items-center gap-2 bg-white border rounded-full px-4 py-3 transition-colors",
          disabled ? "opacity-50 cursor-not-allowed border-[#E5E7EB]" : "border-[#E5E7EB] hover:border-[#D1D5DB] focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#22C55E]",
        ].join(" ")}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Or type what you need..."
          className="flex-1 bg-transparent outline-none border-none text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF]"
        />

        {value.trim().length > 0 && (
          <button
            type="submit"
            disabled={disabled}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#22C55E] text-white hover:bg-[#16A34A] active:scale-95 transition-all disabled:opacity-50"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
