import { getBrands } from "@/lib/data/inventory";

export async function BrandStrip() {
  const brands = await getBrands();

  return (
    <div className="overflow-hidden border-y border-line py-9">
      <div className="wrap flex flex-wrap justify-center gap-12">
        {brands.map((b) => (
          <span key={b.slug} className="font-display text-xl font-semibold uppercase tracking-[.05em] text-text-2">
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}
