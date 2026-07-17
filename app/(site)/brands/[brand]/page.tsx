import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRANDS, getAvailability, getProductsByBrand } from "@/lib/data/inventory";
import { EQUIPMENT_CATEGORIES } from "@/lib/placeholder-data";
import { ResultRow } from "@/components/search/ResultRow";

interface PageProps {
  params: Promise<{ brand: string }>;
}

export function generateStaticParams() {
  return BRANDS.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const b = BRANDS.find((x) => x.slug === brand);
  if (!b) return {};
  return {
    title: `${b.name} Inventory — Leos Trading FZE`,
    description: `Search Leos Trading's live ${b.name} OEM parts inventory by part number.`,
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params;
  const b = BRANDS.find((x) => x.slug === brand);
  if (!b) notFound();

  const products = getProductsByBrand(b.slug).sort(
    (a, c) => getAvailability(c.id).quantity - getAvailability(a.id).quantity,
  );
  const totalUnits = products.reduce((sum, p) => sum + getAvailability(p.id).quantity, 0);
  const category = EQUIPMENT_CATEGORIES.find((c) => c.slug === products[0]?.equipmentCategorySlug);

  return (
    <>
      <div className="border-b border-line bg-bg-1 py-14">
        <div className="wrap">
          <div className="eyebrow">Brand</div>
          <h1 className="mt-3.5">{b.name}</h1>
          <p className="mt-4 max-w-[60ch] text-[16px]">
            Genuine OEM inventory held in UAE warehousing, searchable by part number.
          </p>
          <div className="mt-8 flex flex-wrap gap-10">
            <div>
              <div className="font-display text-[32px] font-bold text-brass">{products.length.toLocaleString()}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[.06em] text-text-2">SKUs In Stock</div>
            </div>
            <div>
              <div className="font-display text-[32px] font-bold text-brass">{totalUnits.toLocaleString()}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[.06em] text-text-2">Units In Stock</div>
            </div>
            {category ? (
              <div>
                <div className="font-display text-[32px] font-bold text-brass">{category.name}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[.06em] text-text-2">Category</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="wrap">
          {products.length > 0 ? (
            <div className="flex flex-col gap-px overflow-hidden rounded-m border border-line bg-line">
              {products.map((p) => (
                <ResultRow key={p.id} product={p} brandName={b.name} />
              ))}
            </div>
          ) : (
            <div className="rounded-m border border-dashed border-line-strong px-6 py-16 text-center">
              <h3>No published SKUs for {b.name} yet</h3>
              <p className="mx-auto mt-2.5 max-w-[46ch] text-[15px]">
                Check back as inventory grows, or send us a part number and our sourcing network will confirm supply.
              </p>
              <a href="/sourcing#request" className="btn btn-primary mt-6 inline-flex">
                Request a Part
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
