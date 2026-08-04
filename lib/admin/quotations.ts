// Data access for quotations, quotation_items, and quotation_activity.
// Line-item edits never write activity rows directly except add/remove
// (see addQuotationItem/deleteQuotationItem) — routine header saves log a
// single "quotation_updated" event rather than diffing every field, and
// revision copies log one "revision_created" event instead of one
// "line_added" per copied line, keeping the activity feed meaningful.
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, ProductCondition, QuotationActivityType, QuotationStatus } from "@/lib/supabase/types";
import type { RfqEnquiry } from "@/lib/admin/rfq";

type QuotationRow = Database["public"]["Tables"]["quotations"]["Row"];
type QuotationItemRow = Database["public"]["Tables"]["quotation_items"]["Row"];
type QuotationActivityRow = Database["public"]["Tables"]["quotation_activity"]["Row"];

export interface QuotationHeader {
  id: string;
  rfqId: string;
  quotationNumber: string;
  revision: number;
  revisionLabel: string;
  isCurrent: boolean;
  status: QuotationStatus;
  customerName: string;
  companyName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  customerAddress: string | null;
  country: string | null;
  customerReference: string | null;
  poNumber: string | null;
  quotationDate: string;
  validUntil: string | null;
  expectedDelivery: string | null;
  currency: string | null;
  exchangeRate: number | null;
  salesperson: string | null;
  preparedBy: string | null;
  approvedBy: string | null;
  incoterm: string | null;
  deliveryTerms: string | null;
  paymentTerms: string | null;
  shipmentTerms: string | null;
  warranty: string | null;
  countryOfOriginNote: string | null;
  shippingMethod: string | null;
  portOfLoading: string | null;
  portOfDestination: string | null;
  bankDetails: string | null;
  swiftCode: string | null;
  iban: string | null;
  signatureReference: string | null;
  notes: string | null;
  internalNotes: string | null;
  freight: number;
  packingCharges: number;
  insurance: number;
  otherCharges: number;
  roundingAdjustment: number;
  subtotal: number;
  totalDiscount: number;
  taxTotal: number;
  grandTotal: number;
  createdByEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapQuotationRow(row: QuotationRow): QuotationHeader {
  return {
    id: row.id,
    rfqId: row.rfq_id,
    quotationNumber: row.quotation_number,
    revision: row.revision,
    revisionLabel: row.revision_label,
    isCurrent: row.is_current,
    status: row.status,
    customerName: row.customer_name,
    companyName: row.company_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    country: row.country,
    customerReference: row.customer_reference,
    poNumber: row.po_number,
    quotationDate: row.quotation_date,
    validUntil: row.valid_until,
    expectedDelivery: row.expected_delivery,
    currency: row.currency,
    exchangeRate: row.exchange_rate,
    salesperson: row.salesperson,
    preparedBy: row.prepared_by,
    approvedBy: row.approved_by,
    incoterm: row.incoterm,
    deliveryTerms: row.delivery_terms,
    paymentTerms: row.payment_terms,
    shipmentTerms: row.shipment_terms,
    warranty: row.warranty,
    countryOfOriginNote: row.country_of_origin_note,
    shippingMethod: row.shipping_method,
    portOfLoading: row.port_of_loading,
    portOfDestination: row.port_of_destination,
    bankDetails: row.bank_details,
    swiftCode: row.swift_code,
    iban: row.iban,
    signatureReference: row.signature_reference,
    notes: row.notes,
    internalNotes: row.internal_notes,
    freight: row.freight,
    packingCharges: row.packing_charges,
    insurance: row.insurance,
    otherCharges: row.other_charges,
    roundingAdjustment: row.rounding_adjustment,
    subtotal: row.subtotal,
    totalDiscount: row.total_discount,
    taxTotal: row.tax_total,
    grandTotal: row.grand_total,
    createdByEmail: row.created_by_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface QuotationLineItem {
  id: string;
  quotationId: string;
  sortOrder: number;
  productId: string | null;
  partNumber: string | null;
  description: string;
  brand: string | null;
  quantity: number;
  unit: string | null;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  leadTime: string | null;
  countryOfOrigin: string | null;
  condition: ProductCondition | null;
  remarks: string | null;
  lineSubtotal: number;
  lineDiscountAmount: number;
  lineTaxAmount: number;
  lineTotal: number;
}

function mapItemRow(row: QuotationItemRow): QuotationLineItem {
  return {
    id: row.id,
    quotationId: row.quotation_id,
    sortOrder: row.sort_order,
    productId: row.product_id,
    partNumber: row.part_number,
    description: row.description,
    brand: row.brand,
    quantity: row.quantity,
    unit: row.unit,
    unitPrice: row.unit_price,
    discountPercent: row.discount_percent,
    taxPercent: row.tax_percent,
    leadTime: row.lead_time,
    countryOfOrigin: row.country_of_origin,
    condition: row.condition,
    remarks: row.remarks,
    lineSubtotal: row.line_subtotal,
    lineDiscountAmount: row.line_discount_amount,
    lineTaxAmount: row.line_tax_amount,
    lineTotal: row.line_total,
  };
}

export interface QuotationActivityEntry {
  id: string;
  eventType: QuotationActivityType;
  oldStatus: QuotationStatus | null;
  newStatus: QuotationStatus | null;
  details: Record<string, unknown>;
  actorEmail: string | null;
  createdAt: string;
}

function mapActivityRow(row: QuotationActivityRow): QuotationActivityEntry {
  return {
    id: row.id,
    eventType: row.event_type,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    details: row.details,
    actorEmail: row.actor_email,
    createdAt: row.created_at,
  };
}

export const getQuotationById = cache(async (id: string): Promise<QuotationHeader | undefined> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("quotations").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapQuotationRow(data) : undefined;
});

export const getCurrentQuotationForRfq = cache(async (rfqId: string): Promise<QuotationHeader | undefined> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("rfq_id", rfqId)
    .eq("is_current", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapQuotationRow(data) : undefined;
});

/** All revisions of one logical quotation, oldest first — for the revision-history panel. */
export async function listQuotationRevisions(quotationNumber: string): Promise<QuotationHeader[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("quotation_number", quotationNumber)
    .order("revision", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapQuotationRow);
}

export async function listQuotationItems(quotationId: string): Promise<QuotationLineItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", quotationId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapItemRow);
}

export async function listQuotationActivity(quotationId: string): Promise<QuotationActivityEntry[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quotation_activity")
    .select("*")
    .eq("quotation_id", quotationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapActivityRow);
}

const PAGE_SIZE = 25;

export interface QuotationListParams {
  page?: number;
  status?: QuotationStatus;
  query?: string;
}

export interface QuotationListResult {
  rows: QuotationHeader[];
  total: number;
  page: number;
  pageSize: number;
}

/** Current revisions only — historical revisions are reached via the quotation detail page, not the list. */
export async function listQuotations(params: QuotationListParams): Promise<QuotationListResult> {
  const supabase = await createServerSupabaseClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("quotations")
    .select("*", { count: "exact" })
    .eq("is_current", true)
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const q = params.query?.trim();
  if (q) {
    const safe = q.replace(/[,()]/g, "");
    query = query.or(
      `quotation_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,company_name.ilike.%${safe}%,customer_email.ilike.%${safe}%`,
    );
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { rows: (data ?? []).map(mapQuotationRow), total: count ?? 0, page, pageSize: PAGE_SIZE };
}

/**
 * Creates the first revision (0) of a quotation from an RFQ via the
 * create_quotation_from_rfq() RPC (migrations/0014), then — if the RFQ has
 * a linked product — prefills line 1 from it (editable afterward). Currency
 * comes from the linked product if present, otherwise left blank; never
 * hardcoded.
 */
export async function createQuotationFromRfq(
  rfq: RfqEnquiry,
  createdBy: string | null,
  createdByEmail: string | null,
): Promise<QuotationHeader> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("create_quotation_from_rfq", {
    p_rfq_id: rfq.id,
    p_currency: rfq.linkedProduct?.currency ?? null,
    p_created_by: createdBy,
    p_created_by_email: createdByEmail,
  });
  if (error) throw error;
  const quotation = mapQuotationRow(data as QuotationRow);

  if (rfq.linkedProduct) {
    const p = rfq.linkedProduct;
    await addQuotationItem(quotation.id, {
      productId: p.id,
      partNumber: p.oemPartNumber,
      description: p.description,
      brand: p.brandName,
      quantity: rfq.quantityRequired ? Number(rfq.quantityRequired) || 1 : 1,
      unit: null,
      unitPrice: p.price ?? 0,
      discountPercent: 0,
      taxPercent: 0,
      leadTime: null,
      countryOfOrigin: p.countryOfOrigin,
      condition: p.condition,
      remarks: null,
    });
  }

  return quotation;
}

export async function createQuotationRevision(
  quotationId: string,
  createdBy: string | null,
  createdByEmail: string | null,
): Promise<QuotationHeader> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("create_quotation_revision", {
    p_quotation_id: quotationId,
    p_created_by: createdBy,
    p_created_by_email: createdByEmail,
  });
  if (error) throw error;
  return mapQuotationRow(data as QuotationRow);
}

export async function changeQuotationStatus(
  quotationId: string,
  newStatus: QuotationStatus,
  changedBy: string | null,
  changedByEmail: string | null,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("change_quotation_status", {
    p_quotation_id: quotationId,
    p_new_status: newStatus,
    p_changed_by: changedBy,
    p_changed_by_email: changedByEmail,
  });
  if (error) throw error;
}

export interface QuotationHeaderUpdate {
  customerName: string;
  companyName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  customerAddress: string | null;
  country: string | null;
  customerReference: string | null;
  poNumber: string | null;
  validUntil: string | null;
  expectedDelivery: string | null;
  currency: string | null;
  exchangeRate: number | null;
  salesperson: string | null;
  preparedBy: string | null;
  approvedBy: string | null;
  incoterm: string | null;
  deliveryTerms: string | null;
  paymentTerms: string | null;
  shipmentTerms: string | null;
  warranty: string | null;
  countryOfOriginNote: string | null;
  shippingMethod: string | null;
  portOfLoading: string | null;
  portOfDestination: string | null;
  bankDetails: string | null;
  swiftCode: string | null;
  iban: string | null;
  signatureReference: string | null;
  notes: string | null;
  internalNotes: string | null;
  freight: number;
  packingCharges: number;
  insurance: number;
  otherCharges: number;
  roundingAdjustment: number;
}

export async function updateQuotationHeader(
  quotationId: string,
  fields: QuotationHeaderUpdate,
  actorId: string | null,
  actorEmail: string | null,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("quotations")
    .update({
      customer_name: fields.customerName,
      company_name: fields.companyName,
      customer_email: fields.customerEmail,
      customer_phone: fields.customerPhone,
      customer_address: fields.customerAddress,
      country: fields.country,
      customer_reference: fields.customerReference,
      po_number: fields.poNumber,
      valid_until: fields.validUntil,
      expected_delivery: fields.expectedDelivery,
      currency: fields.currency,
      exchange_rate: fields.exchangeRate,
      salesperson: fields.salesperson,
      prepared_by: fields.preparedBy,
      approved_by: fields.approvedBy,
      incoterm: fields.incoterm,
      delivery_terms: fields.deliveryTerms,
      payment_terms: fields.paymentTerms,
      shipment_terms: fields.shipmentTerms,
      warranty: fields.warranty,
      country_of_origin_note: fields.countryOfOriginNote,
      shipping_method: fields.shippingMethod,
      port_of_loading: fields.portOfLoading,
      port_of_destination: fields.portOfDestination,
      bank_details: fields.bankDetails,
      swift_code: fields.swiftCode,
      iban: fields.iban,
      signature_reference: fields.signatureReference,
      notes: fields.notes,
      internal_notes: fields.internalNotes,
      freight: fields.freight,
      packing_charges: fields.packingCharges,
      insurance: fields.insurance,
      other_charges: fields.otherCharges,
      rounding_adjustment: fields.roundingAdjustment,
    })
    .eq("id", quotationId);
  if (error) throw error;

  const { error: activityError } = await supabase
    .from("quotation_activity")
    .insert({ quotation_id: quotationId, event_type: "quotation_updated", actor_id: actorId, actor_email: actorEmail });
  if (activityError) throw activityError;
}

export interface QuotationItemInput {
  productId: string | null;
  partNumber: string | null;
  description: string;
  brand: string | null;
  quantity: number;
  unit: string | null;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  leadTime: string | null;
  countryOfOrigin: string | null;
  condition: ProductCondition | null;
  remarks: string | null;
}

const SORT_ORDER_STEP = 1000;

export async function addQuotationItem(
  quotationId: string,
  item: QuotationItemInput,
  actor?: { id: string | null; email: string | null },
): Promise<QuotationLineItem> {
  const supabase = await createServerSupabaseClient();

  const { data: last } = await supabase
    .from("quotation_items")
    .select("sort_order")
    .eq("quotation_id", quotationId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (last?.sort_order ?? 0) + SORT_ORDER_STEP;

  const { data, error } = await supabase
    .from("quotation_items")
    .insert({
      quotation_id: quotationId,
      sort_order: nextSortOrder,
      product_id: item.productId,
      part_number: item.partNumber,
      description: item.description,
      brand: item.brand,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unitPrice,
      discount_percent: item.discountPercent,
      tax_percent: item.taxPercent,
      lead_time: item.leadTime,
      country_of_origin: item.countryOfOrigin,
      condition: item.condition,
      remarks: item.remarks,
    })
    .select("*")
    .single();
  if (error) throw error;

  if (actor) {
    await supabase.from("quotation_activity").insert({
      quotation_id: quotationId,
      event_type: "line_added",
      actor_id: actor.id,
      actor_email: actor.email,
      details: { part_number: item.partNumber, description: item.description },
    });
  }

  return mapItemRow(data);
}

export async function updateQuotationItem(itemId: string, item: QuotationItemInput): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("quotation_items")
    .update({
      product_id: item.productId,
      part_number: item.partNumber,
      description: item.description,
      brand: item.brand,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unitPrice,
      discount_percent: item.discountPercent,
      tax_percent: item.taxPercent,
      lead_time: item.leadTime,
      country_of_origin: item.countryOfOrigin,
      condition: item.condition,
      remarks: item.remarks,
    })
    .eq("id", itemId);
  if (error) throw error;
}

export async function deleteQuotationItem(
  itemId: string,
  quotationId: string,
  actor: { id: string | null; email: string | null },
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("quotation_items")
    .select("part_number, description")
    .eq("id", itemId)
    .maybeSingle();

  const { error } = await supabase.from("quotation_items").delete().eq("id", itemId);
  if (error) throw error;

  await supabase.from("quotation_activity").insert({
    quotation_id: quotationId,
    event_type: "line_removed",
    actor_id: actor.id,
    actor_email: actor.email,
    details: existing ? { part_number: existing.part_number, description: existing.description } : {},
  });
}

/** Copies a line immediately after itself, using the midpoint sort_order — no renumbering of other rows needed. */
export async function duplicateQuotationItem(
  itemId: string,
  actor: { id: string | null; email: string | null },
): Promise<QuotationLineItem> {
  const supabase = await createServerSupabaseClient();

  const { data: original, error: fetchError } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("id", itemId)
    .single();
  if (fetchError) throw fetchError;

  const { data: next } = await supabase
    .from("quotation_items")
    .select("sort_order")
    .eq("quotation_id", original.quotation_id)
    .gt("sort_order", original.sort_order)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const newSortOrder = next ? (original.sort_order + next.sort_order) / 2 : original.sort_order + SORT_ORDER_STEP;

  const { data, error } = await supabase
    .from("quotation_items")
    .insert({
      quotation_id: original.quotation_id,
      sort_order: newSortOrder,
      product_id: original.product_id,
      part_number: original.part_number,
      description: original.description,
      brand: original.brand,
      quantity: original.quantity,
      unit: original.unit,
      unit_price: original.unit_price,
      discount_percent: original.discount_percent,
      tax_percent: original.tax_percent,
      lead_time: original.lead_time,
      country_of_origin: original.country_of_origin,
      condition: original.condition,
      remarks: original.remarks,
    })
    .select("*")
    .single();
  if (error) throw error;

  await supabase.from("quotation_activity").insert({
    quotation_id: original.quotation_id,
    event_type: "line_added",
    actor_id: actor.id,
    actor_email: actor.email,
    details: { part_number: original.part_number, description: original.description, duplicated: true },
  });

  return mapItemRow(data);
}

export interface RfqLinkedQuotationEvent {
  quotationId: string;
  revisionLabel: string;
  eventType: QuotationActivityType;
  oldStatus: QuotationStatus | null;
  newStatus: QuotationStatus | null;
  actorEmail: string | null;
  createdAt: string;
}

/**
 * The meaningful quotation events (creation, status changes, revisions) for
 * merging into an RFQ's own activity timeline. Line-item add/remove events
 * are deliberately excluded here to keep the RFQ-level view high-level —
 * they're still visible on the quotation's own activity panel.
 */
export async function listQuotationActivityForRfq(rfqId: string): Promise<RfqLinkedQuotationEvent[]> {
  const supabase = await createServerSupabaseClient();
  const { data: quotationRows, error: qErr } = await supabase
    .from("quotations")
    .select("id, revision_label")
    .eq("rfq_id", rfqId);
  if (qErr) throw qErr;
  if (!quotationRows || quotationRows.length === 0) return [];

  const labelById = new Map(quotationRows.map((q) => [q.id, q.revision_label]));
  const quotationIds = quotationRows.map((q) => q.id);

  const { data, error } = await supabase
    .from("quotation_activity")
    .select("*")
    .in("quotation_id", quotationIds)
    .in("event_type", ["quotation_created", "status_changed", "revision_created", "email_sent"])
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    quotationId: row.quotation_id,
    revisionLabel: labelById.get(row.quotation_id) ?? "",
    eventType: row.event_type,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    actorEmail: row.actor_email,
    createdAt: row.created_at,
  }));
}

/** Renumbers sort_order for every item in the given order, spaced 1000 apart. */
export async function reorderQuotationItems(quotationId: string, orderedItemIds: string[]): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await Promise.all(
    orderedItemIds.map((id, index) =>
      supabase
        .from("quotation_items")
        .update({ sort_order: (index + 1) * SORT_ORDER_STEP })
        .eq("id", id)
        .eq("quotation_id", quotationId),
    ),
  );
}

export interface QuotationEmailLogEntry {
  id: string;
  recipient: string;
  subject: string;
  deliveryStatus: Database["public"]["Tables"]["quotation_email_log"]["Row"]["delivery_status"];
  providerMessageId: string | null;
  sentByEmail: string | null;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export async function listQuotationEmailLog(quotationId: string): Promise<QuotationEmailLogEntry[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quotation_email_log")
    .select("*")
    .eq("quotation_id", quotationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    recipient: row.recipient,
    subject: row.subject,
    deliveryStatus: row.delivery_status,
    providerMessageId: row.provider_message_id,
    sentByEmail: row.sent_by_email,
    sentAt: row.sent_at,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  }));
}
