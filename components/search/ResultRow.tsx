import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { getAvailability } from "@/lib/data/inventory";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";

export function ResultRow({ product, brandName }: { product: Product; brandName: string }) {
  const { quantity } = getAvailability(product.id);

  return (
    <Link
      href={`/parts/${product.brandSlug}/${product.oemPartNumber.toLowerCase()}`}
      className="grid grid-cols-[64px_1fr] items-center gap-4 bg-bg-0 p-4 transition-colors hover:bg-bg-1 min-[901px]:grid-cols-[88px_1fr_auto_auto_auto] min-[901px]:gap-5 min-[901px]:p-5"
    >
      <div className="flex h-[52px] w-16 items-center justify-center rounded-s bg-bg-2 p-2 min-[901px]:h-16 min-[901px]:w-[88px]">
        {product.imagePath ? (
          <Image
            src={product.imagePath}
            alt={product.description}
            width={88}
            height={64}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="px-1 text-center font-mono text-[8.5px] leading-tight text-text-2">{product.description}</span>
        )}
      </div>
      <div>
        <div className="font-mono text-[13px] text-brass">{product.oemPartNumber}</div>
        <div className="mt-0.5 text-[15px] text-text-0">{product.description}</div>
        <div className="mt-0.5 text-[12.5px] text-text-2">{product.productCategoryName}</div>
      </div>
      <div className="text-left text-[13px] text-text-1 min-[901px]:text-right">
        <span className="mb-1 block font-mono text-[10.5px] uppercase tracking-[.06em] text-text-2">Brand</span>
        {brandName}
      </div>
      <div className="text-left text-[13px] text-text-1 min-[901px]:text-right">
        <span className="mb-1 block font-mono text-[10.5px] uppercase tracking-[.06em] text-text-2">Qty Available</span>
        {quantity}
      </div>
      <div className="min-[901px]:text-right">
        <AvailabilityBadge quantity={quantity} />
      </div>
    </Link>
  );
}
