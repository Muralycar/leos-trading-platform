"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import { changeRfqStatus, addRfqNote, updateRfqNote, deleteRfqNote } from "@/lib/admin/rfq";
import type { RfqStatus } from "@/lib/supabase/types";

const VALID_STATUSES: RfqStatus[] = [
  "new",
  "reviewing",
  "waiting_supplier",
  "quotation_preparation",
  "quotation_ready",
  "sent",
  "accepted",
  "revision_requested",
  "lost",
  "closed",
];

export async function updateRfqStatusAction(id: string, formData: FormData) {
  const profile = await requireRole("admin");

  const status = String(formData.get("status") ?? "");
  if (!VALID_STATUSES.includes(status as RfqStatus)) return;

  await changeRfqStatus(id, status as RfqStatus, profile.id, profile.email || null);

  revalidatePath("/admin/rfq");
  revalidatePath(`/admin/rfq/${id}`);
}

export async function addRfqNoteAction(id: string, formData: FormData) {
  const profile = await requireRole("admin");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await addRfqNote(id, profile.id, profile.email || null, body);

  revalidatePath(`/admin/rfq/${id}`);
}

export async function updateRfqNoteAction(noteId: string, rfqId: string, formData: FormData) {
  await requireRole("admin");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await updateRfqNote(noteId, body);

  revalidatePath(`/admin/rfq/${rfqId}`);
}

export async function deleteRfqNoteAction(noteId: string, rfqId: string) {
  await requireRole("admin");

  await deleteRfqNote(noteId);

  revalidatePath(`/admin/rfq/${rfqId}`);
}
