import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { getQuotationForCustomerToken } from "@/lib/quotations/customer-access";

export const metadata: Metadata = {
  title: "Quotation — Leos Trading FZE",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 border-b border-line py-2.5 text-sm">
      <div className={labelClass}>{label}</div>
      <div className="text-text-0">{value}</div>
    </div>
  );
}

export default async function CustomerQuotationPage({ params }: PageProps) {
  const { token } = await params;
  const quotation = await getQuotationForCustomerToken(token);

  if (!quotation) {
    return (
      <div>
        <PageHeader eyebrow="Quotation" title="Link not valid" />
        <div className="wrap py-16">
          <p className="max-w-[60ch] text-text-1">
            This quotation link is no longer valid. It may have expired or been revoked. Please contact us if you
            need a new copy of your quotation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Quotation"
        title={quotation.revisionLabel}
        description={`Prepared for ${quotation.customerName}${quotation.companyName ? ` — ${quotation.companyName}` : ""}`}
      />

      <div className="wrap py-12">
        <div className="grid grid-cols-1 gap-8 min-[901px]:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-8">
            <div className="rounded-m border border-line bg-bg-1 p-6">
              <h3 className="text-[16px]">Details</h3>
              <div className="mt-3">
                <Field label="Customer" value={quotation.customerName} />
                <Field label="Company" value={quotation.companyName} />
                <Field label="Address" value={quotation.customerAddress} />
                <Field label="Country" value={quotation.country} />
                <Field label="Customer Reference" value={quotation.customerReference} />
                <Field label="PO Number" value={quotation.poNumber} />
                <Field label="Quotation Date" value={quotation.quotationDate} />
                <Field label="Valid Until" value={quotation.validUntil} />
                <Field label="Expected Delivery" value={quotation.expectedDelivery} />
                <Field label="Currency" value={quotation.currency} />
                <Field label="Exchange Rate" value={quotation.exchangeRate ? String(quotation.exchangeRate) : null} />
                <Field label="Incoterm" value={quotation.incoterm} />
                <Field label="Delivery Terms" value={quotation.deliveryTerms} />
                <Field label="Payment Terms" value={quotation.paymentTerms} />
                <Field label="Shipment Terms" value={quotation.shipmentTerms} />
                <Field label="Warranty" value={quotation.warranty} />
                <Field label="Country of Origin Note" value={quotation.countryOfOriginNote} />
                <Field label="Shipping Method" value={quotation.shippingMethod} />
                <Field label="Port of Loading" value={quotation.portOfLoading} />
                <Field label="Port of Destination" value={quotation.portOfDestination} />
              </div>
              {quotation.notes ? (
                <div className="mt-4 border-t border-line pt-4">
                  <div className={labelClass}>Notes</div>
                  <p className="mt-2 text-sm text-text-1">{quotation.notes}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-m border border-line bg-bg-1 p-6">
              <h3 className="text-[16px]">Line Items</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
                      <th className="px-2 py-2 font-medium">#</th>
                      <th className="px-2 py-2 font-medium">Part / Description</th>
                      <th className="px-2 py-2 font-medium">Qty</th>
                      <th className="px-2 py-2 font-medium">Unit Price</th>
                      <th className="px-2 py-2 font-medium">Disc %</th>
                      <th className="px-2 py-2 font-medium">Tax %</th>
                      <th className="px-2 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item, i) => (
                      <tr key={i} className="border-b border-line last:border-0">
                        <td className="px-2 py-2 text-text-2">{i + 1}</td>
                        <td className="px-2 py-2">
                          <div className="text-text-0">{item.description}</div>
                          <div className="text-[12px] text-text-2">
                            {[item.partNumber, item.brand, item.countryOfOrigin].filter(Boolean).join(" · ")}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-text-1">
                          {item.quantity} {item.unit ?? ""}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-text-1">{fmt(item.unitPrice)}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-text-1">{item.discountPercent}%</td>
                        <td className="whitespace-nowrap px-2 py-2 text-text-1">{item.taxPercent}%</td>
                        <td className="whitespace-nowrap px-2 py-2 font-medium text-text-0">{fmt(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="rounded-m border border-line bg-bg-1 p-6">
              <h3 className="text-[16px]">Totals</h3>
              <dl className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><dt className="text-text-2">Subtotal</dt><dd>{fmt(quotation.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-2">Discount</dt><dd>-{fmt(quotation.totalDiscount)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-2">Freight</dt><dd>{fmt(quotation.freight)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-2">Packing Charges</dt><dd>{fmt(quotation.packingCharges)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-2">Insurance</dt><dd>{fmt(quotation.insurance)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-2">Other Charges</dt><dd>{fmt(quotation.otherCharges)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-2">Tax</dt><dd>{fmt(quotation.taxTotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-2">Rounding</dt><dd>{fmt(quotation.roundingAdjustment)}</dd></div>
                <div className="flex justify-between border-t border-line pt-2 text-[15px] font-medium text-text-0">
                  <dt>Grand Total {quotation.currency ? `(${quotation.currency})` : ""}</dt>
                  <dd>{fmt(quotation.grandTotal)}</dd>
                </div>
              </dl>
            </div>

            {quotation.bankDetails || quotation.swiftCode || quotation.iban ? (
              <div className="rounded-m border border-line bg-bg-1 p-6">
                <h3 className="text-[16px]">Payment Details</h3>
                <div className="mt-3">
                  <Field label="Bank Details" value={quotation.bankDetails} />
                  <Field label="SWIFT" value={quotation.swiftCode} />
                  <Field label="IBAN" value={quotation.iban} />
                </div>
              </div>
            ) : null}

            {quotation.signatureReference ? (
              <div className="rounded-m border border-line bg-bg-1 p-6">
                <p className="text-[13px] text-text-2">{quotation.signatureReference}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
