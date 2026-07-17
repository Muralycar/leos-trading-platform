"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { revalidatePublicProductPaths } from "@/lib/admin/revalidate";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductCondition, ProductStatus } from "@/lib/supabase/types";

const VALID_STATUSES: ProductStatus[] = ["draft", "published", "archived"];
const VALID_CONDITIONS: ProductCondition[] = ["genuine_oem", "aftermarket", "obsolete_dead_stock", "used_serviceable"];

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v ? v : null;
}

function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseSharedFields(formData: FormData) {
  const status = String(formData.get("status") ?? "draft");
  const condition = String(formData.get("condition") ?? "");
  const minOrderQtyRaw = num(formData, "min_order_qty");

  return {
    description: String(formData.get("description") ?? "").trim(),
    equipment_category_id: String(formData.get("equipment_category_id") ?? ""),
    equipment_make: str(formData, "equipment_make"),
    equipment_model: str(formData, "equipment_model"),
    application: str(formData, "application"),
    condition: VALID_CONDITIONS.includes(condition as ProductCondition) ? (condition as ProductCondition) : null,
    country_of_origin: str(formData, "country_of_origin"),
    weight: num(formData, "weight"),
    dimensions: str(formData, "dimensions"),
    price: num(formData, "price"),
    currency: str(formData, "currency"),
    min_order_qty: minOrderQtyRaw !== null ? Math.trunc(minOrderQtyRaw) : null,
    public_notes: str(formData, "public_notes"),
    internal_notes: str(formData, "internal_notes"),
    status: VALID_STATUSES.includes(status as ProductStatus) ? (status as ProductStatus) : ("draft" as ProductStatus),
  };
}

function isUniqueViolation(error: { code?: string }): boolean {
  return error.code === "23505";
}

export async function createProduct(formData: FormData) {
  await requireRole("editor", "admin");

  const brandId = String(formData.get("brand_id") ?? "");
  const oemPartNumber = String(formData.get("oem_part_number") ?? "").trim();
  const shared = parseSharedFields(formData);

  if (!brandId || !oemPartNumber || !shared.description || !shared.equipment_category_id) {
    redirect(`/admin/products/new?error=${encodeURIComponent("Brand, OEM part number, description, and category are required.")}`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ brand_id: brandId, oem_part_number: oemPartNumber, ...shared })
    .select("id")
    .single();

  if (error) {
    const message = isUniqueViolation(error)
      ? "A product with this brand and part number already exists."
      : "Something went wrong. Please try again.";
    redirect(`/admin/products/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/products");
  revalidatePublicProductPaths();
  redirect(`/admin/products/${data.id}/edit`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requireRole("editor", "admin");

  const oemPartNumber = String(formData.get("oem_part_number") ?? "").trim();
  const shared = parseSharedFields(formData);

  if (!oemPartNumber || !shared.description || !shared.equipment_category_id) {
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent("OEM part number, description, and category are required.")}`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("products").update({ oem_part_number: oemPartNumber, ...shared }).eq("id", id);

  if (error) {
    const message = isUniqueViolation(error)
      ? "A product with this brand and part number already exists."
      : "Something went wrong. Please try again.";
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePublicProductPaths();
  redirect(`/admin/products/${id}/edit?saved=1`);
}

export async function updateProductCategories(id: string, formData: FormData) {
  await requireRole("editor", "admin");

  const categoryIds = formData.getAll("category_ids").map(String);

  const supabase = await createServerSupabaseClient();
  const { error: deleteError } = await supabase.from("product_category_map").delete().eq("product_id", id);
  if (deleteError) throw deleteError;

  if (categoryIds.length > 0) {
    const { error: insertError } = await supabase
      .from("product_category_map")
      .insert(categoryIds.map((categoryId) => ({ product_id: id, product_category_id: categoryId })));
    if (insertError) throw insertError;
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePublicProductPaths();
  redirect(`/admin/products/${id}/edit?saved=1`);
}

function selectedIds(formData: FormData): string[] {
  return formData.getAll("ids").map(String);
}

export async function bulkPublish(formData: FormData) {
  await requireRole("editor", "admin");
  const ids = selectedIds(formData);
  if (ids.length === 0) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("products").update({ status: "published" }).in("id", ids);
  if (error) throw error;

  revalidatePath("/admin/products");
  revalidatePublicProductPaths();
}

/** Sets status back to draft — the natural published<->draft toggle, distinct from the terminal "archived" state. */
export async function bulkUnpublish(formData: FormData) {
  await requireRole("editor", "admin");
  const ids = selectedIds(formData);
  if (ids.length === 0) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("products").update({ status: "draft" }).in("id", ids);
  if (error) throw error;

  revalidatePath("/admin/products");
  revalidatePublicProductPaths();
}

export async function bulkArchive(formData: FormData) {
  await requireRole("editor", "admin");
  const ids = selectedIds(formData);
  if (ids.length === 0) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("products").update({ status: "archived" }).in("id", ids);
  if (error) throw error;

  revalidatePath("/admin/products");
  revalidatePublicProductPaths();
}

/** Admin-only, per the confirmed permission split — re-checked here regardless of whether the UI shows this button. */
export async function bulkDelete(formData: FormData) {
  await requireRole("admin");
  const ids = selectedIds(formData);
  if (ids.length === 0) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) throw error;

  revalidatePath("/admin/products");
  revalidatePublicProductPaths();
}
