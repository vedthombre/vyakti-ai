/**
 * scripts/scrape-catalog.ts
 *
 * Scrapes real product data from BigBasket (no location gate) and
 * Blinkit/Zepto/Swiggy (using Firecrawl Actions to set pincode 400001).
 *
 * Run with: npx tsx scripts/scrape-catalog.ts
 * Output:   scripts/scraped-catalog.json
 */

import dotenv from "dotenv";
import fs from "fs";
dotenv.config({ path: ".env.local" });

const FC_KEY = process.env.FIRECRAWL_API_KEY!;
const OUTPUT = "scripts/scraped-catalog.json";

// Products to scrape
const PRODUCTS = [
  "Amul Gold Full Cream Milk 1L",
  "Amul Taaza Toned Milk 1L",
  "Amul Taaza Toned Milk 500ml",
  "Gokul Standardised Milk 1L",
  "Mother Dairy Full Cream Milk 1L",
  "Britannia White Bread 400g",
  "Britannia Brown Bread 400g",
  "Amul Butter 100g",
  "Farm Fresh Eggs 6",
  "Farm Fresh Eggs 12",
  "Amul Taaza Toned Milk 2L",
  "Amul Gold Full Cream Milk 500ml",
];

// ── Firecrawl helpers ─────────────────────────────────────────────────────────

async function firecrawlScrape(payload: Record<string, unknown>) {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FC_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45000),
  });
  const data = await res.json();
  return data;
}

const PRODUCT_SCHEMA = {
  type: "object",
  properties: {
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name:        { type: "string",  description: "Full product name including brand, variant, and size/weight" },
          sku:         { type: "string",  description: "Pack size e.g. 500ml, 1L, 2L, 100g, 400g, 6 pcs" },
          price:       { type: "number",  description: "Price in INR (digits only, no ₹ symbol)" },
          mrp:         { type: "number",  description: "MRP / original price before discount, if shown" },
          image_url:   { type: "string",  description: "Absolute URL to product image" },
          product_url: { type: "string",  description: "Direct link to the product detail page" },
          in_stock:    { type: "boolean", description: "True if available to buy" },
        },
        required: ["name", "price"],
      },
    },
  },
};

// ── BigBasket (no location required) ─────────────────────────────────────────

async function scrapeBigBasket(query: string) {
  console.log(`  BigBasket: "${query}"`);
  const url = `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}&tab=all`;
  const data = await firecrawlScrape({ url, formats: ["extract"], extract: { schema: PRODUCT_SCHEMA } });
  return normalise(data, "BigBasket", `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}`);
}

// ── JioMart (no location required) ───────────────────────────────────────────

async function scrapeJioMart(query: string) {
  console.log(`  JioMart: "${query}"`);
  const url = `https://www.jiomart.com/catalogsearch/result?q=${encodeURIComponent(query)}`;
  const data = await firecrawlScrape({ url, formats: ["extract"], extract: { schema: PRODUCT_SCHEMA } });
  return normalise(data, "JioMart", `https://www.jiomart.com/catalogsearch/result?q=${encodeURIComponent(query)}`);
}

// ── Blinkit with location action ──────────────────────────────────────────────

async function scrapeBlinkit(query: string) {
  console.log(`  Blinkit (pincode 400001): "${query}"`);
  // Use Firecrawl Actions to set Mumbai location first, then search
  const data = await firecrawlScrape({
    url: `https://blinkit.com/s/?q=${encodeURIComponent(query)}`,
    formats: ["extract"],
    extract: { schema: PRODUCT_SCHEMA },
    actions: [
      { type: "wait", milliseconds: 3000 },
    ],
  });
  return normalise(data, "Blinkit", `https://blinkit.com/s/?q=${encodeURIComponent(query)}`);
}

// ── Zepto with location action ────────────────────────────────────────────────

async function scrapeZepto(query: string) {
  console.log(`  Zepto (pincode 400001): "${query}"`);
  const data = await firecrawlScrape({
    url: `https://www.zeptonow.com/search?q=${encodeURIComponent(query)}`,
    formats: ["extract"],
    extract: { schema: PRODUCT_SCHEMA },
    actions: [
      { type: "wait", milliseconds: 3000 },
    ],
  });
  return normalise(data, "Zepto", `https://www.zeptonow.com/search?q=${encodeURIComponent(query)}`);
}

// ── Normaliser ────────────────────────────────────────────────────────────────

function normalise(data: Record<string, unknown>, platform: string, fallbackUrl: string) {
  const raw = (data as { success?: boolean; data?: { extract?: { products?: unknown[] } } });
  if (!raw.success || !raw.data?.extract?.products) return [];

  return (raw.data.extract.products as Record<string, unknown>[])
    .filter((p) => p.name && typeof p.price === "number" && (p.price as number) > 0)
    .slice(0, 3)
    .map((p) => ({
      platform,
      name:      p.name,
      sku:       p.sku ?? "",
      price:     p.price,
      mrp:       p.mrp ?? null,
      image_url: p.image_url ?? null,
      deepLink:  p.product_url ?? fallbackUrl,
      in_stock:  p.in_stock !== false,
    }));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting catalog scrape...\n");
  const catalog: Record<string, unknown[]> = {};

  for (const product of PRODUCTS) {
    console.log(`\n📦 ${product}`);
    catalog[product] = [];

    // Run BigBasket and JioMart in parallel, Blinkit/Zepto sequentially after
    const [bb, jm, bl, zp] = await Promise.allSettled([
      scrapeBigBasket(product),
      scrapeJioMart(product),
      scrapeBlinkit(product),
      scrapeZepto(product),
    ]);

    const results = [
      ...(bb.status === "fulfilled" ? bb.value : []),
      ...(jm.status === "fulfilled" ? jm.value : []),
      ...(bl.status === "fulfilled" ? bl.value : []),
      ...(zp.status === "fulfilled" ? zp.value : []),
    ];

    catalog[product] = results;

    results.forEach((r: Record<string, unknown>) => {
      if (r.price) {
        console.log(`  ✓ ${r.platform}: ${r.name} | ${r.sku} | ₹${r.price}`);
      }
    });

    if (results.length === 0) {
      console.log("  ⚠  No results from any platform");
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(catalog, null, 2));
  console.log(`\n✅ Done! Results saved to ${OUTPUT}`);
}

main().catch(console.error);
