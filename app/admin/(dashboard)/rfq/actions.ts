"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { changeRfqStatus, addRfqNote, updateRfqNote, deleteRfqNote, getRfqEnquiryById } from "@/lib/admin/rfq";
import { getCurrentQuotationForRfq, createQuotationFromRfq } from "@/lib/admin/quotations";
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

/**
 * Creates the quotation (or reuses the existing current one) for an RFQ and
 * redirects straight into its editor — no intermediate "new quotation" form,
 * since every field auto-fills from the RFQ per Phase 2.1's requirements.
 */
export async function createQuotationAction(rfqId: string) {
  const profile = await requireRole("admin");

  const existing = await getCurrentQuotationForRfq(rfqId);
  if (existing) {
    redirect(`/admin/quotations/${existing.id}`);
  }

  const rfq = await getRfqEnquiryById(rfqId);
  if (!rfq) {
    throw new Error("RFQ not found");
  }

  const quotation = await createQuotationFromRfq(rfq, profile.id, profile.email || null);

  revalidatePath(`/admin/rfq/${rfqId}`);
  redirect(`/admin/quotations/${quotation.id}`);
}
