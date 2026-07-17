"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RfqStatus } from "@/lib/supabase/types";

const VALID_STATUSES: RfqStatus[] = ["new", "in_progress", "quoted", "closed"];

export async function updateRfqStatus(id: string, formData: FormData) {
  await requireRole("admin");

  const status = String(formData.get("status") ?? "");
  if (!VALID_STATUSES.includes(status as RfqStatus)) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("rfq_enquiries").update({ status: status as RfqStatus }).eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/rfq");
  revalidatePath(`/admin/rfq/${id}`);
}

export async function updateRfqNotes(id: string, formData: FormData) {
  await requireRole("admin");

  const notes = String(formData.get("notes") ?? "").trim();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("rfq_enquiries").update({ internal_notes: notes || null }).eq("id", id);
  if (error) throw error;

  revalidatePath(`/admin/rfq/${id}`);
}
