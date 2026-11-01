import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBanner } from "@/components/home/CtaBanner";
import { RfqForm } from "@/components/rfq/RfqForm";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Obsolete & Hard-to-Find Spare Parts UAE | Leos Trading",
  description:
    "Need an obsolete or discontinued part number? Leos Trading sources hard-to-find OEM, aftermarket and surplus parts for industrial, marine, generator and heavy equipment from the UAE.",
  alternates: { canonical: "/obsolete-hard-to-find-parts-uae" },
};

const SOURCING_CASES = [
  "Discontinued and superseded part numbers",
  "Legacy generator controllers, electrical parts and engine components",
  "Old-stock, surplus and dead-stock components",
  "Low-volume regional or older-equipment variants",
  "Cross-reference searches where the original number has changed",
  "Replacement parts for industrial, marine and heavy-equipment systems",
];

const RFQ_DETAILS = [
  "Original manufacturer and exact part number",
  "Equipment model, serial number or asset tag",
  "Photos of the nameplate, label or the removed part",
  "Quantity required and destination country",
  "Any drawing, specification or known replacement number",
];

export default function ObsoleteHardToFindPartsUaePage() {
  return (
    <>
      <PageHeader
        eyebrow="Global Parts Sourcing"
        title="Obsolete, Discontinued & Hard-to-Find Spare Parts"
        description="For part numbers that are no longer readily available through normal dealer channels, Leos Trading FZE searches UAE and international supply sources for practical, correctly identified options."
      />

      <section className="py-16">
        <div className="wrap grid grid-cols-1 items-center gap-10 min-[901px]:grid-cols-[1.05fr_.95fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">When Normal Supply Channels Stop</div>
            <h2 className="mt-3.5">A difficult part number needs a disciplined search.</h2>
            <p className="mt-4 max-w-[64ch] text-[16px]">
              Older equipment, discontinued product lines and regional variants often need more than a catalogue
              search. We use the supplied equipment information to look through specialised suppliers, old stock and
              alternative supply routes before presenting the available option for review.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#request" className="btn btn-primary">Send a Part Number</Link>
              <Link href="/products" className="btn btn-ghost">Browse Parts</Link>
            </div>
          </div>
          <div className="group relative aspect-[4/3] overflow-hidden rounded-m border border-line-strong bg-bg-2">
            <Image
              src="/images/marketing/obsolete-parts-inventory.webp"
              alt="Warehouse stock for obsolete and hard-to-find spare parts"
              fill
              priority
              sizes="(min-width: 901px) 50vw, 100vw"
              className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-bg-1 py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[680px]">
            <div className="eyebrow">What We Search For</div>
            <h2 className="mt-3.5">Common hard-to-find parts enquiries</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2 min-[1101px]:grid-cols-3">
            {SOURCING_CASES.map((item) => (
              <div key={item} className="bg-bg-0 p-6 text-[15px] text-text-1">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 gap-5 min-[801px]:grid-cols-3">
          <article className="rounded-m border border-line bg-bg-1 p-7">
            <div className="eyebrow">1. Identify</div>
            <h3 className="mt-3.5">Confirm the requirement</h3>
            <p className="mt-3 text-sm">
              We use the part number, photos, equipment model and serial number to reduce the chance of quoting an
              incorrect item or a similarly named component.
            </p>
          </article>
          <article className="rounded-m border border-line bg-bg-1 p-7">
            <div className="eyebrow">2. Search</div>
            <h3 className="mt-3.5">Check suitable supply channels</h3>
            <p className="mt-3 text-sm">
              The search can include UAE stock, international distributors, surplus channels and specialist suppliers
              for discontinued or legacy components.
            </p>
          </article>
          <article className="rounded-m border border-line bg-bg-1 p-7">
            <div className="eyebrow">3. Quote</div>
            <h3 className="mt-3.5">Disclose the available option</h3>
            <p className="mt-3 text-sm">
              Our quotation confirms the available supply type, condition and lead-time information where applicable,
              allowing you to assess the option before ordering.
            </p>
          </article>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[680px]">
            <div className="eyebrow">Across Multiple Industries</div>
            <h2 className="mt-3.5">Sourcing support for equipment that cannot stay idle</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2 min-[1101px]:grid-cols-4">
            <Link href="/generator-spare-parts-uae" className="group bg-bg-0 p-6 transition-colors hover:bg-bg-1">
              <h3 className="text-[18px]">Generator &amp; Engine</h3>
              <p className="mt-3 text-sm">Legacy controls, engine components, pumps, filters and electrical parts.</p>
              <span className="mt-5 inline-flex text-sm text-brass group-hover:underline">Generator parts →</span>
            </Link>
            <Link href="/marine-parts" className="group bg-bg-0 p-6 transition-colors hover:bg-bg-1">
              <h3 className="text-[18px]">Marine &amp; Vessel</h3>
              <p className="mt-3 text-sm">Engine, cooling, pump, instrumentation and auxiliary-equipment parts.</p>
              <span className="mt-5 inline-flex text-sm text-brass group-hover:underline">Marine parts →</span>
            </Link>
            <Link href="/construction-equipment-parts" className="group bg-bg-0 p-6 transition-colors hover:bg-bg-1">
              <h3 className="text-[18px]">Heavy Equipment</h3>
              <p className="mt-3 text-sm">Construction and mining components for older machines and equipment fleets.</p>
              <span className="mt-5 inline-flex text-sm text-brass group-hover:underline">Construction parts →</span>
            </Link>
            <Link href="/oilfield-industrial-parts" className="group bg-bg-0 p-6 transition-colors hover:bg-bg-1">
              <h3 className="text-[18px]">Industrial Systems</h3>
              <p className="mt-3 text-sm">Hydraulic, pneumatic, electrical, control and filtration components.</p>
              <span className="mt-5 inline-flex text-sm text-brass group-hover:underline">Industrial parts →</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="request" className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 gap-12 min-[901px]:grid-cols-[.9fr_1.1fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Send Your RFQ</div>
            <h2 className="mt-3.5">The more detail you can share, the better the search.</h2>
            <p className="mt-4 text-[15px]">
              If the original number is not available, photos and equipment details are useful starting points. We
              will check practical options and confirm availability before any supply is agreed.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-[14px] text-text-1">
              {RFQ_DETAILS.map((detail) => (
                <li key={detail} className="flex gap-2.5">
                  <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brass" />
                  {detail}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/brands" className="btn btn-ghost">Brands We Supply</Link>
              <Link href="/sourcing" className="btn btn-ghost">How Sourcing Works</Link>
            </div>
            <p className="mt-6 text-[13px] text-text-2">
              Brand names and trademarks are the property of their respective owners. Leos Trading FZE is an
              independent supplier and is not an authorized distributor unless expressly stated.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-m border border-[rgba(196,162,106,.25)] bg-bg-1 p-8 shadow-[0_20px_50px_rgba(0,0,0,.35)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(to_right,transparent,rgba(196,162,106,.7),transparent)]" />
            <RfqForm
              variant="sourcing"
              prefillPartNumber="Obsolete / hard-to-find part RFQ"
              submitLabel="Send Hard-to-Find Parts RFQ"
            />
          </div>
        </div>
      </section>

      <CtaBanner
        heading={<>Need a part others cannot locate?<br />Let&apos;s search for it.</>}
        primaryHref="#request"
        primaryLabel="Send a Part Number"
        waMessage="I need help sourcing an obsolete or hard-to-find spare part."
      />
    </>
  );
}
