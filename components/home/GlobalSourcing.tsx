import { WorldMap } from "@/components/home/WorldMap";

// Real regions the map already routes to (components/home/WorldMap.tsx) —
// kept in sync manually since the map's region set is deliberately broader
// than a short label list would be on its own.
const REGIONS = ["GCC & Gulf", "East Africa", "West Africa", "Southern Africa", "Europe", "Asia", "USA / North America"];

export function GlobalSourcing() {
  return (
    <section className="border-b border-line bg-bg-0 py-16 min-[901px]:py-20">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-10 min-[1024px]:grid-cols-[0.85fr_1.15fr] min-[1024px]:items-center min-[1024px]:gap-16">
          <div>
            <div className="font-mono text-[12px] uppercase tracking-[.14em] text-yellow">Global Sourcing. Local Expertise.</div>
            <h2 className="mt-3.5 text-white">We Source. You Succeed.</h2>
            <p className="mt-4 max-w-[46ch] text-[15px] text-white/70">
              Can&apos;t find what you need? Our sourcing team locates the right parts through our UAE and international
              procurement network — genuine OEM, aftermarket, obsolete and hard-to-find.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2.5">
              {REGIONS.map((r) => (
                <span key={r} className="flex items-center gap-2 text-[13px] text-white/75">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5 flex-shrink-0 text-yellow">
                    <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="hidden min-[901px]:block">
              <WorldMap />
            </div>
            <div className="min-[901px]:hidden">
              <WorldMap compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
