import { createServerSupabaseClient } from "@/lib/supabase/server";
import { selectAllPaginated } from "@/lib/supabase/paginate";
import { normalizePartNumber } from "@/lib/part-number";
import { rankTier } from "@/lib/search";
import type { AvailabilityStatus, Database, ProductCondition, ProductStatus } from "@/lib/supabase/types";

type ProductAdminRow = Database["public"]["Views"]["product_admin_view"]["Row"];

export interface AdminProduct {
  id: string;
  brandId: string;
  brandSlug: string;
  brandName: string;
  equipmentCategoryId: string;
  equipmentCategorySlug: string;
  equipmentCategoryName: string;
  oemPartNumber: string;
  oemPartNumberNormalized: string;
  description: string;
  equipmentMake: string | null;
  equipmentModel: string | null;
  application: string | null;
  condition: ProductCondition | null;
  countryOfOrigin: string | null;
  weight: number | null;
  dimensions: string | null;
  price: number | null;
  currency: string | null;
  minOrderQty: number | null;
  publicNotes: string | null;
  internalNotes: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  quantity: number;
  availabilityStatus: AvailabilityStatus;
}

function mapRow(row: ProductAdminRow): AdminProduct {
  return {
    id: row.id,
    brandId: row.brand_id,
    brandSlug: row.brand_slug,
    brandName: row.brand_name,
    equipmentCategoryId: row.equipment_category_id,
    equipmentCategorySlug: row.equipment_category_slug,
    equipmentCategoryName: row.equipment_category_name,
    oemPartNumber: row.oem_part_number,
    oemPartNumberNormalized: row.oem_part_number_normalized,
    description: row.description,
    equipmentMake: row.equipment_make,
    equipmentModel: row.equipment_model,
    application: row.application,
    condition: row.condition,
    countryOfOrigin: row.country_of_origin,
    weight: row.weight,
    dimensions: row.dimensions,
    price: row.price,
    currency: row.currency,
    minOrderQty: row.min_order_qty,
    publicNotes: row.public_notes,
    internalNotes: row.internal_notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    quantity: row.quantity,
    availabilityStatus: row.availability_status,
  };
}

const PAGE_SIZE = 50;

export interface ProductListParams {
  page?: number;
  status?: ProductStatus;
  brandSlug?: string;
  equipmentCategorySlug?: string;
  query?: string;
}

export interface ProductListResult {
  rows: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Status/brand/category filters run at the DB level (cheap, indexed).
 * Free-text search runs in memory over the filtered candidate set, reusing
 * lib/search.ts's rankTier — the exact same exact/partial-OEM/description/
 * brand ranking the public search uses, so "search by OEM part number
 * (exact and partial), description, and brand" behaves identically here.
 * The whole catalog is ~2,200 rows even unfiltered, so fetching the
 * candidate set into memory (paginated to bypass PostgREST's 1000-row cap)
 * before ranking is cheap — the same approach app/api/search/route.ts
 * already uses successfully.
 */
export async function listProducts(params: ProductListParams): Promise<ProductListResult> {
  const supabase = await createServerSupabaseClient();

  function baseQuery() {
    let q = supabase.from("product_admin_view").select("*").order("id", { ascending: true });
    if (params.status) q = q.eq("status", params.status);
    if (params.brandSlug) q = q.eq("brand_slug", params.brandSlug);
    if (params.equipmentCategorySlug) q = q.eq("equipment_category_slug", params.equipmentCategorySlug);
    return q;
  }

  const candidates = await selectAllPaginated<ProductAdminRow>((from, to) => baseQuery().range(from, to));
  let products = candidates.map(mapRow);

  const q = params.query?.trim();
  if (q) {
    const rawQueryLower = q.toLowerCase();
    const normalizedQuery = normalizePartNumber(q);
    products = products
      .map((product) => ({
        product,
        tier: rankTier(product.oemPartNumberNormalized, product.description, product.brandName, rawQueryLower, normalizedQuery),
      }))
      .filter((r): r is { product: AdminProduct; tier: number } => r.tier !== null)
      .sort((a, b) => a.tier - b.tier || a.product.oemPartNumber.localeCompare(b.product.oemPartNumber))
      .map((r) => r.product);
  } else {
    products = [...products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  const page = Math.max(1, params.page ?? 1);
  const total = products.length;
  const from = (page - 1) * PAGE_SIZE;
  const rows = products.slice(from, from + PAGE_SIZE);

  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function getProductById(id: string): Promise<AdminProduct | undefined> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("product_admin_view").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export interface ProductCategoryOption {
  id: string;
  slug: string;
  name: string;
}

/** All 12 product categories (lib/data/categorize.ts's PRODUCT_CATEGORIES), for the edit page's checkbox list. */
export async function getAllProductCategories(): Promise<ProductCategoryOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("product_categories").select("id, slug, name").order("name");
  if (error) throw error;
  return data;
}

/** Currently-mapped category ids for one product. */
export async function getProductCategoryIds(productId: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("product_category_map").select("product_category_id").eq("product_id", productId);
  if (error) throw error;
  return data.map((r) => r.product_category_id);
}
