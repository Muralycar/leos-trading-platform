import type { Metadata } from "next";
import Image from "next/image";
import { CtaBanner } from "@/components/home/CtaBanner";
import { RfqForm } from "@/components/rfq/RfqForm";
import { ProcurementJourney, type JourneyStep } from "@/components/sourcing/ProcurementJourney";
import { CapabilityGroups, type CapabilityGroup } from "@/components/sourcing/CapabilityGroups";
import { getSiteSettings } from "@/lib/data/inventory";
import { waLink, mailtoLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Parts Sourcing — Leos Trading FZE",
  description:
    "OEM, aftermarket, obsolete and hard-to-find spare parts sourcing in the UAE — truck, heavy equipment, generator, marine and industrial parts sourced through our UAE and international procurement network.",
};

const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    title: "Supply Type",
    items: ["Genuine OEM Parts", "Quality Aftermarket Parts", "Hard-to-Find Parts", "Obsolete / Discontinued Parts", "Surplus / Dead-Stock"],
  },
  {
    title: "Applications",
    items: [
      "Truck & Commercial Vehicle Parts",
      "Construction & Mining Equipment Parts",
      "Generator & Engine Parts",
      "Marine Parts",
      "Industrial Components",
    ],
  },
];

const JOURNEY_STEPS: JourneyStep[] = [
  { number: "01", title: "Send Your RFQ", description: "Part number, description, machine/model and quantity." },
  { number: "02", title: "We Search Our Network", description: "We search suitable UAE and international procurement sources." },
  { number: "03", title: "We Verify", description: "Part number, brand, compatibility, condition/origin and availability where applicable." },
  { number: "04", title: "Receive Our Quotation", description: "Commercial offer with available product and supply information." },
  { number: "05", title: "We Export", description: "Supply/export support from the UAE to the Middle East, Africa, USA/North America and worldwide markets." },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Can you source obsolete or discontinued spare parts?",
    a: "Yes. We search our UAE and international supplier network for obsolete and discontinued part numbers, subject to availability, with condition and origin disclosed at quotation.",
  },
  {
    q: "Can I send machine details if I don't know the part number?",
    a: "Yes. Describe the machine, model, application or send a nameplate photo — our sourcing team will help identify the correct part.",
  },
  {
    q: "Do you supply genuine OEM and aftermarket parts?",
    a: "Both. Which option applies is disclosed upfront at quotation, so you can choose based on warranty, certification or budget requirements.",
  },
  {
    q: "Can you source parts that are not shown in your online inventory?",
    a: "Yes. Our online inventory reflects live stock currently in our UAE warehousing — most enquiries we handle are sourced on request through our procurement network.",
  },
  {
    q: "Do you export spare parts internationally?",
    a: "Yes, from the UAE to the Middle East, Africa, USA/North America, Europe and Asia.",
  },
];

interface PageProps {
  searchParams: Promise<{ brand?: string }>;
}

export default async function SourcingPage({ searchParams }: PageProps) {
  const [{ brand }, settings] = await Promise.all([searchParams, getSiteSettings()]);

  return (
    <>
      <div className="border-b border-line bg-bg-1 py-16">
        <div className="wrap">
          <div className="eyebrow">Sourcing</div>
          <h1 className="mt-3.5 text-[clamp(35px,5.25vw,66px)]">
            Can&apos;t find the part?
            <br />
            We&apos;ll source it.
          </h1>
          <div className="mt-5 font-mono text-[12.5px] font-semibold uppercase tracking-[.16em] text-brass">
            OEM <span className="text-text-2">•</span> Aftermarket <span className="text-text-2">•</span> Obsolete{" "}
            <span className="text-text-2">•</span> Hard-to-Find
          </div>
          <p className="mt-5 max-w-[66ch] text-[16px] text-text-1">
            We source truck, construction equipment, generator, mining, marine, automotive and industrial parts
            through our UAE and international procurement network — including parts not currently held in our live
            inventory.
          </p>
        </div>
      </div>

      <section id="what-we-source" className="border-b border-line py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[640px]">
            <div className="eyebrow">What We Source</div>
            <h2 className="mt-3.5">Genuine, aftermarket, hard-to-find — across every major category</h2>
          </div>
          <CapabilityGroups groups={CAPABILITY_GROUPS} />
        </div>
      </section>

      <section id="journey" className="border-b border-line py-16">
        <div className="wrap">
          <div className="mb-12 max-w-[640px]">
            <div className="eyebrow">How Sourcing Works</div>
            <h2 className="mt-3.5">From RFQ to export, in five steps</h2>
          </div>
          <ProcurementJourney steps={JOURNEY_STEPS} />

          <div className="mt-14 border-t border-line pt-10 text-center min-[901px]:mt-16">
            <p className="text-[15px] text-text-1">Sourced from the UAE. Supplied worldwide.</p>
            <div className="mt-4 font-mono text-[12.5px] font-semibold uppercase tracking-[.14em] text-brass">
              Middle East <span className="text-text-2">•</span> Africa <span className="text-text-2">•</span> USA / North
              America <span className="text-text-2">•</span> Europe <span className="text-text-2">•</span> Asia
            </div>
          </div>
        </div>
      </section>

      <section id="request" className="py-16">
        <div className="wrap grid grid-cols-1 gap-12 min-[901px]:grid-cols-[1fr_1.3fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Request a Part</div>
            <h2 className="mt-3.5">Send us the part number or machine details</h2>
            <p className="mt-3.5 text-[15px]">
              Don&apos;t have an exact part number? Describe the machine, model or serial number instead — our
              sourcing team will identify the right part. Availability, condition and pricing are confirmed in
              writing before you commit.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-[14px] text-text-1">
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brass" />
                Genuine OEM, aftermarket, obsolete and hard-to-find parts
              </li>
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brass" />
                Sourced through our UAE and international procurement network
              </li>
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brass" />
                Quotations prepared and issued directly by our sourcing team
              </li>
            </ul>
          </div>
          <div>
            <div className="relative overflow-hidden rounded-m border border-[rgba(196,162,106,.25)] bg-bg-1 p-8 shadow-[0_20px_50px_rgba(0,0,0,.35)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(to_right,transparent,rgba(196,162,106,.7),transparent)]" />
              <RfqForm variant="sourcing" prefillPartNumber={brand ?? ""} submitLabel="Submit Your RFQ" />
            </div>
            <p className="mt-5 text-[13px] text-text-2">
              Have a long parts list, drawing, nameplate photo or PDF? Contact us by{" "}
              <a
                href={waLink(settings, "I'd like to send a parts list / document for sourcing.")}
                target="_blank"
                rel="noreferrer"
                className="text-brass hover:underline"
              >
                WhatsApp
              </a>{" "}
              or{" "}
              <a href={mailtoLink(settings, "Parts list for sourcing")} className="text-brass hover:underline">
                email
              </a>{" "}
              — document upload is coming to the online RFQ system.
            </p>
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
          <div className="group relative aspect-[4/3] overflow-hidden rounded-m border border-line-strong bg-bg-2">
            <Image
              src="/images/marketing/hard-to-find-parts-search.png"
              alt="Industrial part-number search and global sourcing"
              fill
              sizes="(min-width: 901px) 50vw, 100vw"
              className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </div>
      </section>

      <section id="obsolete" className="border-t border-line py-16">
        <div className="wrap grid grid-cols-1 items-center gap-10 min-[901px]:grid-cols-2 min-[901px]:gap-16">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-m border border-line-strong bg-bg-2 min-[901px]:order-2">
            <Image
              src="/images/marketing/obsolete-parts-inventory.png"
              alt="Obsolete and discontinued industrial parts inventory"
              fill
              sizes="(min-width: 901px) 50vw, 100vw"
              className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          </div>
          <div>
            <div className="eyebrow">Obsolete Parts</div>
            <h2 className="mt-3.5">Discontinued and dead-stock part numbers</h2>
            <p className="mt-3.5 text-[15px]">
              Part numbers other suppliers have written off — we search our network to locate genuine or equivalent
              stock, with condition and origin disclosed at quotation.
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

      <section id="faq" className="border-t border-line py-16">
        <div className="wrap">
          <div className="mb-10 max-w-[640px]">
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-3.5">Common sourcing questions</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-line min-[801px]:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="bg-bg-0 p-7">
                <h4>{item.q}</h4>
                <p className="mt-2.5 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      <CtaBanner primaryHref="#request" />
    </>
  );
}
