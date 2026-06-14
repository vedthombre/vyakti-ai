/**
 * app/api/search/route.ts
 *
 * Unified product search endpoint.
 * - Accepts { query, variantId? } in the POST body.
 * - Scrapes Blinkit, Zepto, Swiggy concurrently via Firecrawl.
 * - Falls back to catalog mock if scraping yields nothing.
 * - Returns ranked listings ready for the MarketplaceSurface UI.
 */

import { NextResponse } from "next/server";
import {
  searchProductAcrossMerchants,
  rankByPlatformCheapest,
  relevanceScore,
} from "@/lib/scraper/merchantSearch";

// Edge runtime not possible here because node-cache uses Node.js
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query: string = body?.query ?? body?.intent?.item_name ?? "";
    const variantId: string | undefined = body?.variantId;

    if (!query.trim()) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    console.log(`[/api/search] Query="${query}" variantId="${variantId ?? "none"}"`);

    // ── 1. Scrape (or cache / fallback) ────────────────────────────────────
    const searchResult = await searchProductAcrossMerchants(query, variantId);

    // ── 2. Filter by relevance (remove totally unrelated results) ──────────
    const relevant = searchResult.products.filter(
      (p) => relevanceScore(p.name, query) >= 0.4
    );

    // ── 3. Rank: one best listing per platform, cheapest first ──────────────
    const listings = rankByPlatformCheapest(
      relevant.length > 0 ? relevant : searchResult.products
    );

    if (listings.length === 0) {
      return NextResponse.json({
        success: false,
        source: searchResult.source,
        error: `No in-stock products found for "${query}" on any platform.`,
      });
    }

    console.log(`[/api/search] Returning ${listings.length} listings (source: ${searchResult.source})`);

    return NextResponse.json({
      success: true,
      source: searchResult.source,     // "live" | "cache" | "fallback"
      query,
      listings,
      scrapedAt: searchResult.scrapedAt,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/search] Fatal error:", message);
    return NextResponse.json(
      { error: "Search temporarily unavailable", details: message },
      { status: 502 }
    );
  }
}
