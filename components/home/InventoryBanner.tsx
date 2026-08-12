import Image from "next/image";

/**
 * Shallow across every breakpoint by design — a banner, not a second hero.
 * object-position keeps the shelving band with the turbochargers/parts
 * bins in frame even at the widest/shallowest desktop crop, rather than
 * the plain wall/ceiling above or the aisle floor below.
 */
export function InventoryBanner() {
  return (
    <div className="relative mb-10 aspect-[4/3] w-full overflow-hidden rounded-m border border-paper-line-strong bg-bg-2 min-[640px]:aspect-[16/8] min-[901px]:mb-12 min-[901px]:aspect-[21/7]">
      <Image
        src="/images/inventory/warehouse-live-02.png"
        alt="Warehouse racking with organized spare parts, turbochargers and filtration components"
        fill
        sizes="100vw"
        quality={85}
        className="object-cover object-[45%_46%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(9,10,12,.35),transparent_45%)]" />
    </div>
  );
}
