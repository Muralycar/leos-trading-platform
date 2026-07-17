"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v ? v : null;
}

export async function createBatch(productId: string, formData: FormData) {
  await requireRole("editor", "admin");

  const quantity = Number(formData.get("quantity"));
  if (!Number.isFinite(quantity) || quantity < 0) {
    revalidatePath(`/admin/products/${productId}/edit`);
    return;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("inventory_batches").insert({
    product_id: productId,
    quantity: Math.trunc(quantity),
    condition: str(formData, "condition"),
    bin_location: str(formData, "bin_location"),
    arrival_date: str(formData, "arrival_date"),
    is_current: true,
    // import_job_id intentionally omitted -> null -> a manual entry, the
    // only kind editable/deactivatable through this admin UI.
  });
  if (error) throw error;

  revalidatePath(`/admin/products/${productId}/edit`);
}

/**
 * Only ever touches a batch that is already manual (import_job_id null) —
 * re-checked here, not just hidden in the UI, since editing an
 * import-created batch's values would undermine "this batch reflects
 * exactly what that import's spreadsheet row said," which the rollback
 * and audit trail both depend on.
 */
export async function updateBatch(batchId: string, productId: string, formData: FormData) {
  await requireRole("editor", "admin");

  const quantity = Number(formData.get("quantity"));
  if (!Number.isFinite(quantity) || quantity < 0) {
    revalidatePath(`/admin/products/${productId}/edit`);
    return;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("inventory_batches")
    .update({
      quantity: Math.trunc(quantity),
      condition: str(formData, "condition"),
      bin_location: str(formData, "bin_location"),
      arrival_date: str(formData, "arrival_date"),
    })
    .eq("id", batchId)
    .is("import_job_id", null);
  if (error) throw error;

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function setBatchCurrent(batchId: string, productId: string, isCurrent: boolean) {
  await requireRole("editor", "admin");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("inventory_batches")
    .update({ is_current: isCurrent })
    .eq("id", batchId)
    .is("import_job_id", null);
  if (error) throw error;

  revalidatePath(`/admin/products/${productId}/edit`);
}
