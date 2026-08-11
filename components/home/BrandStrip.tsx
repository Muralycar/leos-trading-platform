import Image from "next/image";
import Link from "next/link";
import { BRAND_TICKER } from "@/lib/brand-directory";

// Broad, representative list of brands Leos Trading supplies parts for or
// sources through its procurement network — not a claim of authorized
// dealership or official representation. The full 44-name list lives in
// lib/brand-directory.ts (shared with /brands); this section only shows the
// subset with a real logo file in public/images/Brands/ — every other brand
// is deliberately skipped here rather than represented by a placeholder.
//
// Filenames confirmed against public/images/Brands/ on inspection — do not
// add an entry without a matching file. Missing logos (29 of 44 brands):
// Volvo, Volvo Penta, Cummins, Hino, Toyota, Hyundai, Kia, JCB, Doosan,
// Develon, Hitachi, Dynapac, Bomag, Hamm, Sakai, Astra, FPT, Deutz, MTU,
// Baudouin, Rexroth, Kawasaki, Danfoss, Timken, Mahle, Varta, Exide, Yuasa.
//
// Perkins is intentionally excluded despite perkins.png existing — verified
// at the pixel level (raw PNG decode, not just a visual check) that it's a
// plain RGB file with no alpha channel: solid opaque navy blue at every
// sampled point, corners included. Needs a real transparent re-export
// before it can rejoin this list.
const LOGO_FILE: Record<string, { file: string; width: number; height: number }> = {
  Iveco: { file: "iveco", width: 3264, height: 1312 },
  Kobelco: { file: "kobelco", width: 1983, height: 793 },
  Kohler: { file: "kohler", width: 3264, height: 1312 },
  Caterpillar: { file: "caterpillar", width: 1983, height: 793 },
  Komatsu: { file: "komatsu", width: 1536, height: 1024 },
  Yanmar: { file: "yanmar", width: 3264, height: 1312 },
  MAN: { file: "man", width: 1983, height: 793 },
  Scania: { file: "scania", width: 1983, height: 793 },
  "Mercedes-Benz": { file: "mercedes-benz", width: 3264, height: 1312 },
  "John Deere": { file: "john-deere", width: 1536, height: 1024 },
  Parker: { file: "parker", width: 1536, height: 1024 },
  SKF: { file: "skf", width: 3264, height: 1312 },
  Bosch: { file: "bosch", width: 3264, height: 1312 },
  Fleetguard: { file: "fleetguard", width: 1983, height: 793 },
  Donaldson: { file: "donaldson", width: 1536, height: 1024 },
};

const LOGO_BRANDS = BRAND_TICKER.filter((name) => LOGO_FILE[name]);

// These source files carry more internal transparent margin around the
// mark than their peers (confirmed at the pixel level), so at the same
// container height their visible logo reads smaller. Scaled ~62% larger
// to compensate. Perkins is included here too — pre-sized so it reads
// correctly the moment a transparent file replaces it — but stays out of
// LOGO_BRANDS above until then.
const ENLARGED_BRANDS = new Set(["Perkins", "Parker", "Komatsu", "Donaldson", "John Deere"]);

// Left/right fade so logos appear to move into and out of the section
// rather than cutting off hard at the edges.
const EDGE_FADE_STYLE = {
  maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
};

function BrandLogo({ name }: { name: string }) {
  const logo = LOGO_FILE[name];
  const heightClasses = ENLARGED_BRANDS.has(name)
    ? "h-[71px] min-[640px]:h-[81px] min-[901px]:h-[91px]"
    : "h-[44px] min-[640px]:h-[50px] min-[901px]:h-[56px]";
  return (
    <div className="group/logo flex flex-shrink-0 items-center px-7 min-[640px]:px-9 min-[901px]:px-11">
      <Image
        src={`/images/Brands/${logo.file}.png`}
        alt={name}
        width={logo.width}
        height={logo.height}
        className={`w-auto object-contain opacity-70 grayscale transition-all duration-300 ease-out group-hover/logo:opacity-100 group-hover/logo:grayscale-0 ${heightClasses}`}
      />
    </div>
  );
}

export function BrandStrip() {
  return (
    <div className="overflow-hidden border-y border-paper-line bg-paper-0 py-9">
      <div className="mx-auto mb-6 flex max-w-container items-center justify-center gap-4 px-5">
        <span className="h-px w-8 flex-shrink-0 bg-yellow/40 min-[541px]:w-16" />
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[.16em] text-yellow-dim">Brands We Supply &amp; Source</span>
        <span className="h-px w-8 flex-shrink-0 bg-yellow/40 min-[541px]:w-16" />
      </div>

      {/* continuous marquee — hidden when the OS/browser requests reduced motion */}
      <div className="group/track relative motion-reduce:hidden" style={EDGE_FADE_STYLE}>
        <div className="flex w-max animate-[leos-brand-marquee_38s_linear_infinite] group-hover/track:[animation-play-state:paused]">
          <div className="flex flex-shrink-0 items-center">
            {LOGO_BRANDS.map((name, i) => (
              <BrandLogo key={`a-${i}`} name={name} />
            ))}
          </div>
          {/* duplicate track for a seamless loop — hidden from assistive tech so brand names aren't announced twice */}
          <div className="flex flex-shrink-0 items-center" aria-hidden="true">
            {LOGO_BRANDS.map((name, i) => (
              <BrandLogo key={`b-${i}`} name={name} />
            ))}
          </div>
        </div>
      </div>

      {/* reduced-motion fallback — static wrapping row, no duplicated content */}
      <div className="wrap hidden flex-wrap items-center justify-center gap-x-10 gap-y-5 motion-reduce:flex">
        {LOGO_BRANDS.map((name) => {
          const logo = LOGO_FILE[name];
          return (
            <Image
              key={name}
              src={`/images/Brands/${logo.file}.png`}
              alt={name}
              width={logo.width}
              height={logo.height}
              className={`w-auto object-contain opacity-70 grayscale ${ENLARGED_BRANDS.has(name) ? "h-[81px]" : "h-[50px]"}`}
            />
          );
        })}
      </div>

      <div className="mt-5 flex justify-center">
        <Link href="/brands" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-0 hover:text-yellow-dim">
          View All Brands
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <p className="mx-auto mt-4 max-w-[70ch] px-5 text-center text-[11.5px] leading-relaxed text-ink-2">
        Brand names and trademarks are the property of their respective owners. Leos Trading FZE is an independent
        supplier and is not an authorized distributor unless otherwise stated.
      </p>

      <style>{`
        @keyframes leos-brand-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
