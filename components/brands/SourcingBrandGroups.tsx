import Link from "next/link";
import { SOURCING_BRAND_GROUPS } from "@/lib/brand-directory";

/**
 * Compact chips grouped by industry category — deliberately not premium
 * cards (30+ of those would be visual noise and would overstate what's
 * genuinely sourced-on-request vs. held as physical stock). Each chip
 * links straight into the existing sourcing RFQ flow with the brand name
 * pre-filled — no new backend, reuses RfqForm's existing prefill prop.
 */
export function SourcingBrandGroups() {
  return (
    <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2 min-[1181px]:grid-cols-3">
      {SOURCING_BRAND_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-4 bg-bg-0 p-7">
          <h4 className="font-mono text-[11px] uppercase tracking-[.08em] text-text-2">{group.title}</h4>
          <div className="flex flex-wrap gap-2">
            {group.brands.map((b) => (
              <Link
                key={b.name}
                href={`/sourcing?brand=${encodeURIComponent(b.name)}#request`}
                className="rounded-s border border-line-strong px-3.5 py-2 text-sm text-text-1 transition-colors hover:border-brass hover:text-brass"
              >
                {b.name}
                {b.note ? <span className="ml-1.5 text-[11px] text-text-2">({b.note})</span> : null}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
