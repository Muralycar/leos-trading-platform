import Link from "next/link";
import { EQUIPMENT_CATEGORIES } from "@/lib/placeholder-data";
import { BRANDS, getBrandSkuCount } from "@/lib/data/inventory";

// Only Kohler/Iveco/Kobelco are real — one per live category, from the
// actual spreadsheets. No other brand name is ever rendered here; the
// "+ Sourced on request" chip covers the sourcing-network pitch generically
// without inventing a brand list.
const BRAND_SLUG_BY_CATEGORY: Record<string, string | undefined> = {
  "truck-parts": "iveco",
  "construction-equipment-parts": "kobelco",
  "generator-parts": "kohler",
};

export function BrandDirectory() {
  return (
    <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2 min-[1181px]:grid-cols-3">
      {EQUIPMENT_CATEGORIES.map((cat) => {
        const brandSlug = BRAND_SLUG_BY_CATEGORY[cat.slug];
        const brand = brandSlug ? BRANDS.find((b) => b.slug === brandSlug) : undefined;

        return (
          <div key={cat.slug} className="flex flex-col gap-4 bg-bg-0 p-7">
            <h4 className="font-mono text-[11px] uppercase tracking-[.08em] text-text-2">{cat.name}</h4>
            <div className="flex flex-wrap gap-2">
              {brand ? (
                <Link
                  href={`/brands/${brand.slug}`}
                  className="rounded-s border border-line-strong px-3.5 py-2 text-sm text-text-0 hover:border-brass hover:text-brass"
                >
                  {brand.name}
                  <span className="ml-1.5 font-mono text-[11px] text-text-2">{getBrandSkuCount(brand.slug)}</span>
                </Link>
              ) : null}
              <span className="rounded-s border border-dashed border-line-strong px-3.5 py-2 text-sm text-text-2">
                + Sourced on request
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
