import Image from "next/image";
import Link from "next/link";
import { InventoryBanner } from "@/components/home/InventoryBanner";
import { getFeaturedProducts } from "@/lib/data/inventory";
import { AVAILABILITY_LABEL, getAvailabilityStatus, type AvailabilityStatus } from "@/lib/types";

const STATUS_DOT: Record<AvailabilityStatus, string> = {
  in_stock: "bg-ok",
  limited_stock: "bg-warn",
  on_request: "bg-text-2",
  out_of_stock: "bg-text-2",
};

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
          {featured.map((p) => {
            const status = getAvailabilityStatus(p.quantity);
            return (
              <Link
                key={p.id}
                href={`/parts/${p.brandSlug}/${p.oemPartNumber.toLowerCase()}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-white/5 bg-[#17191d] shadow-[0_8px_24px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[rgba(196,162,106,.45)] hover:shadow-[0_16px_38px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.08),0_0_22px_rgba(196,162,106,.16)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(to_right,transparent,rgba(196,162,106,.7),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative h-[150px] overflow-hidden bg-[#111214] shadow-[inset_0_-24px_28px_-22px_rgba(0,0,0,.55)] min-[640px]:h-[168px]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_42%,rgba(196,162,106,.08),transparent_72%)]" />
                  <div className="absolute inset-0 p-4">
                    {p.imagePath ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={p.imagePath}
                          alt={`${p.brandName} ${p.description} — ${p.oemPartNumber}`}
                          fill
                          sizes="(min-width: 901px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-center">
                        <span className="font-mono text-[10.5px] text-text-2">{p.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10.5px] text-brass">{p.oemPartNumber}</span>
                    <span className="text-[10px] uppercase tracking-[.05em] text-text-2">{p.brandName}</span>
                  </div>
                  <div className="line-clamp-2 text-[14px] font-medium leading-snug text-text-0">{p.description}</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-text-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                      {AVAILABILITY_LABEL[status]}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[.06em] text-text-2 transition-colors duration-300 group-hover:text-brass">
                      View Part →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
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
