"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent } from "react";
import {
  CONFIRMABLE_FIELD_LABEL,
  NEEDS_CONFIRMATION,
  OUTPUT_SECTIONS,
  type AlibabaContent,
  type ConfirmableField,
  type EbayContent,
  type GeneratedOutputs,
  type LinkedInContent,
  type OutputSection,
  type ReviewData,
  type SeoContent,
  type WebsiteContent,
} from "@/lib/listing-generator/types";
import type { ListingDraftStatus } from "@/lib/supabase/types";
import { generateDraftAction, regenerateSectionAction, saveReviewDataAction, updateStatusAction } from "./actions";

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";
const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";
const textareaClass = `${inputClass} min-h-[80px] resize-y`;

const CONDITION_OPTIONS: { value: ReviewData["condition"]; label: string }[] = [
  { value: null, label: "Not specified" },
  { value: "genuine_oem", label: "Genuine OEM" },
  { value: "aftermarket", label: "Aftermarket" },
  { value: "obsolete_dead_stock", label: "Obsolete / Dead Stock" },
  { value: "used_serviceable", label: "Used / Serviceable" },
];

const STATUS_OPTIONS: ListingDraftStatus[] = ["draft", "reviewed", "approved", "published"];
const STATUS_LABEL: Record<ListingDraftStatus, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  approved: "Approved",
  published: "Published",
};

function computeNeedsConfirmation(r: ReviewData): ConfirmableField[] {
  const needs: ConfirmableField[] = [];
  if (!r.condition) needs.push("condition");
  if (!r.compatibleEquipment) needs.push("compatibleEquipment");
  if (!r.countryOfOrigin) needs.push("countryOfOrigin");
  if (r.weight === null) needs.push("weight");
  if (!r.dimensions) needs.push("dimensions");
  if (r.price === null) needs.push("price");
  if (!r.currency) needs.push("currency");
  if (r.images.length === 0) needs.push("images");
  return needs;
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sectionToText(section: OutputSection, content: GeneratedOutputs[OutputSection]): string {
  if (!content) return "";
  switch (section) {
    case "website": {
      const c = content as WebsiteContent;
      return [
        `# ${c.pageHeading}`,
        "",
        c.shortDescription,
        "",
        c.fullDescription,
        "",
        "Key Specifications:",
        ...c.keySpecifications.map((s) => `- ${s}`),
        "",
        c.rfqCallToAction,
      ].join("\n");
    }
    case "ebay": {
      const c = content as EbayContent;
      return [
        `Title: ${c.title}`,
        "",
        "Item Specifics:",
        ...Object.entries(c.itemSpecifics).map(([k, v]) => `- ${k}: ${v}`),
        "",
        `Condition: ${c.conditionDescription}`,
        "",
        c.fullDescription,
        "",
        `Shipping: ${c.shippingNotes}`,
        `Returns: ${c.returnPolicyNotes}`,
        "",
        `Keywords: ${c.suggestedKeywords.join(", ")}`,
      ].join("\n");
    }
    case "alibaba": {
      const c = content as AlibabaContent;
      return [
        `# ${c.productTitle}`,
        "",
        c.shortOverview,
        "",
        c.detailedDescription,
        "",
        "Specifications:",
        ...c.specifications.map((s) => `- ${s}`),
        "",
        `Supply Capability: ${c.supplyCapability}`,
        `Packaging/Export: ${c.packagingExportNotes}`,
        `MOQ/Quotation: ${c.minOrderAndQuotationWording}`,
      ].join("\n");
    }
    case "seo": {
      const c = content as SeoContent;
      return [
        `SEO Title: ${c.seoTitle}`,
        `Meta Description: ${c.metaDescription}`,
        `URL Slug: /${c.urlSlug}`,
        `Image Alt Text: ${c.imageAltText}`,
        `Keywords: ${c.keywords.join(", ")}`,
      ].join("\n");
    }
    case "linkedin": {
      const c = content as LinkedInContent;
      return [c.companyPagePost, "", c.shortAnnouncement, "", c.hashtags.join(" ")].join("\n");
    }
  }
}

export function ListingWorkspace({
  productId,
  draftId: initialDraftId,
  initialReviewData,
  initialOutputs,
  initialStatus,
  version: initialVersion,
}: {
  productId: string;
  draftId: string | null;
  initialReviewData: ReviewData;
  initialOutputs: GeneratedOutputs;
  initialStatus: ListingDraftStatus;
  version: number;
}) {
  const [reviewData, setReviewData] = useState<ReviewData>(initialReviewData);
  const [outputs, setOutputs] = useState<GeneratedOutputs>(initialOutputs);
  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [status, setStatus] = useState<ListingDraftStatus>(initialStatus);
  const [version, setVersion] = useState<number>(initialVersion);
  const [activeTab, setActiveTab] = useState<OutputSection>("website");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<OutputSection | null>(null);

  const hasDraft = draftId !== null;
  const needsConfirmation = useMemo(() => computeNeedsConfirmation(reviewData), [reviewData]);

  function updateField<K extends keyof ReviewData>(key: K, value: ReviewData[K]) {
    setReviewData((prev) => {
      const next = { ...prev, [key]: value };
      return { ...next, needsConfirmation: computeNeedsConfirmation(next) };
    });
  }

  async function handleGenerate() {
    setBusy("generate");
    setMessage(null);
    try {
      const draft = await generateDraftAction(productId, reviewData);
      setDraftId(draft.id);
      setOutputs(draft.generatedOutputs);
      setStatus(draft.status);
      setVersion(draft.version);
      setMessage(`Generated draft version ${draft.version}.`);
    } finally {
      setBusy(null);
    }
  }

  async function handleRegenerateSection() {
    if (!draftId) return;
    setBusy("regenerate");
    setMessage(null);
    try {
      const content = await regenerateSectionAction(draftId, productId, reviewData, activeTab);
      setOutputs((prev) => ({ ...prev, [activeTab]: content }));
      setMessage(`Regenerated ${activeTab} section.`);
    } finally {
      setBusy(null);
    }
  }

  async function handleSaveReview() {
    if (!draftId) return;
    setBusy("save");
    setMessage(null);
    try {
      await saveReviewDataAction(draftId, reviewData);
      setMessage("Review data saved.");
    } finally {
      setBusy(null);
    }
  }

  async function handleStatusChange(next: ListingDraftStatus) {
    if (!draftId) return;
    setStatus(next);
    await updateStatusAction(draftId, next);
  }

  function handleReset() {
    setReviewData(initialReviewData);
    setOutputs(initialOutputs);
    setStatus(initialStatus);
    setVersion(initialVersion);
    setMessage("Reset to last saved state.");
  }

  function handleCopy(section: OutputSection) {
    const text = sectionToText(section, outputs[section]);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 1500);
    });
  }

  function handleDownloadJson() {
    const payload = { productId, draftId, version, status, reviewData, generatedOutputs: outputs };
    downloadBlob(`${reviewData.oemPartNumber}-listing-draft.json`, JSON.stringify(payload, null, 2), "application/json");
  }

  function handleDownloadMarkdown() {
    const parts = [`# ${reviewData.brand} ${reviewData.productName} — OEM ${reviewData.oemPartNumber}`, `Draft status: ${STATUS_LABEL[status]} · Version ${version}`, ""];
    for (const { key, label } of OUTPUT_SECTIONS) {
      parts.push(`## ${label}`, "", sectionToText(key, outputs[key]) || "_Not yet generated._", "");
    }
    downloadBlob(`${reviewData.oemPartNumber}-listing-draft.md`, parts.join("\n"), "text/markdown");
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3 rounded-m border border-line bg-bg-1 p-4">
        <span className={labelClass}>
          {hasDraft ? `Version ${version}` : "No draft yet"}
        </span>
        {hasDraft ? (
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ListingDraftStatus)}
            className={`${inputClass} w-auto`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        ) : null}
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={handleGenerate} disabled={busy !== null} className="btn btn-primary btn-sm">
            {hasDraft ? "Regenerate All (New Version)" : "Generate Drafts"}
          </button>
          {hasDraft ? (
            <button type="button" onClick={handleSaveReview} disabled={busy !== null} className="btn btn-ghost btn-sm">
              Save Review Data
            </button>
          ) : null}
          <button type="button" onClick={handleDownloadJson} disabled={!hasDraft} className="btn btn-ghost btn-sm">
            Download JSON
          </button>
          <button type="button" onClick={handleDownloadMarkdown} disabled={!hasDraft} className="btn btn-ghost btn-sm">
            Download Markdown
          </button>
          <button type="button" onClick={handleReset} className="btn btn-ghost btn-sm">
            Reset
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 rounded-s border border-ok/40 bg-ok/10 px-3.5 py-2.5 text-sm text-ok">{message}</p> : null}

      {needsConfirmation.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {needsConfirmation.map((f) => (
            <span key={f} className="tag tag-soon">
              ⚠ {CONFIRMABLE_FIELD_LABEL[f]}: {NEEDS_CONFIRMATION}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-8 min-[901px]:grid-cols-[1fr_1.3fr]">
        {/* Review form */}
        <div className="flex flex-col gap-5 rounded-m border border-line bg-bg-1 p-6">
          <h3 className="text-[16px]">Product Review</h3>

          <div className="grid grid-cols-1 gap-5 min-[601px]:grid-cols-2">
            <ReadOnlyField label="Brand" value={reviewData.brand} />
            <ReadOnlyField label="OEM Part Number" value={reviewData.oemPartNumber} />
          </div>
          <ReadOnlyField label="Product Name" value={reviewData.productName} />
          <div className="grid grid-cols-1 gap-5 min-[601px]:grid-cols-2">
            <ReadOnlyField label="Category" value={reviewData.category} />
            <ReadOnlyField label="Quantity" value={String(reviewData.quantity)} />
          </div>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Condition {badge(needsConfirmation.includes("condition"))}</span>
            <select
              value={reviewData.condition ?? ""}
              onChange={(e) => updateField("condition", (e.target.value || null) as ReviewData["condition"])}
              className={inputClass}
            >
              {CONDITION_OPTIONS.map((o) => (
                <option key={o.label} value={o.value ?? ""}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <TextField
            label="Compatible Equipment/Models"
            flagged={needsConfirmation.includes("compatibleEquipment")}
            value={reviewData.compatibleEquipment ?? ""}
            onChange={(v) => updateField("compatibleEquipment", v || null)}
          />
          <TextField
            label="Country of Origin"
            flagged={needsConfirmation.includes("countryOfOrigin")}
            value={reviewData.countryOfOrigin ?? ""}
            onChange={(v) => updateField("countryOfOrigin", v || null)}
          />

          <div className="grid grid-cols-1 gap-5 min-[601px]:grid-cols-2">
            <NumberField
              label="Weight (kg)"
              flagged={needsConfirmation.includes("weight")}
              value={reviewData.weight}
              onChange={(v) => updateField("weight", v)}
            />
            <TextField
              label="Dimensions"
              flagged={needsConfirmation.includes("dimensions")}
              value={reviewData.dimensions ?? ""}
              onChange={(v) => updateField("dimensions", v || null)}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 min-[601px]:grid-cols-2">
            <NumberField
              label="Price"
              flagged={needsConfirmation.includes("price")}
              value={reviewData.price}
              onChange={(v) => updateField("price", v)}
            />
            <TextField
              label="Currency"
              flagged={needsConfirmation.includes("currency")}
              value={reviewData.currency ?? ""}
              onChange={(v) => updateField("currency", v || null)}
            />
          </div>

          <TextAreaField label="Shipping Notes" value={reviewData.shippingNotes} onChange={(v) => updateField("shippingNotes", v)} />
          <TextAreaField label="Warranty" value={reviewData.warranty} onChange={(v) => updateField("warranty", v)} />

          <div className="flex flex-col gap-2">
            <span className={labelClass}>Product Images {badge(needsConfirmation.includes("images"))}</span>
            {reviewData.images.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reviewData.images.map((src) => (
                  <div key={src} className="relative h-16 w-16 overflow-hidden rounded-s border border-line bg-bg-2">
                    <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-2">
                No images yet — add them via{" "}
                <a href={`/admin/products/${productId}/edit`} className="text-brass hover:underline">
                  Product → Media
                </a>
                .
              </p>
            )}
          </div>

          <TextAreaField label="Internal Notes (private)" value={reviewData.internalNotes} onChange={(v) => updateField("internalNotes", v)} />
        </div>

        {/* Output panels */}
        <div className="flex flex-col gap-4 rounded-m border border-line bg-bg-1 p-6">
          <div className="flex flex-wrap gap-2 border-b border-line pb-4">
            {OUTPUT_SECTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`btn btn-sm ${activeTab === key ? "btn-primary" : "btn-ghost"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[16px]">{OUTPUT_SECTIONS.find((s) => s.key === activeTab)?.label}</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRegenerateSection}
                disabled={!hasDraft || busy !== null}
                className="btn btn-ghost btn-sm"
              >
                Regenerate This Section
              </button>
              <button type="button" onClick={() => handleCopy(activeTab)} disabled={!outputs[activeTab]} className="btn btn-ghost btn-sm">
                {copiedSection === activeTab ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>

          {!outputs[activeTab] ? (
            <p className="text-sm text-text-2">Not generated yet — click &ldquo;Generate Drafts&rdquo; above.</p>
          ) : (
            <OutputSectionEditor
              section={activeTab}
              outputs={outputs}
              onChange={(section, content) => setOutputs((prev) => ({ ...prev, [section]: content }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function badge(flagged: boolean) {
  return flagged ? <span className="tag tag-soon ml-2">Needs confirmation</span> : null;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      <div className={`${inputClass} opacity-70`}>{value}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  flagged,
  onChange,
}: {
  label: string;
  value: string;
  flagged?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelClass}>
        {label} {badge(!!flagged)}
      </span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}

function NumberField({
  label,
  value,
  flagged,
  onChange,
}: {
  label: string;
  value: number | null;
  flagged?: boolean;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelClass}>
        {label} {badge(!!flagged)}
      </span>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className={inputClass}
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className={textareaClass} rows={3} />
    </label>
  );
}

function joinLines(v: string[]): string {
  return v.join("\n");
}
function splitLines(v: string): string[] {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function OutputSectionEditor({
  section,
  outputs,
  onChange,
}: {
  section: OutputSection;
  outputs: GeneratedOutputs;
  onChange: (section: OutputSection, content: GeneratedOutputs[OutputSection]) => void;
}) {
  switch (section) {
    case "website": {
      const c = outputs.website as WebsiteContent;
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Page Heading" value={c.pageHeading} onChange={(v) => onChange("website", { ...c, pageHeading: v })} />
          <TextAreaField label="Short Description" value={c.shortDescription} onChange={(v) => onChange("website", { ...c, shortDescription: v })} />
          <TextAreaField label="Full Description" value={c.fullDescription} onChange={(v) => onChange("website", { ...c, fullDescription: v })} />
          <TextAreaField
            label="Key Specifications (one per line)"
            value={joinLines(c.keySpecifications)}
            onChange={(v) => onChange("website", { ...c, keySpecifications: splitLines(v) })}
          />
          <TextAreaField label="RFQ Call to Action" value={c.rfqCallToAction} onChange={(v) => onChange("website", { ...c, rfqCallToAction: v })} />
        </div>
      );
    }
    case "ebay": {
      const c = outputs.ebay as EbayContent;
      return (
        <div className="flex flex-col gap-4">
          <TextField label={`Title (${c.title.length}/80 chars)`} value={c.title} onChange={(v) => onChange("ebay", { ...c, title: v.slice(0, 80) })} />
          <TextAreaField
            label="Item Specifics (Key: Value per line)"
            value={Object.entries(c.itemSpecifics)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n")}
            onChange={(v) => {
              const itemSpecifics: Record<string, string> = {};
              for (const line of splitLines(v)) {
                const idx = line.indexOf(":");
                if (idx === -1) continue;
                itemSpecifics[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
              }
              onChange("ebay", { ...c, itemSpecifics });
            }}
          />
          <TextAreaField label="Condition Description" value={c.conditionDescription} onChange={(v) => onChange("ebay", { ...c, conditionDescription: v })} />
          <TextAreaField label="Full Description" value={c.fullDescription} onChange={(v) => onChange("ebay", { ...c, fullDescription: v })} />
          <TextAreaField label="Shipping Notes" value={c.shippingNotes} onChange={(v) => onChange("ebay", { ...c, shippingNotes: v })} />
          <TextAreaField label="Return Policy Notes" value={c.returnPolicyNotes} onChange={(v) => onChange("ebay", { ...c, returnPolicyNotes: v })} />
          <TextAreaField
            label="Suggested Keywords (one per line)"
            value={joinLines(c.suggestedKeywords)}
            onChange={(v) => onChange("ebay", { ...c, suggestedKeywords: splitLines(v) })}
          />
        </div>
      );
    }
    case "alibaba": {
      const c = outputs.alibaba as AlibabaContent;
      return (
        <div className="flex flex-col gap-4">
          <TextField label="Product Title" value={c.productTitle} onChange={(v) => onChange("alibaba", { ...c, productTitle: v })} />
          <TextAreaField label="Short Overview" value={c.shortOverview} onChange={(v) => onChange("alibaba", { ...c, shortOverview: v })} />
          <TextAreaField label="Detailed Description" value={c.detailedDescription} onChange={(v) => onChange("alibaba", { ...c, detailedDescription: v })} />
          <TextAreaField
            label="Specifications (one per line)"
            value={joinLines(c.specifications)}
            onChange={(v) => onChange("alibaba", { ...c, specifications: splitLines(v) })}
          />
          <TextAreaField label="Supply Capability" value={c.supplyCapability} onChange={(v) => onChange("alibaba", { ...c, supplyCapability: v })} />
          <TextAreaField label="Packaging & Export Notes" value={c.packagingExportNotes} onChange={(v) => onChange("alibaba", { ...c, packagingExportNotes: v })} />
          <TextAreaField
            label="MOQ & Quotation Wording"
            value={c.minOrderAndQuotationWording}
            onChange={(v) => onChange("alibaba", { ...c, minOrderAndQuotationWording: v })}
          />
        </div>
      );
    }
    case "seo": {
      const c = outputs.seo as SeoContent;
      return (
        <div className="flex flex-col gap-4">
          <TextField label="SEO Title" value={c.seoTitle} onChange={(v) => onChange("seo", { ...c, seoTitle: v })} />
          <TextAreaField label="Meta Description" value={c.metaDescription} onChange={(v) => onChange("seo", { ...c, metaDescription: v })} />
          <TextField label="URL Slug" value={c.urlSlug} onChange={(v) => onChange("seo", { ...c, urlSlug: v })} />
          <TextField label="Image Alt Text" value={c.imageAltText} onChange={(v) => onChange("seo", { ...c, imageAltText: v })} />
          <TextAreaField label="Keywords (one per line)" value={joinLines(c.keywords)} onChange={(v) => onChange("seo", { ...c, keywords: splitLines(v) })} />
        </div>
      );
    }
    case "linkedin": {
      const c = outputs.linkedin as LinkedInContent;
      return (
        <div className="flex flex-col gap-4">
          <TextAreaField label="Company Page Post" value={c.companyPagePost} onChange={(v) => onChange("linkedin", { ...c, companyPagePost: v })} />
          <TextAreaField label="Short Announcement" value={c.shortAnnouncement} onChange={(v) => onChange("linkedin", { ...c, shortAnnouncement: v })} />
          <TextAreaField label="Hashtags (one per line)" value={joinLines(c.hashtags)} onChange={(v) => onChange("linkedin", { ...c, hashtags: splitLines(v) })} />
        </div>
      );
    }
  }
}
