import Image from "next/image";
import Link from "next/link";
import { InventoryBanner } from "@/components/home/InventoryBanner";
import { getFeaturedProducts } from "@/lib/data/inventory";
import { AVAILABILITY_LABEL, getAvailabilityStatus, type AvailabilityStatus } from "@/lib/types";

// Green is reserved for genuine confirmed stock only — every other status
// gets neutral grey, never amber/yellow, so "in stock" stays unambiguous.
const STATUS_DOT: Record<AvailabilityStatus, string> = {
  in_stock: "bg-ok",
  limited_stock: "bg-ink-2",
  on_request: "bg-ink-2",
  out_of_stock: "bg-ink-2",
};
const STATUS_TEXT: Record<AvailabilityStatus, string> = {
  in_stock: "text-ok",
  limited_stock: "text-ink-2",
  on_request: "text-ink-2",
  out_of_stock: "text-ink-2",
};

export async function FeaturedGrid() {
  const featured = await getFeaturedProducts(4);

  return (
    <section className="bg-paper-0 py-20 min-[901px]:py-24">
      <div className="wrap">
        <InventoryBanner />

        <div className="flex flex-col gap-10 min-[1181px]:flex-row min-[1181px]:items-start min-[1181px]:gap-10">
          {/* editorial block — ~23% on wide desktop, stacked full-width above the cards below that */}
          <div className="min-[1181px]:w-[23%] min-[1181px]:flex-shrink-0">
            <div className="font-mono text-[12px] uppercase tracking-[.14em] text-yellow">Inventory</div>
            <h2 className="mt-3.5 text-ink-0">
              Quality Parts.
              <br />
              Ready To Ship.
            </h2>
            <p className="mt-3.5 text-[15px] text-ink-1">
              Search our available genuine OEM stock by part number or browse our current inventory.
            </p>
            <Link
              href="/search"
              className="mt-6 inline-flex items-center gap-2 rounded-[7px] bg-yellow px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[.04em] text-black transition-colors hover:bg-yellow-glow"
            >
              Browse Inventory
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* products — flex-1 on wide desktop so it fills the remaining ~77% */}
          <div className="min-[1181px]:flex-1">
            <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1181px]:grid-cols-4 min-[1181px]:gap-5">
              {featured.map((p) => {
                const status = getAvailabilityStatus(p.quantity);
                return (
                  <Link
                    key={p.id}
                    href={`/parts/${p.brandSlug}/${p.oemPartNumber.toLowerCase()}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[12px] bg-paper-1 shadow-[0_4px_16px_rgba(15,17,20,.07)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,17,20,.13)]"
                  >
                    <div className="relative h-[170px] overflow-hidden bg-paper-2 min-[640px]:h-[190px]">
                      <div className="absolute inset-0 p-4">
                        {p.imagePath ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={p.imagePath}
                              alt={`${p.brandName} ${p.description} — ${p.oemPartNumber}`}
                              fill
                              sizes="(min-width: 1181px) 19vw, (min-width: 640px) 50vw, 100vw"
                              className="object-contain object-center drop-shadow-[0_10px_14px_rgba(15,17,20,.18)] transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-center">
                            <span className="font-mono text-[10.5px] text-ink-2">{p.description}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10.5px] text-yellow-dim">{p.oemPartNumber}</span>
                        <span className="text-[10px] uppercase tracking-[.05em] text-ink-2">{p.brandName}</span>
                      </div>
                      <div className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink-0">{p.description}</div>
                      <div className="mt-0.5 flex items-center justify-between gap-2 pt-1">
                        <span className={`inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[.04em] ${STATUS_TEXT[status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                          {AVAILABILITY_LABEL[status]}
                        </span>
                        <span className="font-mono text-[9.5px] uppercase tracking-[.06em] text-ink-2 transition-colors duration-300 group-hover:text-yellow-dim">
                          View Part →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
