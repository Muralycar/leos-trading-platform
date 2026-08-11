import Image from "next/image";

/**
 * Shallow across every breakpoint by design — a banner, not a second hero.
 * object-position is pinned slightly below center to keep the sharpest,
 * most identifiable cluster (turbo, crankshaft, gears, filters) in frame
 * even at the widest/shallowest desktop crop.
 */
export function InventoryBanner() {
  return (
    <div className="relative mb-10 aspect-[4/3] w-full overflow-hidden rounded-m border border-paper-line-strong bg-bg-2 min-[640px]:aspect-[16/8] min-[901px]:mb-12 min-[901px]:aspect-[21/7]">
      <Image
        src="/images/inventory/showcase.png"
        alt="Organized OEM spare parts — filters, bearings, gears and hydraulic components in Leos Trading's warehouse"
        fill
        sizes="100vw"
        quality={85}
        className="object-cover object-[center_58%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(9,10,12,.35),transparent_45%)]" />
    </div>
  );
}
