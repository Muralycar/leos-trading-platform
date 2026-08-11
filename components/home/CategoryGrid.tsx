import Image from "next/image";
import Link from "next/link";
import { getEquipmentCategories } from "@/lib/data/inventory";

// Small line-icon per category, used only by the light (Homepage) card
// treatment as a badge overlay — deliberately simple/generic shapes, not
// brand-specific artwork.
const CATEGORY_ICON: Record<string, string> = {
  "truck-parts": "M2 4h11v9H2z M13 8h4l3 3v2h-7V8Z M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  "construction-equipment-parts":
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  "generator-parts": "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  "mining-industrial-parts": "m3 20 6-11 4 7 3-5 5 9H3Z",
  "marine-parts": "M12 2v20M8 6h8M5 12H2a10 10 0 0 0 10 10 10 10 0 0 0 10-10h-3M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  "tyres-batteries-accessories": "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
};

export async function CategoryGrid({ showHeading = true, variant = "dark" }: { showHeading?: boolean; variant?: "dark" | "light" }) {
  const categories = await getEquipmentCategories();

  if (variant === "light") {
    return (
      <section className="bg-paper-0 py-16 min-[901px]:py-20">
        <div className="mx-auto max-w-[1440px] px-8 max-[1180px]:px-5">
          {showHeading ? (
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[.14em] text-yellow">
                <span className="h-px w-8 bg-yellow/50" />
                Our Categories
                <span className="h-px w-8 bg-yellow/50" />
              </div>
              <h2 className="mt-3.5 text-ink-0">Find Parts For Every Industry</h2>
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[901px]:grid-cols-3 min-[1181px]:grid-cols-6">
            {categories.map((c) => {
              const isLive = c.status === "live";
              return (
                <Link
                  key={c.slug}
                  href={`/search?cat=${encodeURIComponent(c.slug)}`}
                  aria-label={`${c.name} — ${isLive ? "View Inventory" : "Request a Part"}`}
                  className="group flex flex-col overflow-hidden rounded-[14px] bg-paper-1 shadow-[0_4px_18px_rgba(15,17,20,.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,17,20,.16)]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2">
                    {c.imagePath ? (
                      <Image
                        src={c.imagePath}
                        alt={c.name}
                        fill
                        loading="lazy"
                        sizes="(min-width: 1181px) 16vw, (min-width: 901px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className={`object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.05] ${isLive ? "" : "opacity-90"}`}
                      />
                    ) : null}
                    {CATEGORY_ICON[c.slug] ? (
                      <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-[8px] bg-yellow shadow-[0_4px_10px_rgba(0,0,0,.3)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#15171a" strokeWidth={1.8} className="h-[18px] w-[18px]">
                          <path d={CATEGORY_ICON[c.slug]} />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <h3 className="font-sans text-[15px] font-semibold normal-case leading-tight text-ink-0">{c.name}</h3>
                    <div className="font-mono text-[11.5px] text-ink-2">
                      {isLive ? `${c.skuCount.toLocaleString()}+ SKUs` : "Sourcing Network"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-[7px] bg-yellow px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[.04em] text-black transition-colors hover:bg-yellow-glow"
            >
              View All Products
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

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
