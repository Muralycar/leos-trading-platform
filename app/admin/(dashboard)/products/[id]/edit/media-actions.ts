"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BUCKET = "product-media";

export async function uploadProductMedia(productId: string, formData: FormData) {
  await requireRole("editor", "admin");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return;
  }

  const supabase = await createServerSupabaseClient();

  const ext = file.name.split(".").pop() || "jpg";
  const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { count } = await supabase
    .from("product_media")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);
  const isFirstImage = (count ?? 0) === 0;

  const { error: insertError } = await supabase.from("product_media").insert({
    product_id: productId,
    storage_path: path,
    is_primary: isFirstImage,
    sort_order: count ?? 0,
  });
  if (insertError) throw insertError;

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
}

export async function setPrimaryMedia(mediaId: string, productId: string) {
  await requireRole("editor", "admin");

  const supabase = await createServerSupabaseClient();
  const { error: clearError } = await supabase.from("product_media").update({ is_primary: false }).eq("product_id", productId);
  if (clearError) throw clearError;

  const { error: setError } = await supabase.from("product_media").update({ is_primary: true }).eq("id", mediaId);
  if (setError) throw setError;

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
}

export async function deleteProductMedia(mediaId: string, productId: string, storagePath: string) {
  await requireRole("editor", "admin");

  const supabase = await createServerSupabaseClient();
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (storageError) throw storageError;

  const { error: dbError } = await supabase.from("product_media").delete().eq("id", mediaId);
  if (dbError) throw dbError;

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
}
