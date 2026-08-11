import Image from "next/image";
import Link from "next/link";
import { getEquipmentCategories } from "@/lib/data/inventory";

export async function CategoryGrid({ showHeading = true }: { showHeading?: boolean }) {
  const categories = await getEquipmentCategories();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1440px] px-8 max-[1180px]:px-5">
        {showHeading ? (
          <div className="mb-12 max-w-[640px]">
            <div className="eyebrow">Products</div>
            <h2 className="mt-3.5">Explore Our OEM Parts Inventory</h2>
            <p className="mt-4 text-[17px]">Search genuine OEM and quality aftermarket parts by category.</p>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[901px]:grid-cols-3">
          {categories.map((c) => {
            const isLive = c.status === "live";
            return (
              <div
                key={c.slug}
                className={`group relative flex flex-col overflow-hidden rounded-[18px] border border-white/5 bg-[#17191d] p-4 pb-3.5 shadow-[0_12px_35px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.05)] transition-all duration-[320ms] ease-out hover:-translate-y-2 hover:border-[rgba(196,162,106,.45)] hover:shadow-[0_24px_56px_rgba(0,0,0,.58),inset_0_1px_0_rgba(255,255,255,.08),0_0_32px_rgba(196,162,106,.2)] ${isLive ? "" : "opacity-90"}`}
              >
                {/* brass accent line, top edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(to_right,transparent,rgba(196,162,106,.7),transparent)] opacity-40 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative aspect-[17/11] h-[118px] self-center overflow-hidden rounded-xl bg-[#0f1012] min-[640px]:h-[136px] min-[901px]:h-[146px]">
                  {c.imagePath ? (
                    <>
                      {/* soft radial spotlight, dark-to-brass, very low opacity */}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_50%_42%,rgba(196,162,106,.08),rgba(15,16,18,0)_70%)]" />
                      <Image
                        src={c.imagePath}
                        alt={c.name}
                        fill
                        loading="lazy"
                        sizes="(min-width: 901px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className={`object-contain object-center drop-shadow-[0_16px_18px_rgba(0,0,0,.55)] brightness-[1.13] contrast-[1.05] transition-transform duration-500 ease-out group-hover:scale-[1.04] ${isLive ? "" : "opacity-55"}`}
                      />
                      {/* soft shadow / floor reflection under the object */}
                      <div className="pointer-events-none absolute bottom-1.5 left-1/2 h-3 w-[62%] -translate-x-1/2 rounded-full bg-black/55 blur-md" />
                      {/* vignette */}
                      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_28px_10px_rgba(0,0,0,.35)]" />
                    </>
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center border border-dashed border-line-strong font-mono text-xs text-text-2 ${isLive ? "" : "opacity-55"}`}>
                      {c.name} — photography pending
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col pt-2.5">
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] ${
                      isLive ? "border-[rgba(108,196,140,.35)] bg-[#0f1f16] text-ok" : "border-line-strong bg-white/[0.03] text-text-2"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-ok" : "bg-text-2"}`} />
                    {isLive ? `${c.skuCount.toLocaleString()} SKUs In Stock` : "Sourcing Network"}
                  </span>
                  <h3 className="mt-1.5 text-[18px] tracking-[0.02em] min-[640px]:text-[20px] min-[901px]:text-[22px]">{c.name}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm">
                    {c.brandsLabel}.{" "}
                    {isLive
                      ? " Genuine OEM inventory held in UAE warehousing, searchable by part number."
                      : " Sourced through our global procurement network on request."}
                  </p>
                  <span
                    aria-hidden="true"
                    className="btn btn-ghost btn-sm mt-3.5 self-start gap-2 px-5 py-2.5 transition-all duration-300 group-hover:border-brass group-hover:text-brass group-hover:shadow-[0_0_18px_rgba(196,162,106,.3)]"
                  >
                    {isLive ? "View Inventory" : "Request a Part"}
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </span>
                  <Link
                    href={`/search?cat=${encodeURIComponent(c.slug)}`}
                    aria-label={`${c.name} — ${isLive ? "View Inventory" : "Request a Part"}`}
                    className="absolute inset-0 z-10 rounded-[18px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0"
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
