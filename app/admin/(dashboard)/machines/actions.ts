"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { revalidatePublicMachinePaths } from "@/lib/admin/revalidate";
import { MACHINE_BUCKET, slugify } from "@/lib/machinery";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MachineCondition, MachineStatus } from "@/lib/supabase/types";

const VALID_STATUSES: MachineStatus[] = ["available", "reserved", "sold", "sourcing"];
const VALID_CONDITIONS: MachineCondition[] = ["new", "used"];

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v ? v : null;
}

function int(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function money(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** "Label: value" per line -> { Label: "value" } */
function parseSpecs(raw: string | null): Record<string, string> {
  const specs: Record<string, string> = {};
  if (!raw) return specs;
  for (const line of raw.split("\n")) {
    const i = line.indexOf(":");
    if (i < 1) continue;
    const label = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (label && value) specs[label] = value;
  }
  return specs;
}

function parseFields(formData: FormData) {
  const status = String(formData.get("status") ?? "available");
  const condition = String(formData.get("condition") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  return {
    title,
    slug: slugify(slugInput || title),
    category: String(formData.get("category") ?? "other"),
    brand: String(formData.get("brand") ?? "").trim(),
    model: str(formData, "model"),
    condition: VALID_CONDITIONS.includes(condition as MachineCondition) ? (condition as MachineCondition) : null,
    year: int(formData, "year"),
    hours_or_km: int(formData, "hours_or_km"),
    capacity: str(formData, "capacity"),
    location: str(formData, "location"),
    price_aed: money(formData, "price_aed"),
    description: str(formData, "description"),
    specs: parseSpecs(str(formData, "specs")),
    status: VALID_STATUSES.includes(status as MachineStatus) ? (status as MachineStatus) : ("available" as MachineStatus),
    is_published: formData.get("is_published") === "on",
  };
}

function refresh(id?: string) {
  revalidatePath("/admin/machines");
  if (id) revalidatePath(`/admin/machines/${id}/edit`);
  revalidatePublicMachinePaths();
}

export async function createMachine(formData: FormData) {
  await requireRole("admin");
  const fields = parseFields(formData);

  if (!fields.title || !fields.brand || !fields.slug) {
    redirect(`/admin/machines/new?error=${encodeURIComponent("Title and brand are required.")}`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("machines").insert(fields).select("id").single();
  if (error) {
    const message =
      error.code === "23505" ? "A machine with this URL slug already exists — change the slug." : "Something went wrong. Please try again.";
    redirect(`/admin/machines/new?error=${encodeURIComponent(message)}`);
  }

  refresh();
  redirect(`/admin/machines/${data.id}/edit?saved=1`);
}

export async function updateMachine(id: string, formData: FormData) {
  await requireRole("admin");
  const fields = parseFields(formData);

  if (!fields.title || !fields.brand || !fields.slug) {
    redirect(`/admin/machines/${id}/edit?error=${encodeURIComponent("Title and brand are required.")}`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("machines").update(fields).eq("id", id);
  if (error) {
    const message =
      error.code === "23505" ? "A machine with this URL slug already exists — change the slug." : "Something went wrong. Please try again.";
    redirect(`/admin/machines/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  refresh(id);
  redirect(`/admin/machines/${id}/edit?saved=1`);
}

export async function deleteMachine(id: string) {
  await requireRole("admin");
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase.from("machines").select("images").eq("id", id).maybeSingle();
  if (data?.images?.length) {
    await supabase.storage.from(MACHINE_BUCKET).remove(data.images);
  }
  const { error } = await supabase.from("machines").delete().eq("id", id);
  if (error) throw error;

  refresh();
  redirect("/admin/machines");
}

/**
 * Photos are uploaded straight from the browser to Storage (see MachineImages.tsx)
 * — phone photos exceed Server Action / serverless body limits — and this just
 * records the resulting storage paths on the machine.
 */
export async function addMachineImages(id: string, paths: string[]) {
  await requireRole("admin");
  const clean = paths.filter((p) => typeof p === "string" && p.startsWith(`machines/${id}/`));
  if (clean.length === 0) return;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("machines").select("images").eq("id", id).single();
  if (error) throw error;

  const { error: updateError } = await supabase
    .from("machines")
    .update({ images: [...(data.images ?? []), ...clean] })
    .eq("id", id);
  if (updateError) throw updateError;

  refresh(id);
}

export async function removeMachineImage(id: string, path: string) {
  await requireRole("admin");
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.from("machines").select("images").eq("id", id).single();
  if (error) throw error;

  await supabase.storage.from(MACHINE_BUCKET).remove([path]);
  const { error: updateError } = await supabase
    .from("machines")
    .update({ images: (data.images ?? []).filter((p) => p !== path) })
    .eq("id", id);
  if (updateError) throw updateError;

  refresh(id);
}

/** The first image is the main one — move the chosen photo to the front. */
export async function makeMainMachineImage(id: string, path: string) {
  await requireRole("admin");
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.from("machines").select("images").eq("id", id).single();
  if (error) throw error;
  const images = data.images ?? [];
  if (!images.includes(path)) return;

  const { error: updateError } = await supabase
    .from("machines")
    .update({ images: [path, ...images.filter((p) => p !== path)] })
    .eq("id", id);
  if (updateError) throw updateError;

  refresh(id);
}
