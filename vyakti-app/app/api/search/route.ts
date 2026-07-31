/**
 * app/api/search/route.ts
 *
 * Unified product search endpoint.
 * - Accepts { query, variantId? } in the POST body.
 * - Delegates to the MarketplaceAggregator which fans out to all providers.
 * - Returns ranked listings ready for the MarketplaceSurface UI.
 *
 * This route is intentionally thin — no marketplace logic lives here.
 * All provider-specific behaviour belongs in lib/marketplace/providers/.
 */

import { NextResponse } from "next/server";
import { defaultAggregator } from "@/lib/marketplace/aggregator";

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

    // ── Delegate entirely to the Aggregator ──────────────────────────────────
    const searchResult = await defaultAggregator.search(query, variantId);

    if (searchResult.products.length === 0) {
      return NextResponse.json({
        success: false,
        source: searchResult.source,
        error: `No in-stock products found for "${query}" on any platform.`,
      });
    }

    console.log(
      `[/api/search] Returning ${searchResult.products.length} listings (source: ${searchResult.source})`
    );

    return NextResponse.json({
      success: true,
      source:    searchResult.source,   // "live" | "cache" | "fallback"
      query,
      listings:  searchResult.products,
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
