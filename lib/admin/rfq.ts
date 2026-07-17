import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, RfqStatus } from "@/lib/supabase/types";

type RfqRow = Database["public"]["Tables"]["rfq_enquiries"]["Row"];

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
  quantityRequired: string | null;
  message: string | null;
  attachmentUrl: string | null;
  internalNotes: string | null;
  source: string;
  status: RfqStatus;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: RfqRow): RfqEnquiry {
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
    internalNotes: row.internal_notes,
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
  rows: RfqEnquiry[];
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
  return data ? mapRow(data) : undefined;
});
