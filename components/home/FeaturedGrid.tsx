import Image from "next/image";
import Link from "next/link";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { BRANDS, getAvailability, getFeaturedProducts } from "@/lib/data/inventory";

export function FeaturedGrid() {
  const featured = getFeaturedProducts(4);
  const brandNameBySlug = Object.fromEntries(BRANDS.map((b) => [b.slug, b.name]));

  return (
    <section className="py-16">
      <div className="wrap">
        <div className="mb-12 max-w-[640px]">
          <div className="eyebrow">Featured Parts</div>
          <h2 className="mt-3.5">Recently added to inventory</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-px border border-line bg-line min-[901px]:grid-cols-4">
        {featured.map((p) => (
          <Link
            key={p.id}
            href={`/parts/${p.brandSlug}/${p.oemPartNumber.toLowerCase()}`}
            className="flex flex-col bg-bg-0"
          >
            <div className="relative flex aspect-square items-center justify-center bg-bg-2 p-5">
              {p.imagePath ? (
                <Image src={p.imagePath} alt={p.description} fill className="object-contain p-5" />
              ) : (
                <span className="px-4 text-center font-mono text-[11px] text-text-2">{p.description}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="font-mono text-xs text-brass">{p.oemPartNumber}</div>
              <div className="flex-1 text-[15px] font-medium text-text-0">{p.description}</div>
              <div className="mt-1.5 flex items-center justify-between">
                <AvailabilityBadge quantity={getAvailability(p.id).quantity} />
                <span className="tag">{brandNameBySlug[p.brandSlug] ?? p.brandSlug}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
