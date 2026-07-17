import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { IconList } from "@/components/shared/IconList";
import { StepList } from "@/components/shared/StepList";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Export — Leos Trading FZE",
  description: "Leos Trading FZE exports OEM and aftermarket parts worldwide from Sharjah, UAE, with documentation support for customs clearance.",
};

const CAPABILITIES = [
  "Commercial invoice and packing list preparation",
  "Certificate of origin support",
  "Freight coordination — air and sea",
  "Export crating for oversized components",
];

const SHIPPING_STEPS = [
  { number: "01", title: "RFQ Confirmed", description: "Availability, pricing and condition agreed." },
  { number: "02", title: "Terms Agreed", description: "Payment and Incoterms confirmed." },
  { number: "03", title: "Export Documentation", description: "Invoice, packing list and certificates prepared." },
  { number: "04", title: "Dispatch & Tracking", description: "Shipped from the UAE with tracking provided." },
];

export default function ExportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Export"
        title="Export from the UAE"
        description="Leos Trading FZE exports OEM and aftermarket parts worldwide from Sharjah, UAE, with documentation support for customs clearance."
      />

      <section className="py-16">
        <div className="wrap grid grid-cols-1 items-center gap-10 min-[901px]:grid-cols-2 min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Capability</div>
            <h2 className="mt-3.5">Documentation and logistics, handled</h2>
            <div className="mt-6">
              <IconList items={CAPABILITIES} />
            </div>
          </div>
          <ImagePlaceholder label="Export packing / logistics operations" />
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10">
            <div className="eyebrow">Process</div>
            <h2 className="mt-3.5">Shipping process</h2>
          </div>
          <StepList steps={SHIPPING_STEPS} />
        </div>
      </section>

      <CtaBanner
        heading={
          <>
            Shipping to your region?
            <br />
            Confirm export terms.
          </>
        }
        primaryHref="/contact"
        primaryLabel="Request a Quote"
      />
    </>
  );
}
