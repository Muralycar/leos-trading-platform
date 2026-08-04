"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/admin/auth";
import {
  getQuotationById,
  changeQuotationStatus,
  createQuotationRevision,
  updateQuotationHeader,
  addQuotationItem,
  updateQuotationItem,
  deleteQuotationItem,
  duplicateQuotationItem,
  reorderQuotationItems,
  type QuotationHeaderUpdate,
  type QuotationItemInput,
} from "@/lib/admin/quotations";
import { isQuotationEditable } from "@/lib/quotations/types";
import type { ProductCondition, QuotationStatus } from "@/lib/supabase/types";

const VALID_STATUSES: QuotationStatus[] = [
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

/** Re-checked server-side on every write — the client's status-based UI gating is a convenience, not the enforcement. */
async function assertEditable(quotationId: string): Promise<void> {
  const quotation = await getQuotationById(quotationId);
  if (!quotation || !isQuotationEditable(quotation.status)) {
    throw new Error("This quotation revision is locked. Create a revision to make changes.");
  }
}

function num(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function str(value: FormDataEntryValue | null): string | null {
  const v = String(value ?? "").trim();
  return v ? v : null;
}

function numOrNull(value: FormDataEntryValue | null): number | null {
  const v = String(value ?? "").trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function saveHeaderAction(quotationId: string, formData: FormData) {
  const profile = await requireRole("admin");
  await assertEditable(quotationId);

  const fields: QuotationHeaderUpdate = {
    customerName: String(formData.get("customerName") ?? "").trim(),
    companyName: str(formData.get("companyName")),
    customerEmail: String(formData.get("customerEmail") ?? "").trim(),
    customerPhone: str(formData.get("customerPhone")),
    customerAddress: str(formData.get("customerAddress")),
    country: str(formData.get("country")),
    customerReference: str(formData.get("customerReference")),
    poNumber: str(formData.get("poNumber")),
    validUntil: str(formData.get("validUntil")),
    expectedDelivery: str(formData.get("expectedDelivery")),
    currency: str(formData.get("currency")),
    exchangeRate: numOrNull(formData.get("exchangeRate")),
    salesperson: str(formData.get("salesperson")),
    preparedBy: str(formData.get("preparedBy")),
    approvedBy: str(formData.get("approvedBy")),
    incoterm: str(formData.get("incoterm")),
    deliveryTerms: str(formData.get("deliveryTerms")),
    paymentTerms: str(formData.get("paymentTerms")),
    shipmentTerms: str(formData.get("shipmentTerms")),
    warranty: str(formData.get("warranty")),
    countryOfOriginNote: str(formData.get("countryOfOriginNote")),
    shippingMethod: str(formData.get("shippingMethod")),
    portOfLoading: str(formData.get("portOfLoading")),
    portOfDestination: str(formData.get("portOfDestination")),
    bankDetails: str(formData.get("bankDetails")),
    swiftCode: str(formData.get("swiftCode")),
    iban: str(formData.get("iban")),
    signatureReference: str(formData.get("signatureReference")),
    notes: str(formData.get("notes")),
    internalNotes: str(formData.get("internalNotes")),
    freight: num(formData.get("freight")),
    packingCharges: num(formData.get("packingCharges")),
    insurance: num(formData.get("insurance")),
    otherCharges: num(formData.get("otherCharges")),
    roundingAdjustment: num(formData.get("roundingAdjustment")),
  };

  await updateQuotationHeader(quotationId, fields, profile.id, profile.email || null);

  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function changeStatusAction(quotationId: string, formData: FormData) {
  const profile = await requireRole("admin");

  const status = String(formData.get("status") ?? "");
  if (!VALID_STATUSES.includes(status as QuotationStatus)) return;

  await changeQuotationStatus(quotationId, status as QuotationStatus, profile.id, profile.email || null);

  revalidatePath(`/admin/quotations/${quotationId}`);
  revalidatePath("/admin/quotations");
}

export async function createRevisionActionRedirect(quotationId: string): Promise<string> {
  const profile = await requireRole("admin");
  const revision = await createQuotationRevision(quotationId, profile.id, profile.email || null);
  revalidatePath(`/admin/quotations/${quotationId}`);
  revalidatePath("/admin/quotations");
  return revision.id;
}

function parseItemInput(formData: FormData): QuotationItemInput {
  const condition = String(formData.get("condition") ?? "");
  const VALID_CONDITIONS: ProductCondition[] = ["genuine_oem", "aftermarket", "obsolete_dead_stock", "used_serviceable"];
  return {
    productId: null,
    partNumber: str(formData.get("partNumber")),
    description: String(formData.get("description") ?? "").trim(),
    brand: str(formData.get("brand")),
    quantity: num(formData.get("quantity")) || 1,
    unit: str(formData.get("unit")),
    unitPrice: num(formData.get("unitPrice")),
    discountPercent: num(formData.get("discountPercent")),
    taxPercent: num(formData.get("taxPercent")),
    leadTime: str(formData.get("leadTime")),
    countryOfOrigin: str(formData.get("countryOfOrigin")),
    condition: VALID_CONDITIONS.includes(condition as ProductCondition) ? (condition as ProductCondition) : null,
    remarks: str(formData.get("remarks")),
  };
}

export async function addItemAction(quotationId: string, formData: FormData) {
  const profile = await requireRole("admin");
  await assertEditable(quotationId);

  const item = parseItemInput(formData);
  if (!item.description) return;

  await addQuotationItem(quotationId, item, { id: profile.id, email: profile.email || null });

  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function updateItemAction(itemId: string, quotationId: string, formData: FormData) {
  await requireRole("admin");
  await assertEditable(quotationId);

  const item = parseItemInput(formData);
  if (!item.description) return;

  await updateQuotationItem(itemId, item);

  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function deleteItemAction(itemId: string, quotationId: string) {
  const profile = await requireRole("admin");
  await assertEditable(quotationId);

  await deleteQuotationItem(itemId, quotationId, { id: profile.id, email: profile.email || null });

  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function duplicateItemAction(itemId: string, quotationId: string) {
  const profile = await requireRole("admin");
  await assertEditable(quotationId);

  await duplicateQuotationItem(itemId, { id: profile.id, email: profile.email || null });

  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function reorderItemsAction(quotationId: string, orderedItemIds: string[]) {
  await requireRole("admin");
  await assertEditable(quotationId);

  await reorderQuotationItems(quotationId, orderedItemIds);

  revalidatePath(`/admin/quotations/${quotationId}`);
}
