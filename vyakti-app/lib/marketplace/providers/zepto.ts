/**
 * lib/marketplace/providers/zepto.ts
 *
 * MarketplaceProvider implementation for Zepto.
 *
 * Data flow:
 *   search() → Firecrawl scrape (live)
 *           → catalog fallback (lib/mock/catalog.ts) if scraping fails
 *
 * All scraping and normalization logic lives here.
 * The Aggregator receives only the final ProviderSearchResult.
 */

import type { MarketplaceProvider, ProviderSearchResult } from "@/lib/marketplace/provider";
import type { ScrapedProduct } from "@/lib/scraper/merchantSearch";
import { getListings } from "@/lib/mock/catalog";
import type { PlatformListing } from "@/lib/mock/catalog";

// ── Config ────────────────────────────────────────────────────────────────────

const ZEPTO_SEARCH_URL = (q: string) =>
  `https://www.zeptonow.com/search?q=${encodeURIComponent(q)}`;

const DEEP_LINK_BASE = "https://www.zeptonow.com/search?q=";

const PRODUCT_EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    products: {
      type: "array",
      description: "List of products visible on the page",
      items: {
        type: "object",
        properties: {
          name:        { type: "string",  description: "Full product name including brand and variant" },
          sku:         { type: "string",  description: "Pack size / weight / quantity e.g. 500ml, 1L, 6 pcs" },
          price:       { type: "number",  description: "Price in INR (just the number, no ₹ symbol)" },
          eta:         { type: "string",  description: "Estimated delivery time e.g. '8 min', '12 mins'" },
          product_url: { type: "string",  description: "Full URL to the product detail page, if available" },
          image_url:   { type: "string",  description: "URL of the product image, if available" },
          in_stock:    { type: "boolean", description: "Is the product currently in stock?" },
        },
        required: ["name", "price"],
      },
    },
  },
};

// ── Zepto Provider ────────────────────────────────────────────────────────────

export class ZeptoProvider implements MarketplaceProvider {
  readonly name = "Zepto";

  async search(query: string, variantId?: string): Promise<ProviderSearchResult> {
    try {
      const products = await this.scrape(query);

      if (products.length > 0) {
        return { source: "live", products };
      }

      // Scrape returned nothing — fall back to catalog
      console.warn(`[ZeptoProvider] Live scrape empty for "${query}", using catalog fallback.`);
      return this.catalogFallback(query, variantId);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[ZeptoProvider] Scrape failed for "${query}": ${message}. Using catalog fallback.`);
      return this.catalogFallback(query, variantId);
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async scrape(query: string): Promise<ScrapedProduct[]> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not configured.");
    }

    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: ZEPTO_SEARCH_URL(query),
        formats: ["extract"],
        extract: { schema: PRODUCT_EXTRACT_SCHEMA },
        timeout: 20000,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Firecrawl HTTP ${res.status}: ${err.slice(0, 200)}`);
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(`Firecrawl extract failed: ${data.error ?? "unknown"}`);
    }

    type RawProduct = {
      name?: string; sku?: string; price?: number; eta?: string;
      product_url?: string; image_url?: string; in_stock?: boolean;
    };

    const raw: RawProduct[] = data.data?.extract?.products ?? [];

    return raw
      .filter((p) => p.name && typeof p.price === "number" && p.price > 0)
      .slice(0, 5)
      .map((p) => ({
        name:     p.name!,
        sku:      p.sku ?? "",
        price:    p.price!,
        eta:      p.eta ?? "~15 min",
        platform: "Zepto" as const,
        deepLink: p.product_url ?? `${DEEP_LINK_BASE}${encodeURIComponent(query)}`,
        inStock:  p.in_stock !== false,
        imageUrl: p.image_url,
      }));
  }

  private catalogFallback(query: string, variantId?: string): ProviderSearchResult {
    if (!variantId) {
      return { source: "fallback", products: [] };
    }

    const listings: PlatformListing[] = getListings(variantId).filter(
      (l) => l.platform === "Zepto"
    );

    const products: ScrapedProduct[] = listings.map((l) => ({
      name:     query,
      sku:      "",
      price:    l.price,
      eta:      l.eta,
      platform: "Zepto" as const,
      deepLink: l.deepLink,
      inStock:  l.inStock,
    }));

    return { source: "fallback", products };
  }
}
