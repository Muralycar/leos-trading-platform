import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { IconList } from "@/components/shared/IconList";
import { StepList } from "@/components/shared/StepList";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { StatStrip } from "@/components/home/StatStrip";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "About — Leos Trading FZE",
  description: "Leos Trading FZE is a UAE-based industrial trading and sourcing partner supplying OEM and aftermarket parts across generator, truck, construction, mining, marine and industrial applications.",
};

const WHAT_WE_DO = [
  "Genuine and aftermarket parts supply",
  "Dead-stock, obsolete and hard-to-find part sourcing",
  "Export documentation and logistics coordination",
  "Sales, service and rental support",
];

const HOW_WE_WORK_STEPS = [
  { number: "01", title: "Send Part Number or Equipment Details", description: "Via search, WhatsApp, email or RFQ form." },
  { number: "02", title: "We Confirm Availability", description: "Stock, sourcing lead time, or aftermarket alternative." },
  { number: "03", title: "Quotation & Terms", description: "Pricing, condition and delivery terms confirmed." },
  { number: "04", title: "Dispatch & Export Documentation", description: "Packed, documented and shipped from the UAE." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A UAE-based industrial trading and sourcing partner"
        description="Leos Trading FZE supplies OEM and aftermarket parts across generator, truck, construction equipment, mining, marine and industrial applications — from stock held in the UAE and through our global sourcing network."
      />

      <section className="py-16">
        <div className="wrap grid grid-cols-1 items-center gap-10 min-[901px]:grid-cols-2 min-[901px]:gap-16">
          <ImagePlaceholder label="Warehouse operations — bin-tracked racking" />
          <div>
            <div className="eyebrow">What We Do</div>
            <h2 className="mt-3.5">Supply, sourcing and export — under one operation</h2>
            <div className="mt-6">
              <IconList items={WHAT_WE_DO} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap mb-10">
          <div className="eyebrow">Process</div>
          <h2 className="mt-3.5">How we work</h2>
        </div>
        <div className="wrap">
          <StepList steps={HOW_WE_WORK_STEPS} />
        </div>
      </section>

      <StatStrip />

      <CtaBanner
        heading={
          <>
            Have a requirement?
            <br />
            Talk to our team.
          </>
        }
        primaryHref="/contact"
        primaryLabel="Contact Us"
      />
    </>
  );
}
