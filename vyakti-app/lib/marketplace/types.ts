/**
 * lib/marketplace/types.ts
 *
 * Canonical type definitions for the marketplace layer.
 *
 * All UI components and marketplace providers should import their shared
 * types from here rather than reaching into lib/mock/catalog directly.
 *
 * lib/mock/catalog.ts re-exports these types so existing importers
 * continue to work without any changes.
 */

// ── Catalog types ─────────────────────────────────────────────────────────────

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

 export type Product = {
  id: string;
  /** Links back to ProductVariant.id — reuses existing brand/variant matching logic */
  variantId: string;
  price: number;
  currency: string;
  /** e.g. "1 L", "500 g" */
  unit: string;
  category: string;
  inStock: boolean;
};
