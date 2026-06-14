/**
 * scripts/test-scraping.ts
 *
 * Quick smoke-test for the Firecrawl merchant search.
 * Run with: npx tsx scripts/test-scraping.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Minimal inline test (no NodeCache in script context)
async function scrapeOne(query: string, platform: string, url: string) {
  console.log(`\n--- ${platform} ---`);
  console.log(`URL: ${url}`);

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["extract"],
      timeout: 20000,
      extract: {
        schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name:        { type: "string",  description: "Full product name with brand" },
                  sku:         { type: "string",  description: "Size or quantity e.g. 500ml, 1L" },
                  price:       { type: "number",  description: "Price in INR (number only)" },
                  eta:         { type: "string",  description: "Delivery ETA e.g. 8 min" },
                  product_url: { type: "string",  description: "Direct link to product page" },
                  in_stock:    { type: "boolean", description: "Is it in stock?" },
                },
                required: ["name", "price"],
              },
            },
          },
        },
      },
    }),
    signal: AbortSignal.timeout(25000),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    console.error("FAILED:", data?.error ?? res.status);
    return;
  }

  const products = data.data?.extract?.products ?? [];
  if (products.length === 0) {
    console.log("⚠  No products extracted. Platform may require location auth.");
  } else {
    console.log(`✓ Found ${products.length} products:`);
    products.slice(0, 3).forEach((p: Record<string, unknown>, i: number) => {
      console.log(`  ${i + 1}. ${p.name} | ${p.sku ?? "-"} | ₹${p.price} | ETA: ${p.eta ?? "?"}`);
      if (p.product_url) console.log(`     URL: ${p.product_url}`);
    });
  }
}

async function main() {
  const query = process.argv[2] ?? "Amul Gold milk 1L";
  console.log(`\n🔍 Testing Firecrawl scraping for: "${query}"`);
  console.log(`API Key: ${process.env.FIRECRAWL_API_KEY?.slice(0, 8)}...`);

  await scrapeOne(query, "Blinkit", `https://blinkit.com/s/?q=${encodeURIComponent(query)}`);
  await scrapeOne(query, "Zepto",   `https://www.zeptonow.com/search?q=${encodeURIComponent(query)}`);
  await scrapeOne(query, "Swiggy",  `https://www.swiggy.com/instamart/search?custom_query=${encodeURIComponent(query)}`);
  
  console.log("\n✅ Test complete.");
}

main().catch(console.error);
