// Deterministic, template-based draft generation — no external AI provider
// call. The project has none configured (no AI SDK dependency, no API key
// in .env.local.example), and Phase 1 explicitly asks for placeholder
// generation until one exists. Every function here is a pure string
// composition over ReviewData; nothing here reads or writes Supabase.
import type { AdminProduct } from "@/lib/admin/products";
import {
  CONFIRMABLE_FIELD_LABEL,
  NEEDS_CONFIRMATION,
  type AlibabaContent,
  type ConfirmableField,
  type EbayContent,
  type GeneratedOutputs,
  type LinkedInContent,
  type ReviewData,
  type SeoContent,
  type WebsiteContent,
} from "./types";

const CONDITION_LABEL: Record<NonNullable<ReviewData["condition"]>, string> = {
  genuine_oem: "Genuine OEM",
  aftermarket: "Aftermarket",
  obsolete_dead_stock: "Obsolete / Dead Stock",
  used_serviceable: "Used / Serviceable",
};

function conditionLabel(condition: ReviewData["condition"]): string {
  return condition ? CONDITION_LABEL[condition] : NEEDS_CONFIRMATION;
}

function fmt(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return NEEDS_CONFIRMATION;
  return String(value);
}

function fmtWeight(weight: number | null): string {
  return weight === null ? NEEDS_CONFIRMATION : `${weight} kg`;
}

// Note: price/currency are deliberately never echoed into any of the
// generated public-facing content below. The product edit page labels
// `price` "(private)" — this is an RFQ-driven site with no public pricing
// (see Handoff/design_handoff_leos_trading/README.md), so price stays in
// the review form for the reviewer's own reference only.

/**
 * Builds the initial editable review snapshot from a real product record.
 * Only ever called to CREATE a draft or via an explicit "Sync from product"
 * action — never automatically on regenerate, so edits a reviewer has made
 * are never silently clobbered by a fresh pull from the live product.
 */
export function buildReviewData(product: AdminProduct, images: string[]): ReviewData {
  const compatibleEquipment = [product.equipmentMake, product.equipmentModel, product.application]
    .filter((v): v is string => !!v && v.trim() !== "")
    .join(" — ") || null;

  const needsConfirmation: ConfirmableField[] = [];
  if (!product.condition) needsConfirmation.push("condition");
  if (!compatibleEquipment) needsConfirmation.push("compatibleEquipment");
  if (!product.countryOfOrigin) needsConfirmation.push("countryOfOrigin");
  if (product.weight === null) needsConfirmation.push("weight");
  if (!product.dimensions) needsConfirmation.push("dimensions");
  if (product.price === null) needsConfirmation.push("price");
  if (!product.currency) needsConfirmation.push("currency");
  if (images.length === 0) needsConfirmation.push("images");

  return {
    brand: product.brandName,
    oemPartNumber: product.oemPartNumber,
    productName: product.description,
    category: product.equipmentCategoryName,
    condition: product.condition,
    quantity: product.quantity,
    compatibleEquipment,
    countryOfOrigin: product.countryOfOrigin,
    weight: product.weight,
    dimensions: product.dimensions,
    price: product.price,
    currency: product.currency,
    shippingNotes: "",
    warranty: "",
    images,
    internalNotes: product.internalNotes ?? "",
    needsConfirmation,
  };
}

function needsConfirmationNote(r: ReviewData): string {
  if (r.needsConfirmation.length === 0) return "";
  const labels = r.needsConfirmation.map((f) => CONFIRMABLE_FIELD_LABEL[f]);
  return ` (Unconfirmed: ${labels.join(", ")} — do not publish until confirmed.)`;
}

export function generateWebsiteContent(r: ReviewData): WebsiteContent {
  const heading = `${r.brand} ${r.productName} — OEM ${r.oemPartNumber}`;
  return {
    pageHeading: heading,
    shortDescription: `${conditionLabel(r.condition)} ${r.productName} for ${r.brand} equipment, OEM part ${r.oemPartNumber}. ${
      r.quantity > 0 ? "In stock in the UAE." : "Available through our sourcing network."
    }`,
    fullDescription:
      `Leos Trading FZE supplies OEM part ${r.oemPartNumber} (${r.productName}) for ${r.brand} equipment. ` +
      `Condition: ${conditionLabel(r.condition)}. Compatible equipment/models: ${fmt(r.compatibleEquipment)}. ` +
      `Country of origin: ${fmt(r.countryOfOrigin)}.${needsConfirmationNote(r)}`,
    keySpecifications: [
      `Brand: ${r.brand}`,
      `OEM Part Number: ${r.oemPartNumber}`,
      `Category: ${r.category}`,
      `Condition: ${conditionLabel(r.condition)}`,
      `Compatible Equipment/Models: ${fmt(r.compatibleEquipment)}`,
      `Country of Origin: ${fmt(r.countryOfOrigin)}`,
      `Weight: ${fmtWeight(r.weight)}`,
      `Dimensions: ${fmt(r.dimensions)}`,
      `Warranty: ${r.warranty || NEEDS_CONFIRMATION}`,
    ],
    rfqCallToAction: `Request a quotation for part ${r.oemPartNumber} — confirm availability and export terms.`,
  };
}

export function generateEbayContent(r: ReviewData): EbayContent {
  const rawTitle = `${r.brand} ${r.productName} OEM ${r.oemPartNumber}${
    r.condition ? ` - ${conditionLabel(r.condition)}` : " - Condition TBC"
  }`;
  const title = rawTitle.length > 80 ? rawTitle.slice(0, 77).trimEnd() + "..." : rawTitle;

  const itemSpecifics: Record<string, string> = {
    Brand: r.brand,
    "Part Number": r.oemPartNumber,
    Condition: conditionLabel(r.condition),
  };
  if (r.compatibleEquipment) itemSpecifics["Compatible Equipment"] = r.compatibleEquipment;
  if (r.countryOfOrigin) itemSpecifics["Country of Origin"] = r.countryOfOrigin;

  return {
    title,
    itemSpecifics,
    conditionDescription: r.condition
      ? `Condition: ${conditionLabel(r.condition)}.`
      : `Condition: ${NEEDS_CONFIRMATION} — do not publish until confirmed.`,
    fullDescription:
      `${r.brand} ${r.productName}, OEM part ${r.oemPartNumber}. ${conditionLabel(r.condition)}. ` +
      `Shipped from Leos Trading FZE, Sharjah, UAE.${needsConfirmationNote(r)}`,
    shippingNotes: `Shipped from UAE. Weight: ${fmtWeight(r.weight)}. Dimensions: ${fmt(r.dimensions)}.${
      r.shippingNotes ? ` ${r.shippingNotes}` : ""
    }`,
    returnPolicyNotes: "Standard Leos Trading FZE return policy applies — confirm terms before listing.",
    suggestedKeywords: [
      `${r.brand.toLowerCase()} ${r.oemPartNumber}`,
      `${r.brand.toLowerCase()} ${r.productName.toLowerCase()}`,
      `${r.brand.toLowerCase()} parts uae`,
    ],
  };
}

export function generateAlibabaContent(r: ReviewData): AlibabaContent {
  return {
    productTitle: `${r.brand} ${r.productName} OEM ${r.oemPartNumber}`,
    shortOverview: `${conditionLabel(r.condition)} ${r.productName} for ${r.brand} equipment, sourced and exported from the UAE.`,
    detailedDescription:
      `Leos Trading FZE — UAE-based supplier of OEM part ${r.oemPartNumber} (${r.productName}) for ${r.brand} equipment. ` +
      `Condition: ${conditionLabel(r.condition)}. Compatible equipment/models: ${fmt(r.compatibleEquipment)}.${needsConfirmationNote(r)}`,
    specifications: [
      `Brand: ${r.brand}`,
      `OEM Part Number: ${r.oemPartNumber}`,
      `Condition: ${conditionLabel(r.condition)}`,
      `Weight: ${fmtWeight(r.weight)}`,
      `Dimensions: ${fmt(r.dimensions)}`,
      `Country of Origin: ${fmt(r.countryOfOrigin)}`,
    ],
    supplyCapability: `In stock quantity: ${r.quantity.toLocaleString()} units. Additional supply available through our global sourcing network.`,
    packagingExportNotes: `Export documentation and logistics coordination from Sharjah, UAE. Packaging: ${NEEDS_CONFIRMATION}.`,
    minOrderAndQuotationWording: `Minimum order quantity: ${NEEDS_CONFIRMATION} — contact us for a formal quotation.`,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateSeoContent(r: ReviewData): SeoContent {
  return {
    seoTitle: `${r.brand} ${r.productName} OEM ${r.oemPartNumber} | Leos Trading FZE`,
    metaDescription: `Source ${r.brand} ${r.productName}, OEM part ${r.oemPartNumber}, from Leos Trading FZE — UAE-based supplier of genuine and aftermarket industrial parts.`,
    urlSlug: slugify(`${r.brand}-${r.productName}-${r.oemPartNumber}`),
    imageAltText: `${r.brand} ${r.productName} — OEM part ${r.oemPartNumber}`,
    keywords: [
      `${r.brand.toLowerCase()} ${r.oemPartNumber}`,
      `${r.productName.toLowerCase()} ${r.brand.toLowerCase()}`,
      `${r.brand.toLowerCase()} parts uae`,
    ],
  };
}

export function generateLinkedInContent(r: ReviewData): LinkedInContent {
  const stockPhrase = r.quantity > 0 ? `in stock in the UAE (${r.quantity.toLocaleString()} units)` : "available through our sourcing network";
  return {
    companyPagePost: `Now sourcing: ${r.brand} ${r.productName} (OEM ${r.oemPartNumber}) — ${stockPhrase}. Contact Leos Trading FZE for a quotation.`,
    shortAnnouncement: `In stock: ${r.brand} ${r.productName}, OEM ${r.oemPartNumber}.`,
    hashtags: [`#${r.brand.replace(/\s+/g, "")}Parts`, "#UAESupplier", "#IndustrialParts"],
  };
}

export function generateAllOutputs(r: ReviewData): GeneratedOutputs {
  return {
    website: generateWebsiteContent(r),
    ebay: generateEbayContent(r),
    alibaba: generateAlibabaContent(r),
    seo: generateSeoContent(r),
    linkedin: generateLinkedInContent(r),
  };
}
