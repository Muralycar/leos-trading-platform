// Client-side mirror of the server's GENERATED ALWAYS AS formula in
// migrations/0014_quotations.sql, used only for instant UI feedback while
// editing. Never authoritative — Postgres `numeric` arithmetic there is
// exact decimal; this JS approximation is display-only and is always
// replaced by the server's real numbers after every save.
export interface LineItemCalcInput {
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export interface LineItemCalcResult {
  lineSubtotal: number;
  lineDiscountAmount: number;
  lineTaxAmount: number;
  lineTotal: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calcLineItem(input: LineItemCalcInput): LineItemCalcResult {
  const lineSubtotal = round2(input.quantity * input.unitPrice);
  const lineDiscountAmount = round2((input.quantity * input.unitPrice * input.discountPercent) / 100);
  const taxable = lineSubtotal - lineDiscountAmount;
  const lineTaxAmount = round2((taxable * input.taxPercent) / 100);
  const lineTotal = lineSubtotal - lineDiscountAmount + lineTaxAmount;
  return { lineSubtotal, lineDiscountAmount, lineTaxAmount, lineTotal };
}

export interface QuotationTotalsInput {
  items: LineItemCalcResult[];
  freight: number;
  packingCharges: number;
  insurance: number;
  otherCharges: number;
  roundingAdjustment: number;
}

export interface QuotationTotalsResult {
  subtotal: number;
  totalDiscount: number;
  taxTotal: number;
  grandTotal: number;
}

export function calcQuotationTotals(input: QuotationTotalsInput): QuotationTotalsResult {
  const subtotal = round2(input.items.reduce((sum, i) => sum + i.lineSubtotal, 0));
  const totalDiscount = round2(input.items.reduce((sum, i) => sum + i.lineDiscountAmount, 0));
  const taxTotal = round2(input.items.reduce((sum, i) => sum + i.lineTaxAmount, 0));
  const grandTotal = round2(
    subtotal -
      totalDiscount +
      taxTotal +
      input.freight +
      input.packingCharges +
      input.insurance +
      input.otherCharges +
      input.roundingAdjustment,
  );
  return { subtotal, totalDiscount, taxTotal, grandTotal };
}

/** The only statuses in which line items/header fields may be edited — locked statuses require Create Revision. */
export const EDITABLE_QUOTATION_STATUSES = ["draft", "under_review", "revision_requested"] as const;

export function isQuotationEditable(status: string): boolean {
  return (EDITABLE_QUOTATION_STATUSES as readonly string[]).includes(status);
}
