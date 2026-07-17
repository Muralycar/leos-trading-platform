import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicMediaUrl } from "@/lib/supabase/storage";
import type { Database } from "@/lib/supabase/types";

type MediaRow = Database["public"]["Tables"]["product_media"]["Row"];

export interface AdminMedia {
  id: string;
  productId: string;
  storagePath: string;
  publicUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

function mapRow(row: MediaRow): AdminMedia {
  return {
    id: row.id,
    productId: row.product_id,
    storagePath: row.storage_path,
    publicUrl: getPublicMediaUrl("product-media", row.storage_path),
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
  };
}

export async function listMediaForProduct(productId: string): Promise<AdminMedia[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("product_media")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data.map(mapRow);
}
