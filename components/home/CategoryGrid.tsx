import Image from "next/image";
import Link from "next/link";
import { getEquipmentCategories } from "@/lib/data/inventory";

export async function CategoryGrid() {
  const categories = await getEquipmentCategories();

  return (
    <section className="py-16">
      <div className="wrap">
        <div className="mb-12 max-w-[640px]">
          <div className="eyebrow">Products</div>
          <h2 className="mt-3.5">Categories</h2>
          <p className="mt-4 text-[17px]">
            Live inventory in Generator Parts, Truck Parts and Construction Equipment Parts today, with the same architecture onboarding every other category.
          </p>
        </div>
      </div>
      <div className="wrap">
        <div className="grid grid-cols-1 gap-6 min-[901px]:grid-cols-3">
          {categories.map((c) => {
            const isLive = c.status === "live";
            return (
              <div
                key={c.slug}
                className={`group relative flex flex-col overflow-hidden rounded-m border border-line bg-bg-1 shadow-[0_12px_32px_rgba(0,0,0,.35)] transition-colors hover:border-line-strong ${isLive ? "" : "opacity-90"}`}
              >
                <div className="relative h-[240px]">
                  {c.imagePath ? (
                    <Image
                      src={c.imagePath}
                      alt={c.name}
                      fill
                      sizes="(min-width: 901px) 33vw, 100vw"
                      className={`object-contain object-center p-6 ${isLive ? "" : "opacity-55"}`}
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center border border-dashed border-line-strong font-mono text-xs text-text-2 ${isLive ? "" : "opacity-55"}`}>
                      {c.name} — photography pending
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6 pt-4">
                  <span className={`tag w-fit ${isLive ? "tag-stock" : "tag-soon"}`}>
                    {isLive ? `${c.skuCount.toLocaleString()} SKUs In Stock` : "Sourcing Network"}
                  </span>
                  <h3 className="mt-3 text-[26px]">{c.name}</h3>
                  <p className="mt-3 flex-1 text-sm">
                    {c.brandsLabel}.{" "}
                    {isLive
                      ? " Genuine OEM inventory held in UAE warehousing, searchable by part number."
                      : " Sourced through our global procurement network on request."}
                  </p>
                  <span
                    aria-hidden="true"
                    className="btn btn-ghost btn-sm mt-5 self-start transition-colors group-hover:border-brass group-hover:text-brass"
                  >
                    {isLive ? "View Inventory" : "Request a Part"} →
                  </span>
                  <Link
                    href={`/search?cat=${encodeURIComponent(c.slug)}`}
                    aria-label={`${c.name} — ${isLive ? "View Inventory" : "Request a Part"}`}
                    className="absolute inset-0 z-10 rounded-m focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
