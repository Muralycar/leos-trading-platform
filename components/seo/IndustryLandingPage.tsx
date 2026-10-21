import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { CtaBanner } from "@/components/home/CtaBanner";

type IndustryLandingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  brands: string[];
  applications: string[];
  capabilities: string[];
};

export function IndustryLandingPage({
  eyebrow,
  title,
  description,
  intro,
  brands,
  applications,
  capabilities,
}: IndustryLandingPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <section className="py-16">
        <div className="wrap grid grid-cols-1 gap-12 min-[901px]:grid-cols-[1.1fr_.9fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Supply & Sourcing</div>
            <h2 className="mt-3.5">Parts supplied from the UAE to worldwide customers</h2>
            <p className="mt-4 max-w-[66ch] text-[16px] text-text-1">{intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sourcing#request" className="btn btn-primary">Request a Part</Link>
              <Link href="/brands" className="btn btn-ghost">View Brands</Link>
            </div>
          </div>

          <div className="rounded-m border border-line bg-bg-1 p-7">
            <div className="eyebrow">Popular Brands</div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-[14px] text-text-1">
              {brands.map((brand) => (
                <div key={brand} className="rounded-s border border-line bg-bg-0 px-4 py-3">{brand}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[640px]">
            <div className="eyebrow">Applications</div>
            <h2 className="mt-3.5">Typical equipment and applications</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2 min-[1001px]:grid-cols-3">
            {applications.map((item) => (
              <div key={item} className="bg-bg-0 p-6 text-[15px] text-text-1">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[640px]">
            <div className="eyebrow">What We Can Supply</div>
            <h2 className="mt-3.5">Genuine, aftermarket and hard-to-find options</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[701px]:grid-cols-2">
            {capabilities.map((item) => (
              <div key={item} className="rounded-m border border-line bg-bg-1 p-5 text-[15px] text-text-1">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner primaryHref="/sourcing#request" primaryLabel="Send Your RFQ" />
    </>
  );
}
