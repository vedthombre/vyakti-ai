/**
 * lib/marketplace/provider.ts
 *
 * Defines the MarketplaceProvider interface that every marketplace
 * integration must implement.
 *
 * Contract:
 * - search()     → required. Returns products from this marketplace.
 * - addToCart()  → optional stub. Implement when cart integration is ready.
 * - checkout()   → optional stub. Implement when checkout integration is ready.
 *
 * The interface is intentionally narrow so that swapping a provider
 * implementation (mock → scraper → MCP → live API) requires no
 * changes to the Aggregator or any UI component.
 */

import type { ScrapedProduct } from "@/lib/scraper/merchantSearch";

// ── Result shape returned by every provider ───────────────────────────────────

export interface ProviderSearchResult {
  /** Where this data came from for the data-source badge in the UI. */
  source: "live" | "cache" | "fallback";
  /** Normalised products ready to be merged by the Aggregator. */
  products: ScrapedProduct[];
}

// ── Cart / Checkout stubs — future use ────────────────────────────────────────

export interface CartItem {
  variantId: string;
  quantity: number;
}

// ── Core interface ────────────────────────────────────────────────────────────

export interface MarketplaceProvider {
  /**
   * Human-readable marketplace name.
   * Used by the Aggregator for logging — must not contain business logic.
   */
  readonly name: string;

  /**
   * Search for a product on this marketplace.
   *
   * @param query     - Product name / search string
   * @param variantId - Optional catalog variant ID for a more precise fallback
   * @returns         - Normalised products and their data source
   *
   * Must NOT throw — return { source: "fallback", products: [] } on any
   * unrecoverable error. The Aggregator uses Promise.allSettled, but
   * explicit handling inside the provider gives clearer error messages.
   */
  search(query: string, variantId?: string): Promise<ProviderSearchResult>;

  /**
   * Add a product to the cart on this marketplace.
   * Stub: not implemented yet. Will be wired up per-provider in a future sprint.
   */
  addToCart?(item: CartItem): Promise<void>;

  /**
   * Initiate checkout on this marketplace.
   * Stub: not implemented yet.
   */
  checkout?(cart: CartItem[]): Promise<void>;
}
