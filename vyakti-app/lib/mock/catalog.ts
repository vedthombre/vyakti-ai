// Auto-generated from vyakti_mock_ecommerce_db.js
//
// Types are defined in lib/marketplace/types.ts and re-exported here
// so all existing importers (page.tsx, MarketplaceSurface, merchantSearch)
// continue to work without any import-path changes.
//
// v2.0: LISTINGS (3 platforms per variant) collapsed into PRODUCTS
// (single demo-merchant catalog, one price per SKU). BRANDS/VARIANTS
// are unchanged and still power CLARIFY_BRAND / CLARIFY_VARIANT.

import type { Brand, ProductVariant, Product } from "@/lib/marketplace/types";
export type { Brand, ProductVariant, Product } from "@/lib/marketplace/types";


export const BRANDS: Brand[] = [
  { id: "milk_amul_full_cream", name: "Amul Full Cream", emoji: "🥛", keywords: ["amul","full","cream","dairy","milk"] },
  { id: "milk_amul_taaza", name: "Amul Taaza", emoji: "🥛", keywords: ["amul","taaza","dairy","milk"] },
  { id: "milk_mother_dairy", name: "Mother Dairy", emoji: "🥛", keywords: ["mother","dairy","dairy","milk"] },
  { id: "milk_gokul", name: "Gokul", emoji: "🥛", keywords: ["gokul","dairy"] },
  { id: "bread_britannia", name: "Britannia Bread", emoji: "🌾", keywords: ["britannia","bread","groceries"] },
  { id: "bread_harvest_gold", name: "Harvest Gold Bread", emoji: "🌾", keywords: ["harvest","gold","bread","groceries"] },
  { id: "bread_english_oven", name: "English Oven Bread", emoji: "🌾", keywords: ["english","oven","bread","groceries"] },
  { id: "eggs_farm_fresh", name: "Farm Fresh Eggs", emoji: "🥛", keywords: ["farm","fresh","eggs","dairy"] },
  { id: "eggs_country_delight", name: "Country Delight Eggs", emoji: "🥛", keywords: ["country","delight","eggs","dairy"] },
  { id: "eggs_nandini", name: "Nandini Eggs", emoji: "🥛", keywords: ["nandini","eggs","dairy"] },
  { id: "butter_amul", name: "Amul Butter", emoji: "🥛", keywords: ["amul","butter","dairy"] },
  { id: "butter_mother_dairy", name: "Mother Dairy Butter", emoji: "🥛", keywords: ["mother","dairy","butter","dairy"] },
  { id: "butter_nandini", name: "Nandini Butter", emoji: "🥛", keywords: ["nandini","butter","dairy"] },
  { id: "paneer", name: "Paneer", emoji: "🥛", keywords: ["paneer","dairy"] },
  { id: "bananas", name: "Bananas", emoji: "🍎", keywords: ["bananas","fruits"] },
];

export const VARIANTS: ProductVariant[] = [
  { id: "amul_full_500", brandId: "milk_amul_full_cream", name: "Amul Gold Full Cream Milk 500ml", sku: "amul_full_500", image: "🥛", searchKeywords: [] },
  { id: "amul_full_1l", brandId: "milk_amul_full_cream", name: "Amul Gold Full Cream Milk 1L", sku: "amul_full_1l", image: "🥛", searchKeywords: [] },
  { id: "amul_full_2l", brandId: "milk_amul_full_cream", name: "Amul Gold Full Cream Milk 2L", sku: "amul_full_2l", image: "🥛", searchKeywords: [] },
  { id: "amul_full_5l", brandId: "milk_amul_full_cream", name: "Amul Gold Full Cream Milk 5L", sku: "amul_full_5l", image: "🥛", searchKeywords: [] },
  { id: "amul_taaza_500", brandId: "milk_amul_taaza", name: "Amul Taaza Toned Milk 500ml", sku: "amul_taaza_500", image: "🥛", searchKeywords: [] },
  { id: "amul_taaza_1l", brandId: "milk_amul_taaza", name: "Amul Taaza Toned Milk 1L", sku: "amul_taaza_1l", image: "🥛", searchKeywords: [] },
  { id: "amul_taaza_2l", brandId: "milk_amul_taaza", name: "Amul Taaza Toned Milk 2L", sku: "amul_taaza_2l", image: "🥛", searchKeywords: [] },
  { id: "md_full_500", brandId: "milk_mother_dairy", name: "Mother Dairy Full Cream 500ml", sku: "md_full_500", image: "🥛", searchKeywords: [] },
  { id: "md_full_1l", brandId: "milk_mother_dairy", name: "Mother Dairy Full Cream 1L", sku: "md_full_1l", image: "🥛", searchKeywords: [] },
  { id: "md_full_2l", brandId: "milk_mother_dairy", name: "Mother Dairy Full Cream 2L", sku: "md_full_2l", image: "🥛", searchKeywords: [] },
  { id: "md_toned_500", brandId: "milk_mother_dairy", name: "Mother Dairy Toned Milk 500ml", sku: "md_toned_500", image: "🥛", searchKeywords: [] },
  { id: "md_toned_1l", brandId: "milk_mother_dairy", name: "Mother Dairy Toned Milk 1L", sku: "md_toned_1l", image: "🥛", searchKeywords: [] },
  { id: "gokul_std_500", brandId: "milk_gokul", name: "Gokul Standardised Milk 500ml", sku: "gokul_std_500", image: "🥛", searchKeywords: [] },
  { id: "gokul_std_1l", brandId: "milk_gokul", name: "Gokul Standardised Milk 1L", sku: "gokul_std_1l", image: "🥛", searchKeywords: [] },
  { id: "gokul_full_1l", brandId: "milk_gokul", name: "Gokul Full Cream Milk 1L", sku: "gokul_full_1l", image: "🥛", searchKeywords: [] },
  { id: "gokul_full_2l", brandId: "milk_gokul", name: "Gokul Full Cream Milk 2L", sku: "gokul_full_2l", image: "🥛", searchKeywords: [] },
  { id: "brit_white_400", brandId: "bread_britannia", name: "Britannia White Sandwich Bread 400g", sku: "brit_white_400", image: "🌾", searchKeywords: [] },
  { id: "brit_brown_400", brandId: "bread_britannia", name: "Britannia 100% Whole Wheat Brown Bread 400g", sku: "brit_brown_400", image: "🌾", searchKeywords: [] },
  { id: "brit_multi_400", brandId: "bread_britannia", name: "Britannia Multigrain Bread 400g", sku: "brit_multi_400", image: "🌾", searchKeywords: [] },
  { id: "hg_white_400", brandId: "bread_harvest_gold", name: "Harvest Gold White Bread 400g", sku: "hg_white_400", image: "🌾", searchKeywords: [] },
  { id: "hg_brown_400", brandId: "bread_harvest_gold", name: "Harvest Gold Brown Bread 400g", sku: "hg_brown_400", image: "🌾", searchKeywords: [] },
  { id: "hg_multi_400", brandId: "bread_harvest_gold", name: "Harvest Gold Hearty Multigrain Bread 400g", sku: "hg_multi_400", image: "🌾", searchKeywords: [] },
  { id: "eo_white_400", brandId: "bread_english_oven", name: "English Oven Sandwich White Bread 400g", sku: "eo_white_400", image: "🌾", searchKeywords: [] },
  { id: "eo_brown_400", brandId: "bread_english_oven", name: "English Oven 100% Atta Brown Bread 400g", sku: "eo_brown_400", image: "🌾", searchKeywords: [] },
  { id: "eo_multi_400", brandId: "bread_english_oven", name: "English Oven Multigrain Bread 400g", sku: "eo_multi_400", image: "🌾", searchKeywords: [] },
  { id: "egg_white_6", brandId: "eggs_farm_fresh", name: "White Farm Fresh Eggs 6 pcs", sku: "egg_white_6", image: "🥛", searchKeywords: [] },
  { id: "egg_white_10", brandId: "eggs_farm_fresh", name: "White Farm Fresh Eggs 10 pcs", sku: "egg_white_10", image: "🥛", searchKeywords: [] },
  { id: "egg_white_12", brandId: "eggs_farm_fresh", name: "White Farm Fresh Eggs 12 pcs", sku: "egg_white_12", image: "🥛", searchKeywords: [] },
  { id: "egg_white_30", brandId: "eggs_farm_fresh", name: "White Farm Fresh Eggs 30 pcs", sku: "egg_white_30", image: "🥛", searchKeywords: [] },
  { id: "cd_white_6", brandId: "eggs_country_delight", name: "Country Delight Protein White Eggs 6 pcs", sku: "cd_white_6", image: "🥛", searchKeywords: [] },
  { id: "cd_brown_6", brandId: "eggs_country_delight", name: "Country Delight Brown Eggs 6 pcs", sku: "cd_brown_6", image: "🥛", searchKeywords: [] },
  { id: "nandini_6", brandId: "eggs_nandini", name: "Nandini Farm Fresh Eggs 6 pcs", sku: "nandini_6", image: "🥛", searchKeywords: [] },
  { id: "nandini_30", brandId: "eggs_nandini", name: "Nandini Farm Fresh Eggs 30 pcs", sku: "nandini_30", image: "🥛", searchKeywords: [] },
  { id: "amul_butter_100", brandId: "butter_amul", name: "Amul Pasteurized Salted Butter 100g", sku: "amul_butter_100", image: "🥛", searchKeywords: [] },
  { id: "amul_butter_200", brandId: "butter_amul", name: "Amul Pasteurized Salted Butter 200g", sku: "amul_butter_200", image: "🥛", searchKeywords: [] },
  { id: "amul_butter_500", brandId: "butter_amul", name: "Amul Pasteurized Salted Butter 500g", sku: "amul_butter_500", image: "🥛", searchKeywords: [] },
  { id: "amul_unsalted_100", brandId: "butter_amul", name: "Amul Unsalted Butter 100g", sku: "amul_unsalted_100", image: "🥛", searchKeywords: [] },
  { id: "amul_garlic_100", brandId: "butter_amul", name: "Amul Garlic & Herbs Butter 100g", sku: "amul_garlic_100", image: "🥛", searchKeywords: [] },
  { id: "md_butter_100", brandId: "butter_mother_dairy", name: "Mother Dairy Classic Salted Butter 100g", sku: "md_butter_100", image: "🥛", searchKeywords: [] },
  { id: "md_butter_500", brandId: "butter_mother_dairy", name: "Mother Dairy Classic Salted Butter 500g", sku: "md_butter_500", image: "🥛", searchKeywords: [] },
  { id: "md_white_butter_100", brandId: "butter_mother_dairy", name: "Mother Dairy White Unsalted Butter 100g", sku: "md_white_butter_100", image: "🥛", searchKeywords: [] },
  { id: "nandini_butter_100", brandId: "butter_nandini", name: "Nandini Pasteurised Butter 100g", sku: "nandini_butter_100", image: "🥛", searchKeywords: [] },
  { id: "nandini_butter_500", brandId: "butter_nandini", name: "Nandini Pasteurised Butter 500g", sku: "nandini_butter_500", image: "🥛", searchKeywords: [] },
  { id: "paneer_200", brandId: "paneer", name: "Amul Malai Paneer 200g", sku: "paneer_200", image: "🥛", searchKeywords: [] },
  { id: "paneer_1kg", brandId: "paneer", name: "Amul Malai Paneer 1kg", sku: "paneer_1kg", image: "🥛", searchKeywords: [] },
  { id: "banana_6", brandId: "bananas", name: "Fresh Robusta Bananas 6 pcs", sku: "banana_6", image: "🍎", searchKeywords: [] },
  { id: "banana_12", brandId: "bananas", name: "Fresh Robusta Bananas 12 pcs", sku: "banana_12", image: "🍎", searchKeywords: [] },
];

// ── Demo merchant catalog ────────────────────────────────────────────────
// Collapsed from the old 3-platform LISTINGS: one Product per variant,
// representing what a single agent-readable merchant catalog would return.
// Prices carried over from the former Blinkit column as the representative price.

export const PRODUCTS: Product[] = [
  { id: "amul_full_500", variantId: "amul_full_500", price: 34, currency: "INR", unit: "500 ml", category: "milk", inStock: true },
  { id: "amul_full_1l", variantId: "amul_full_1l", price: 68, currency: "INR", unit: "1 L", category: "milk", inStock: true },
  { id: "amul_full_2l", variantId: "amul_full_2l", price: 135, currency: "INR", unit: "2 L", category: "milk", inStock: true },
  { id: "amul_full_5l", variantId: "amul_full_5l", price: 340, currency: "INR", unit: "5 L", category: "milk", inStock: false },
  { id: "amul_taaza_500", variantId: "amul_taaza_500", price: 30, currency: "INR", unit: "500 ml", category: "milk", inStock: true },
  { id: "amul_taaza_1l", variantId: "amul_taaza_1l", price: 58, currency: "INR", unit: "1 L", category: "milk", inStock: true },
  { id: "amul_taaza_2l", variantId: "amul_taaza_2l", price: 115, currency: "INR", unit: "2 L", category: "milk", inStock: true },
  { id: "md_full_500", variantId: "md_full_500", price: 34, currency: "INR", unit: "500 ml", category: "milk", inStock: true },
  { id: "md_full_1l", variantId: "md_full_1l", price: 68, currency: "INR", unit: "1 L", category: "milk", inStock: true },
  { id: "md_full_2l", variantId: "md_full_2l", price: 136, currency: "INR", unit: "2 L", category: "milk", inStock: true },
  { id: "md_toned_500", variantId: "md_toned_500", price: 30, currency: "INR", unit: "500 ml", category: "milk", inStock: true },
  { id: "md_toned_1l", variantId: "md_toned_1l", price: 58, currency: "INR", unit: "1 L", category: "milk", inStock: true },
  { id: "gokul_std_500", variantId: "gokul_std_500", price: 33, currency: "INR", unit: "500 ml", category: "milk", inStock: true },
  { id: "gokul_std_1l", variantId: "gokul_std_1l", price: 66, currency: "INR", unit: "1 L", category: "milk", inStock: true },
  { id: "gokul_full_1l", variantId: "gokul_full_1l", price: 70, currency: "INR", unit: "1 L", category: "milk", inStock: true },
  { id: "gokul_full_2l", variantId: "gokul_full_2l", price: 140, currency: "INR", unit: "2 L", category: "milk", inStock: false },
  { id: "brit_white_400", variantId: "brit_white_400", price: 35, currency: "INR", unit: "400 g", category: "bread", inStock: true },
  { id: "brit_brown_400", variantId: "brit_brown_400", price: 45, currency: "INR", unit: "400 g", category: "bread", inStock: true },
  { id: "brit_multi_400", variantId: "brit_multi_400", price: 55, currency: "INR", unit: "400 g", category: "bread", inStock: true },
  { id: "hg_white_400", variantId: "hg_white_400", price: 35, currency: "INR", unit: "400 g", category: "bread", inStock: true },
  { id: "hg_brown_400", variantId: "hg_brown_400", price: 45, currency: "INR", unit: "400 g", category: "bread", inStock: true },
  { id: "hg_multi_400", variantId: "hg_multi_400", price: 50, currency: "INR", unit: "400 g", category: "bread", inStock: true },
  { id: "eo_white_400", variantId: "eo_white_400", price: 40, currency: "INR", unit: "400 g", category: "bread", inStock: true },
  { id: "eo_brown_400", variantId: "eo_brown_400", price: 50, currency: "INR", unit: "400 g", category: "bread", inStock: true },
  { id: "eo_multi_400", variantId: "eo_multi_400", price: 60, currency: "INR", unit: "400 g", category: "bread", inStock: false },
  { id: "egg_white_6", variantId: "egg_white_6", price: 45, currency: "INR", unit: "6 pcs", category: "eggs", inStock: true },
  { id: "egg_white_10", variantId: "egg_white_10", price: 75, currency: "INR", unit: "10 pcs", category: "eggs", inStock: true },
  { id: "egg_white_12", variantId: "egg_white_12", price: 85, currency: "INR", unit: "12 pcs", category: "eggs", inStock: true },
  { id: "egg_white_30", variantId: "egg_white_30", price: 205, currency: "INR", unit: "30 pcs", category: "eggs", inStock: true },
  { id: "cd_white_6", variantId: "cd_white_6", price: 65, currency: "INR", unit: "6 pcs", category: "eggs", inStock: true },
  { id: "cd_brown_6", variantId: "cd_brown_6", price: 85, currency: "INR", unit: "6 pcs", category: "eggs", inStock: true },
  { id: "nandini_6", variantId: "nandini_6", price: 40, currency: "INR", unit: "6 pcs", category: "eggs", inStock: true },
  { id: "nandini_30", variantId: "nandini_30", price: 195, currency: "INR", unit: "30 pcs", category: "eggs", inStock: false },
  { id: "amul_butter_100", variantId: "amul_butter_100", price: 58, currency: "INR", unit: "100 g", category: "butter", inStock: true },
  { id: "amul_butter_200", variantId: "amul_butter_200", price: 115, currency: "INR", unit: "200 g", category: "butter", inStock: true },
  { id: "amul_butter_500", variantId: "amul_butter_500", price: 285, currency: "INR", unit: "500 g", category: "butter", inStock: true },
  { id: "amul_unsalted_100", variantId: "amul_unsalted_100", price: 60, currency: "INR", unit: "100 g", category: "butter", inStock: true },
  { id: "amul_garlic_100", variantId: "amul_garlic_100", price: 65, currency: "INR", unit: "100 g", category: "butter", inStock: true },
  { id: "md_butter_100", variantId: "md_butter_100", price: 56, currency: "INR", unit: "100 g", category: "butter", inStock: true },
  { id: "md_butter_500", variantId: "md_butter_500", price: 280, currency: "INR", unit: "500 g", category: "butter", inStock: true },
  { id: "md_white_butter_100", variantId: "md_white_butter_100", price: 58, currency: "INR", unit: "100 g", category: "butter", inStock: false },
  { id: "nandini_butter_100", variantId: "nandini_butter_100", price: 54, currency: "INR", unit: "100 g", category: "butter", inStock: true },
  { id: "nandini_butter_500", variantId: "nandini_butter_500", price: 270, currency: "INR", unit: "500 g", category: "butter", inStock: true },
  { id: "paneer_200", variantId: "paneer_200", price: 90, currency: "INR", unit: "200 g", category: "paneer", inStock: true },
  { id: "paneer_1kg", variantId: "paneer_1kg", price: 430, currency: "INR", unit: "1 kg", category: "paneer", inStock: true },
  { id: "banana_6", variantId: "banana_6", price: 35, currency: "INR", unit: "6 pcs", category: "fruits", inStock: true },
  { id: "banana_12", variantId: "banana_12", price: 65, currency: "INR", unit: "12 pcs", category: "fruits", inStock: true },
];

// ── Helpers ─────────────────────────────────────────────────────────────

export function findBrands(query: string): Brand[] {
  const q = query.toLowerCase();
  return BRANDS.filter((b) => 
    b.name.toLowerCase().includes(q) || 
    b.keywords.some((k) => q.includes(k) || k.includes(q))
  );
}

/**
 * Returns this brand's variants, each paired with its single-merchant Product.
 * Replaces the old `listings: PlatformListing[]` (3 platforms) with a single
 * `product: Product` since there's now one merchant, one price.
 */
export function getVariantsForBrand(brandId: string, sizeHint?: string): (ProductVariant & { product: Product | undefined })[] {
  const brandVariants = VARIANTS.filter((v) => v.brandId === brandId);
  const withProduct = brandVariants.map((v) => ({
    ...v,
    product: getProductForVariant(v.id),
  }));

  if (sizeHint) {
    const hint = sizeHint.toLowerCase().replace(/\s+/g, "");
    withProduct.sort((a, b) => {
      const aSku = a.sku.toLowerCase().replace(/\s+/g, "");
      const bSku = b.sku.toLowerCase().replace(/\s+/g, "");
      if (aSku.includes(hint) && !bSku.includes(hint)) return -1;
      if (!aSku.includes(hint) && bSku.includes(hint)) return 1;
      return 0;
    });
  }
  return withProduct;
}

/** Renamed from getListings() — single merchant means a single Product, not an array. */
export function getProductForVariant(variantId: string): Product | undefined {
  return PRODUCTS.find((p) => p.variantId === variantId);
}