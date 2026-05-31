// ondcMock.ts — Simulates the ONDC seller catalogue response for the MVP
// In production this would be replaced by a live ONDC search call.

export interface OndcSeller {
  id: string;
  name: string;
  platform: string; // e.g. "Blinkit", "Zepto", "Swiggy Instamart"
  price: number;    // in INR
  currency: string;
  eta: string;      // estimated delivery, e.g. "12 min"
  rating: number;   // out of 5
  inStock: boolean;
  logoEmoji: string; // placeholder emoji logo for MVP UI
}

// A static catalogue keyed by normalised item name
const mockCatalogue: Record<string, OndcSeller[]> = {
  default: [
    { id: "zlk-001", name: "Zepto", platform: "Zepto",           price: 62,  currency: "₹", eta: "10 min", rating: 4.6, inStock: true,  logoEmoji: "⚡" },
    { id: "blk-001", name: "Blinkit", platform: "Blinkit",       price: 65,  currency: "₹", eta: "12 min", rating: 4.5, inStock: true,  logoEmoji: "🟡" },
    { id: "swg-001", name: "Swiggy Instamart", platform: "Swiggy", price: 68, currency: "₹", eta: "15 min", rating: 4.4, inStock: true,  logoEmoji: "🟠" },
    { id: "dmr-001", name: "Dunzo", platform: "Dunzo",           price: 70,  currency: "₹", eta: "20 min", rating: 4.2, inStock: false, logoEmoji: "🏍️" },
  ],
  milk: [
    { id: "zlk-mlk", name: "Zepto",           platform: "Zepto",  price: 63,  currency: "₹", eta: "8 min",  rating: 4.7, inStock: true,  logoEmoji: "⚡" },
    { id: "blk-mlk", name: "Blinkit",         platform: "Blinkit",price: 66,  currency: "₹", eta: "11 min", rating: 4.5, inStock: true,  logoEmoji: "🟡" },
    { id: "swg-mlk", name: "Swiggy Instamart",platform: "Swiggy", price: 72,  currency: "₹", eta: "14 min", rating: 4.3, inStock: true,  logoEmoji: "🟠" },
  ],
  bread: [
    { id: "zlk-brd", name: "Zepto",           platform: "Zepto",  price: 45,  currency: "₹", eta: "9 min",  rating: 4.6, inStock: true,  logoEmoji: "⚡" },
    { id: "blk-brd", name: "Blinkit",         platform: "Blinkit",price: 48,  currency: "₹", eta: "12 min", rating: 4.5, inStock: true,  logoEmoji: "🟡" },
    { id: "swg-brd", name: "Swiggy Instamart",platform: "Swiggy", price: 55,  currency: "₹", eta: "16 min", rating: 4.3, inStock: true,  logoEmoji: "🟠" },
  ],
};

/**
 * Returns matching sellers for the given item, sorted cheapest first.
 * Falls back to the `default` catalogue if the item isn't specifically mapped.
 */
export function getOndcSellers(itemName: string | null | undefined): OndcSeller[] {
  const key = (itemName ?? "").toLowerCase().trim();
  const sellers = mockCatalogue[key] ?? mockCatalogue["default"];
  return [...sellers].sort((a, b) => a.price - b.price);
}

/** Returns just the single cheapest in-stock seller */
export function getCheapestSeller(itemName: string | null | undefined): OndcSeller | null {
  return getOndcSellers(itemName).find((s) => s.inStock) ?? null;
}
