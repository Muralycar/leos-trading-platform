// Customer-facing quotation access: token generation/validation, and the
// ONE data-access path allowed to serve quotation data to an unauthenticated
// visitor. Every read here uses an explicit, hand-picked column list —
// never select("*") — so internal_notes, created_by, prepared_by,
// approved_by, and anything email-log-related can never leak, even by
// future accident.
import { randomBytes, createHash } from "node:crypto";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { ProductCondition } from "@/lib/supabase/types";

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Generates a fresh access token for a quotation revision. Called from an
 * already-admin-authenticated server action, so this uses the normal
 * cookie-scoped client — RLS (is_admin()) covers the write same as any
 * other admin insert. Only the raw token is ever returned; only its hash
 * is stored.
 */
export async function createQuotationAccessToken(
  quotationId: string,
  validUntil: string | null,
  createdBy: string | null,
  createdByEmail: string | null,
): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const rawToken = randomBytes(32).toString("hex");

  const { error } = await supabase.from("quotation_access_tokens").insert({
    quotation_id: quotationId,
    token_hash: hashToken(rawToken),
    created_by: createdBy,
    created_by_email: createdByEmail,
    expires_at: validUntil,
  });
  if (error) throw error;

  return rawToken;
}

export interface QuotationAccessTokenSummary {
  id: string;
  createdByEmail: string | null;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

export async function listQuotationAccessTokens(quotationId: string): Promise<QuotationAccessTokenSummary[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quotation_access_tokens")
    .select("id, created_by_email, created_at, expires_at, revoked_at")
    .eq("quotation_id", quotationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    createdByEmail: row.created_by_email,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  }));
}

export async function revokeQuotationAccessToken(tokenId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("quotation_access_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Public (unauthenticated) read path
// ---------------------------------------------------------------------------

export interface CustomerQuotationItem {
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

export interface CustomerQuotation {
  quotationNumber: string;
  revisionLabel: string;
  customerName: string;
  companyName: string | null;
  customerAddress: string | null;
  country: string | null;
  customerReference: string | null;
  poNumber: string | null;
  quotationDate: string;
  validUntil: string | null;
  expectedDelivery: string | null;
  currency: string | null;
  exchangeRate: number | null;
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
  freight: number;
  packingCharges: number;
  insurance: number;
  otherCharges: number;
  roundingAdjustment: number;
  subtotal: number;
  totalDiscount: number;
  taxTotal: number;
  grandTotal: number;
  items: CustomerQuotationItem[];
}

/**
 * Resolves a raw URL token to its quotation, or null if the token doesn't
 * exist, is revoked, or has expired — all three cases are indistinguishable
 * to the caller, so the customer-facing page can never disclose which one
 * occurred. There is no anon/RLS path to quotations at all (RLS is
 * admin-only), so this necessarily uses the service-role client; token
 * validity is the sole authorization gate, checked before any quotation
 * data is touched.
 */
export async function getQuotationForCustomerToken(rawToken: string): Promise<CustomerQuotation | null> {
  if (!/^[0-9a-f]{64}$/.test(rawToken)) return null;

  const supabase = createServiceRoleClient();
  const tokenHash = hashToken(rawToken);

  const { data: tokenRow, error: tokenError } = await supabase
    .from("quotation_access_tokens")
    .select("quotation_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (tokenError) throw tokenError;
  if (!tokenRow) return null;
  if (tokenRow.revoked_at) return null;
  if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) return null;

  const CUSTOMER_SAFE_COLUMNS =
    "quotation_number, revision_label, customer_name, company_name, customer_address, country, " +
    "customer_reference, po_number, quotation_date, valid_until, expected_delivery, currency, exchange_rate, " +
    "incoterm, delivery_terms, payment_terms, shipment_terms, warranty, country_of_origin_note, shipping_method, " +
    "port_of_loading, port_of_destination, bank_details, swift_code, iban, signature_reference, notes, " +
    "freight, packing_charges, insurance, other_charges, rounding_adjustment, subtotal, total_discount, " +
    "tax_total, grand_total";

  const { data: q, error: qError } = await supabase
    .from("quotations")
    .select(CUSTOMER_SAFE_COLUMNS)
    .eq("id", tokenRow.quotation_id)
    .maybeSingle();
  if (qError) throw qError;
  if (!q) return null;

  const { data: itemRows, error: itemsError } = await supabase
    .from("quotation_items")
    .select(
      "part_number, description, brand, quantity, unit, unit_price, discount_percent, tax_percent, lead_time, country_of_origin, condition, remarks, line_subtotal, line_discount_amount, line_tax_amount, line_total",
    )
    .eq("quotation_id", tokenRow.quotation_id)
    .order("sort_order", { ascending: true });
  if (itemsError) throw itemsError;

  // Supabase's generic .select(joinedColumnList) types the row as `any` for
  // an explicit string list; narrow it back to the safe shape by hand
  // rather than trusting an inferred type here.
  const row = q as unknown as {
    quotation_number: string;
    revision_label: string;
    customer_name: string;
    company_name: string | null;
    customer_address: string | null;
    country: string | null;
    customer_reference: string | null;
    po_number: string | null;
    quotation_date: string;
    valid_until: string | null;
    expected_delivery: string | null;
    currency: string | null;
    exchange_rate: number | null;
    incoterm: string | null;
    delivery_terms: string | null;
    payment_terms: string | null;
    shipment_terms: string | null;
    warranty: string | null;
    country_of_origin_note: string | null;
    shipping_method: string | null;
    port_of_loading: string | null;
    port_of_destination: string | null;
    bank_details: string | null;
    swift_code: string | null;
    iban: string | null;
    signature_reference: string | null;
    notes: string | null;
    freight: number;
    packing_charges: number;
    insurance: number;
    other_charges: number;
    rounding_adjustment: number;
    subtotal: number;
    total_discount: number;
    tax_total: number;
    grand_total: number;
  };

  return {
    quotationNumber: row.quotation_number,
    revisionLabel: row.revision_label,
    customerName: row.customer_name,
    companyName: row.company_name,
    customerAddress: row.customer_address,
    country: row.country,
    customerReference: row.customer_reference,
    poNumber: row.po_number,
    quotationDate: row.quotation_date,
    validUntil: row.valid_until,
    expectedDelivery: row.expected_delivery,
    currency: row.currency,
    exchangeRate: row.exchange_rate,
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
    freight: row.freight,
    packingCharges: row.packing_charges,
    insurance: row.insurance,
    otherCharges: row.other_charges,
    roundingAdjustment: row.rounding_adjustment,
    subtotal: row.subtotal,
    totalDiscount: row.total_discount,
    taxTotal: row.tax_total,
    grandTotal: row.grand_total,
    items: (itemRows ?? []).map((item) => ({
      partNumber: item.part_number,
      description: item.description,
      brand: item.brand,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unit_price,
      discountPercent: item.discount_percent,
      taxPercent: item.tax_percent,
      leadTime: item.lead_time,
      countryOfOrigin: item.country_of_origin,
      condition: item.condition,
      remarks: item.remarks,
      lineSubtotal: item.line_subtotal,
      lineDiscountAmount: item.line_discount_amount,
      lineTaxAmount: item.line_tax_amount,
      lineTotal: item.line_total,
    })),
  };
}
