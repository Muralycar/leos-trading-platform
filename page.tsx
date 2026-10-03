import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MachineGallery } from "@/components/machinery/MachineGallery";
import { MachineStatusTag } from "@/components/machinery/MachineStatusTag";
import { SpecTable } from "@/components/product/SpecTable";
import { RfqForm } from "@/components/rfq/RfqForm";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { getSiteSettings } from "@/lib/data/inventory";
import {
  MACHINE_CONDITION_LABEL,
  categoryLabel,
  formatPriceAed,
  formatUsage,
  getMachineBySlug,
} from "@/lib/machinery";
import { waLink } from "@/lib/whatsapp";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const machine = await getMachineBySlug(slug);
  if (!machine) return {};
  const onRequest = machine.status === "sourcing";
  return {
    title: `${machine.title} | Machinery | Leos Trading FZE`,
    description:
      machine.description?.slice(0, 160) ??
      `${machine.title} — ${onRequest ? "available on request" : "for sale"} from Leos Trading FZE, UAE.`,
    openGraph: machine.imageUrls[0] ? { images: [machine.imageUrls[0]] } : undefined,
  };
}

export default async function MachineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const machine = await getMachineBySlug(slug);
  if (!machine) notFound();

  const settings = await getSiteSettings();
  const usage = formatUsage(machine);

  const rows: { label: string; value: string }[] = [
    { label: "Category", value: categoryLabel(machine.category) },
    { label: "Brand", value: machine.brand },
    machine.model ? { label: "Model", value: machine.model } : null,
    machine.condition ? { label: "Condition", value: MACHINE_CONDITION_LABEL[machine.condition] } : null,
    machine.year ? { label: "Year", value: String(machine.year) } : null,
    usage ? { label: machine.category === "truck" ? "Mileage" : "Hours", value: usage } : null,
    machine.capacity ? { label: "Capacity", value: machine.capacity } : null,
    machine.location ? { label: "Location", value: machine.location } : null,
    ...Object.entries(machine.specs).map(([label, value]) => ({ label, value })),
  ].filter(Boolean) as { label: string; value: string }[];

  const waMessage = `Inquiry — ${machine.title} (leosdubai.com/machinery/${machine.slug})`;
  const enquiryMessage = `Enquiry about: ${machine.title} (ref: ${machine.slug})\n`;
  const canEnquire = machine.status !== "sold";

  return (
    <>
      <div className="wrap pt-6">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] text-text-2">
          <Link href="/" className="hover:text-brass">Home</Link>
          <span>/</span>
          <Link href="/machinery" className="hover:text-brass">Machinery</Link>
          <span>/</span>
          <Link href={`/machinery?cat=${encodeURIComponent(machine.category)}`} className="hover:text-brass">
            {categoryLabel(machine.category)}
          </Link>
          <span>/</span>
          <span className="text-text-1">{machine.title}</span>
        </nav>
      </div>

      <div className="wrap grid grid-cols-1 gap-10 py-10 min-[901px]:grid-cols-2 min-[901px]:gap-16 min-[901px]:py-12">
        <MachineGallery images={machine.imageUrls} title={machine.title} brand={machine.brand} />

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <MachineStatusTag status={machine.status} />
            <span className="font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
              {machine.brand} · {categoryLabel(machine.category)}
            </span>
          </div>
          <h1 className="mt-4 text-[32px] leading-tight">{machine.title}</h1>
          <div className="mt-3 text-[18px] font-semibold text-brass">{formatPriceAed(machine.priceAed)}</div>

          {machine.description ? <p className="mt-5 max-w-[60ch] text-[15px] text-text-1">{machine.description}</p> : null}

          <SpecTable rows={rows} />

          {canEnquire ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#enquire" className="btn btn-primary">
                {machine.status === "sourcing" ? "Request this machine" : "Request quotation"}
              </a>
              <a href={waLink(settings, waMessage)} target="_blank" rel="noreferrer" className="btn btn-wa">
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          ) : (
            <p className="mt-8 text-sm text-text-2">
              This unit has been sold. We can source a similar machine —{" "}
              <Link href="/machinery#request" className="text-brass hover:underline">
                tell us what you need
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      {canEnquire ? (
        <section id="enquire" className="border-t border-line bg-bg-1 py-16">
          <div className="wrap grid grid-cols-1 gap-10 min-[901px]:grid-cols-[1fr_1.3fr] min-[901px]:gap-16">
            <div>
              <div className="eyebrow">Enquiry</div>
              <h2 className="mt-3.5">Request a quotation</h2>
              <p className="mt-4 max-w-[44ch] text-[15px]">
                Send your details and we&apos;ll confirm availability, pricing, shipping and export documents for{" "}
                {machine.title}.
              </p>
            </div>
            <RfqForm
              variant="machinery"
              prefillPartNumber={machine.title}
              prefillBrand={machine.brand}
              prefillMessage={enquiryMessage}
              submitLabel="Request Quotation"
              className="rounded-m border border-line bg-bg-0 p-6"
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
