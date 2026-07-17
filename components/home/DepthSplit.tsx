import { CheckIcon } from "@/components/ui/Icons";

const POINTS = [
  "Bin-tracked warehousing with full part-number traceability",
  "Dedicated dead-stock and surplus acquisition program",
  "Condition-graded inventory: Genuine OEM, Surplus, Obsolete",
];

export function DepthSplit() {
  return (
    <section className="py-16">
      <div className="wrap grid grid-cols-1 items-center gap-8 min-[901px]:grid-cols-2 min-[901px]:gap-16">
        <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-line-strong bg-bg-2 font-mono text-xs text-text-2">
          Warehouse racking — full inventory depth
        </div>
        <div>
          <div className="eyebrow">Inventory Depth</div>
          <h2 className="mt-3.5">Thousands of part numbers, held and shelf-ready</h2>
          <p className="mt-4 text-base">
            If it carries an OEM part number, chances are we can locate it — in our own racking, or through our supplier network.
          </p>
          <ul className="mt-7 flex flex-col gap-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3.5 text-[15px] text-text-1">
                <CheckIcon className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-brass" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
