import { BRAND_TICKER as BRANDS } from "@/lib/brand-directory";

// Broad, representative list of brands Leos Trading supplies parts for or
// sources through its procurement network — not a claim of authorized
// dealership or official representation. Static/decorative, so this section
// intentionally doesn't read from the brands table (that data — the brands
// with live, searchable inventory — is what drives Header/Footer/CategoryGrid
// elsewhere; this ticker is a broader "who we work with" statement). The
// list itself lives in lib/brand-directory.ts, shared with the /brands page.

// Left/right fade so names appear to move into and out of the section rather
// than cutting off hard at the edges.
const EDGE_FADE_STYLE = {
  maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
};

function BrandItem({ name }: { name: string }) {
  return (
    <span className="inline-flex flex-shrink-0 items-center gap-5 px-2.5 min-[640px]:gap-6 min-[640px]:px-3 min-[901px]:gap-8 min-[901px]:px-4">
      <span className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[.06em] text-[oklch(0.62_0.01_90)] transition-colors duration-300 hover:text-brass min-[640px]:text-base min-[901px]:text-lg min-[1181px]:text-xl">
        {name}
      </span>
      <span aria-hidden="true" className="h-1 w-1 flex-shrink-0 rounded-full bg-[rgba(196,162,106,.45)]" />
    </span>
  );
}

export function BrandStrip() {
  return (
    <div className="overflow-hidden border-y border-line bg-bg-1 py-[30px]">
      <div className="mx-auto mb-4 flex max-w-container items-center justify-center gap-4 px-5">
        <span className="h-px w-8 flex-shrink-0 bg-[rgba(196,162,106,.35)] min-[541px]:w-16" />
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[.16em] text-brass">Brands We Supply &amp; Source</span>
        <span className="h-px w-8 flex-shrink-0 bg-[rgba(196,162,106,.35)] min-[541px]:w-16" />
      </div>

      {/* continuous marquee — hidden when the OS/browser requests reduced motion */}
      <div className="group relative motion-reduce:hidden" style={EDGE_FADE_STYLE}>
        <div className="flex w-max animate-[leos-brand-marquee_50s_linear_infinite] group-hover:[animation-play-state:paused]">
          <div className="flex flex-shrink-0 items-center">
            {BRANDS.map((name, i) => (
              <BrandItem key={`a-${i}`} name={name} />
            ))}
          </div>
          {/* duplicate track for a seamless loop — hidden from assistive tech so brand names aren't announced twice */}
          <div className="flex flex-shrink-0 items-center" aria-hidden="true">
            {BRANDS.map((name, i) => (
              <BrandItem key={`b-${i}`} name={name} />
            ))}
          </div>
        </div>
      </div>

      {/* reduced-motion fallback — static wrapping list, no duplicated content */}
      <div className="wrap hidden flex-wrap items-center justify-center gap-x-8 gap-y-3 motion-reduce:flex">
        {BRANDS.map((name) => (
          <span key={name} className="font-display text-base font-semibold uppercase tracking-[.06em] text-[oklch(0.62_0.01_90)] min-[901px]:text-lg">
            {name}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes leos-brand-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
