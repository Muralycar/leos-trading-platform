export interface CapabilityGroup {
  title: string;
  items: string[];
}

/**
 * Static, non-interactive chips — a scannable capability overview, not a
 * category nav. Deliberately simpler than SourcingBrandGroups (no
 * live-stock/link logic — these are supply-type/application labels, not
 * brand names tied to specific inventory).
 */
export function CapabilityGroups({ groups }: { groups: CapabilityGroup[] }) {
  return (
    <div className="grid grid-cols-1 gap-10 min-[801px]:grid-cols-2 min-[801px]:gap-14">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="font-mono text-[11px] uppercase tracking-[.08em] text-text-2">{g.title}</div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {g.items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-s border border-line-strong px-3.5 py-2 text-[13.5px] text-text-1"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
