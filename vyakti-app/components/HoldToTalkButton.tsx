"use client";

import { useRef } from "react";
import type { AppState } from "@/lib/types/appState";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HoldToTalkButtonProps {
  appState: AppState;
  onRecordingStart: (blob: Promise<Blob>) => void;
  onError: (message: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HoldToTalkButton({
  appState,
  onRecordingStart,
  onError,
}: HoldToTalkButtonProps) {
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const audioChunksRef    = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  const isRecording = appState === "RECORDING";
  const isBusy =
    appState === "TRANSCRIBING" ||
    appState === "THINKING";
  const isDisabled = isBusy;

  // ── MediaRecorder lifecycle ───────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream        = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current  = mediaRecorder;
      audioChunksRef.current    = [];

      const blobPromise = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const elapsed = Date.now() - recordingStartRef.current;
          if (elapsed < 500) {
            reject(new Error("Recording too short — hold for at least half a second."));
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
    <div className="relative flex items-center justify-center w-[240px] h-[240px]">

      {/* ── Concentric green glow rings — visible while recording ── */}
      {isRecording && (
        <>
          <div
            className="animate-ring-pulse absolute inset-0 rounded-full"
            style={{ background: "rgba(34,197,94,0.18)" }}
          />
          <div
            className="animate-ring-pulse2 absolute inset-0 rounded-full"
            style={{ background: "rgba(34,197,94,0.10)" }}
          />
          <div
            className="animate-ring-pulse3 absolute inset-0 rounded-full"
            style={{ background: "rgba(34,197,94,0.05)" }}
          />
        </>
      )}

      {/* ── Static soft glow rings — always visible in IDLE ── */}
      {!isRecording && !isBusy && (
        <>
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 200, height: 200,
              top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              background: "rgba(34,197,94,0.10)",
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 232, height: 232,
              top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              background: "rgba(34,197,94,0.05)",
            }}
          />
        </>
      )}

      {/* ── Core button ── */}
      <button
        id="tap-to-talk-btn"
        suppressHydrationWarning
        disabled={isDisabled}
        onClick={(e) => {
          e.preventDefault();
          if (isDisabled) return;
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
        style={{

          width: 160, height: 160,
          borderRadius: "50%",
          border: "none",
          cursor: isDisabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          transform: isRecording ? "scale(1.05)" : "scale(1)",
          background: isRecording
            ? "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)"
            : isBusy
            ? "#D1FAE5"
            : "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
          boxShadow: isRecording
            ? "0 8px 32px rgba(34,197,94,0.50), 0 2px 8px rgba(34,197,94,0.30)"
            : isBusy
            ? "none"
            : "0 4px 20px rgba(34,197,94,0.35)",
        }}
      >
        {/* Mic SVG */}
        <svg
          width={isRecording ? 40 : 36}
          height={isRecording ? 40 : 36}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isBusy ? "#22C55E" : "#ffffff"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8"  y1="22" x2="16" y2="22" />
        </svg>
      </button>
    </div>
  );
}
