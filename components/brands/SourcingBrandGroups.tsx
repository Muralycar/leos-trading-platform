import Link from "next/link";
import { SOURCING_BRAND_GROUPS } from "@/lib/brand-directory";

/**
 * Compact chips grouped by industry category — deliberately not premium
 * cards (30+ of those would be visual noise and would overstate what's
 * genuinely sourced-on-request vs. held as physical stock). Sourcing-only
 * chips link into the existing sourcing RFQ flow with the brand name
 * pre-filled (no new backend, reuses RfqForm's existing prefill prop);
 * chips for brands with real live inventory (liveSlug set) link straight
 * to that brand's inventory page instead, with a small green indicator so
 * the distinction is visible, not just the different destination.
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
                href={b.liveSlug ? `/brands/${b.liveSlug}` : `/sourcing?brand=${encodeURIComponent(b.name)}#request`}
                className={`inline-flex items-center gap-2 rounded-s border px-3.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0 ${
                  b.liveSlug
                    ? "border-[rgba(108,196,140,.35)] bg-[#0f1f16] text-text-0 hover:border-ok"
                    : "border-line-strong text-text-1 hover:border-brass hover:bg-[rgba(196,162,106,.06)] hover:text-brass hover:shadow-[0_0_0_1px_rgba(196,162,106,.2)]"
                }`}
              >
                {b.name}
                {b.liveSlug ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-semibold uppercase tracking-[.05em] text-ok">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                    Live Stock
                  </span>
                ) : null}
                {b.note ? <span className="text-[11px] text-text-2">({b.note})</span> : null}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
