import type { Brand, EquipmentCategory } from "@/lib/types";

// Pure functions, not module-level constants — the underlying brand/category
// data now lives in Supabase (lib/data/inventory.ts) and is fetched async,
// so the caller (Header, an async Server Component) fetches once and builds
// every link list from that single result, passing what a Client Component
// (MobileNav) needs down as a prop.

export interface NavLink {
  label: string;
  href: string;
}

export function buildProductLinks(categories: EquipmentCategory[]): NavLink[] {
  return categories.map((c) => ({
    label: c.name,
    href: `/search?cat=${encodeURIComponent(c.slug)}`,
  }));
}

export function buildInventoryLinks(brands: Brand[]): NavLink[] {
  return [
    { label: "Search All Stock", href: "/search" },
    ...brands.map((b) => ({
      label: `${b.name} Inventory`,
      href: `/search?brand=${encodeURIComponent(b.slug)}`,
    })),
    { label: "Recently Added", href: "/search?sort=recent" },
  ];
}

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

export function buildMobileLinks(categories: EquipmentCategory[]): NavLink[] {
  return [
    { label: "Home", href: "/" },
    ...buildProductLinks(categories),
    { label: "Search All Stock", href: "/search" },
    { label: "Brands", href: "/brands" },
    { label: "Request a Part", href: "/sourcing#request" },
    { label: "Sourcing", href: "/sourcing" },
    { label: "Export", href: "/export" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
}
