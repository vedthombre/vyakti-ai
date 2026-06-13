/**
 * lib/types/appState.ts
 *
 * Shared AppState type — used by the agent page and all components
 * that need to react to the current state of the voice pipeline.
 * Extracted from app/app/page.tsx so components don't import from a page.
 */

export type AppState =
  | "IDLE"
  | "RECORDING"
  | "TRANSCRIBING"
  | "THINKING"
  | "CLARIFY_CATEGORY"
  | "CLARIFY_VARIANT"
  | "READY_TO_PAY"
  | "ERROR";
