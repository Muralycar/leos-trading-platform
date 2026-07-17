// Mirrors the shape of Handoff/design_handoff_leos_trading/data-model.md.
// Phase 1 uses local literals implementing these types (see placeholder-data.ts);
// Phase 3+ replaces the data source with live Supabase queries against
// matching tables/views, without changing these shapes.

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
  sku: string;
  name: string;
  brandSlug: string;
  brandName: string;
  categorySlug: string;
  categoryName: string;
  subCategory: string;
  quantity: number;
  imagePath: string | null;
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
