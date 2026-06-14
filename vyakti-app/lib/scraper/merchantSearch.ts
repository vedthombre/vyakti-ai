/**
 * lib/scraper/merchantSearch.ts
 *
 * Production-grade Firecrawl integration for scraping live product data
 * from Blinkit, Zepto, and Swiggy Instamart.
 *
 * Architecture:
 * 1. Search all 3 merchants concurrently via Firecrawl's LLM Extract API
 * 2. Cache results for 1 hour to stay within API rate limits
 * 3. Fallback to catalog mock if scraping fails
 * 4. Return normalized ScrapedProduct[] ready for the comparison UI
 */

import NodeCache from "node-cache";
import { getListings } from "@/lib/mock/catalog";
import type { PlatformListing } from "@/lib/mock/catalog";

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

// ── Config ────────────────────────────────────────────────────────────────────

const MERCHANT_CONFIGS = {
  Blinkit: {
    searchUrl: (q: string) => `https://blinkit.com/s/?q=${encodeURIComponent(q)}`,
    deepLinkBase: "https://blinkit.com/s/?q=",
  },
  Zepto: {
    searchUrl: (q: string) => `https://www.zeptonow.com/search?q=${encodeURIComponent(q)}`,
    deepLinkBase: "https://www.zeptonow.com/search?q=",
  },
  Swiggy: {
    searchUrl: (q: string) => `https://www.swiggy.com/instamart/search?custom_query=${encodeURIComponent(q)}`,
    deepLinkBase: "https://www.swiggy.com/instamart/search?custom_query=",
  },
} as const;

// Firecrawl extraction schema — tells the LLM what to extract from each page
const PRODUCT_EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    products: {
      type: "array",
      description: "List of products visible on the page",
      items: {
        type: "object",
        properties: {
          name:      { type: "string",  description: "Full product name including brand and variant" },
          sku:       { type: "string",  description: "Pack size / weight / quantity e.g. 500ml, 1L, 2L, 6 pcs" },
          price:     { type: "number",  description: "Price in INR (just the number, no ₹ symbol)" },
          eta:       { type: "string",  description: "Estimated delivery time e.g. '8 min', '12 mins'" },
          product_url: { type: "string", description: "Full URL to the product detail page, if available" },
          image_url: { type: "string",  description: "URL of the product image, if available" },
          in_stock:  { type: "boolean", description: "Is the product currently in stock?" },
        },
        required: ["name", "price"],
      },
    },
  },
};

// ── In-memory Cache (1 hour TTL) ─────────────────────────────────────────────
// Note: This is per-process. In production, use Redis.
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// ── Core Scrape Function ──────────────────────────────────────────────────────

async function scrapeOnePlatform(
  query: string,
  platform: keyof typeof MERCHANT_CONFIGS
): Promise<ScrapedProduct[]> {
  const config = MERCHANT_CONFIGS[platform];
  const url = config.searchUrl(query);

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["extract"],
      extract: { schema: PRODUCT_EXTRACT_SCHEMA },
      // Give JS-heavy pages time to render
      timeout: 20000,
    }),
    signal: AbortSignal.timeout(25000), // Hard 25s timeout per request
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firecrawl HTTP ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(`Firecrawl extract failed: ${data.error ?? "unknown"}`);
  }

  const rawProducts: Array<{
    name?: string;
    sku?: string;
    price?: number;
    eta?: string;
    product_url?: string;
    image_url?: string;
    in_stock?: boolean;
  }> = data.data?.extract?.products ?? [];

  return rawProducts
    .filter((p) => p.name && typeof p.price === "number" && p.price > 0)
    .slice(0, 5) // Max 5 per platform
    .map((p) => ({
      name:      p.name!,
      sku:       p.sku ?? "",
      price:     p.price!,
      eta:       p.eta ?? "~15 min",
      platform,
      deepLink:  p.product_url ?? `${config.deepLinkBase}${encodeURIComponent(query)}`,
      inStock:   p.in_stock !== false,
      imageUrl:  p.image_url,
    }));
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Search for a product across all 3 merchants concurrently.
 * Falls back to mock catalog data if scraping fails or returns nothing.
 */
export async function searchProductAcrossMerchants(
  productName: string,
  variantId?: string
): Promise<MerchantSearchResult> {
  const cacheKey = `search:${productName.toLowerCase().trim()}`;
  const cached = cache.get<MerchantSearchResult>(cacheKey);

  if (cached) {
    console.log(`[merchantSearch] Cache hit: ${cacheKey}`);
    return { ...cached, source: "cache" };
  }

  console.log(`[merchantSearch] Live scrape: "${productName}"`);

  const [blinkit, zepto, swiggy] = await Promise.allSettled([
    scrapeOnePlatform(productName, "Blinkit"),
    scrapeOnePlatform(productName, "Zepto"),
    scrapeOnePlatform(productName, "Swiggy"),
  ]);

  const allProducts: ScrapedProduct[] = [
    ...(blinkit.status === "fulfilled" ? blinkit.value : []),
    ...(zepto.status   === "fulfilled" ? zepto.value   : []),
    ...(swiggy.status  === "fulfilled" ? swiggy.value  : []),
  ];

  // Log failures for observability
  [{ name: "Blinkit", r: blinkit }, { name: "Zepto", r: zepto }, { name: "Swiggy", r: swiggy }]
    .filter(({ r }) => r.status === "rejected")
    .forEach(({ name, r }) =>
      console.warn(`[merchantSearch] ${name} scrape failed:`, (r as PromiseRejectedResult).reason)
    );

  if (allProducts.length > 0) {
    const result: MerchantSearchResult = {
      source: "live",
      query: productName,
      products: allProducts,
      scrapedAt: new Date().toISOString(),
    };
    cache.set(cacheKey, result);
    return result;
  }

  // ── Fallback: use catalog mock if scraping returned nothing ──────────────
  console.warn(`[merchantSearch] All scrapes empty, using catalog fallback for: ${productName}`);

  if (variantId) {
    const listings = getListings(variantId);
    const fallback: ScrapedProduct[] = listings.map((l: PlatformListing) => ({
      name:     productName,
      sku:      "",
      price:    l.price,
      eta:      l.eta,
      platform: l.platform,
      deepLink: l.deepLink,
      inStock:  l.inStock,
    }));
    return { source: "fallback", query: productName, products: fallback, scrapedAt: new Date().toISOString() };
  }

  return { source: "fallback", query: productName, products: [], scrapedAt: new Date().toISOString() };
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
