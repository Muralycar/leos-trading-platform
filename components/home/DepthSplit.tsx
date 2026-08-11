import Image from "next/image";
import { CheckIcon } from "@/components/ui/Icons";

const POINTS = [
  "Bin-tracked warehousing with full part-number traceability",
  "Dedicated dead-stock and surplus acquisition program",
  "Condition-graded inventory: Genuine OEM, Surplus, Obsolete",
];

export function DepthSplit() {
  return (
    <section className="bg-paper-0 py-16">
      <div className="wrap grid grid-cols-1 items-center gap-8 min-[901px]:grid-cols-2 min-[901px]:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-m border border-paper-line-strong bg-paper-2">
          <Image
            src="/images/inventory/Depth/parts-warehouse.png"
            alt="Warehouse racking and organized spare parts inventory"
            fill
            sizes="(min-width: 901px) 50vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,23,26,.05)_0%,rgba(21,23,26,.35)_100%)]" />
        </div>
        <div>
          <div className="font-mono text-[12px] uppercase tracking-[.14em] text-yellow">Inventory Depth</div>
          <h2 className="mt-3.5 text-ink-0">Thousands of part numbers, stocked and shelf-ready</h2>
          <p className="mt-4 text-base text-ink-1">
            If it carries an OEM part number, chances are we can locate it — in our own racking, or through our supplier network.
          </p>
          <ul className="mt-7 flex flex-col gap-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3.5 text-[15px] text-ink-1">
                <CheckIcon className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-yellow" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
