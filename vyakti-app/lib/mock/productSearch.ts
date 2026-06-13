export interface ProductVariant {
  id: string;
  name: string;
  urls: Record<string, string | null>;
}

export interface ProductCategory {
  id: string;
  name: string;
  emoji: string;
}

export interface ProductSearchResult {
  exactMatch: ProductVariant | null;
  variants: ProductVariant[];
  categories?: ProductCategory[];
}

export const MOCK_PRODUCTS: ProductVariant[] = [
  { id: "amul-gold", name: "Amul Gold", urls: {} },
  { id: "amul-taaza", name: "Amul Taaza", urls: {} },
  { id: "amul-slim", name: "Amul Slim n Trim", urls: {} },
  { id: "amul-full-cream", name: "Amul Full Cream", urls: {} },
  { id: "gokul-milk", name: "Gokul Milk", urls: {} },
  { id: "bread-white", name: "Britannia White Bread", urls: {} },
  { id: "bread-brown", name: "Britannia Brown Bread", urls: {} },
  { id: "eggs-6", name: "Farm Fresh Eggs (6 pack)", urls: {} }
];

export const MOCK_CATEGORIES: ProductCategory[] = [
  { id: "cat-milk", name: "Milk", emoji: "🥛" },
  { id: "cat-bread", name: "Bread", emoji: "🍞" },
  { id: "cat-eggs", name: "Eggs", emoji: "🥚" },
  { id: "cat-pantry", name: "Pantry", emoji: "🥫" },
];

function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return matrix[b.length][a.length];
}

function getSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return 1 - (levenshteinDistance(a.toLowerCase(), b.toLowerCase()) / maxLen);
}

export function searchProducts(query: string): ProductSearchResult {
  const q = query.toLowerCase().trim();
  
  if (q === "groceries" || q === "grocery") {
    return { exactMatch: null, variants: [], categories: MOCK_CATEGORIES };
  }
  
  let variants = MOCK_PRODUCTS.filter(p => {
    const pn = p.name.toLowerCase();
    const qWords = q.split(/\s+/);
    
    // Custom logic to simulate generic searches returning multiple variants
    if (qWords.some(w => w === 'amul' || w === 'milk')) return pn.includes('amul') || pn.includes('gokul');
    if (qWords.some(w => w === 'bread')) return pn.includes('bread');
    if (qWords.some(w => w === 'egg' || w === 'eggs')) return pn.includes('egg');
    
    return pn.includes(q) || q.includes(pn) || getSimilarity(q, pn) > 0.6;
  });

  // Deduplicate and fallback
  if (variants.length === 0) {
    // If we have no variants, treat the query itself as an exact match generic product
    variants = [{ id: "generic", name: query, urls: {} }];
  }

  // Exactly one result returned?
  if (variants.length === 1) {
    return { exactMatch: variants[0], variants };
  }

  // Check if any matches 90%+ similarity
  let exactMatch: ProductVariant | null = null;
  for (const v of variants) {
    if (getSimilarity(q, v.name) >= 0.9) {
      exactMatch = v;
      break;
    }
  }

  return { exactMatch, variants };
}
