import Link from "next/link";
import { getBrands, getBrandSkuCount, getEquipmentCategories } from "@/lib/data/inventory";

/**
 * Reuses CategoryGrid's approved premium card recipe exactly — same
 * radius, shadow layers, brass-glow hover — for the brands that actually
 * have real, searchable inventory (currently Iveco, Kobelco, Kohler).
 * SKU counts are always live (getBrandSkuCount), never hardcoded.
 */
export async function LiveBrandCards() {
  const [brands, categories] = await Promise.all([getBrands(), getEquipmentCategories()]);

  const cards = await Promise.all(
    brands.map(async (brand) => {
      const skuCount = await getBrandSkuCount(brand.slug);
      const category = categories.find((c) => c.brandsLabel === brand.name);
      return { brand, skuCount, categoryName: category?.name ?? null };
    }),
  );

  return (
    <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1181px]:grid-cols-3">
      {cards.map(({ brand, skuCount, categoryName }) => (
        <div
          key={brand.slug}
          className="group relative flex flex-col overflow-hidden rounded-[18px] border border-white/5 bg-[#17191d] p-4 shadow-[0_12px_35px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.05)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[rgba(196,162,106,.45)] hover:shadow-[0_20px_50px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.08),0_0_28px_rgba(196,162,106,.18)]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(to_right,transparent,rgba(196,162,106,.7),transparent)] opacity-40 transition-opacity duration-300 group-hover:opacity-100" />

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(108,196,140,.35)] bg-[#0f1f16] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[.06em] text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            {skuCount.toLocaleString()} SKUs In Stock
          </span>
          <h3 className="mt-3 text-[22px]">{brand.name}</h3>
          {categoryName ? <p className="mt-1.5 flex-1 text-sm text-text-1">{categoryName}</p> : <div className="flex-1" />}
          <span
            aria-hidden="true"
            className="btn btn-ghost btn-sm mt-4 self-start gap-2 transition-all duration-300 group-hover:border-brass group-hover:text-brass group-hover:shadow-[0_0_16px_rgba(196,162,106,.25)]"
          >
            View Inventory
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </span>
          <Link
            href={`/brands/${brand.slug}`}
            aria-label={`${brand.name} — View Inventory`}
            className="absolute inset-0 z-10 rounded-[18px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0"
          />
        </div>
      ))}
    </div>
  );
}
