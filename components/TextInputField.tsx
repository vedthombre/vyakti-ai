"use client";

import { useState, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TextInputFieldProps {
  /** Called when the user submits a non-empty command string */
  onSubmit: (text: string) => void;
  /** When true the field is locked (pipeline is running) */
  disabled?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TextInputField({ onSubmit, disabled = false }: TextInputFieldProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Label */}
      <label
        htmlFor="text-command-input"
        className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-500"
      >
        Or type a command
      </label>

      {/* Input row */}
      <div
        className={[
          "flex items-center gap-2 w-full rounded-xl px-4 py-3",
          "bg-[rgba(8,15,26,0.8)] transition-all duration-200",
          focused
            ? "border border-blue-500/50 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
            : "border border-[rgba(30,80,180,0.25)]",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {/* Search icon */}
        <svg
          width={15}
          height={15}
          viewBox="0 0 24 24"
          fill="none"
          stroke={focused ? "#60a5fa" : "#475569"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-colors duration-200"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          id="text-command-input"
          suppressHydrationWarning
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. Order 2 litres of Amul milk"
          className={[
            "flex-1 bg-transparent outline-none border-none text-sm text-slate-200",
            "placeholder:text-slate-600 disabled:cursor-not-allowed",
          ].join(" ")}
        />

        {/* Submit button — only shown when there is text */}
        {value.trim().length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className={[
              "shrink-0 flex items-center justify-center w-7 h-7 rounded-lg",
              "bg-blue-600 hover:bg-blue-500 active:scale-95",
              "transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
            ].join(" ")}
            aria-label="Submit command"
          >
            <svg
               width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>

      {/* Helper hint */}
      <p className="text-[11px] text-slate-600 text-center">
        Speak via the mic above or type your commerce intent here
      </p>
    </div>
  );
}
