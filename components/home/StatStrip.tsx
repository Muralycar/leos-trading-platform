import { getLiveBrandCount, getTotalSkuCount, getTotalUnitCount } from "@/lib/data/inventory";

export async function StatStrip() {
  const [totalSkus, totalUnits, liveBrands] = await Promise.all([getTotalSkuCount(), getTotalUnitCount(), getLiveBrandCount()]);

  const stats = [
    { num: `${totalSkus.toLocaleString()}+`, label: "SKUs In Network" },
    { num: `${totalUnits.toLocaleString()}+`, label: "Units In Stock" },
    { num: String(liveBrands), label: "Brands Live In Inventory" },
    { num: "MEA", label: "Regional Coverage" },
  ];

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
