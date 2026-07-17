import { BRANDS, EQUIPMENT_CATEGORIES } from "./placeholder-data";

// Generated from live data, not hard-coded — per components.md ("must be
// generated — do not hard-code 3 brands"). Swapping placeholder-data.ts for
// Supabase queries in Phase 3 requires no change here.

export interface NavLink {
  label: string;
  href: string;
}

export const PRODUCT_LINKS: NavLink[] = EQUIPMENT_CATEGORIES.map((c) => ({
  label: c.name,
  href: `/search?cat=${encodeURIComponent(c.slug)}`,
}));

export const INVENTORY_LINKS: NavLink[] = [
  { label: "Search All Stock", href: "/search" },
  ...BRANDS.map((b) => ({
    label: `${b.name} Inventory`,
    href: `/search?brand=${encodeURIComponent(b.slug)}`,
  })),
  { label: "Recently Added", href: "/search?sort=recent" },
];

export const SOURCING_LINKS: NavLink[] = [
  { label: "Request a Part", href: "/sourcing#request" },
  { label: "Hard-to-Find Parts", href: "/sourcing#hard-to-find" },
  { label: "Obsolete Parts", href: "/sourcing#obsolete" },
  { label: "Genuine & Aftermarket Supply", href: "/sourcing#genuine-aftermarket" },
  { label: "Global Procurement", href: "/sourcing#procurement" },
];

export const TOP_LEVEL_LINKS: NavLink[] = [
  { label: "Brands", href: "/brands" },
  { label: "Export", href: "/export" },
  { label: "About", href: "/about" },
];

export const MOBILE_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  ...PRODUCT_LINKS,
  { label: "Search All Stock", href: "/search" },
  { label: "Brands", href: "/brands" },
  { label: "Request a Part", href: "/sourcing#request" },
  { label: "Sourcing", href: "/sourcing" },
  { label: "Export", href: "/export" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
