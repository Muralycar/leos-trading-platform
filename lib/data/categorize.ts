// Keyword-based product-category classifier, applied once at data-generation
// time (see scripts/generate-inventory-data.mts). Mirrors the "Category Rule
// Engine" described in Handoff/design_handoff_leos_trading/inventory-import-spec.md:
// rules suggest a category from the description text; nothing here invents
// data that isn't already in the spreadsheets. Rules are ordered — first
// match wins — and a description that matches nothing falls into the
// General Hardware bucket rather than being left unclassified.

export interface ProductCategory {
  slug: string;
  name: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { slug: "filters", name: "Filters" },
  { slug: "gaskets-seals", name: "Gaskets & Seals" },
  { slug: "bearings-bushings", name: "Bearings & Bushings" },
  { slug: "pumps", name: "Pumps" },
  { slug: "electrical", name: "Electrical" },
  { slug: "engine-components", name: "Engine Components" },
  { slug: "hoses-fittings", name: "Hoses & Fittings" },
  { slug: "belts", name: "Belts" },
  { slug: "brake-suspension", name: "Brake & Suspension" },
  { slug: "body-cab", name: "Body & Cab" },
  { slug: "fasteners-hardware", name: "Fasteners & Hardware" },
  { slug: "general-hardware", name: "General Hardware" },
];

interface Rule {
  slug: string;
  keywords: string[];
}

// Ordered rules — first match wins. Keep more specific rules (FILTER,
// GASKET) ahead of broad catch-alls (SEAL alone would otherwise swallow
// unrelated parts).
const RULES: Rule[] = [
  { slug: "filters", keywords: ["FILTER", "CARTRIDGE", "ELEMENT"] },
  { slug: "gaskets-seals", keywords: ["GASKET", "SEAL", "ORING", "O-RING", "FACING"] },
  { slug: "bearings-bushings", keywords: ["BEARING", "BUSH", "BUSHING", "SLEEVE"] },
  { slug: "pumps", keywords: ["PUMP"] },
  {
    slug: "electrical",
    keywords: ["SWITCH", "RELAY", "SENSOR", "FUSE", "LAMP", "LIGHT", "ALTERNATOR", "SOLENOID", "WIRE", "WIRING"],
  },
  {
    slug: "engine-components",
    keywords: ["ENGINE", "PISTON", "CYLINDER", "CYLINDHEAD", "VALVE", "SHAFT", "NOZZLE", "HEAD"],
  },
  { slug: "hoses-fittings", keywords: ["HOSE", "PIPE", "LINE", "ELBOW", "CONNECTOR", "CLAMP"] },
  { slug: "belts", keywords: ["BELT", "VBELT"] },
  { slug: "brake-suspension", keywords: ["BRAKE", "SUSPENSION", "SPRING", "SHOCK"] },
  { slug: "body-cab", keywords: ["DOOR", "WINDOW", "PANEL", "MIRROR"] },
  {
    slug: "fasteners-hardware",
    keywords: ["BOLT", "SCREW", "NUT", "WASHER", "STUD", "CIRCLIP", "CLIP", "DOWEL", "PIN", "HEXAGON"],
  },
];

const CATEGORY_NAME_BY_SLUG = new Map(PRODUCT_CATEGORIES.map((c) => [c.slug, c.name]));

export function classifyDescription(description: string): ProductCategory {
  const upper = description.toUpperCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => upper.includes(kw))) {
      const slug = rule.slug;
      return { slug, name: CATEGORY_NAME_BY_SLUG.get(slug)! };
    }
  }
  return { slug: "general-hardware", name: CATEGORY_NAME_BY_SLUG.get("general-hardware")! };
}
