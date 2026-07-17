import Image from "next/image";
import Link from "next/link";
import { EQUIPMENT_CATEGORIES } from "@/lib/placeholder-data";

export function CategoryGrid() {
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
      <div className="grid grid-cols-1 gap-px bg-line min-[901px]:grid-cols-3">
        {EQUIPMENT_CATEGORIES.map((c) => {
          const isLive = c.status === "live";
          return (
            <div key={c.slug} className={`flex min-h-[420px] flex-col bg-bg-1 ${isLive ? "" : "opacity-90"}`}>
              <div className="relative h-[240px] bg-bg-2">
                {c.imagePath ? (
                  <Image
                    src={c.imagePath}
                    alt={c.name}
                    fill
                    className={`object-contain p-6 ${isLive ? "" : "opacity-55"}`}
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center border border-dashed border-line-strong font-mono text-xs text-text-2 ${isLive ? "" : "opacity-55"}`}>
                    {c.name} — photography pending
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-7">
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
                <Link href={`/search?cat=${encodeURIComponent(c.slug)}`} className="btn btn-ghost btn-sm mt-5 self-start">
                  {isLive ? "View Inventory" : "Request a Part"} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
