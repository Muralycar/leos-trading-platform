import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, RfqStatus } from "@/lib/supabase/types";
import { getProductById, type AdminProduct } from "@/lib/admin/products";

type RfqRow = Database["public"]["Tables"]["rfq_enquiries"]["Row"];
type StatusHistoryRow = Database["public"]["Tables"]["rfq_status_history"]["Row"];
type NoteRow = Database["public"]["Tables"]["rfq_internal_notes"]["Row"];

export interface RfqEnquiry {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  brand: string | null;
  partNumber: string | null;
  productId: string | null;
  linkedProduct: AdminProduct | null;
  quantityRequired: string | null;
  message: string | null;
  attachmentUrl: string | null;
  source: string;
  status: RfqStatus;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: RfqRow): Omit<RfqEnquiry, "linkedProduct"> {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    country: row.country,
    brand: row.brand,
    partNumber: row.part_number,
    productId: row.product_id,
    quantityRequired: row.quantity_required,
    message: row.message,
    attachmentUrl: row.attachment_url,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PAGE_SIZE = 25;

export interface RfqListParams {
  page?: number;
  status?: RfqStatus;
  query?: string;
}

export interface RfqListResult {
  rows: Array<Omit<RfqEnquiry, "linkedProduct">>;
  total: number;
  page: number;
  pageSize: number;
}

// Not cache()'d — pagination/filter args change per interaction, so there's
// nothing to usefully memoize within a single request.
export async function listRfqEnquiries(params: RfqListParams): Promise<RfqListResult> {
  const supabase = await createServerSupabaseClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("rfq_enquiries").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const q = params.query?.trim();
  if (q) {
    // Strip characters meaningful to PostgREST's .or() mini-language so a
    // search term can never accidentally break the filter syntax.
    const safe = q.replace(/[,()]/g, "");
    query = query.or(
      `company.ilike.%${safe}%,name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%,part_number.ilike.%${safe}%`,
    );
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { rows: (data ?? []).map(mapRow), total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export const getRfqEnquiryById = cache(async (id: string): Promise<RfqEnquiry | undefined> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("rfq_enquiries").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return undefined;

  const mapped = mapRow(data);
  const linkedProduct = mapped.productId ? ((await getProductById(mapped.productId)) ?? null) : null;
  return { ...mapped, linkedProduct };
});

export interface RfqStatusHistoryEntry {
  id: string;
  oldStatus: RfqStatus;
  newStatus: RfqStatus;
  changedByEmail: string | null;
  changedAt: string;
}

function mapStatusHistoryRow(row: StatusHistoryRow): RfqStatusHistoryEntry {
  return {
    id: row.id,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    changedByEmail: row.changed_by_email,
    changedAt: row.changed_at,
  };
}

export async function listRfqStatusHistory(rfqId: string): Promise<RfqStatusHistoryEntry[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("rfq_status_history")
    .select("*")
    .eq("rfq_id", rfqId)
    .order("changed_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStatusHistoryRow);
}

/** Atomically updates status and logs the transition, via migrations/0012's change_rfq_status(). */
export async function changeRfqStatus(
  rfqId: string,
  newStatus: RfqStatus,
  changedBy: string | null,
  changedByEmail: string | null,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("change_rfq_status", {
    p_rfq_id: rfqId,
    p_new_status: newStatus,
    p_changed_by: changedBy,
    p_changed_by_email: changedByEmail,
  });
  if (error) throw error;
}

export interface RfqNote {
  id: string;
  authorEmail: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

function mapNoteRow(row: NoteRow): RfqNote {
  return {
    id: row.id,
    authorEmail: row.author_email,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listRfqNotes(rfqId: string): Promise<RfqNote[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("rfq_internal_notes")
    .select("*")
    .eq("rfq_id", rfqId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapNoteRow);
}

export async function addRfqNote(
  rfqId: string,
  authorId: string | null,
  authorEmail: string | null,
  body: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("rfq_internal_notes")
    .insert({ rfq_id: rfqId, author_id: authorId, author_email: authorEmail, body });
  if (error) throw error;
}

export async function updateRfqNote(noteId: string, body: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("rfq_internal_notes").update({ body }).eq("id", noteId);
  if (error) throw error;
}

export async function deleteRfqNote(noteId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("rfq_internal_notes").delete().eq("id", noteId);
  if (error) throw error;
}

export type RfqTimelineEvent =
  | { type: "received"; at: string }
  | { type: "status_change"; at: string; entry: RfqStatusHistoryEntry }
  | { type: "note_added"; at: string; note: RfqNote };

/** Merges the received event, status history, and notes into one chronological (oldest-first) timeline. */
export function buildRfqTimeline(
  createdAt: string,
  history: RfqStatusHistoryEntry[],
  notes: RfqNote[],
): RfqTimelineEvent[] {
  const events: RfqTimelineEvent[] = [
    { type: "received", at: createdAt },
    ...history.map((entry): RfqTimelineEvent => ({ type: "status_change", at: entry.changedAt, entry })),
    ...notes.map((note): RfqTimelineEvent => ({ type: "note_added", at: note.createdAt, note })),
  ];
  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}
