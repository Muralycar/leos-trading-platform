"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import {
  getCurrentDraftForProduct,
  reviseDraft,
  updateDraftStatus,
  updateOutputSection,
  updateReviewData,
  type ListingDraft,
} from "@/lib/admin/listing-generator";
import { generateAllOutputs, generateWebsiteContent, generateEbayContent, generateAlibabaContent, generateSeoContent, generateLinkedInContent } from "@/lib/listing-generator/templates";
import type { GeneratedOutputs, OutputSection, ReviewData } from "@/lib/listing-generator/types";
import type { ListingDraftStatus } from "@/lib/supabase/types";

const SECTION_GENERATORS: Record<OutputSection, (r: ReviewData) => GeneratedOutputs[OutputSection]> = {
  website: generateWebsiteContent,
  ebay: generateEbayContent,
  alibaba: generateAlibabaContent,
  seo: generateSeoContent,
  linkedin: generateLinkedInContent,
};

/**
 * "Generate Drafts" — creates the first draft, or a fresh full version of
 * an existing one, via the revise_listing_draft() RPC. This is the only
 * action that bumps `version`; single-section regenerates below update the
 * current version in place instead, so trivial re-runs don't pile up
 * history noise.
 */
export async function generateDraftAction(productId: string, reviewData: ReviewData): Promise<ListingDraft> {
  const profile = await requireRole("editor", "admin");
  const outputs = generateAllOutputs(reviewData);
  const draft = await reviseDraft(productId, reviewData, outputs, profile.id);
  revalidatePath("/admin/listing-generator");
  return draft;
}

/**
 * Regenerates exactly one output section from the reviewer's current
 * (possibly unsaved) review data. Persists that review data to the current
 * draft first — so the regenerated section reflects any edits — then
 * replaces only that one key in generated_outputs. Every other section,
 * and the draft's version number, are untouched.
 */
export async function regenerateSectionAction(
  draftId: string,
  productId: string,
  reviewData: ReviewData,
  section: OutputSection,
): Promise<GeneratedOutputs[OutputSection]> {
  await requireRole("editor", "admin");
  await updateReviewData(draftId, reviewData);

  const current = await getCurrentDraftForProduct(productId);
  const currentOutputs = current?.generatedOutputs ?? {};
  const content = SECTION_GENERATORS[section](reviewData);
  await updateOutputSection(draftId, currentOutputs, section, content);

  revalidatePath("/admin/listing-generator");
  return content;
}

/** Saves review-form edits without regenerating any output section. */
export async function saveReviewDataAction(draftId: string, reviewData: ReviewData): Promise<void> {
  await requireRole("editor", "admin");
  await updateReviewData(draftId, reviewData);
  revalidatePath("/admin/listing-generator");
}

export async function updateStatusAction(draftId: string, status: ListingDraftStatus): Promise<void> {
  await requireRole("editor", "admin");
  await updateDraftStatus(draftId, status);
  revalidatePath("/admin/listing-generator");
}
