import fs from "fs";
import { PRODUCTS } from "../vyakti_mock_ecommerce_db.js";

// Map emojis by category
const EMOJIS: Record<string, string> = {
  Dairy: "🥛",
  Fruits: "🍎",
  Vegetables: "🥦",
  Groceries: "🌾",
  Snacks: "🍪",
  "Instant Food": "🍜",
  Household: "🧼",
};

const ETAS: Record<string, string> = {
  Blinkit: "8 min",
  Zepto: "10 min",
  Swiggy: "12 min",
};

let output = `// Auto-generated from vyakti_mock_ecommerce_db.js

export type Brand = {
  id: string;
  name: string;
  emoji: string;
  keywords: string[];
};

export type ProductVariant = {
  id: string;
  brandId: string;
  name: string;
  sku: string;
  image: string;
  searchKeywords: string[];
};

export type PlatformListing = {
  variantId: string;
  platform: "Blinkit" | "Zepto" | "Swiggy";
  price: number;
  eta: string;
  deepLink: string;
  inStock: boolean;
};

export const BRANDS: Brand[] = [
`;

PRODUCTS.forEach((p: any) => {
  const emoji = EMOJIS[p.category] || "📦";
  const keywords = p.baseVariant.toLowerCase().split(" ");
  keywords.push(p.category.toLowerCase());
  if (p.id === "milk_amul_full_cream" || p.id === "milk_amul_taaza" || p.id === "milk_mother_dairy") keywords.push("milk");
  
  output += `  { id: "${p.id}", name: "${p.baseVariant}", emoji: "${emoji}", keywords: ${JSON.stringify(keywords)} },\n`;
});

output += `];\n\nexport const VARIANTS: ProductVariant[] = [\n`;

PRODUCTS.forEach((p: any) => {
  p.variants.forEach((v: any) => {
    output += `  { id: "${v.sku}", brandId: "${p.id}", name: "${v.name}", sku: "${v.sku}", image: "${EMOJIS[p.category] || "📦"}", searchKeywords: [] },\n`;
  });
});

output += `];\n\nexport const LISTINGS: PlatformListing[] = [\n`;

PRODUCTS.forEach((p: any) => {
  p.variants.forEach((v: any) => {
    ["blinkit", "zepto", "instamart"].forEach((m: string) => {
      const platformName = m === "instamart" ? "Swiggy" : m.charAt(0).toUpperCase() + m.slice(1);
      const deepLink = m === "blinkit" ? "https://blinkit.com/s/?q=" + encodeURIComponent(v.name) :
                       m === "zepto" ? "https://www.zeptonow.com/search?q=" + encodeURIComponent(v.name) :
                       "https://www.swiggy.com/instamart/search?custom_query=" + encodeURIComponent(v.name);
      
      if (v.prices[m]) {
        output += `  { variantId: "${v.sku}", platform: "${platformName}" as const, price: ${v.prices[m]}, eta: "${ETAS[platformName]}", deepLink: "${deepLink}", inStock: ${v.inStock[m]} },\n`;
      }
    });
  });
});

output += `];

// ── Helpers ─────────────────────────────────────────────────────────────

export function findBrands(query: string): Brand[] {
  const q = query.toLowerCase();
  return BRANDS.filter((b) => 
    b.name.toLowerCase().includes(q) || 
    b.keywords.some((k) => q.includes(k) || k.includes(q))
  );
}

export function getVariantsForBrand(brandId: string, sizeHint?: string): (ProductVariant & { listings: PlatformListing[] })[] {
  const brandVariants = VARIANTS.filter((v) => v.brandId === brandId);
  const withListings = brandVariants.map((v) => ({
    ...v,
    listings: getListings(v.id),
  }));

  if (sizeHint) {
    const hint = sizeHint.toLowerCase().replace(/\\s+/g, "");
    withListings.sort((a, b) => {
      const aSku = a.sku.toLowerCase().replace(/\\s+/g, "");
      const bSku = b.sku.toLowerCase().replace(/\\s+/g, "");
      if (aSku.includes(hint) && !bSku.includes(hint)) return -1;
      if (!aSku.includes(hint) && bSku.includes(hint)) return 1;
      return 0;
    });
  }
  return withListings;
}

export function getListings(variantId: string): PlatformListing[] {
  return LISTINGS.filter((l) => l.variantId === variantId);
}
`;

fs.writeFileSync("lib/mock/catalog.ts", output);
console.log("Successfully generated lib/mock/catalog.ts from vyakti_mock_ecommerce_db.js");
