"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { QuotationHeader, QuotationLineItem, QuotationActivityEntry, QuotationEmailLogEntry } from "@/lib/admin/quotations";
import type { QuotationAccessTokenSummary } from "@/lib/quotations/customer-access";
import { calcLineItem, calcQuotationTotals, isQuotationEditable } from "@/lib/quotations/types";
import type { ProductCondition, QuotationStatus } from "@/lib/supabase/types";
import {
  saveHeaderAction,
  changeStatusAction,
  createRevisionActionRedirect,
  addItemAction,
  updateItemAction,
  deleteItemAction,
  duplicateItemAction,
  reorderItemsAction,
} from "./actions";
import { revokeQuotationAccessTokenAction } from "./send-actions";
import { SendQuotationButton } from "./SendQuotationButton";

const STATUSES: QuotationStatus[] = [
  "draft",
  "under_review",
  "approved",
  "sent",
  "accepted",
  "revision_requested",
  "rejected",
  "expired",
  "cancelled",
];

const STATUS_LABEL: Record<QuotationStatus, string> = {
  draft: "Draft",
  under_review: "Under Review",
  approved: "Approved",
  sent: "Sent",
  accepted: "Accepted",
  revision_requested: "Revision Requested",
  rejected: "Rejected",
  expired: "Expired",
  cancelled: "Cancelled",
};

const CONDITIONS: ProductCondition[] = ["genuine_oem", "aftermarket", "obsolete_dead_stock", "used_serviceable"];
const CONDITION_LABEL: Record<ProductCondition, string> = {
  genuine_oem: "Genuine OEM",
  aftermarket: "Aftermarket",
  obsolete_dead_stock: "Obsolete / Dead Stock",
  used_serviceable: "Used / Serviceable",
};

const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3 py-2 text-[13px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none disabled:opacity-50";
const labelClass = "font-mono text-[10px] uppercase tracking-[.06em] text-text-2";

interface NumericDraft {
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

function draftFromItem(item: QuotationLineItem): NumericDraft {
  return {
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPercent: item.discountPercent,
    taxPercent: item.taxPercent,
  };
}

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  quotationId: string;
  quotation: QuotationHeader;
  items: QuotationLineItem[];
  activity: QuotationActivityEntry[];
  revisions: QuotationHeader[];
  rfqId: string;
  emailLog: QuotationEmailLogEntry[];
  accessTokens: QuotationAccessTokenSummary[];
}

export function QuotationEditor({
  quotationId,
  quotation,
  items,
  activity,
  revisions,
  rfqId,
  emailLog,
  accessTokens,
}: Props) {
  const router = useRouter();
  const editable = isQuotationEditable(quotation.status);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [freight, setFreight] = useState(quotation.freight);
  const [packingCharges, setPackingCharges] = useState(quotation.packingCharges);
  const [insurance, setInsurance] = useState(quotation.insurance);
  const [otherCharges, setOtherCharges] = useState(quotation.otherCharges);
  const [roundingAdjustment, setRoundingAdjustment] = useState(quotation.roundingAdjustment);
  useEffect(() => {
    setFreight(quotation.freight);
    setPackingCharges(quotation.packingCharges);
    setInsurance(quotation.insurance);
    setOtherCharges(quotation.otherCharges);
    setRoundingAdjustment(quotation.roundingAdjustment);
  }, [quotation.freight, quotation.packingCharges, quotation.insurance, quotation.otherCharges, quotation.roundingAdjustment]);

  // Auto-save: after a few seconds of no header edits, or on Ctrl/Cmd+S,
  // silently save the header form and stamp "Last saved". Manual "Save
  // Draft" clicks go through the same path so the indicator always reflects
  // the true last-persisted time, not just the last keystroke.
  const formRef = useRef<HTMLFormElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const AUTO_SAVE_IDLE_MS = 4000;

  const saveHeader = useCallback(
    async (formData: FormData) => {
      setBusy(true);
      setMessage(null);
      try {
        await saveHeaderAction(quotationId, formData);
        setDirty(false);
        setLastSavedAt(new Date());
        setMessage("Draft saved.");
        router.refresh();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setBusy(false);
      }
    },
    [quotationId, router],
  );

  useEffect(() => {
    if (!editable) return;

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (formRef.current) saveHeader(new FormData(formRef.current));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editable, saveHeader]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  function handleHeaderFormChange() {
    if (!editable) return;
    setDirty(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (formRef.current) saveHeader(new FormData(formRef.current));
    }, AUTO_SAVE_IDLE_MS);
  }

  const [drafts, setDrafts] = useState<Record<string, NumericDraft>>(() =>
    Object.fromEntries(items.map((i) => [i.id, draftFromItem(i)])),
  );
  useEffect(() => {
    setDrafts(Object.fromEntries(items.map((i) => [i.id, draftFromItem(i)])));
  }, [items]);

  const [newItemDraft, setNewItemDraft] = useState<NumericDraft>({
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxPercent: 0,
  });

  const liveTotals = calcQuotationTotals({
    items: items.map((i) => calcLineItem(drafts[i.id] ?? draftFromItem(i))),
    freight,
    packingCharges,
    insurance,
    otherCharges,
    roundingAdjustment,
  });

  async function runAction(fn: () => Promise<unknown>, successMessage: string) {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      setMessage(successMessage);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleHeaderSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    await saveHeader(new FormData(e.currentTarget));
  }

  async function handleStatusSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await runAction(() => changeStatusAction(quotationId, formData), "Status updated.");
  }

  async function handleCreateRevision() {
    setBusy(true);
    setMessage(null);
    try {
      const newId = await createRevisionActionRedirect(quotationId);
      router.push(`/admin/quotations/${newId}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create revision.");
      setBusy(false);
    }
  }

  async function handleItemSubmit(e: React.FormEvent<HTMLFormElement>, itemId: string) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await runAction(() => updateItemAction(itemId, quotationId, formData), "Line saved.");
  }

  async function handleAddItemSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await runAction(async () => {
      await addItemAction(quotationId, formData);
      setNewItemDraft({ quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 });
    }, "Line added.");
  }

  async function handleDelete(itemId: string) {
    await runAction(() => deleteItemAction(itemId, quotationId), "Line removed.");
  }

  async function handleDuplicate(itemId: string) {
    await runAction(() => duplicateItemAction(itemId, quotationId), "Line duplicated.");
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    await runAction(() => reorderItemsAction(quotationId, reordered.map((i) => i.id)), "Lines reordered.");
  }

  return (
    <div>
      <Link href={`/admin/rfq/${rfqId}`} className="text-sm text-text-2 hover:text-brass">
        ← Back to RFQ
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Quotation</div>
          <h1 className="mt-3.5 text-[28px]">{quotation.revisionLabel}</h1>
          <p className="mt-1 text-text-1">
            {quotation.customerName}
            {quotation.companyName ? ` — ${quotation.companyName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="tag">{STATUS_LABEL[quotation.status]}</span>
          {!editable ? (
            <span className="text-[12px] text-warn">Locked — create a revision to edit</span>
          ) : null}
        </div>
      </div>

      {message ? <p className="mt-4 rounded-s border border-line-strong bg-bg-1 px-3.5 py-2.5 text-sm text-text-1">{message}</p> : null}

      {revisions.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {revisions.map((r) => (
            <Link
              key={r.id}
              href={`/admin/quotations/${r.id}`}
              className={`tag ${r.id === quotationId ? "text-brass" : "text-text-2"}`}
            >
              {r.revisionLabel}
              {r.isCurrent ? " (current)" : ""}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-8 min-[1101px]:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Header form */}
          <form ref={formRef} onSubmit={handleHeaderSubmit} onChange={handleHeaderFormChange} className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Quotation Header</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 min-[701px]:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Customer Name</span>
                <input name="customerName" defaultValue={quotation.customerName} required disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Company</span>
                <input name="companyName" defaultValue={quotation.companyName ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Email</span>
                <input name="customerEmail" type="email" defaultValue={quotation.customerEmail} required disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Phone</span>
                <input name="customerPhone" defaultValue={quotation.customerPhone ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 min-[701px]:col-span-2">
                <span className={labelClass}>Address</span>
                <input name="customerAddress" defaultValue={quotation.customerAddress ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Country</span>
                <input name="country" defaultValue={quotation.country ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Customer Reference</span>
                <input name="customerReference" defaultValue={quotation.customerReference ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>PO Number</span>
                <input name="poNumber" defaultValue={quotation.poNumber ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Valid Until</span>
                <input name="validUntil" type="date" defaultValue={quotation.validUntil ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Expected Delivery</span>
                <input name="expectedDelivery" type="date" defaultValue={quotation.expectedDelivery ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Currency</span>
                <input name="currency" defaultValue={quotation.currency ?? ""} placeholder="e.g. AED, USD" disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Exchange Rate</span>
                <input name="exchangeRate" type="number" step="any" defaultValue={quotation.exchangeRate ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Salesperson</span>
                <input name="salesperson" defaultValue={quotation.salesperson ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Prepared By</span>
                <input name="preparedBy" defaultValue={quotation.preparedBy ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Approved By</span>
                <input name="approvedBy" defaultValue={quotation.approvedBy ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Incoterm</span>
                <input name="incoterm" defaultValue={quotation.incoterm ?? ""} placeholder="e.g. FOB, CIF" disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Delivery Terms</span>
                <input name="deliveryTerms" defaultValue={quotation.deliveryTerms ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Payment Terms</span>
                <input name="paymentTerms" defaultValue={quotation.paymentTerms ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Shipment Terms</span>
                <input name="shipmentTerms" defaultValue={quotation.shipmentTerms ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Warranty</span>
                <input name="warranty" defaultValue={quotation.warranty ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Country of Origin Note</span>
                <input name="countryOfOriginNote" defaultValue={quotation.countryOfOriginNote ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Shipping Method</span>
                <input name="shippingMethod" defaultValue={quotation.shippingMethod ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Port of Loading</span>
                <input name="portOfLoading" defaultValue={quotation.portOfLoading ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Port of Destination</span>
                <input name="portOfDestination" defaultValue={quotation.portOfDestination ?? ""} disabled={!editable} className={inputClass} />
              </label>
            </div>

            <h4 className="mt-6 text-[13px] text-text-1">Banking &amp; Signature</h4>
            <div className="mt-3 grid grid-cols-1 gap-4 min-[701px]:grid-cols-2">
              <label className="flex flex-col gap-1.5 min-[701px]:col-span-2">
                <span className={labelClass}>Bank Details</span>
                <textarea name="bankDetails" rows={2} defaultValue={quotation.bankDetails ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>SWIFT</span>
                <input name="swiftCode" defaultValue={quotation.swiftCode ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>IBAN</span>
                <input name="iban" defaultValue={quotation.iban ?? ""} disabled={!editable} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 min-[701px]:col-span-2">
                <span className={labelClass}>Company Signature / Stamp Reference</span>
                <input name="signatureReference" defaultValue={quotation.signatureReference ?? ""} disabled={!editable} className={inputClass} />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className={labelClass}>General Notes</span>
              <textarea name="notes" rows={3} defaultValue={quotation.notes ?? ""} disabled={!editable} className={inputClass} />
            </label>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className={labelClass}>Internal Notes (never customer-facing)</span>
              <textarea name="internalNotes" rows={3} defaultValue={quotation.internalNotes ?? ""} disabled={!editable} className={inputClass} />
            </label>

            <h4 className="mt-6 text-[13px] text-text-1">Additional Charges</h4>
            <div className="mt-3 grid grid-cols-1 gap-4 min-[701px]:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Freight</span>
                <input
                  name="freight"
                  type="number"
                  step="any"
                  value={freight}
                  onChange={(e) => setFreight(Number(e.target.value) || 0)}
                  disabled={!editable}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Packing Charges</span>
                <input
                  name="packingCharges"
                  type="number"
                  step="any"
                  value={packingCharges}
                  onChange={(e) => setPackingCharges(Number(e.target.value) || 0)}
                  disabled={!editable}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Insurance</span>
                <input
                  name="insurance"
                  type="number"
                  step="any"
                  value={insurance}
                  onChange={(e) => setInsurance(Number(e.target.value) || 0)}
                  disabled={!editable}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Other Charges</span>
                <input
                  name="otherCharges"
                  type="number"
                  step="any"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(Number(e.target.value) || 0)}
                  disabled={!editable}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Rounding Adjustment</span>
                <input
                  name="roundingAdjustment"
                  type="number"
                  step="any"
                  value={roundingAdjustment}
                  onChange={(e) => setRoundingAdjustment(Number(e.target.value) || 0)}
                  disabled={!editable}
                  className={inputClass}
                />
              </label>
            </div>

            {editable ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
                  Save Draft
                </button>
                <span className="text-[11px] text-text-2">
                  {dirty && !busy
                    ? "Unsaved changes — auto-saving shortly…"
                    : lastSavedAt
                      ? `Last saved ${lastSavedAt.toLocaleTimeString()}`
                      : "Not saved yet"}
                  {" · Ctrl+S / ⌘S to save"}
                </span>
              </div>
            ) : null}
          </form>

          {/* Line items */}
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Line Items</h3>
            <div className="mt-4 flex flex-col gap-4">
              {items.map((item, index) => {
                const draft = drafts[item.id] ?? draftFromItem(item);
                const calc = calcLineItem(draft);
                return (
                  <form
                    key={item.id}
                    onSubmit={(e) => handleItemSubmit(e, item.id)}
                    className="rounded-s border border-line bg-bg-0 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-text-2">Line {index + 1}</span>
                      {editable ? (
                        <div className="flex gap-3 text-[11px]">
                          <button type="button" onClick={() => handleMove(index, -1)} disabled={busy || index === 0} className="text-text-2 hover:text-brass disabled:opacity-30">
                            ↑ Move Up
                          </button>
                          <button type="button" onClick={() => handleMove(index, 1)} disabled={busy || index === items.length - 1} className="text-text-2 hover:text-brass disabled:opacity-30">
                            ↓ Move Down
                          </button>
                          <button type="button" onClick={() => handleDuplicate(item.id)} disabled={busy} className="text-text-2 hover:text-brass">
                            Duplicate
                          </button>
                          <button type="button" onClick={() => handleDelete(item.id)} disabled={busy} className="text-safety hover:underline">
                            Remove
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 min-[701px]:grid-cols-3 min-[1101px]:grid-cols-4">
                      <label className="flex flex-col gap-1"><span className={labelClass}>Part Number</span><input name="partNumber" defaultValue={item.partNumber ?? ""} disabled={!editable} className={inputClass} /></label>
                      <label className="flex flex-col gap-1 min-[701px]:col-span-2"><span className={labelClass}>Description</span><input name="description" defaultValue={item.description} required disabled={!editable} className={inputClass} /></label>
                      <label className="flex flex-col gap-1"><span className={labelClass}>Brand</span><input name="brand" defaultValue={item.brand ?? ""} disabled={!editable} className={inputClass} /></label>

                      <label className="flex flex-col gap-1">
                        <span className={labelClass}>Quantity</span>
                        <input
                          name="quantity" type="number" step="any" value={draft.quantity}
                          onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: { ...draft, quantity: Number(e.target.value) || 0 } }))}
                          disabled={!editable} className={inputClass}
                        />
                      </label>
                      <label className="flex flex-col gap-1"><span className={labelClass}>Unit</span><input name="unit" defaultValue={item.unit ?? ""} placeholder="pcs" disabled={!editable} className={inputClass} /></label>
                      <label className="flex flex-col gap-1">
                        <span className={labelClass}>Unit Price</span>
                        <input
                          name="unitPrice" type="number" step="any" value={draft.unitPrice}
                          onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: { ...draft, unitPrice: Number(e.target.value) || 0 } }))}
                          disabled={!editable} className={inputClass}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className={labelClass}>Discount %</span>
                        <input
                          name="discountPercent" type="number" step="any" value={draft.discountPercent}
                          onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: { ...draft, discountPercent: Number(e.target.value) || 0 } }))}
                          disabled={!editable} className={inputClass}
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className={labelClass}>Tax %</span>
                        <input
                          name="taxPercent" type="number" step="any" value={draft.taxPercent}
                          onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: { ...draft, taxPercent: Number(e.target.value) || 0 } }))}
                          disabled={!editable} className={inputClass}
                        />
                      </label>
                      <label className="flex flex-col gap-1"><span className={labelClass}>Lead Time</span><input name="leadTime" defaultValue={item.leadTime ?? ""} disabled={!editable} className={inputClass} /></label>
                      <label className="flex flex-col gap-1"><span className={labelClass}>Country of Origin</span><input name="countryOfOrigin" defaultValue={item.countryOfOrigin ?? ""} disabled={!editable} className={inputClass} /></label>
                      <label className="flex flex-col gap-1">
                        <span className={labelClass}>Condition</span>
                        <select name="condition" defaultValue={item.condition ?? ""} disabled={!editable} className={inputClass}>
                          <option value="">Not specified</option>
                          {CONDITIONS.map((c) => (
                            <option key={c} value={c}>{CONDITION_LABEL[c]}</option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-1 min-[701px]:col-span-3 min-[1101px]:col-span-4">
                        <span className={labelClass}>Remarks</span>
                        <input name="remarks" defaultValue={item.remarks ?? ""} disabled={!editable} className={inputClass} />
                      </label>
                    </div>

                    <div className="mt-3 flex flex-wrap justify-end gap-4 border-t border-line pt-3 text-[12px] text-text-2">
                      <span>Subtotal: {fmt(calc.lineSubtotal)}</span>
                      <span>Discount: {fmt(calc.lineDiscountAmount)}</span>
                      <span>Tax: {fmt(calc.lineTaxAmount)}</span>
                      <span className="font-medium text-text-0">Line Total: {fmt(calc.lineTotal)}</span>
                    </div>

                    {editable ? (
                      <button type="submit" disabled={busy} className="btn btn-ghost btn-sm mt-3">
                        Save Line
                      </button>
                    ) : null}
                  </form>
                );
              })}
              {items.length === 0 ? <p className="text-[13px] text-text-2">No line items yet.</p> : null}
            </div>

            {editable ? (
              <form onSubmit={handleAddItemSubmit} className="mt-5 rounded-s border border-line-strong border-dashed bg-bg-0 p-4">
                <h4 className="text-[13px] text-text-1">Add Line</h4>
                <div className="mt-3 grid grid-cols-1 gap-3 min-[701px]:grid-cols-3 min-[1101px]:grid-cols-4">
                  <label className="flex flex-col gap-1"><span className={labelClass}>Part Number</span><input name="partNumber" className={inputClass} /></label>
                  <label className="flex flex-col gap-1 min-[701px]:col-span-2"><span className={labelClass}>Description</span><input name="description" required className={inputClass} /></label>
                  <label className="flex flex-col gap-1"><span className={labelClass}>Brand</span><input name="brand" className={inputClass} /></label>

                  <label className="flex flex-col gap-1">
                    <span className={labelClass}>Quantity</span>
                    <input name="quantity" type="number" step="any" value={newItemDraft.quantity} onChange={(e) => setNewItemDraft((d) => ({ ...d, quantity: Number(e.target.value) || 0 }))} className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-1"><span className={labelClass}>Unit</span><input name="unit" placeholder="pcs" className={inputClass} /></label>
                  <label className="flex flex-col gap-1">
                    <span className={labelClass}>Unit Price</span>
                    <input name="unitPrice" type="number" step="any" value={newItemDraft.unitPrice} onChange={(e) => setNewItemDraft((d) => ({ ...d, unitPrice: Number(e.target.value) || 0 }))} className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelClass}>Discount %</span>
                    <input name="discountPercent" type="number" step="any" value={newItemDraft.discountPercent} onChange={(e) => setNewItemDraft((d) => ({ ...d, discountPercent: Number(e.target.value) || 0 }))} className={inputClass} />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className={labelClass}>Tax %</span>
                    <input name="taxPercent" type="number" step="any" value={newItemDraft.taxPercent} onChange={(e) => setNewItemDraft((d) => ({ ...d, taxPercent: Number(e.target.value) || 0 }))} className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-1"><span className={labelClass}>Lead Time</span><input name="leadTime" className={inputClass} /></label>
                  <label className="flex flex-col gap-1"><span className={labelClass}>Country of Origin</span><input name="countryOfOrigin" className={inputClass} /></label>
                  <label className="flex flex-col gap-1">
                    <span className={labelClass}>Condition</span>
                    <select name="condition" defaultValue="" className={inputClass}>
                      <option value="">Not specified</option>
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>{CONDITION_LABEL[c]}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 min-[701px]:col-span-3 min-[1101px]:col-span-4">
                    <span className={labelClass}>Remarks</span>
                    <input name="remarks" className={inputClass} />
                  </label>
                </div>
                <div className="mt-3 flex justify-end gap-4 border-t border-line pt-3 text-[12px] text-text-2">
                  <span className="font-medium text-text-0">Preview Line Total: {fmt(calcLineItem(newItemDraft).lineTotal)}</span>
                </div>
                <button type="submit" disabled={busy} className="btn btn-primary btn-sm mt-3">
                  Add Line
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Totals */}
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Totals</h3>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><dt className="text-text-2">Subtotal</dt><dd>{fmt(liveTotals.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-2">Total Discount</dt><dd>-{fmt(liveTotals.totalDiscount)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-2">Tax Total</dt><dd>{fmt(liveTotals.taxTotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-2">Freight</dt><dd>{fmt(freight)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-2">Packing Charges</dt><dd>{fmt(packingCharges)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-2">Insurance</dt><dd>{fmt(insurance)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-2">Other Charges</dt><dd>{fmt(otherCharges)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-2">Rounding</dt><dd>{fmt(roundingAdjustment)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-[15px] font-medium text-text-0">
                <dt>Grand Total {quotation.currency ? `(${quotation.currency})` : ""}</dt><dd>{fmt(liveTotals.grandTotal)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-text-2">
              Live preview — the saved values shown above after each save are the server&apos;s authoritative calculation.
            </p>
          </div>

          {/* Status */}
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Status</h3>
            <form onSubmit={handleStatusSubmit} className="mt-4 flex flex-col gap-3">
              <select name="status" defaultValue={quotation.status} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
              <button type="submit" disabled={busy} className="btn btn-primary btn-sm self-start">
                Update Status
              </button>
            </form>

            <button type="button" onClick={handleCreateRevision} disabled={busy} className="btn btn-ghost btn-sm mt-4 w-full">
              Create Revision
            </button>
          </div>

          {/* Send to customer */}
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Send to Customer</h3>
            <div className="mt-4">
              <SendQuotationButton
                quotationId={quotationId}
                quotationNumber={quotation.quotationNumber}
                revisionLabel={quotation.revisionLabel}
                customerEmail={quotation.customerEmail}
                currency={quotation.currency}
                grandTotal={quotation.grandTotal}
                validUntil={quotation.validUntil}
                status={quotation.status}
              />
              {quotation.status !== "approved" && quotation.status !== "sent" ? (
                <p className="text-[12px] text-text-2">Only an approved (or already-sent) quotation can be emailed.</p>
              ) : null}
            </div>

            {emailLog.length > 0 ? (
              <div className="mt-5 border-t border-line pt-4">
                <div className={labelClass}>Email History</div>
                <ul className="mt-2 flex flex-col gap-2">
                  {emailLog.map((entry) => (
                    <li key={entry.id} className="text-[12px]">
                      <span
                        className={
                          entry.deliveryStatus === "sent" || entry.deliveryStatus === "delivered"
                            ? "text-ok"
                            : entry.deliveryStatus === "failed" || entry.deliveryStatus === "bounced"
                              ? "text-safety"
                              : "text-warn"
                        }
                      >
                        {entry.deliveryStatus}
                      </span>
                      {" — "}
                      {entry.recipient} · {new Date(entry.createdAt).toLocaleString()}
                      {entry.errorMessage ? <div className="text-safety">{entry.errorMessage}</div> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {accessTokens.length > 0 ? (
              <div className="mt-5 border-t border-line pt-4">
                <div className={labelClass}>Customer Access Links</div>
                <ul className="mt-2 flex flex-col gap-2">
                  {accessTokens.map((tok) => (
                    <li key={tok.id} className="flex items-center justify-between gap-2 text-[12px] text-text-2">
                      <span>
                        Created {new Date(tok.createdAt).toLocaleString()}
                        {tok.revokedAt ? " — revoked" : tok.expiresAt ? ` — expires ${new Date(tok.expiresAt).toLocaleDateString()}` : ""}
                      </span>
                      {!tok.revokedAt ? (
                        <button
                          type="button"
                          onClick={() => runAction(() => revokeQuotationAccessTokenAction(tok.id, quotationId), "Link revoked.")}
                          disabled={busy}
                          className="text-safety hover:underline"
                        >
                          Revoke
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Activity */}
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Activity</h3>
            <ol className="mt-4 flex flex-col gap-3">
              {activity.map((event) => (
                <li key={event.id} className="border-l-2 border-line-strong pl-3 text-sm">
                  <div className="text-text-0">{activityLabel(event)}</div>
                  <div className="mt-0.5 text-[12px] text-text-2">
                    {new Date(event.createdAt).toLocaleString()}
                    {event.actorEmail ? ` — ${event.actorEmail}` : ""}
                  </div>
                </li>
              ))}
              {activity.length === 0 ? <p className="text-[13px] text-text-2">No activity yet.</p> : null}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function activityLabel(event: QuotationActivityEntry): string {
  switch (event.eventType) {
    case "quotation_created":
      return "Quotation created";
    case "quotation_updated":
      return "Quotation updated";
    case "status_changed":
      return `Status changed: ${event.oldStatus ?? "?"} → ${event.newStatus ?? "?"}`;
    case "revision_created":
      return `Revision ${String(event.details.to_revision ?? "?")} created`;
    case "line_added":
      return `Line added: ${String(event.details.part_number ?? event.details.description ?? "")}`;
    case "line_removed":
      return `Line removed: ${String(event.details.part_number ?? event.details.description ?? "")}`;
    case "email_sent":
      return `Emailed to ${String(event.details.recipient ?? "customer")}`;
    case "email_failed":
      return `Email send failed: ${String(event.details.error ?? "unknown error")}`;
    default:
      return event.eventType;
  }
}
