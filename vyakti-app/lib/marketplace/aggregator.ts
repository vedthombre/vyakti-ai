/**
 * lib/marketplace/aggregator.ts
 *
 * v2.0: this file no longer fans out to Blinkit/Zepto/Swiggy providers.
 * It is now the AI buyer's DETERMINISTIC decision engine: takes a parsed
 * Intent and the single-merchant catalog (lib/mock/catalog.ts) and returns
 * a Decision — one selected product, a human-readable reasoning trace, and
 * a short list of alternatives.
 *
 * IMPORTANT (decision #3, locked): product selection here is rules-based
 * only. No LLM call decides the winner. An LLM may only ever be used later
 * to *rephrase* the reasoning strings into nicer prose — never to change
 * which candidate wins.
 *
 * Old multi-provider fan-out logic (Blinkit/Zepto/Swiggy Promise.allSettled)
 * has been removed from this file. That logic still exists, unplugged, in
 * lib/marketplace/providers/*.ts and app/api/search/route.ts (Vyakti 1.0,
 * recoverable, not deleted — see project decisions).
 */

import { BRANDS, VARIANTS, findBrands, getVariantsForBrand, getProductForVariant } from "@/lib/mock/catalog";
import type { Brand } from "@/lib/mock/catalog";
import type { Intent } from "@/lib/schemas/intent";
import type { Decision, DecisionCandidate } from "@/lib/schemas/decision";

// ── Unit normalization ──────────────────────────────────────────────────────
// Maps loose spoken units ("litre", "ltr", "kg", "packet"...) and catalog
// units ("500 ml", "1 L", "6 pcs"...) onto a small shared vocabulary so they
// can be compared. Deliberately simple — the demo catalog uses a handful of
// unit types only.

const UNIT_SYNONYMS: Record<string, string> = {
  l: "l", litre: "l", liter: "l", litres: "l", liters: "l", ltr: "l",
  ml: "ml", millilitre: "ml", millilitres: "ml",
  kg: "kg", kilogram: "kg", kilograms: "kg", kilo: "kg",
  g: "g", gram: "g", grams: "g",
  pcs: "pcs", pc: "pcs", piece: "pcs", pieces: "pcs",
  pack: "pcs", packet: "pcs", packets: "pcs",
};

function normalizeUnitType(raw: string): string | null {
  const key = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
  return UNIT_SYNONYMS[key] ?? null;
}

function parseProductUnit(unit: string): { amount: number; type: string } | null {
  const match = unit.trim().toLowerCase().match(/^([\d.]+)\s*([a-z]+)$/);
  if (!match) return null;
  const type = normalizeUnitType(match[2]);
  if (!type) return null;
  return { amount: parseFloat(match[1]), type };
}

// ── Candidate collection ──────────────────────────────────────────────────────

type ScoredCandidate = {
  candidate: DecisionCandidate;
  score: number;
  reasons: string[];
};

/**
 * Step 1 of plan §7: filter catalog by item_name/brand/unit.
 * Reuses findBrands() (existing keyword matching) rather than reinventing
 * product search — it's the same logic CLARIFY_BRAND already relies on.
 */
function collectCandidates(intent: Intent): DecisionCandidate[] {
  const query = intent.item_name?.trim() ?? "";
  const matchedBrands = query ? findBrands(query) : BRANDS;

  // If the user also gave an explicit brand_preference, narrow further —
  // but don't discard everything if nothing matches (fall back to matchedBrands).
  let brandPool: Brand[] = matchedBrands;
  if (intent.brand_preference) {
    const pref = intent.brand_preference.toLowerCase();
    const narrowed = matchedBrands.filter(
      (b) =>
        b.name.toLowerCase().includes(pref) ||
        b.keywords.some((k) => k.includes(pref) || pref.includes(k))
    );
    if (narrowed.length > 0) brandPool = narrowed;
  }

  const candidates: DecisionCandidate[] = [];
  for (const brand of brandPool) {
    const variantsWithProduct = getVariantsForBrand(brand.id);
    for (const v of variantsWithProduct) {
      if (!v.product) continue; // catalog gap — skip rather than crash
      candidates.push({
        productId: v.product.id,
        variantId: v.id,
        brandId: brand.id,
        brandName: brand.name,
        name: v.name,
        image: brand.emoji,
        price: v.product.price,
        currency: v.product.currency,
        unit: v.product.unit,
        inStock: v.product.inStock,
      });
    }
  }
  return candidates;
}

/**
 * Step 2 of plan §7: deterministic rules-based scoring.
 * Tiers, highest first: brand match > in-stock (hard filter) > unit/quantity
 * match > price as final tiebreaker. Every scored candidate carries the
 * plain-language reason(s) it earned its score, so the reasoning trace is
 * built alongside scoring rather than reverse-engineered after the fact.
 */
function scoreCandidates(intent: Intent, candidates: DecisionCandidate[]): ScoredCandidate[] {
  const wantedUnitType = intent.unit ? normalizeUnitType(intent.unit) : null;
  const wantedBrand = intent.brand_preference?.toLowerCase().trim();

  return candidates
    .filter((c) => c.inStock) // hard filter — out-of-stock is never selectable
    .map((c) => {
      let score = 0;
      const reasons: string[] = [];

      if (wantedBrand && c.brandName.toLowerCase().includes(wantedBrand)) {
        score += 100;
        reasons.push(`Matches the brand you asked for ("${c.brandName}").`);
      }

      if (wantedUnitType) {
        const parsed = parseProductUnit(c.unit);
        if (parsed && parsed.type === wantedUnitType) {
          if (!intent.quantity || parsed.amount === intent.quantity) {
            score += 50;
            reasons.push(`Matches the quantity you asked for (${c.unit}).`);
          } else {
            score += 20;
            reasons.push(`Closest available size in the unit you asked for (${c.unit}).`);
          }
        }
      }

      reasons.push(`In stock right now.`);
      score += 1; // tiny base score so every in-stock candidate is comparable

      return { candidate: c, score, reasons };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.candidate.price - b.candidate.price; // tiebreaker only, never primary signal
    });
}

/**
 * Public entry point. Returns null when nothing in the catalog is even
 * a plausible match — caller (page.tsx, Stage 9) routes that to ERROR,
 * same catalog-miss message as before (plan §7, point 4).
 */
export function decide(intent: Intent): Decision | null {
  const candidates = collectCandidates(intent);
  const scored = scoreCandidates(intent, candidates);

  if (scored.length === 0) return null;

  const [top, ...rest] = scored;
  const reasoning = [...top.reasons];
  if (rest.length > 0) {
    reasoning.push(
      `Picked over ${rest.length} other in-stock option${rest.length > 1 ? "s" : ""} as the best match.`
    );
  } else {
    reasoning.push(`Only matching in-stock option found.`);
  }

  return {
    selected: top.candidate,
    reasoning,
    alternatives: rest.slice(0, 3).map((s) => s.candidate),
  };
}

/**
 * Builds a Decision for a variant the user explicitly picked via
 * CLARIFY_BRAND/CLARIFY_VARIANT taps (page.tsx handleVariantSelect).
 * Unlike decide(), this never overrides the user's manual choice — it
 * packages that choice into the same auditable Decision/reasoning shape.
 * Sibling variants (other sizes of the same brand) become `alternatives`.
 *
 * Returns null only if the chosen variant is unknown or out of stock —
 * an out-of-stock item can never be selected (mirrors decide(), decision #3).
 */
export function decideForVariant(intent: Intent, variantId: string): Decision | null {
  const variant = VARIANTS.find((v) => v.id === variantId);
  const product = getProductForVariant(variantId);
  if (!variant || !product || !product.inStock) return null;

  const brand = BRANDS.find((b) => b.id === variant.brandId);
  if (!brand) return null;

  const selected: DecisionCandidate = {
    productId: product.id,
    variantId: variant.id,
    brandId: brand.id,
    brandName: brand.name,
    name: variant.name,
    image: brand.emoji,
    price: product.price,
    currency: product.currency,
    unit: product.unit,
    inStock: product.inStock,
  };

  const reasoning: string[] = [`You chose ${brand.name}.`];
  const wantedUnitType = intent.unit ? normalizeUnitType(intent.unit) : null;
  if (wantedUnitType) {
    const parsed = parseProductUnit(product.unit);
    if (parsed && parsed.type === wantedUnitType) {
      reasoning.push(`Matches the size you asked for (${product.unit}).`);
    } else {
      reasoning.push(`Selected size: ${product.unit}.`);
    }
  } else {
    reasoning.push(`Selected size: ${product.unit}.`);
  }
  reasoning.push("In stock and ready to order.");

  const alternatives: DecisionCandidate[] = getVariantsForBrand(brand.id)
    .filter((v) => v.id !== variantId && v.product?.inStock)
    .map((v) => ({
      productId: v.product!.id,
      variantId: v.id,
      brandId: brand.id,
      brandName: brand.name,
      name: v.name,
      image: brand.emoji,
      price: v.product!.price,
      currency: v.product!.currency,
      unit: v.product!.unit,
      inStock: v.product!.inStock,
    }))
    .slice(0, 3);

  return { selected, reasoning, alternatives };
}