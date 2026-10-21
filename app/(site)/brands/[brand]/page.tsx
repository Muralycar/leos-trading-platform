import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandBySlug, getBrands, getEquipmentCategories, getProductsByBrand } from "@/lib/data/inventory";
import { ResultRow } from "@/components/search/ResultRow";

interface PageProps {
  params: Promise<{ brand: string }>;
}

const BRAND_SEO: Record<string, { title: string; description: string }> = {
  iveco: {
    title: "Iveco Truck Spare Parts UAE | Leos Trading",
    description: "Search genuine Iveco truck spare parts inventory in the UAE by part number, with sourcing support for additional Iveco parts and export worldwide.",
  },
  kobelco: {
    title: "Kobelco Excavator Spare Parts UAE | Leos Trading",
    description: "Search genuine Kobelco excavator spare parts inventory in the UAE by part number, with sourcing support for hard-to-find Kobelco components.",
  },
  kohler: {
    title: "Kohler Generator Spare Parts UAE | Leos Trading",
    description: "Search genuine Kohler generator spare parts inventory in the UAE by part number, with sourcing support for additional Kohler engine and generator components.",
  },
  caterpillar: {
    title: "Caterpillar CAT Spare Parts UAE | Leos Trading",
    description: "Source Caterpillar CAT spare parts for construction, mining and engine applications from the UAE, including OEM, aftermarket and hard-to-find part numbers.",
  },
  cat: {
    title: "Caterpillar CAT Spare Parts UAE | Leos Trading",
    description: "Source Caterpillar CAT spare parts for construction, mining and engine applications from the UAE, including OEM, aftermarket and hard-to-find part numbers.",
  },
  komatsu: {
    title: "Komatsu Spare Parts UAE | Leos Trading",
    description: "Source Komatsu spare parts for excavators, dozers, loaders and mining equipment from the UAE, including OEM, aftermarket and hard-to-find components.",
  },
  cummins: {
    title: "Cummins Engine Spare Parts Dubai UAE | Leos Trading",
    description: "Source Cummins engine spare parts in Dubai and the UAE for generators, trucks, marine and industrial applications, including OEM and aftermarket options.",
  },
  yanmar: {
    title: "Yanmar Marine & Engine Parts UAE | Leos Trading",
    description: "Source Yanmar marine and diesel engine spare parts in the UAE, including genuine OEM, aftermarket and hard-to-find components for marine and industrial engines.",
  },
  perkins: {
    title: "Perkins Engine Spare Parts UAE | Leos Trading",
    description: "Source Perkins engine spare parts in the UAE for generators, construction and industrial applications, including OEM, aftermarket and obsolete part numbers.",
  },
  parker: {
    title: "Parker Industrial & Hydraulic Parts UAE | Leos Trading",
    description: "Source Parker hydraulic, pneumatic and industrial parts in the UAE for oilfield, marine and industrial applications, including hard-to-find part numbers.",
  },
  volvo: {
    title: "Volvo Equipment & Truck Spare Parts UAE | Leos Trading",
    description: "Source Volvo truck, construction equipment and engine spare parts in the UAE, including OEM, aftermarket and hard-to-find components.",
  },
};

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const b = await getBrandBySlug(brand);
  if (!b) return {};

  const seo = BRAND_SEO[b.slug.toLowerCase()];
  return seo ?? {
    title: `${b.name} Spare Parts Supplier UAE | Leos Trading`,
    description: `Search or source ${b.name} spare parts from the UAE by part number, including genuine OEM, aftermarket and hard-to-find components for worldwide supply.`,
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params;
  const b = await getBrandBySlug(brand);
  if (!b) notFound();

  const [products, categories] = await Promise.all([getProductsByBrand(b.slug), getEquipmentCategories()]);
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const category = categories.find((c) => c.slug === products[0]?.equipmentCategorySlug);

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
            <div className="flex flex-col overflow-hidden rounded-m border border-line">
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
