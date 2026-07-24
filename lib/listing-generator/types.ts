import type { ProductCondition } from "@/lib/supabase/types";

// Fields on ReviewData that come from real, structured inventory data and
// can legitimately be null — never fabricated, only ever flagged. Draft-only
// free-text fields (shippingNotes, warranty, internalNotes) aren't included
// here: they have no "unconfirmed" state, just an empty default.
export type ConfirmableField =
  | "condition"
  | "compatibleEquipment"
  | "countryOfOrigin"
  | "weight"
  | "dimensions"
  | "price"
  | "currency"
  | "images";

export const CONFIRMABLE_FIELD_LABEL: Record<ConfirmableField, string> = {
  condition: "Condition (genuine OEM / aftermarket)",
  compatibleEquipment: "Compatible equipment/models",
  countryOfOrigin: "Country of origin",
  weight: "Weight",
  dimensions: "Dimensions",
  price: "Price",
  currency: "Currency",
  images: "Product images",
};

export const NEEDS_CONFIRMATION = "Needs confirmation";

/**
 * The editable snapshot a reviewer works from. Populated once from the real
 * product record (see buildReviewData in templates.ts), then edited
 * independently — later edits here never write back to the products table,
 * and later changes to the live product never silently overwrite this
 * snapshot (see lib/admin/listing-generator.ts for where that rule lives).
 */
export interface ReviewData {
  brand: string;
  oemPartNumber: string;
  productName: string;
  category: string;
  condition: ProductCondition | null;
  quantity: number;
  compatibleEquipment: string | null;
  countryOfOrigin: string | null;
  weight: number | null;
  dimensions: string | null;
  price: number | null;
  currency: string | null;
  shippingNotes: string;
  warranty: string;
  images: string[];
  internalNotes: string;
  needsConfirmation: ConfirmableField[];
}

export interface WebsiteContent {
  pageHeading: string;
  shortDescription: string;
  fullDescription: string;
  keySpecifications: string[];
  rfqCallToAction: string;
}

export interface EbayContent {
  title: string;
  itemSpecifics: Record<string, string>;
  conditionDescription: string;
  fullDescription: string;
  shippingNotes: string;
  returnPolicyNotes: string;
  suggestedKeywords: string[];
}

export interface AlibabaContent {
  productTitle: string;
  shortOverview: string;
  detailedDescription: string;
  specifications: string[];
  supplyCapability: string;
  packagingExportNotes: string;
  minOrderAndQuotationWording: string;
}

export interface SeoContent {
  seoTitle: string;
  metaDescription: string;
  urlSlug: string;
  imageAltText: string;
  keywords: string[];
}

export interface LinkedInContent {
  companyPagePost: string;
  shortAnnouncement: string;
  hashtags: string[];
}

export interface GeneratedOutputs {
  website?: WebsiteContent;
  ebay?: EbayContent;
  alibaba?: AlibabaContent;
  seo?: SeoContent;
  linkedin?: LinkedInContent;
}

export type OutputSection = keyof GeneratedOutputs;

export const OUTPUT_SECTIONS: { key: OutputSection; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "ebay", label: "eBay" },
  { key: "alibaba", label: "Alibaba / B2B" },
  { key: "seo", label: "SEO" },
  { key: "linkedin", label: "LinkedIn" },
];
