import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { IconList } from "@/components/shared/IconList";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Products — Leos Trading FZE",
  description:
    "Genuine OEM and quality aftermarket parts across trucks, construction equipment, generators and more — sourced, stocked and exported from the UAE.",
};

const SOURCING_CAPABILITY = [
  "Global procurement network across generator, truck and construction equipment lines",
  "Dedicated dead-stock and obsolete part-number specialists",
  "Bin-tracked UAE warehousing with full part-number traceability",
];

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Product Categories"
        title="OEM & Aftermarket Parts, By Category"
        description="Genuine OEM and quality aftermarket parts across trucks, construction equipment, generators and more — sourced, stocked and exported from the UAE."
      />

      <CategoryGrid showHeading={false} />

      <section className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10">
            <div className="eyebrow">Genuine &amp; Aftermarket Supply</div>
            <h2 className="mt-3.5">Two supply options, disclosed upfront</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2">
            <div className="bg-bg-0 p-7">
              <h4>Genuine OEM</h4>
              <p className="mt-2.5 text-sm">
                Manufacturer-sourced parts with full traceability. Recommended where warranty or certification requirements apply.
              </p>
            </div>
            <div className="bg-bg-0 p-7">
              <h4>Aftermarket</h4>
              <p className="mt-2.5 text-sm">
                Cross-referenced equivalents, typically faster to source and lower cost where genuine OEM is unavailable or discontinued.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 gap-10 min-[901px]:grid-cols-[1fr_1.3fr] min-[901px]:items-center min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Sourcing Capability</div>
            <h2 className="mt-3.5">Built to find parts others can&apos;t</h2>
          </div>
          <IconList items={SOURCING_CAPABILITY} />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
