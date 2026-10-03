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
  | "CLARIFY_INTENT"
  | "CLARIFY_BRAND"
  | "CLARIFY_VARIANT"
  | "CLARIFY_CATEGORY"
  | "DECIDING"
  | "AWAITING_APPROVAL"
  | "PAYING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "ERROR";
