// Part-number/description search, implementing the ranking + normalization
// rules in Handoff/design_handoff_leos_trading/search-spec.md. Pure functions
// over a Product[] the caller already fetched — app/api/search/route.ts is
// the only caller now (search moved server-side in Phase 3); these functions
// don't know or care where the products came from.

import type { AvailabilityStatus, Product } from "@/lib/types";
import { normalizePartNumber } from "@/lib/part-number";

export type SortOption = "relevance" | "part-number" | "stock";

export interface SearchFilters {
  query: string;
  brandSlugs: string[]; // empty = all brands
  equipmentCategorySlugs: string[]; // empty = all categories
  availabilityStatuses: AvailabilityStatus[]; // empty = all statuses
  sort: SortOption;
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  brandSlugs: [],
  equipmentCategorySlugs: [],
  availabilityStatuses: [],
  sort: "relevance",
};

/**
 * Ranking tiers per search-spec.md:
 *   1. exact match on normalized OEM part number
 *   2. exact match on normalized alternative/superseded part number
 *      (reserved — none of the 3 real spreadsheets have alternative/
 *      superseded numbers, so this tier is structurally present but unused)
 *   3. partial match on normalized OEM part number
 *   4. match on description or brand
 * Returns null when the query matches none of the above.
 */
function matchTier(product: Product, brandName: string, rawQueryLower: string, normalizedQuery: string): number | null {
  if (!rawQueryLower) return 0;
  if (normalizedQuery && product.oemPartNumberNormalized === normalizedQuery) return 1;
  if (normalizedQuery && product.oemPartNumberNormalized.includes(normalizedQuery)) return 3;
  if (product.description.toLowerCase().includes(rawQueryLower) || brandName.toLowerCase().includes(rawQueryLower)) return 4;
  return null;
}

export function matchesSearchQuery(product: Product, brandName: string, query: string): boolean {
  const rawQueryLower = query.trim().toLowerCase();
  const normalizedQuery = normalizePartNumber(query);
  return matchTier(product, brandName, rawQueryLower, normalizedQuery) !== null;
}

export function searchProducts(filters: SearchFilters, brandNameBySlug: Record<string, string>, products: Product[]): Product[] {
  const rawQueryLower = filters.query.trim().toLowerCase();
  const normalizedQuery = normalizePartNumber(filters.query);

  const ranked: { product: Product; tier: number }[] = [];

  for (const product of products) {
    if (filters.brandSlugs.length && !filters.brandSlugs.includes(product.brandSlug)) continue;
    if (filters.equipmentCategorySlugs.length && !filters.equipmentCategorySlugs.includes(product.equipmentCategorySlug))
      continue;
    if (filters.availabilityStatuses.length && !filters.availabilityStatuses.includes(product.status)) continue;

    const brandName = brandNameBySlug[product.brandSlug] ?? product.brandSlug;
    const tier = matchTier(product, brandName, rawQueryLower, normalizedQuery);
    if (tier !== null) ranked.push({ product, tier });
  }

  ranked.sort((a, b) => {
    if (filters.sort === "part-number") return a.product.oemPartNumber.localeCompare(b.product.oemPartNumber);
    if (filters.sort === "stock") return b.product.quantity - a.product.quantity;
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.product.description.localeCompare(b.product.description);
  });

  return ranked.map((r) => r.product);
}
