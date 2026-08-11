import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { AVAILABILITY_LABEL, getAvailabilityStatus } from "@/lib/types";

/**
 * Stock status and quantity as one coherent group — dot + label always,
 * "· N PCS" appended only for the two statuses where the quantity is a
 * meaningful positive count (in_stock/limited_stock). Reuses the same
 * getAvailabilityStatus()/AVAILABILITY_LABEL every other page derives
 * availability from — no new status invented here.
 */
function StockInfo({ quantity }: { quantity: number }) {
  const status = getAvailabilityStatus(quantity);
  const dotClass = status === "in_stock" ? "bg-ok" : status === "limited_stock" ? "bg-warn" : "bg-text-2";
  const textClass = status === "in_stock" ? "text-ok" : status === "limited_stock" ? "text-warn" : "text-text-2";
  const showQuantity = status === "in_stock" || status === "limited_stock";

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[.04em] ${textClass}`}>
      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotClass}`} />
      {AVAILABILITY_LABEL[status]}
      {showQuantity ? (
        <>
          <span className="text-line-strong">•</span>
          <span>
            {quantity} {quantity === 1 ? "PC" : "PCS"}
          </span>
        </>
      ) : null}
    </span>
  );
}

/**
 * Compact hybrid row, not an e-commerce product card — ~99.5% of live
 * products have no photo, so the layout is designed to look complete and
 * intentional without one; a real image (when present) shows as a small
 * inline icon rather than a reserved thumbnail column. Two sibling links
 * (not one wrapping link) since the info block and "Request Quotation"
 * deliberately go to different anchors on the same product page — nesting
 * an anchor inside another anchor isn't valid HTML.
 */
export function ResultRow({ product, brandName }: { product: Product; brandName: string }) {
  const { quantity } = product;
  const href = `/parts/${product.brandSlug}/${product.oemPartNumber.toLowerCase()}`;

  return (
    <div className="group flex flex-col gap-3 border-b border-line bg-bg-0 px-4 py-4 transition-all duration-200 hover:bg-bg-1 hover:shadow-[inset_3px_0_0_0_rgba(196,162,106,.6)] min-[901px]:grid min-[901px]:grid-cols-[1fr_auto_auto] min-[901px]:items-center min-[901px]:gap-6 min-[901px]:px-5 min-[901px]:py-3.5">
      <Link href={href} className="flex min-w-0 items-center gap-3">
        {product.imagePath ? (
          <span className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-s bg-bg-2">
            <Image src={product.imagePath} alt="" fill className="object-contain p-1" />
          </span>
        ) : null}
        <span className="min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-[.06em] text-text-2">{brandName}</span>
          <span className="block truncate font-mono text-[16.5px] font-extrabold tracking-[.01em] text-brass min-[901px]:text-[17px]">
            {product.oemPartNumber}
          </span>
          <span className="block truncate text-[13px] text-text-1">{product.description}</span>
        </span>
      </Link>

      <StockInfo quantity={quantity} />

      <Link
        href={`${href}#rfq`}
        className="btn btn-ghost btn-sm w-full justify-center gap-1.5 transition-all duration-200 group-hover:border-brass group-hover:text-brass group-hover:shadow-[0_0_14px_rgba(196,162,106,.25)] min-[901px]:w-auto"
      >
        Request Quotation
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
