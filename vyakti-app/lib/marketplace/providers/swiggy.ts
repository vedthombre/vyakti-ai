/**
 * lib/marketplace/providers/swiggy.ts
 *
 * ── PLACEHOLDER — Swiggy MCP not implemented yet ─────────────────────────────
 *
 * This provider is intentionally incomplete. It exists to:
 *   1. Reserve the Swiggy slot in the Aggregator's provider registry
 *   2. Make the unimplemented state explicit and observable (console.warn)
 *   3. Allow the Aggregator to continue functioning with Blinkit + Zepto
 *
 * TO IMPLEMENT:
 *   Replace the body of search() with the Swiggy MCP integration.
 *   No other file needs to change — the Aggregator and UI are agnostic.
 *
 * The method signature must remain:
 *   search(query: string, variantId?: string): Promise<ProviderSearchResult>
 */

import type { MarketplaceProvider, ProviderSearchResult } from "@/lib/marketplace/provider";

export class SwiggyProvider implements MarketplaceProvider {
  readonly name = "Swiggy";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async search(_query: string, _variantId?: string): Promise<ProviderSearchResult> {
    // ── NOT IMPLEMENTED ───────────────────────────────────────────────────────
    // Swiggy MCP provider not implemented yet.
    // The Aggregator will merge this empty result gracefully; Blinkit and
    // Zepto listings will still reach the MarketplaceSurface UI.
    console.warn(
      "[SwiggyProvider] Swiggy MCP provider not implemented yet. " +
      "Returning empty fallback. Replace with MCP implementation."
    );

    return { source: "fallback", products: [] };
  }
}
