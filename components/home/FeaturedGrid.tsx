import Image from "next/image";
import Link from "next/link";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { getFeaturedProducts } from "@/lib/data/inventory";

export async function FeaturedGrid() {
  const featured = await getFeaturedProducts(8);

  return (
    <section className="py-16">
      <div className="wrap">
        <div className="mb-12 max-w-[640px]">
          <div className="eyebrow">Featured Parts</div>
          <h2 className="mt-3.5">Recently added to inventory</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-px border border-line bg-line min-[640px]:grid-cols-2 min-[901px]:grid-cols-4">
        {featured.map((p) => (
          <Link
            key={p.id}
            href={`/parts/${p.brandSlug}/${p.oemPartNumber.toLowerCase()}`}
            className="group flex flex-col bg-bg-0"
          >
            <div className="relative flex h-[230px] items-center justify-center overflow-hidden bg-bg-2 p-5 min-[640px]:h-[260px] min-[901px]:h-[300px]">
              {p.imagePath ? (
                <Image
                  src={p.imagePath}
                  alt={`${p.brandName} ${p.description} — ${p.oemPartNumber}`}
                  fill
                  sizes="(min-width: 901px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain object-center p-3 transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <span className="px-4 text-center font-mono text-[11px] text-text-2">{p.description}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="font-mono text-xs text-brass">{p.oemPartNumber}</div>
              <div className="flex-1 text-[15px] font-medium text-text-0">{p.description}</div>
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
