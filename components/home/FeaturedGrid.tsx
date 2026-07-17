import Image from "next/image";
import Link from "next/link";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { PRODUCTS } from "@/lib/placeholder-data";

export function FeaturedGrid() {
  const featured = PRODUCTS.slice(0, 4);

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
          <Link key={p.sku} href={`/parts/${p.brandSlug}/${p.sku.toLowerCase()}`} className="flex flex-col bg-bg-0">
            <div className="relative flex aspect-square items-center justify-center bg-bg-2 p-5">
              {p.imagePath ? (
                <Image src={p.imagePath} alt={p.name} fill className="object-contain p-5" />
              ) : (
                <span className="px-4 text-center font-mono text-[11px] text-text-2">{p.name}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="font-mono text-xs text-brass">{p.sku}</div>
              <div className="flex-1 text-[15px] font-medium text-text-0">{p.name}</div>
              <div className="mt-1.5 flex items-center justify-between">
                <AvailabilityBadge quantity={p.quantity} />
                <span className="tag">{p.brandName}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
