/**
 * lib/agent/intentParser.ts
 *
 * Owns the full STT → Intent pipeline.
 * All LangGraph / Llama 3.3 calls are isolated here so page.tsx
 * stays a thin state-machine orchestrator.
 */

import { IntentSchema, STTResponseSchema } from "@/lib/schemas/intent";
import type { Intent, STTResponse } from "@/lib/schemas/intent";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ParseResult {
  transcript: string;
  intent: Intent;
}

export interface ParseError {
  stage: "STT" | "INTENT" | "VALIDATION";
  message: string;
}

// ── Stage 1 — Speech-to-Text (Groq Whisper via /api/voice) ───────────────────

async function transcribeAudio(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("audio", blob, "recording.webm");

  const res = await fetch("/api/voice", { method: "POST", body: form });
  const raw = await res.json();

  // Validate with Zod so we catch schema drift early
  const parsed: STTResponse = STTResponseSchema.parse(raw);

  if (!res.ok || !parsed.success || !parsed.text) {
    throw Object.assign(new Error(parsed.error ?? parsed.details ?? "STT failed"), {
      stage: "STT",
    });
  }

  return parsed.text;
}

// ── Stage 2 — Intent Extraction (LangGraph + Llama 3.3 via /api/intent) ──────

async function parseIntent(transcript: string): Promise<Intent> {
  const res = await fetch("/api/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: transcript }),
  });

  if (!res.ok) {
    throw Object.assign(new Error("Intent parsing failed — upstream error"), {
      stage: "INTENT",
    });
  }

  const raw = await res.json();

  if (!raw.success) {
    throw Object.assign(new Error(raw.error ?? "Intent parsing returned success=false"), {
      stage: "INTENT",
    });
  }
    console.log("[DEBUG /api/intent response]", raw);

  // Validate & coerce with Zod — guarantees downstream components
  // always receive a fully-typed, defaulted Intent object.
  const result = IntentSchema.safeParse(raw.intent);

  if (!result.success) {
    console.error("[intentParser] Zod validation failed:", result.error.flatten());
    throw Object.assign(new Error("Intent response failed schema validation"), {
      stage: "VALIDATION",
    });
  }

  return result.data;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Full pipeline: audio blob → { transcript, intent }
 *
 * Throws a plain Error with an additional `.stage` property so the
 * caller can surface context-appropriate error messages.
 */
export async function runIntentPipeline(blob: Blob): Promise<ParseResult> {
  const transcript = await transcribeAudio(blob);
  const intent = await parseIntent(transcript);
  return { transcript, intent };
}

/**
 * Text-only shortcut for the manual TextInputField fallback.
 * Skips STT and goes straight to intent parsing.
 */
export async function runIntentFromText(text: string): Promise<ParseResult> {
  const intent = await parseIntent(text);
  return { transcript: text, intent };
}

// ── Utility — friendly error messages for the UI ─────────────────────────────

export function getFriendlyError(err: unknown): string {
  if (!(err instanceof Error)) return "An unexpected error occurred. Please try again.";

  const stage = (err as Error & { stage?: string }).stage;

  switch (stage) {
    case "STT":
      return "Could not understand your audio. Please speak clearly and try again.";
    case "INTENT":
      return "Our AI couldn't parse your request. Please try rephrasing.";
    case "VALIDATION":
      return "An internal schema error occurred. The team has been notified.";
    default:
      return err.message || "Something went wrong. Please try again.";
  }
}
