import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBanner } from "@/components/home/CtaBanner";
import { RfqForm } from "@/components/rfq/RfqForm";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Generator Spare Parts UAE | DENYO, AIRMAN, Kohler & Cummins",
  description:
    "Generator engine and genset spare parts in the UAE for DENYO, AIRMAN, Kohler, Caterpillar, Cummins, Perkins and more. OEM, aftermarket and hard-to-find options.",
  alternates: { canonical: "/generator-spare-parts-uae" },
};

const PARTS_WE_SOURCE = [
  "Engine overhaul parts, pistons, rings and bearings",
  "Cylinder heads, gasket sets, seals and O-rings",
  "Fuel-injection pumps, injectors and fuel-system components",
  "Water pumps, oil pumps, radiators and heat exchangers",
  "Turbochargers, filters, belts, hoses and cooling parts",
  "Alternators, starter motors and voltage regulators",
  "Generator controllers, panels, sensors and switches",
  "Electrical components, mountings and auxiliary equipment",
];

const RFQ_DETAILS = [
  "Manufacturer / brand",
  "Generator and engine model",
  "Serial number",
  "Part number and required quantity",
  "Photos of the generator, engine or existing part when available",
];

export default function GeneratorSparePartsUaePage() {
  return (
    <>
      <PageHeader
        eyebrow="Generator Spare Parts"
        title="Generator Engine & Genset Spare Parts Supplier UAE"
        description="Genuine OEM, quality aftermarket, obsolete and hard-to-find generator parts sourced from the UAE for industrial, commercial, marine, construction and standby-power applications."
      />

      <section className="py-16">
        <div className="wrap grid grid-cols-1 items-center gap-10 min-[901px]:grid-cols-[1.05fr_.95fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">UAE Supply · Global Export</div>
            <h2 className="mt-3.5">Send the part number. We&apos;ll help locate the right supply option.</h2>
            <p className="mt-4 max-w-[64ch] text-[16px]">
              Leos Trading FZE supports generator-parts RFQs using the manufacturer, genset model, engine model,
              serial number or part number. We check suitable supply routes through our UAE and international
              sourcing network, including selected Kohler generator inventory.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#request" className="btn btn-primary">Request a Part</Link>
              <Link href="/search?cat=generator-parts" className="btn btn-ghost">Browse Generator Stock</Link>
            </div>
          </div>
          <div className="group relative aspect-[4/3] overflow-hidden rounded-m border border-line-strong bg-bg-2">
            <Image
              src="/images/marketing/generator-engine.png"
              alt="Industrial generator engine for spare-parts sourcing"
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
          <div className="grid grid-cols-1 gap-10 min-[901px]:grid-cols-[.8fr_1.2fr] min-[901px]:gap-16">
            <div>
              <div className="eyebrow">Generator Brands</div>
              <h2 className="mt-3.5">Brands we can supply and source</h2>
              <p className="mt-4 text-[15px]">
                We handle enquiries for leading generator and engine manufacturers, plus alternator, control,
                cooling, fuel-system and auxiliary-equipment components from other international makers.
              </p>
              <Link href="/brands" className="btn btn-ghost btn-sm mt-6">View All Brands</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 min-[601px]:grid-cols-3">
              {[
                "Kohler", "Caterpillar", "Cummins", "Perkins", "John Deere", "Deutz", "MTU", "FPT",
                "Volvo Penta", "Yanmar", "DENYO", "AIRMAN",
              ].map((brand) => (
                <div key={brand} className="rounded-s border border-line bg-bg-0 px-4 py-3 text-[14px] text-text-1">
                  {brand}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 max-w-[92ch] text-[13px] text-text-2">
            Brand names and trademarks belong to their respective owners and are used only to identify the equipment
            for which parts may be requested. Leos Trading FZE is an independent supplier and is not an authorized
            distributor unless expressly stated.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[680px]">
            <div className="eyebrow">Generator Parts We Supply</div>
            <h2 className="mt-3.5">Parts for the engine, genset and control system</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2 min-[1101px]:grid-cols-4">
            {PARTS_WE_SOURCE.map((item) => (
              <div key={item} className="bg-bg-0 p-6 text-[15px] text-text-1">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[680px]">
            <div className="eyebrow">Supply Options</div>
            <h2 className="mt-3.5">The right route for the requirement</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-line min-[801px]:grid-cols-3">
            <div className="bg-bg-0 p-7">
              <h3>Genuine OEM</h3>
              <p className="mt-3 text-sm">
                Original manufacturer-sourced components where an exact OEM specification, documentation or
                traceability is required.
              </p>
            </div>
            <div className="bg-bg-0 p-7">
              <h3>Quality Aftermarket</h3>
              <p className="mt-3 text-sm">
                Suitable alternatives from established manufacturers when the OEM route is unavailable, delayed or
                not commercially practical. Cross-references are checked against the information available.
              </p>
            </div>
            <div className="bg-bg-0 p-7">
              <h3>Obsolete &amp; Hard-to-Find</h3>
              <p className="mt-3 text-sm">
                Discontinued, superseded, old-stock and legacy control-system part numbers located through
                specialised supplier channels.
              </p>
              <Link href="/obsolete-hard-to-find-parts-uae" className="mt-5 inline-flex text-sm text-brass hover:underline">
                Explore hard-to-find parts →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[680px]">
            <div className="eyebrow">Parts By Generator Brand</div>
            <h2 className="mt-3.5">Support for common generator and engine applications</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
            <article className="rounded-m border border-line bg-bg-1 p-7">
              <h3>Kohler Generator Spare Parts</h3>
              <p className="mt-3 text-sm">
                Our live generator inventory includes Kohler part-number listings. For unlisted items, send the
                generator or engine model, serial number and required part number for an availability check.
              </p>
              <Link href="/search?brand=kohler" className="mt-5 inline-flex text-sm text-brass hover:underline">
                Browse Kohler stock →
              </Link>
            </article>
            <article className="rounded-m border border-line bg-bg-1 p-7">
              <h3>Caterpillar Generator Parts</h3>
              <p className="mt-3 text-sm">
                We can source Caterpillar generator engine and electrical components using the CAT part number,
                engine model, generator model or serial number. Package equipment may contain components from more
                than one manufacturer, so the supplied details help identify the right source.
              </p>
            </article>
            <article className="rounded-m border border-line bg-bg-1 p-7">
              <h3>Cummins Generator Parts</h3>
              <p className="mt-3 text-sm">
                Cummins enquiries can include engine components, cooling and fuel-system parts, filters, sensors,
                electrical components, starting-system parts and control-system components.
              </p>
            </article>
            <article className="rounded-m border border-line bg-bg-1 p-7">
              <h3>Perkins Generator Parts</h3>
              <p className="mt-3 text-sm">
                Perkins engines are used across generator applications worldwide. We can check overhaul components,
                pumps, filters, gaskets, cooling parts and fuel-system components against the engine serial number and
                required part details.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 gap-5 min-[901px]:grid-cols-2">
          <article className="rounded-m border border-line bg-bg-1 p-7">
            <div className="eyebrow">Japanese Generator Brand</div>
            <h2 className="mt-3.5">DENYO Generator Spare Parts</h2>
            <p className="mt-4 text-[15px]">
              Leos Trading FZE can source parts for DENYO diesel generators and related power equipment. Enquiries
              may include engine components, filters, cooling-system parts, alternator-related components,
              controllers, panels, sensors and electrical parts.
            </p>
            <p className="mt-3 text-[15px]">
              Please provide the DENYO model, serial number and requested part number so the item can be identified
              and checked for availability.
            </p>
          </article>
          <article className="rounded-m border border-line bg-bg-1 p-7">
            <div className="eyebrow">Japanese Generator Brand</div>
            <h2 className="mt-3.5">AIRMAN Generator Spare Parts</h2>
            <p className="mt-4 text-[15px]">
              We also handle sourcing enquiries for AIRMAN generators and power equipment. Our team can check engine,
              fuel, cooling, electrical, control and replacement components against the available AIRMAN equipment
              details.
            </p>
            <p className="mt-3 text-[15px]">
              Include the AIRMAN generator model, serial number, engine details and any part number or nameplate
              photos for faster identification and quotation.
            </p>
          </article>
        </div>
      </section>

      <section id="request" className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 gap-12 min-[901px]:grid-cols-[.9fr_1.1fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Need A Generator Part?</div>
            <h2 className="mt-3.5">Send the details that help us identify it correctly</h2>
            <p className="mt-4 text-[15px]">
              Clear equipment details reduce the risk of an incorrect cross-reference and help us return a faster,
              more useful quotation.
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
              <Link href="/products" className="btn btn-ghost">Browse Parts</Link>
              <Link href="/brands" className="btn btn-ghost">Brands We Supply</Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-m border border-[rgba(196,162,106,.25)] bg-bg-1 p-8 shadow-[0_20px_50px_rgba(0,0,0,.35)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(to_right,transparent,rgba(196,162,106,.7),transparent)]" />
            <RfqForm
              variant="sourcing"
              prefillPartNumber="Generator spare parts RFQ"
              submitLabel="Send Generator Parts RFQ"
            />
          </div>
        </div>
      </section>

      <CtaBanner
        heading={<>Looking for a generator part?<br />Send your RFQ to our sourcing team.</>}
        primaryHref="#request"
        primaryLabel="Request a Part"
        waMessage="I am looking for generator spare parts."
      />
    </>
  );
}
