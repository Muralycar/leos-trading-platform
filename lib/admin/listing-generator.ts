// Data access for listing_drafts only. Every function here reads from
// products/inventory_batches/product_media at most — none of them ever
// write to those tables. All mutations in this module target
// listing_drafts exclusively, so a generated draft can never silently
// overwrite confirmed product data.
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, ListingDraftStatus } from "@/lib/supabase/types";
import type { GeneratedOutputs, OutputSection, ReviewData } from "@/lib/listing-generator/types";

type ListingDraftRow = Database["public"]["Tables"]["listing_drafts"]["Row"];

export interface ListingDraft {
  id: string;
  productId: string;
  version: number;
  isCurrent: boolean;
  status: ListingDraftStatus;
  reviewData: ReviewData;
  generatedOutputs: GeneratedOutputs;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
}

function mapRow(row: ListingDraftRow): ListingDraft {
  return {
    id: row.id,
    productId: row.product_id,
    version: row.version,
    isCurrent: row.is_current,
    status: row.status,
    reviewData: row.review_data as unknown as ReviewData,
    generatedOutputs: row.generated_outputs as unknown as GeneratedOutputs,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
    approvedAt: row.approved_at,
    publishedAt: row.published_at,
  };
}

export async function getCurrentDraftForProduct(productId: string): Promise<ListingDraft | undefined> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("listing_drafts")
    .select("*")
    .eq("product_id", productId)
    .eq("is_current", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

/** All versions for a product, newest first — for a "history" view if ever needed. */
export async function listDraftVersions(productId: string): Promise<ListingDraft[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("listing_drafts")
    .select("*")
    .eq("product_id", productId)
    .order("version", { ascending: false });
  if (error) throw error;
  return data.map(mapRow);
}

/**
 * Creates the very first draft, or a new version of an existing one, via
 * the revise_listing_draft() RPC (migrations/0011) — atomically retires the
 * previous is_current row and inserts the new one, so the partial unique
 * index (one current draft per product) is never transiently violated.
 */
export async function reviseDraft(
  productId: string,
  reviewData: ReviewData,
  generatedOutputs: GeneratedOutputs,
  createdBy: string | null,
): Promise<ListingDraft> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("revise_listing_draft", {
    p_product_id: productId,
    p_review_data: reviewData as unknown as Record<string, unknown>,
    p_generated_outputs: generatedOutputs as unknown as Record<string, unknown>,
    p_created_by: createdBy,
  });
  if (error) throw error;
  return mapRow(data as ListingDraftRow);
}

/**
 * Merges edited fields into the CURRENT draft's review_data in place (does
 * not create a new version — that's reserved for regenerate/resync).
 * Reviewer edits here never touch generated_outputs or the live product.
 */
export async function updateReviewData(draftId: string, reviewData: ReviewData): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("listing_drafts")
    .update({ review_data: reviewData as unknown as Record<string, unknown> })
    .eq("id", draftId);
  if (error) throw error;
}

/**
 * Replaces just one section of generated_outputs (e.g. "regenerate eBay
 * only") in place on the current draft — every other section, and
 * review_data, are untouched.
 */
export async function updateOutputSection(
  draftId: string,
  currentOutputs: GeneratedOutputs,
  section: OutputSection,
  content: GeneratedOutputs[OutputSection],
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const nextOutputs: GeneratedOutputs = { ...currentOutputs, [section]: content };
  const { error } = await supabase
    .from("listing_drafts")
    .update({ generated_outputs: nextOutputs as unknown as Record<string, unknown> })
    .eq("id", draftId);
  if (error) throw error;
}

export async function updateDraftStatus(draftId: string, status: ListingDraftStatus): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const update: Database["public"]["Tables"]["listing_drafts"]["Update"] =
    status === "reviewed"
      ? { status, reviewed_at: now }
      : status === "approved"
        ? { status, approved_at: now }
        : status === "published"
          ? { status, published_at: now }
          : { status };
  const { error } = await supabase.from("listing_drafts").update(update).eq("id", draftId);
  if (error) throw error;
}
