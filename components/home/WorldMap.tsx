import type { CSSProperties } from "react";

// Schematic silhouettes (not a geographic projection) for Africa, the
// Arabian Peninsula, Europe and Asia, bounded tightly so the drawn shapes
// fill their viewBox rather than floating in dead margin. Routes group
// nearby Gulf markets (Saudi Arabia, Qatar, Oman, Bahrain) into one "GCC &
// Gulf" label rather than pinning each individually, and every label names a
// broad market region, never a specific country, so nothing here reads as a
// claim of confirmed shipment history.
const VIEWBOX = { x: 0, y: 0, w: 640, h: 420 };
// Compact crop for the hero's mobile/tablet map — a short, wide band around
// the UAE hub and its nearest markets, not a shrunk copy of the full map.
const VIEWBOX_COMPACT = { x: 148, y: 55, w: 442, h: 205 };

// UAE hub sits at the Musandam coastal point of the redrawn Arabian
// Peninsula silhouette below — geographically the right spot (the UAE/Oman
// pinch point on the Gulf, near the Strait of Hormuz).
const UAE_HUB = { x: 408, y: 213, labelX: 432, labelY: 196, anchor: "start" as const };

type Region = { key: string; label: string; x: number; y: number; labelX: number; labelY: number; anchor: string; duration: string; path: string };

// GCC & Gulf / East Africa / UAE Hub are the three points that sit closest
// together — positioned and curved deliberately so their labels and routes
// keep clear separation instead of converging on the hub.
const REGIONS: Region[] = [
  { key: "gcc", label: "GCC & Gulf", x: 372, y: 168, labelX: 336, labelY: 142, anchor: "end", duration: "7s", path: "M408,213 Q390,188 372,168" },
  { key: "east-africa", label: "East Africa", x: 322, y: 222, labelX: 296, labelY: 248, anchor: "end", duration: "8.2s", path: "M408,213 Q365,220 322,222" },
  { key: "west-africa", label: "West Africa", x: 165, y: 222, labelX: 150, labelY: 202, anchor: "end", duration: "9.4s", path: "M408,213 Q290,218 165,222" },
  { key: "southern-africa", label: "Southern Africa", x: 245, y: 392, labelX: 245, labelY: 410, anchor: "middle", duration: "10s", path: "M408,213 Q330,305 245,392" },
  { key: "europe", label: "Europe", x: 282, y: 45, labelX: 282, labelY: 26, anchor: "middle", duration: "7.6s", path: "M408,213 Q345,125 282,45" },
  { key: "asia", label: "Asia", x: 528, y: 150, labelX: 544, labelY: 132, anchor: "start", duration: "8.8s", path: "M408,213 Q472,180 528,150" },
  // USA / North America — drawn in the previously-empty far-left margin of
  // the same canvas (no viewBox resize, so the map's rendered size in the
  // Hero is unchanged). Routed as a cubic curve that leaves the hub steeply
  // upward before sweeping left, deliberately staying clear of the nearby
  // GCC and Europe labels rather than cutting through them. Desktop-only —
  // dropped from COMPACT_REGIONS below to keep the mobile map readable, per
  // the brief's explicit allowance to simplify/hide it there.
  { key: "usa", label: "USA / North America", x: 75, y: 100, labelX: 14, labelY: 50, anchor: "start", duration: "11.5s", path: "M408,213 C395,140 330,60 75,100" },
];

// Mobile/tablet compact set — three broad groups instead of six, per the
// brief's "GCC/Gulf, Africa, Europe/Asia" simplification, so the compact map
// is a deliberately shorter composition rather than a shrunk full map.
const COMPACT_REGIONS: Region[] = [
  { key: "gcc", label: "GCC & Gulf", x: 372, y: 168, labelX: 340, labelY: 148, anchor: "end", duration: "7s", path: "M408,213 Q390,188 372,168" },
  { key: "africa", label: "Africa", x: 232, y: 258, labelX: 232, labelY: 278, anchor: "middle", duration: "9s", path: "M408,213 Q322,235 232,258" },
  { key: "europe-asia", label: "Europe & Asia", x: 468, y: 92, labelX: 478, labelY: 74, anchor: "start", duration: "8s", path: "M408,213 Q438,150 468,92" },
];

// textAnchor-equivalent for the HTML label overlay — points are positioned by
// percentage of the SVG viewBox, so the label itself needs the matching
// horizontal transform to anchor start/middle/end the same way SVG text would.
const ANCHOR_TRANSFORM: Record<string, string> = {
  start: "translate(0,-50%)",
  middle: "translate(-50%,-50%)",
  end: "translate(-100%,-50%)",
};

type Box = { x: number; y: number; w: number; h: number };

function MapLabel({
  x,
  y,
  anchor,
  box,
  children,
  strong,
}: {
  x: number;
  y: number;
  anchor: string;
  box: Box;
  children: string;
  strong?: boolean;
}) {
  return (
    <span
      className={`pointer-events-none absolute whitespace-nowrap font-mono text-[10.5px] tracking-[.02em] min-[1181px]:text-[11.5px] ${
        strong ? "text-[12px] font-semibold text-[#f0d5a3] min-[1181px]:text-[13px]" : "text-[#b7bcc3]"
      }`}
      style={{
        left: `${((x - box.x) / box.w) * 100}%`,
        top: `${((y - box.y) / box.h) * 100}%`,
        transform: ANCHOR_TRANSFORM[anchor],
      }}
    >
      {children}
    </span>
  );
}

/**
 * `compact` swaps in a short, wide viewBox crop and a reduced three-region
 * set (GCC & Gulf / Africa / Europe & Asia) with a larger UAE hub — used for
 * the hero's stacked mobile/tablet layout so the map reads as a genuinely
 * shorter composition, not a shrunk copy of the desktop map.
 */
export function WorldMap({ compact = false }: { compact?: boolean }) {
  const box = compact ? VIEWBOX_COMPACT : VIEWBOX;
  const regions = compact ? COMPACT_REGIONS : REGIONS;
  const hubRingR = compact ? 9 : 7;
  const hubDotR = compact ? 7 : 5.5;

  return (
    <div className="relative">
      <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} role="img" className="h-auto w-full overflow-visible">
        <title>Leos Trading&apos;s global supply network, radiating from its UAE hub</title>
        <desc>
          A schematic map centered on the UAE, with subtle route lines toward the markets Leos Trading serves
          {compact
            ? ": the GCC and wider Gulf, Africa, and Europe and Asia."
            : ": the GCC and wider Gulf, East Africa, West Africa, Southern Africa, Europe, Asia and the USA/North America."}
        </desc>

        <style>{`
          @keyframes leos-map-route-flow {
            to { stroke-dashoffset: -180; }
          }
          @keyframes leos-map-hub-pulse {
            0% { r: 7px; opacity: .5; }
            70%, 100% { r: 28px; opacity: 0; }
          }
        `}</style>

        {/* continents — simplified but geography-recognizable silhouettes, not a precise projection */}
        <g fill="#20242a" stroke="rgba(255,255,255,.08)" strokeWidth="1.25">
          {/* USA / North America — drawn only when there's room (the full map; dropped from the compact crop), in the previously-unused far-left margin */}
          {!compact ? (
            <polygon points="35,68 75,60 115,72 128,92 116,108 124,126 100,130 78,128 62,145 42,122 22,98" />
          ) : null}
          {/* Europe — rounded landmass with an Italy-like southward peninsula */}
          <polygon points="248,20 278,13 310,18 328,30 330,48 318,58 306,76 296,60 278,68 258,60 242,42 240,28" />
          {/* Africa — wide north, Gulf of Guinea coastal notch, Horn of Africa point, tapering to the Cape */}
          <polygon points="192,132 232,120 275,124 300,148 318,165 344,192 322,208 330,235 308,270 288,315 262,362 238,398 208,355 185,310 158,275 172,245 142,222 150,188 168,158" />
          {/* Arabian Peninsula — its own distinct landmass, pointed south at Yemen, with the Gulf coast pinching in at the UAE/Musandam jut */}
          <polygon points="352,150 388,143 408,152 420,172 416,192 408,213 398,233 380,258 360,272 340,242 328,205 334,175 345,157" fill="#262b32" />
          {/* Asia — large landmass with a subcontinent-like southward point */}
          <polygon points="426,130 445,98 472,78 505,66 542,62 575,78 598,108 600,145 582,178 552,198 518,212 495,235 478,268 462,298 448,262 432,215 420,170" />
        </g>

        {/* route lines — dim base + slow travelling highlight, brass, low-contrast on purpose */}
        {regions.map((r) => (
          <g key={r.key}>
            <path d={r.path} fill="none" stroke="rgba(200,168,112,.32)" strokeWidth="1.25" />
            <path
              d={r.path}
              fill="none"
              stroke="rgba(222,192,148,.88)"
              strokeWidth="1.25"
              strokeDasharray="4 14"
              strokeLinecap="round"
              className="motion-safe:[animation:leos-map-route-flow_var(--dur)_linear_infinite]"
              style={{ "--dur": r.duration } as CSSProperties}
            />
            <circle cx={r.x} cy={r.y} r="3" fill="rgba(222,192,148,.92)" />
          </g>
        ))}

        {/* UAE hub — the strongest, brightest point on the map */}
        <circle
          cx={UAE_HUB.x}
          cy={UAE_HUB.y}
          r={hubRingR}
          fill="none"
          stroke="#dcb47c"
          strokeWidth="1.75"
          className="motion-safe:[animation:leos-map-hub-pulse_3.2s_ease-out_infinite]"
        />
        <circle cx={UAE_HUB.x} cy={UAE_HUB.y} r={hubDotR} fill="#e4bf88" />
        <circle cx={UAE_HUB.x} cy={UAE_HUB.y} r={hubDotR * 0.4} fill="#fff5e4" />
      </svg>

      {/* HTML label overlay — kept out of the SVG viewBox so text size never
          scales down with the map */}
      {regions.map((r) => (
        <MapLabel key={r.key} x={r.labelX} y={r.labelY} anchor={r.anchor} box={box}>
          {r.label}
        </MapLabel>
      ))}
      <MapLabel x={UAE_HUB.labelX} y={UAE_HUB.labelY} anchor={UAE_HUB.anchor} box={box} strong>
        UAE HUB
      </MapLabel>
    </div>
  );
}
