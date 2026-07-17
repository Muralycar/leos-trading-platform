import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { StepList } from "@/components/shared/StepList";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { CtaBanner } from "@/components/home/CtaBanner";
import { RfqForm } from "@/components/rfq/RfqForm";

export const metadata: Metadata = {
  title: "Sourcing — Leos Trading FZE",
  description: "Global procurement for hard-to-find and obsolete parts, genuine OEM and aftermarket supply, sourced through Leos Trading's network.",
};

const PROCUREMENT_STEPS = [
  { number: "01", title: "Part Identified", description: "Part number, cross-reference or equipment details received." },
  { number: "02", title: "Network Search", description: "Checked against our stock and partner supplier network." },
  { number: "03", title: "Availability Confirmed", description: "Condition, lead time and pricing confirmed in writing." },
  { number: "04", title: "Quotation Issued", description: "RFQ delivered with export terms." },
];

export default function SourcingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sourcing"
        title="Global procurement for parts that are hard to move"
        description="Genuine and aftermarket options, hard-to-find and obsolete parts, sourced through our global procurement network."
      />

      <section id="request" className="py-16">
        <div className="wrap grid grid-cols-1 gap-12 min-[901px]:grid-cols-[1fr_1.3fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Request a Part</div>
            <h2 className="mt-3.5">Send the part number or equipment details</h2>
            <p className="mt-3.5 text-[15px]">
              Availability subject to confirmation. Include as much detail as possible — OEM part number, equipment
              make/model, or a photo of the part — for the fastest response.
            </p>
          </div>
          <div className="rounded-m border border-line bg-bg-1 p-8">
            <RfqForm variant="sourcing" />
          </div>
        </div>
      </section>

      <section id="hard-to-find" className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 items-center gap-10 min-[901px]:grid-cols-2 min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Hard-to-Find Parts</div>
            <h2 className="mt-3.5">If it carries a part number, we can search for it</h2>
            <p className="mt-3.5 text-[15px]">
              Discontinued lines, low-volume regional variants, and parts no longer listed by the manufacturer — our
              sourcing network extends beyond what&apos;s in our own warehousing.
            </p>
          </div>
          <ImagePlaceholder label="Hard-to-find parts — warehouse search" />
        </div>
      </section>

      <section id="obsolete" className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 items-center gap-10 min-[901px]:grid-cols-2 min-[901px]:gap-16">
          <ImagePlaceholder label="Obsolete / dead-stock inventory" className="min-[901px]:order-2" />
          <div>
            <div className="eyebrow">Obsolete Parts</div>
            <h2 className="mt-3.5">Dead-stock and discontinued inventory</h2>
            <p className="mt-3.5 text-[15px]">
              We hold and actively acquire obsolete and discontinued part numbers that other suppliers have written off
              — condition-graded and disclosed at quotation.
            </p>
          </div>
        </div>
      </section>

      <section id="genuine-aftermarket" className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10">
            <div className="eyebrow">Genuine &amp; Aftermarket Supply</div>
            <h2 className="mt-3.5">Two supply options, disclosed upfront</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2">
            <div className="bg-bg-0 p-7">
              <h4>Genuine OEM</h4>
              <p className="mt-2.5 text-sm">
                Manufacturer-sourced parts with full traceability. Recommended where warranty or certification
                requirements apply.
              </p>
            </div>
            <div className="bg-bg-0 p-7">
              <h4>Aftermarket</h4>
              <p className="mt-2.5 text-sm">
                Cross-referenced equivalents, typically faster to source and lower cost where genuine OEM is
                unavailable or discontinued.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="procurement" className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10">
            <div className="eyebrow">Global Procurement</div>
            <h2 className="mt-3.5">How we source</h2>
          </div>
          <StepList steps={PROCUREMENT_STEPS} />
        </div>
      </section>

      <CtaBanner primaryHref="#request" />
    </>
  );
}
