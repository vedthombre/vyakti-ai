"use client";

import { useRef } from "react";
import type { AppState } from "@/app/page";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HoldToTalkButtonProps {
  appState: AppState;
  onRecordingStart: (blob: Promise<Blob>) => void;
  onError: (message: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BUTTON_LABELS: Record<AppState, string> = {
  IDLE: "Hold to Talk",
  RECORDING: "Listening...",
  TRANSCRIBING: "Processing...",
  THINKING: "Thinking...",
  READY_TO_PAY: "Hold to Talk",
  PROCESSING: "Processing...",
  MANIFESTED: "Hold to Talk",
  ERROR: "Try Again",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function HoldToTalkButton({
  appState,
  onRecordingStart,
  onError,
}: HoldToTalkButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  const isRecording = appState === "RECORDING";
  const isBusy =
    appState === "TRANSCRIBING" ||
    appState === "THINKING" ||
    appState === "PROCESSING";
  const isDisabled = isBusy || appState === "MANIFESTED";

  const label = BUTTON_LABELS[appState];

  // ── MediaRecorder lifecycle ───────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect a Promise<Blob> that resolves when onstop fires
      const blobPromise = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const elapsed = Date.now() - recordingStartRef.current;
          if (elapsed < 500) {
            reject(
              new Error(
                "Recording too short — hold the button for at least half a second."
              )
            );
            return;
          }
          resolve(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        };
      });

      mediaRecorder.start();
      recordingStartRef.current = Date.now();
      onRecordingStart(blobPromise);
    } catch {
      onError("Microphone access denied. Please check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && appState === "RECORDING") {
      mediaRecorderRef.current.stop();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex items-center justify-center w-[180px] h-[180px]">

      {/* Pulse rings — visible only while recording */}
      {isRecording && (
        <>
          <div className="animate-ring-pulse absolute inset-0 rounded-full border-2 border-sky-400/50" />
          <div className="animate-ring-pulse2 absolute inset-0 rounded-full border border-blue-600/40" />
        </>
      )}

      {/* Core button */}
      <button
        id="hold-to-talk-btn"
        suppressHydrationWarning
        disabled={isDisabled}
        onMouseDown={!isDisabled ? startRecording : undefined}
        onMouseUp={!isDisabled ? stopRecording : undefined}
        onTouchStart={(e) => {
          e.preventDefault();
          if (!isDisabled) startRecording();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (!isDisabled) stopRecording();
        }}
        className={[
          "w-[136px] h-[136px] rounded-full border-none flex flex-col items-center justify-center gap-1.5",
          "select-none transition-all duration-150 ease-out",
          isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          isRecording
            ? "scale-[1.07] bg-gradient-to-br from-blue-700 to-sky-700 shadow-[0_0_40px_12px_rgba(56,189,248,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
            : isBusy
            ? "scale-100 bg-gradient-to-br from-[#1e3a5f] to-[#0f2847] shadow-[0_0_20px_4px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.08)]"
            : "scale-100 bg-gradient-to-br from-blue-700 to-blue-600 shadow-[0_0_20px_4px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.08)]",
        ].join(" ")}
      >
        {/* Mic icon */}
        <svg
          width={isRecording ? 28 : 24}
          height={isRecording ? 28 : 24}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isRecording ? "#38bdf8" : isBusy ? "#475569" : "#e2e8f0"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-200"
          aria-hidden
        >
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>

        <span
          className={[
            "text-[11px] font-semibold tracking-widest uppercase transition-colors duration-200",
            isRecording
              ? "text-sky-400"
              : isBusy
              ? "text-slate-600"
              : "text-slate-200",
          ].join(" ")}
        >
          {label}
        </span>
      </button>
    </div>
  );
}
