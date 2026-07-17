import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { getAvailability } from "@/lib/data/inventory";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";

export function RelatedParts({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-text-2">
        No other published parts in this category yet — check back as inventory grows, or{" "}
        <Link href="/sourcing#request" className="text-brass">
          request a part
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-px border border-line bg-line min-[901px]:grid-cols-4">
      {products.map((p) => (
        <Link key={p.id} href={`/parts/${p.brandSlug}/${p.oemPartNumber.toLowerCase()}`} className="flex flex-col bg-bg-0">
          <div className="relative flex aspect-square items-center justify-center bg-bg-2 p-5">
            {p.imagePath ? (
              <Image src={p.imagePath} alt={p.description} fill className="object-contain p-5" />
            ) : (
              <span className="px-3 text-center font-mono text-[10px] text-text-2">{p.description}</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="font-mono text-xs text-brass">{p.oemPartNumber}</div>
            <div className="flex-1 text-sm text-text-0">{p.description}</div>
            <AvailabilityBadge quantity={getAvailability(p.id).quantity} />
          </div>
        </Link>
      ))}
    </div>
  );
}
