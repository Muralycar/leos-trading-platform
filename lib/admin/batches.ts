import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type BatchRow = Database["public"]["Tables"]["inventory_batches"]["Row"];

export interface AdminBatch {
  id: string;
  productId: string;
  quantity: number;
  condition: string | null;
  warehouseLocationId: string | null;
  binLocation: string | null;
  arrivalDate: string | null;
  supplierReference: string | null;
  purchaseReference: string | null;
  internalCost: number | null;
  sourceLine: number | null;
  importJobId: string | null;
  isCurrent: boolean;
  createdAt: string;
  /** Manual entries (importJobId === null) are the only ones editable in the admin UI — see updateBatch/deactivateBatch. */
  isManual: boolean;
}

function mapRow(row: BatchRow): AdminBatch {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    condition: row.condition,
    warehouseLocationId: row.warehouse_location_id,
    binLocation: row.bin_location,
    arrivalDate: row.arrival_date,
    supplierReference: row.supplier_reference,
    purchaseReference: row.purchase_reference,
    internalCost: row.internal_cost,
    sourceLine: row.source_line,
    importJobId: row.import_job_id,
    isCurrent: row.is_current,
    createdAt: row.created_at,
    isManual: row.import_job_id === null,
  };
}

/** All batches for a product, current and superseded — full history, for audit transparency. */
export async function listBatchesForProduct(productId: string): Promise<AdminBatch[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("inventory_batches")
    .select("*")
    .eq("product_id", productId)
    .order("is_current", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapRow);
}
