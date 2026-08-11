import Image from "next/image";
import Link from "next/link";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { InventoryBanner } from "@/components/home/InventoryBanner";
import { getFeaturedProducts } from "@/lib/data/inventory";

export async function FeaturedGrid() {
  const featured = await getFeaturedProducts(4);

  return (
    <section className="py-20 min-[901px]:py-24">
      <div className="wrap">
        <div className="mb-10 max-w-[640px]">
          <div className="eyebrow">Featured Parts</div>
          <h2 className="mt-3.5">Recently added to inventory</h2>
          <p className="mt-3.5 text-[15px]">Selected stock available for immediate enquiry.</p>
        </div>

        <InventoryBanner />

        <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[901px]:grid-cols-4 min-[901px]:gap-5">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/parts/${p.brandSlug}/${p.oemPartNumber.toLowerCase()}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-white/5 bg-[#17191d] shadow-[0_8px_24px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[rgba(196,162,106,.45)] hover:shadow-[0_16px_38px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.08),0_0_22px_rgba(196,162,106,.16)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(to_right,transparent,rgba(196,162,106,.7),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative h-[140px] bg-bg-2 min-[640px]:h-[160px]">
                <div className="absolute inset-0 p-3.5">
                  {p.imagePath ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={p.imagePath}
                        alt={`${p.brandName} ${p.description} — ${p.oemPartNumber}`}
                        fill
                        sizes="(min-width: 901px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-center">
                      <span className="font-mono text-[10.5px] text-text-2">{p.description}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <div className="font-mono text-[11px] text-brass">{p.oemPartNumber}</div>
                <div className="flex-1 text-[13.5px] font-medium leading-snug text-text-0">{p.description}</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <AvailabilityBadge quantity={p.quantity} />
                  <span className="tag">{p.brandName}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center min-[901px]:mt-12">
          <Link href="/search" className="btn btn-ghost">
            View All Inventory
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
