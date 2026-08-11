import Image from "next/image";
import { getLiveBrandCount, getTotalSkuCount, getTotalUnitCount } from "@/lib/data/inventory";

const ICON_PATHS = [
  "M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5M12 13v8",
  "M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3.5 2",
  "M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z M8.5 12 11 14.5 15.5 10",
];

export async function StatStrip({ variant = "default" }: { variant?: "default" | "dark-accent" }) {
  const [totalSkus, totalUnits, liveBrands] = await Promise.all([getTotalSkuCount(), getTotalUnitCount(), getLiveBrandCount()]);

  const stats = [
    { num: `${totalSkus.toLocaleString()}+`, label: "SKUs In Network", desc: "Genuine and aftermarket parts available" },
    { num: `${totalUnits.toLocaleString()}+`, label: "Units In Stock", desc: "Ready for immediate dispatch from the UAE" },
    { num: String(liveBrands), label: "Brands Live In Inventory", desc: "Searchable by part number" },
    { num: "MEA", label: "Regional Coverage", desc: "UAE-based sourcing and export network" },
  ];

  if (variant === "dark-accent") {
    return (
      <div className="relative overflow-hidden border-b border-line bg-bg-0">
        <div className="absolute inset-y-0 left-0 w-[38%] opacity-25">
          <Image
            src="/images/inventory/Depth/warehouse.png"
            alt=""
            fill
            sizes="40vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(11,12,14,1)_95%)]" />
        </div>
        <div className="wrap relative grid grid-cols-2 gap-8 py-12 min-[901px]:grid-cols-4 min-[901px]:gap-6 min-[901px]:py-16">
          {stats.map((s, i) => (
            <div key={s.label}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mb-3 h-6 w-6 text-yellow">
                <path d={ICON_PATHS[i]} />
              </svg>
              <div className="text-[34px] font-bold leading-none text-yellow min-[901px]:text-[40px]">{s.num}</div>
              <div className="mt-1.5 text-[13px] font-semibold text-white">{s.label}</div>
              <div className="mt-1 text-[12px] text-white/55">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-line bg-bg-1">
      <div className="wrap grid grid-cols-2 gap-5 py-9 min-[901px]:grid-cols-4 min-[901px]:gap-0">
        {stats.map((s, i) => (
          <div key={s.label} className={`text-left ${i > 0 ? "min-[901px]:border-l min-[901px]:border-line min-[901px]:pl-6" : ""}`}>
            <div className="font-display text-[38px] font-bold text-brass">{s.num}</div>
            <div className="mt-1 font-mono text-[11.5px] uppercase tracking-[.06em] text-text-2">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
