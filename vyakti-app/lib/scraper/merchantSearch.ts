/**
 * lib/scraper/merchantSearch.ts
 *
 * Types and ranking utilities for marketplace search results.
 * Core scraping logic has been moved to individual providers in lib/marketplace/providers.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScrapedProduct {
  name: string;
  sku: string;          // e.g. "500ml", "1L"
  price: number;        // in INR
  eta: string;          // e.g. "8 min"
  platform: "Blinkit" | "Zepto" | "Swiggy";
  deepLink: string;     // Direct URL to the product page
  inStock: boolean;
  imageUrl?: string;
}

export interface MerchantSearchResult {
  source: "live" | "cache" | "fallback";
  query: string;
  products: ScrapedProduct[];
  scrapedAt: string;
}

// ── Ranking & Comparison ──────────────────────────────────────────────────────

/**
 * From raw scraped products, return the best per-platform listing
 * (cheapest available for each platform), sorted cheapest-first.
 */
export function rankByPlatformCheapest(products: ScrapedProduct[]): ScrapedProduct[] {
  const byPlatform = new Map<string, ScrapedProduct>();

  for (const p of products) {
    const existing = byPlatform.get(p.platform);
    if (!existing || p.price < existing.price) {
      byPlatform.set(p.platform, p);
    }
  }

  return [...byPlatform.values()]
    .filter((p) => p.inStock)
    .sort((a, b) => a.price - b.price);
}

/**
 * Group results by variant (by SKU/size), useful to rebuild
 * the CLARIFY_VARIANT UI from live data.
 */
export function groupByVariant(products: ScrapedProduct[]): Map<string, ScrapedProduct[]> {
  const groups = new Map<string, ScrapedProduct[]>();

  for (const p of products) {
    const key = `${p.name}:::${p.sku}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return groups;
}

/**
 * Calculate string relevance between product name and search query.
 * Used to filter out off-topic results.
 */
export function relevanceScore(productName: string, query: string): number {
  const name = productName.toLowerCase();
  const words = query.toLowerCase().split(/\s+/);
  const matched = words.filter((w) => name.includes(w));
  return matched.length / words.length;
}
