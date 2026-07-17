// Runtime dataset — full, real product/inventory data derived from the
// three client spreadsheets (see scripts/generate-inventory-data.mts and
// lib/data/inventory.generated.json). This is the single module Phase 3
// replaces with live Supabase queries; every other module reads inventory
// data only through the exports below, never the generated JSON directly.

import generated from "./inventory.generated.json";
import type { AvailabilityStatus, Brand, InventoryBatch, Product } from "@/lib/types";
import { getAvailabilityStatus } from "@/lib/types";
import { normalizePartNumber } from "@/lib/part-number";

export const PRODUCTS: Product[] = generated.products;
export const INVENTORY_BATCHES: InventoryBatch[] = generated.batches;

const BRAND_NAMES: Record<string, string> = {
  kohler: "Kohler",
  iveco: "Iveco",
  kobelco: "Kobelco",
};

// Derived from the products that actually exist — never a hardcoded brand
// list — so a 4th brand's spreadsheet only requires adding it to
// BRAND_NAMES and re-running the generation script.
export const BRANDS: Brand[] = Array.from(new Set(PRODUCTS.map((p) => p.brandSlug)))
  .sort()
  .map((slug) => ({ id: slug, slug, name: BRAND_NAMES[slug] ?? slug }));

const batchesByProduct = new Map<string, InventoryBatch[]>();
for (const batch of INVENTORY_BATCHES) {
  if (!batchesByProduct.has(batch.productId)) batchesByProduct.set(batch.productId, []);
  batchesByProduct.get(batch.productId)!.push(batch);
}

const productsById = new Map(PRODUCTS.map((p) => [p.id, p]));

/**
 * Mirrors the product_public_availability Postgres view from data-model.md:
 * quantity is always the sum of a product's batches, computed on demand —
 * never stored on Product itself.
 */
export function getAvailability(productId: string): { quantity: number; status: AvailabilityStatus } {
  const batches = batchesByProduct.get(productId) ?? [];
  const quantity = batches.reduce((sum, b) => sum + b.quantity, 0);
  return { quantity, status: getAvailabilityStatus(quantity) };
}

export function getProductById(id: string): Product | undefined {
  return productsById.get(id);
}

export function getProductByBrandAndSku(brandSlug: string, skuParam: string): Product | undefined {
  const normalized = normalizePartNumber(skuParam);
  return PRODUCTS.find((p) => p.brandSlug === brandSlug && p.oemPartNumberNormalized === normalized);
}

export function getProductsByBrand(brandSlug: string): Product[] {
  return PRODUCTS.filter((p) => p.brandSlug === brandSlug);
}

export function getProductsByEquipmentCategory(equipmentCategorySlug: string): Product[] {
  return PRODUCTS.filter((p) => p.equipmentCategorySlug === equipmentCategorySlug);
}

/** Same equipment category, excluding the product itself, highest-stock first. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter((p) => p.equipmentCategorySlug === product.equipmentCategorySlug && p.id !== product.id)
    .sort((a, b) => getAvailability(b.id).quantity - getAvailability(a.id).quantity)
    .slice(0, limit);
}

/**
 * No created_at exists in the real spreadsheets, so "Recently Added" on the
 * homepage is approximated by highest current stock depth — a real,
 * defensible signal rather than an invented recency field.
 */
export function getFeaturedProducts(limit = 4): Product[] {
  return [...PRODUCTS].sort((a, b) => getAvailability(b.id).quantity - getAvailability(a.id).quantity).slice(0, limit);
}

export function getBrandSkuCount(brandSlug: string): number {
  return PRODUCTS.filter((p) => p.brandSlug === brandSlug).length;
}

export function getCategorySkuCount(equipmentCategorySlug: string): number {
  return PRODUCTS.filter((p) => p.equipmentCategorySlug === equipmentCategorySlug).length;
}

export function getTotalSkuCount(): number {
  return PRODUCTS.length;
}

export function getTotalUnitCount(): number {
  return INVENTORY_BATCHES.reduce((sum, b) => sum + b.quantity, 0);
}

export function getLiveBrandCount(): number {
  return BRANDS.length;
}
