// PHASE 1 STAND-IN FOR SUPABASE.
// Every SKU/description/quantity below is copied verbatim from the real
// client spreadsheets in /Inventory (iveco obsolete parts.xlsx, kobelco
// parts.xlsx, kohler stock parts.xlsx) — nothing here is invented.
// Sub-category is a *suggested* classification applied with the same
// keyword rules described in inventory-import-spec.md's "Category Rule
// Engine" (FILTER→Filters, PUMP→Pumps, etc.) — in production these are
// admin-confirmed at import review, not hard-coded like this.
//
// This file must be deleted once Phase 3 (Supabase) lands — every value
// here becomes a live query against `products` / `product_public_availability`
// per data-model.md. Only 3 brands appear because only 3 spreadsheets exist
// in /Inventory today; the header/search/brand UIs must stay driven by
// whatever this module exports, never a hard-coded brand list, so that a
// 4th brand added later requires no component changes.

import type { Brand, EquipmentCategory, Product, SiteSettings } from "./types";

export const BRANDS: Brand[] = [
  { id: "kohler", name: "Kohler", slug: "kohler" },
  { id: "iveco", name: "Iveco", slug: "iveco" },
  { id: "kobelco", name: "Kobelco", slug: "kobelco" },
];

// Real totals computed by summing the actual spreadsheet rows/quantities:
// Iveco 1,614 rows / 16,219 units · Kobelco 313 rows / 2,553 units ·
// Kohler 329 rows / 1,240 units.
export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: "truck-parts",
    name: "Truck Parts",
    slug: "truck-parts",
    status: "live",
    brandsLabel: "Iveco",
    skuCount: 1614,
    imagePath: null,
  },
  {
    id: "construction-equipment-parts",
    name: "Construction Equipment Parts",
    slug: "construction-equipment-parts",
    status: "live",
    brandsLabel: "Kobelco",
    skuCount: 313,
    imagePath: null,
  },
  {
    id: "generator-parts",
    name: "Generator Parts",
    slug: "generator-parts",
    status: "live",
    brandsLabel: "Kohler",
    skuCount: 329,
    imagePath: "/categories/generator-parts.png",
  },
  {
    id: "mining-industrial-parts",
    name: "Mining & Industrial Parts",
    slug: "mining-industrial-parts",
    status: "sourcing",
    brandsLabel: "Multi-brand sourcing network",
    skuCount: 0,
    imagePath: null,
  },
  {
    id: "marine-parts",
    name: "Marine Parts",
    slug: "marine-parts",
    status: "sourcing",
    brandsLabel: "Multi-brand sourcing network",
    skuCount: 0,
    imagePath: null,
  },
  {
    id: "tyres-batteries-accessories",
    name: "Tyres, Batteries & Accessories",
    slug: "tyres-batteries-accessories",
    status: "sourcing",
    brandsLabel: "Multi-brand sourcing network",
    skuCount: 0,
    imagePath: null,
  },
];

// A sample drawn from real rows across the three spreadsheets (not the full
// 2,256 — see note above). Ordered newest-looking first for the "Featured /
// Recently Added" homepage grid, same convention as the design source.
export const PRODUCTS: Product[] = [
  {
    sku: "KH330560633",
    name: "Oil Filter",
    brandSlug: "kohler",
    brandName: "Kohler",
    categorySlug: "generator-parts",
    categoryName: "Generator Parts",
    subCategory: "Filters",
    quantity: 86,
    imagePath: "/products/kh330560633.png",
  },
  {
    sku: "1907570",
    name: "Oil Filter Cartridge",
    brandSlug: "iveco",
    brandName: "Iveco",
    categorySlug: "truck-parts",
    categoryName: "Truck Parts",
    subCategory: "Filters",
    quantity: 254,
    imagePath: null,
  },
  {
    sku: "KO2405P482",
    name: "Bush",
    brandSlug: "kobelco",
    brandName: "Kobelco",
    categorySlug: "construction-equipment-parts",
    categoryName: "Construction Equipment Parts",
    subCategory: "Bearings & Bushings",
    quantity: 10,
    imagePath: null,
  },
  {
    sku: "5801388688",
    name: "Valve Seat Std.",
    brandSlug: "iveco",
    brandName: "Iveco",
    categorySlug: "truck-parts",
    categoryName: "Truck Parts",
    subCategory: "Engine Components",
    quantity: 48,
    imagePath: null,
  },
  {
    sku: "B330560643",
    name: "Air Filter",
    brandSlug: "kohler",
    brandName: "Kohler",
    categorySlug: "generator-parts",
    categoryName: "Generator Parts",
    subCategory: "Filters",
    quantity: 10,
    imagePath: null,
  },
  {
    sku: "KOZX60U16175",
    name: "Hose Assy",
    brandSlug: "kobelco",
    brandName: "Kobelco",
    categorySlug: "construction-equipment-parts",
    categoryName: "Construction Equipment Parts",
    subCategory: "Hydraulics",
    quantity: 11,
    imagePath: null,
  },
  {
    sku: "8169109",
    name: "Parabolic Spring",
    brandSlug: "iveco",
    brandName: "Iveco",
    categorySlug: "truck-parts",
    categoryName: "Truck Parts",
    subCategory: "Brake & Suspension",
    quantity: 1,
    imagePath: null,
  },
  {
    sku: "KH267373",
    name: "Sea Water Pump",
    brandSlug: "kohler",
    brandName: "Kohler",
    categorySlug: "generator-parts",
    categoryName: "Generator Parts",
    subCategory: "Pumps",
    quantity: 1,
    imagePath: "/products/kh267373.png",
  },
];

export const SITE_SETTINGS: SiteSettings = {
  phonePrimary: "+971 50 848 9640",
  phoneSecondary: "+971 50 285 1056",
  whatsappNumber: "971508489640",
  email: "trade@leosdubai.com",
  address: "SRTIP, Sharjah, UAE",
};

export function getTotalSkuCount(): number {
  return 2256; // Iveco 1,614 + Kobelco 313 + Kohler 329 — real row counts.
}

export function getTotalUnitCount(): number {
  return 20012; // Sum of real Stock/Inventory columns across all three files.
}

export function getLiveBrandCount(): number {
  return BRANDS.length;
}
