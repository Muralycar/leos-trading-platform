// Single source of truth for the two brand lists used across the site:
// BrandStrip's homepage ticker, and the /brands page's "Brands We Supply &
// Source" groups. Both are decorative/representative — not a claim of
// authorized dealership, distributorship or guaranteed stock — and
// deliberately separate from the `brands` Supabase table, which holds only
// the brands with real, searchable live inventory (currently Iveco, Kobelco,
// Kohler; see lib/data/inventory.ts).

// The 44 names BrandStrip's marquee shows, unchanged from the approved
// homepage build.
export const BRAND_TICKER: string[] = [
  "Iveco", "Kobelco", "Kohler", "Caterpillar", "Komatsu", "Volvo", "Volvo Penta",
  "Cummins", "Perkins", "Yanmar", "MAN", "Scania", "Mercedes-Benz", "Hino",
  "Toyota", "Hyundai", "Kia", "JCB", "Doosan", "Develon", "Hitachi", "Dynapac",
  "Bomag", "Hamm", "Sakai", "Astra", "FPT", "Deutz", "MTU", "Baudouin",
  "John Deere", "Rexroth", "Kawasaki", "Danfoss", "Parker", "SKF", "Timken",
  "Bosch", "Mahle", "Fleetguard", "Donaldson", "Varta", "Exide", "Yuasa",
];

export interface SourcingBrand {
  name: string;
  /** Short qualifier shown after the name, e.g. distinguishing Kohler's marine line from its live generator-parts inventory. */
  note?: string;
}

export interface SourcingBrandGroup {
  title: string;
  brands: SourcingBrand[];
}

// Grouped for the /brands page. Deliberately not identical to BRAND_TICKER:
// Iveco/Kobelco's live-inventory lines aren't repeated here (they have their
// own Live Inventory cards on that page), while Kohler reappears under
// Marine for its separate, sourced-on-request marine-genset line. Yamaha
// and Mercury are marine outboard-engine brands not in the ticker.
export const SOURCING_BRAND_GROUPS: SourcingBrandGroup[] = [
  {
    title: "Trucks & Commercial Vehicles",
    brands: [{ name: "MAN" }, { name: "Scania" }, { name: "Mercedes-Benz" }, { name: "Hino" }, { name: "Astra" }],
  },
  {
    title: "Construction & Earthmoving",
    brands: [
      { name: "Caterpillar" },
      { name: "Komatsu" },
      { name: "Volvo" },
      { name: "JCB" },
      { name: "Doosan" },
      { name: "Develon" },
      { name: "Hitachi" },
      { name: "Dynapac" },
      { name: "Bomag" },
      { name: "Hamm" },
      { name: "Sakai" },
    ],
  },
  {
    title: "Engines & Power Generation",
    brands: [{ name: "Cummins" }, { name: "Perkins" }, { name: "Deutz" }, { name: "MTU" }, { name: "FPT" }, { name: "John Deere" }],
  },
  {
    title: "Marine",
    brands: [
      { name: "Volvo Penta" },
      { name: "Baudouin" },
      { name: "Kohler", note: "marine — sourced on request" },
      { name: "Yanmar" },
      { name: "Yamaha" },
      { name: "Mercury" },
    ],
  },
  {
    title: "Automotive / Fleet",
    brands: [{ name: "Toyota" }, { name: "Hyundai" }, { name: "Kia" }],
  },
  {
    title: "Parts, Filtration & Components",
    brands: [
      { name: "Bosch" },
      { name: "Mahle" },
      { name: "Fleetguard" },
      { name: "Donaldson" },
      { name: "SKF" },
      { name: "Timken" },
      { name: "Parker" },
      { name: "Rexroth" },
      { name: "Danfoss" },
      { name: "Kawasaki" },
      { name: "Varta" },
      { name: "Exide" },
      { name: "Yuasa" },
    ],
  },
];
