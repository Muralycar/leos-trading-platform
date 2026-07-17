// Mirrors the shape of Handoff/design_handoff_leos_trading/data-model.md.
// Phase 3 sources these from Supabase — see lib/data/inventory.ts — via the
// product_public_view Postgres view, which is why Product below carries
// brand/category display names and availability inline: the view already
// joins and computes them, so callers never need a separate lookup.

export type AvailabilityStatus =
  | "in_stock"
  | "limited_stock"
  | "on_request"
  | "out_of_stock";

export type EquipmentCategoryStatus = "live" | "sourcing";

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  slug: string;
  status: EquipmentCategoryStatus;
  /** Display label for which brand(s) serve this category, e.g. "Iveco" or "Multi-brand sourcing network". */
  brandsLabel: string;
  /** Count of published SKUs in this category. 0 for sourcing-only categories. */
  skuCount: number;
  /** Path under /public, or null to render the placeholder treatment. */
  imagePath: string | null;
}

export interface Product {
  /** Database uuid (products.id). */
  id: string;
  brandSlug: string;
  brandName: string;
  equipmentCategorySlug: string;
  equipmentCategoryName: string;
  /** Null only if a product somehow has no product_category_map row. */
  productCategorySlug: string | null;
  productCategoryName: string | null;
  /** Original formatting, e.g. "KHED0037301210-S". */
  oemPartNumber: string;
  /** Uppercased, punctuation-stripped — search/dedupe key. */
  oemPartNumberNormalized: string;
  description: string;
  imagePath: string | null;
  /** Sum of is_current inventory_batches — never stored on the products table itself. */
  quantity: number;
  status: AvailabilityStatus;
}

/**
 * A stock lot for a product (inventory_batches table) — deliberately
 * separate from Product; a product can have more than one batch (see the
 * 53 real multi-line Iveco SKUs). Admin-only; never fetched by public
 * pages, which read Product.quantity/status (sourced from
 * product_public_view, which already sums is_current batches) instead.
 */
export interface InventoryBatch {
  id: string;
  productId: string;
  quantity: number;
  sourceLine: number | null;
  importJobId: string | null;
  isCurrent: boolean;
}

export interface SiteSettings {
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  email: string;
  address: string;
}

export function getAvailabilityStatus(quantity: number): AvailabilityStatus {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= 2) return "limited_stock";
  return "in_stock";
}

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
  in_stock: "In Stock",
  limited_stock: "Limited Stock",
  on_request: "Availability On Request",
  out_of_stock: "Out of Stock",
};
