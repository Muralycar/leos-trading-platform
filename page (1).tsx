import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { MachineCard } from "@/components/machinery/MachineCard";
import { RfqForm } from "@/components/rfq/RfqForm";
import { MACHINE_CATEGORIES, getPublishedMachines } from "@/lib/machinery";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Machinery & Vehicles for Sale — Leos Trading FZE",
  description:
    "New and used construction machinery, trucks and forklifts — Komatsu, Caterpillar, Tadano, Volvo, Iveco, Renault and more — sourced and supplied from the UAE.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; cat?: string; brand?: string; condition?: string; availability?: string }>;
}

const inputClass =
  "rounded-s border border-line-strong bg-bg-1 px-3.5 py-2.5 text-sm text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

export default async function MachineryPage({ searchParams }: PageProps) {
  const { q, cat, brand, condition, availability } = await searchParams;
  const all = await getPublishedMachines();

  const brands = Array.from(new Set(all.map((m) => m.brand))).sort((a, b) => a.localeCompare(b));
  const needle = q?.trim().toLowerCase();

  const machines = all.filter((m) => {
    if (cat && m.category !== cat) return false;
    if (brand && m.brand !== brand) return false;
    if (condition && m.condition !== condition) return false;
    if (availability === "in_stock" && m.status !== "available") return false;
    if (availability === "on_request" && m.status !== "sourcing") return false;
    if (needle && !`${m.title} ${m.brand} ${m.model ?? ""}`.toLowerCase().includes(needle)) return false;
    return true;
  });

  const filtered = Boolean(q || cat || brand || condition || availability);

  return (
    <>
      <PageHeader
        eyebrow="Machinery & Vehicles"
        title="New & Used Machinery, Trucks and Forklifts"
        description="Komatsu, Caterpillar, Tadano, Volvo, Iveco, Renault and more — in stock or sourced to your specification, with export from the UAE."
      />

      <section className="py-12">
        <div className="wrap">
          <form method="get" className="flex flex-wrap gap-3">
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search brand, model…"
              className={`min-w-[220px] flex-1 ${inputClass}`}
            />
            <select name="cat" defaultValue={cat ?? ""} className={inputClass}>
              <option value="">All categories</option>
              {MACHINE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select name="brand" defaultValue={brand ?? ""} className={inputClass}>
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select name="condition" defaultValue={condition ?? ""} className={inputClass}>
              <option value="">New &amp; used</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
            <select name="availability" defaultValue={availability ?? ""} className={inputClass}>
              <option value="">In stock &amp; on request</option>
              <option value="in_stock">In stock</option>
              <option value="on_request">Available on request</option>
            </select>
            <button type="submit" className="btn btn-ghost btn-sm">
              Filter
            </button>
            {filtered ? (
              <Link href="/machinery" className="btn btn-ghost btn-sm">
                Clear
              </Link>
            ) : null}
          </form>

          <div className="mt-6 text-sm text-text-2">{machines.length} listings</div>

          {machines.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-6 min-[701px]:grid-cols-2 min-[1181px]:grid-cols-3">
              {machines.map((m) => (
                <MachineCard key={m.id} machine={m} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-m border border-dashed border-line-strong px-6 py-14 text-center text-text-1">
              <p>No machines match these filters right now.</p>
              <p className="mt-2 text-sm text-text-2">
                We source machinery to order — use the form below and we&apos;ll find it for you.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="request" className="border-t border-line bg-bg-1 py-16">
        <div className="wrap grid grid-cols-1 gap-10 min-[901px]:grid-cols-[1fr_1.3fr] min-[901px]:gap-16">
          <div>
            <div className="eyebrow">Machinery Sourcing</div>
            <h2 className="mt-3.5">Looking for a specific machine?</h2>
            <p className="mt-4 max-w-[46ch] text-[15px]">
              Tell us the make, model, year range, hours and budget. We source new and used machinery, trucks and forklifts
              through our UAE and international network and come back with available units, specifications and photos.
            </p>
          </div>
          <RfqForm
            variant="machinery"
            prefillMessage=""
            submitLabel="Request Machinery Quotation"
            className="rounded-m border border-line bg-bg-0 p-6"
          />
        </div>
      </section>
    </>
  );
}
