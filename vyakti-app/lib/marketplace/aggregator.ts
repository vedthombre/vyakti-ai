/**
 * lib/marketplace/aggregator.ts
 *
 * MarketplaceAggregator — the single orchestration layer between the
 * /api/search route and all marketplace providers.
 *
 * ── Responsibilities (exhaustive list) ───────────────────────────────────────
 *   1. Fan out search() to all registered providers concurrently
 *   2. Merge their ProviderSearchResult.products into a single flat list
 *   3. Filter by relevance and rank (cheapest-per-platform)
 *   4. Handle individual provider failures gracefully
 *
 * ── What this file must NEVER contain ────────────────────────────────────────
 *   ✗ Firecrawl / HTTP scraping logic     → belongs in each provider
 *   ✗ MCP calls                           → belongs in each provider
 *   ✗ Platform-specific URL construction  → belongs in each provider
 *   ✗ Catalog fallback logic              → belongs in each provider
 *   ✗ In-memory cache                     → belongs in each provider
 *   ✗ Hardcoded platform names            → providers expose `name` for logging
 *
 * Adding a new marketplace = create a new provider + add it to defaultAggregator.
 * The Aggregator and UI require zero changes.
 */

import type { MarketplaceProvider } from "@/lib/marketplace/provider";
import type { ScrapedProduct, MerchantSearchResult } from "@/lib/scraper/merchantSearch";
import { rankByPlatformCheapest, relevanceScore } from "@/lib/scraper/merchantSearch";
import { BlinkitProvider } from "@/lib/marketplace/providers/blinkit";
import { ZeptoProvider }   from "@/lib/marketplace/providers/zepto";
import { SwiggyProvider }  from "@/lib/marketplace/providers/swiggy";

// ── Aggregator ────────────────────────────────────────────────────────────────

export class MarketplaceAggregator {
  constructor(private readonly providers: MarketplaceProvider[]) {}

  async search(query: string, variantId?: string): Promise<MerchantSearchResult> {
    // 1. Fan out to all providers concurrently — never let one block another
    const settled = await Promise.allSettled(
      this.providers.map((p) => p.search(query, variantId))
    );

    // 2. Merge — log rejected providers, continue with the rest
    const allProducts: ScrapedProduct[] = [];
    let anyLive = false;

    for (const [i, result] of settled.entries()) {
      if (result.status === "fulfilled") {
        allProducts.push(...result.value.products);
        if (result.value.source === "live" || result.value.source === "cache") {
          anyLive = true;
        }
      } else {
        console.warn(
          `[Aggregator] Provider "${this.providers[i].name}" rejected:`,
          result.reason
        );
      }
    }

    // 3. Relevance filter — remove completely unrelated results
    const relevant = allProducts.filter(
      (p) => relevanceScore(p.name, query) >= 0.4
    );
    const filtered = relevant.length > 0 ? relevant : allProducts;

    // 4. Rank: one best listing per platform, cheapest first
    const ranked = rankByPlatformCheapest(filtered);

    return {
      source:    anyLive ? "live" : "fallback",
      query,
      products:  ranked,
      scrapedAt: new Date().toISOString(),
    };
  }
}

// ── Default singleton ─────────────────────────────────────────────────────────
// New marketplaces are added here — nowhere else.

export const defaultAggregator = new MarketplaceAggregator([
  new BlinkitProvider(),
  new ZeptoProvider(),
  new SwiggyProvider(), // stub — replace body of SwiggyProvider.search() when MCP is ready
]);
