// Structural site metadata that has no source in the client spreadsheets —
// equipment-category taxonomy (including the 3 sourcing-only categories,
// which by definition have no spreadsheet) and global contact settings.
// Brand and product data itself comes from lib/data/inventory.ts, which is
// generated from the real Kohler/Iveco/Kobelco files (see
// scripts/generate-inventory-data.mts) — nothing in this file is invented,
// and nothing here needs to change when Phase 3 swaps in Supabase for the
// inventory data (only lib/data/inventory.ts does).

import type { EquipmentCategory, SiteSettings } from "./types";
import { getCategorySkuCount } from "./data/inventory";

export {
  BRANDS,
  getTotalSkuCount,
  getTotalUnitCount,
  getLiveBrandCount,
} from "./data/inventory";

// Live categories' skuCount is computed from the real dataset; sourcing-only
// categories stay at 0 because no spreadsheet exists for them yet — never a
// fabricated count.
export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: "truck-parts",
    name: "Truck Parts",
    slug: "truck-parts",
    status: "live",
    brandsLabel: "Iveco",
    skuCount: getCategorySkuCount("truck-parts"),
    imagePath: null,
  },
  {
    id: "construction-equipment-parts",
    name: "Construction Equipment Parts",
    slug: "construction-equipment-parts",
    status: "live",
    brandsLabel: "Kobelco",
    skuCount: getCategorySkuCount("construction-equipment-parts"),
    imagePath: null,
  },
  {
    id: "generator-parts",
    name: "Generator Parts",
    slug: "generator-parts",
    status: "live",
    brandsLabel: "Kohler",
    skuCount: getCategorySkuCount("generator-parts"),
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

export const SITE_SETTINGS: SiteSettings = {
  phonePrimary: "+971 50 848 9640",
  phoneSecondary: "+971 50 285 1056",
  whatsappNumber: "971508489640",
  email: "trade@leosdubai.com",
  address: "SRTIP, Sharjah, UAE",
};
