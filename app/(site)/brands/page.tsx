import type { Metadata } from "next";
import { LiveBrandCards } from "@/components/brands/LiveBrandCards";
import { SourcingBrandGroups } from "@/components/brands/SourcingBrandGroups";
import { RfqForm } from "@/components/rfq/RfqForm";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Brands — Leos Trading FZE",
  description:
    "Live Iveco, Kobelco and Kohler OEM inventory in the UAE, plus Caterpillar, Komatsu, Volvo, Cummins and 40+ other brands sourced on request through our global procurement network.",
};

export default function BrandsPage() {
  return (
    <>
      <div className="border-b border-line bg-bg-1 py-14">
        <div className="wrap">
          <div className="eyebrow">Brands</div>
          <h1 className="mt-3.5 text-[clamp(35px,5.25vw,66px)]">Live inventory and global sourcing, by manufacturer</h1>
          <p className="mt-4 max-w-[60ch] text-[16px]">
            Genuine OEM stock held in UAE warehousing today, plus the manufacturers we source on request through our
            global procurement network.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[640px]">
            <div className="eyebrow">Live Inventory</div>
            <h2 className="mt-3.5">Brands we hold in stock</h2>
          </div>
          <LiveBrandCards />
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[640px]">
            <div className="eyebrow">Brands We Supply &amp; Source</div>
            <h2 className="mt-3.5">Sourced on request, by category</h2>
            <p className="mt-4 text-[15px] text-text-1">
              Sourced through our global procurement network on request — not held as physical Leos Trading stock
              unless listed under Live Inventory above.
            </p>
          </div>
          <SourcingBrandGroups />
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 gap-10 min-[901px]:grid-cols-[1fr_1.3fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Can&apos;t Find Your Brand?</div>
            <h2 className="mt-3.5">Send us the part number or equipment details</h2>
            <p className="mt-3.5 text-[15px]">
              We source multi-brand parts across most major manufacturers — genuine OEM, aftermarket, obsolete and
              hard-to-find. Our sourcing team confirms availability and pricing.
            </p>
          </div>
          <div className="rounded-m border border-line bg-bg-1 p-8">
            <RfqForm variant="sourcing" submitLabel="Request a Part" />
          </div>
        </div>
      </section>

      <CtaBanner
        heading={
          <>
            Don&apos;t see your brand?
            <br />
            Ask our sourcing team.
          </>
        }
      />
    </>
  );
}
