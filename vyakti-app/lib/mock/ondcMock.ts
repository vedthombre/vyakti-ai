// ondcMock.ts — Simulates the ONDC seller catalogue response for the MVP
// In production this would be replaced by a live ONDC search call.

import type { ProductVariant } from "./productSearch";

export interface OndcSeller {
  id: string;
  name: string;
  platform: string; // e.g. "Blinkit", "Zepto", "Swiggy"
  price: number;    // in INR
  currency: string;
  eta: string;      // estimated delivery, e.g. "12 min"
  rating: number;   // out of 5
  inStock: boolean;
  logoEmoji: string; // placeholder emoji logo for MVP UI
  redirectUrl: string; // Product URL or search URL
}

// A static catalogue keyed by platform
const PLATFORMS = [
  { id: "blk", name: "Blinkit", platform: "Blinkit", logoEmoji: "🟡" },
  { id: "zlk", name: "Zepto", platform: "Zepto", logoEmoji: "⚡" },
  { id: "swg", name: "Swiggy Instamart", platform: "Swiggy", logoEmoji: "🟠" },
];

/**
 * Returns matching sellers for the given exact product match, sorted cheapest first.
 */
export function getOndcSellers(product: ProductVariant): OndcSeller[] {
  // Generate random but deterministic prices/etas for the mock
  let basePrice = 65;
  if (product.name.toLowerCase().includes("bread")) basePrice = 45;
  if (product.name.toLowerCase().includes("egg")) basePrice = 90;

  const sellers = PLATFORMS.map((plat, i) => {
    // Generate mock price variation
    const price = basePrice + i * 3 - (product.id.length % 5);
    const eta = `${10 + i * 2 - (product.id.length % 3)} min`;
    
    // Get product URL or construct search URL
    let redirectUrl = product.urls[plat.platform];
    if (!redirectUrl) {
      // Construct a search URL based on platform
      const q = encodeURIComponent(product.name);
      if (plat.platform === "Blinkit") redirectUrl = `https://blinkit.com/s/?q=${q}`;
      else if (plat.platform === "Zepto") redirectUrl = `https://www.zeptonow.com/search?query=${q}`;
      else redirectUrl = `https://www.swiggy.com/instamart/search?custom_query=${q}`;
    }

    return {
      id: `${plat.id}-${product.id}`,
      name: plat.name,
      platform: plat.platform,
      price: price > 0 ? price : 10,
      currency: "₹",
      eta,
      rating: 4.5 - i * 0.1,
      inStock: true, // For mock purposes, all are in stock
      logoEmoji: plat.logoEmoji,
      redirectUrl,
    };
  });

  return sellers.sort((a, b) => a.price - b.price);
}

/** Returns just the single cheapest in-stock seller */
export function getCheapestSeller(product: ProductVariant): OndcSeller | null {
  return getOndcSellers(product).find((s) => s.inStock) ?? null;
}

