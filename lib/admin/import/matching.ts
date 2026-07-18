import { createServerSupabaseClient } from "@/lib/supabase/server";
import { selectAllPaginated } from "@/lib/supabase/paginate";
import type { Database } from "@/lib/supabase/types";

type ProductAdminRow = Database["public"]["Views"]["product_admin_view"]["Row"];

export interface MatchedProduct {
  id: string;
  oemPartNumber: string;
  description: string;
  quantity: number;
  equipmentMake: string | null;
  equipmentModel: string | null;
  application: string | null;
  countryOfOrigin: string | null;
  weight: number | null;
  dimensions: string | null;
  price: number | null;
  currency: string | null;
  minOrderQty: number | null;
  publicNotes: string | null;
  internalNotes: string | null;
}

function mapRow(row: ProductAdminRow): MatchedProduct {
  return {
    id: row.id,
    oemPartNumber: row.oem_part_number,
    description: row.description,
    quantity: row.quantity,
    equipmentMake: row.equipment_make,
    equipmentModel: row.equipment_model,
    application: row.application,
    countryOfOrigin: row.country_of_origin,
    weight: row.weight,
    dimensions: row.dimensions,
    price: row.price,
    currency: row.currency,
    minOrderQty: row.min_order_qty,
    publicNotes: row.public_notes,
    internalNotes: row.internal_notes,
  };
}

type SupabaseClientLike = Awaited<ReturnType<typeof createServerSupabaseClient>>;

/**
 * Every existing product for this brand, keyed by normalized OEM part
 * number — fetched once per preview/confirm run rather than one query per
 * row, since a brand can have 1000+ products (Iveco alone has 1,561).
 * Accepts an optional injected client for the same reason as
 * listMatchableRows in lib/admin/import/rows.ts.
 */
export async function getBrandProductsByNormalizedKey(brandId: string, client?: SupabaseClientLike): Promise<Map<string, MatchedProduct>> {
  const supabase = client ?? (await createServerSupabaseClient());
  const rows = await selectAllPaginated<ProductAdminRow>((from, to) =>
    supabase.from("product_admin_view").select("*").eq("brand_id", brandId).order("id").range(from, to),
  );
  const map = new Map<string, MatchedProduct>();
  for (const row of rows) map.set(row.oem_part_number_normalized, mapRow(row));
  return map;
}
