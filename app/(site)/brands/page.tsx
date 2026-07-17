import type { Metadata } from "next";
import { BrandDirectory } from "@/components/brands/BrandDirectory";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Brands — Leos Trading FZE",
  description: "Brands live in Leos Trading's UAE inventory today, grouped by equipment category, plus our multi-brand sourcing network.",
};

export default function BrandsPage() {
  return (
    <>
      <div className="border-b border-line bg-bg-1 py-14">
        <div className="wrap">
          <div className="eyebrow">Brands</div>
          <h1 className="mt-3.5">Live inventory and sourcing network, by category</h1>
          <p className="mt-4 max-w-[60ch] text-[16px]">
            Genuine OEM stock held in UAE warehousing today, plus the manufacturers we source on request through our
            global procurement network.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="wrap">
          <BrandDirectory />
          <p className="mt-7 max-w-[60ch] text-[15px]">
            Don&apos;t see your brand? We source multi-brand parts across most major manufacturers — send us your part
            number or equipment details.
          </p>
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
