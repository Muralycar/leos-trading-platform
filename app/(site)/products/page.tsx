import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { IconList } from "@/components/shared/IconList";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Industrial & Heavy Equipment Spare Parts UAE | Leos Trading",
  description:
    "OEM and aftermarket spare parts for trucks, construction equipment, generators, engines, marine and industrial applications, stocked or sourced from the UAE.",
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
          <div className="mb-10 max-w-[680px]">
            <div className="eyebrow">Specialist Sourcing</div>
            <h2 className="mt-3.5">Parts support for more specific requirements</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 min-[801px]:grid-cols-2">
            <Link
              href="/generator-spare-parts-uae"
              className="group rounded-m border border-line bg-bg-1 p-7 transition-colors hover:border-brass"
            >
              <div className="eyebrow">Power Generation</div>
              <h3 className="mt-3.5">Generator Spare Parts UAE</h3>
              <p className="mt-3 text-sm">
                Generator engine, alternator, control and electrical components for genuine OEM, aftermarket and
                difficult-to-source requirements.
              </p>
              <span className="mt-5 inline-flex text-sm text-brass group-hover:underline">Explore generator parts →</span>
            </Link>
            <Link
              href="/obsolete-hard-to-find-parts-uae"
              className="group rounded-m border border-line bg-bg-1 p-7 transition-colors hover:border-brass"
            >
              <div className="eyebrow">Parts Sourcing</div>
              <h3 className="mt-3.5">Obsolete &amp; Hard-to-Find Parts</h3>
              <p className="mt-3 text-sm">
                A focused search route for discontinued, superseded, old-stock and legacy part numbers across
                industrial equipment categories.
              </p>
              <span className="mt-5 inline-flex text-sm text-brass group-hover:underline">Explore sourcing support →</span>
            </Link>
          </div>
        </div>
      </section>

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
