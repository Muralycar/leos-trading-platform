// Reads the three real client spreadsheets in /Inventory and writes
// lib/data/inventory.generated.json — a normalized, complete (not sampled)
// product + inventory-batch dataset. Run manually with:
//   npm run generate:data
// Re-run whenever the source spreadsheets change. Not part of the Next.js
// build/runtime — `xlsx` is a devDependency only, never imported from
// app/, components/, or lib/*.ts (only from this script).

import XLSX from "xlsx";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { classifyDescription } from "../lib/data/categorize.ts";
import { normalizePartNumber } from "../lib/part-number.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

interface BrandConfig {
  slug: string;
  name: string;
  equipmentCategorySlug: string;
  file: string;
}

const BRAND_CONFIGS: BrandConfig[] = [
  {
    slug: "kohler",
    name: "Kohler",
    equipmentCategorySlug: "generator-parts",
    file: resolve(ROOT, "Inventory/kohler stock parts.xlsx"),
  },
  {
    slug: "iveco",
    name: "Iveco",
    equipmentCategorySlug: "truck-parts",
    file: resolve(ROOT, "Inventory/iveco obsolete parts.xlsx"),
  },
  {
    slug: "kobelco",
    name: "Kobelco",
    equipmentCategorySlug: "construction-equipment-parts",
    file: resolve(ROOT, "Inventory/kobelco parts.xlsx"),
  },
];

// The only two SKUs with real photography today (see
// Handoff/design_handoff_leos_trading/image-asset-map.md and public/products).
// Keyed by full product id (brand-scoped), not bare normalized SKU — the
// same part-number text can legitimately belong to two different real
// products from two different brand files (e.g. "KH330560633" appears in
// both the Kohler and Iveco sheets, at different quantities), and the
// photo is only a true match for the Kohler one.
const IMAGE_BY_PRODUCT_ID: Record<string, string> = {
  "kohler:KH267373": "/products/kh267373.png",
  "kohler:KH330560633": "/products/kh330560633.png",
};

// Title-cases description text, but leaves any token containing a digit
// untouched (identifier-like — e.g. an embedded cross-reference part
// number such as "KHGB330560688/OIL FILTER") rather than mangling it into
// "Khgb330560688/oil". "/" is treated as its own boundary so a slash-joined
// pair of tokens ("...688/OIL") doesn't get swallowed into one word.
function toTitleCase(raw: string): string {
  return raw
    .split(/(\s+|\/)/)
    .map((token) => {
      if (token === "" || /^\s+$/.test(token) || token === "/") return token;
      if (/\d/.test(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join("");
}

function findColumn(header: unknown[], matcher: (h: string) => boolean): number {
  const idx = header.findIndex((h) => matcher(String(h).toLowerCase()));
  if (idx === -1) throw new Error(`Column not found in header: ${JSON.stringify(header)}`);
  return idx;
}

interface GeneratedProduct {
  id: string;
  brandSlug: string;
  equipmentCategorySlug: string;
  productCategorySlug: string;
  productCategoryName: string;
  oemPartNumber: string;
  oemPartNumberNormalized: string;
  description: string;
  imagePath: string | null;
}

interface GeneratedBatch {
  id: string;
  productId: string;
  quantity: number;
  sourceLine: number;
}

const products: GeneratedProduct[] = [];
const batches: GeneratedBatch[] = [];

for (const brand of BRAND_CONFIGS) {
  const workbook = XLSX.readFile(brand.file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const header = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c !== ""));

  const lineIdx = findColumn(header, (h) => h.includes("line"));
  const itemNoIdx = findColumn(header, (h) => h.includes("item no"));
  const descIdx = findColumn(header, (h) => h.includes("description"));
  const qtyIdx = findColumn(header, (h) => h.includes("stock") || h.includes("inventory"));

  // Group rows by normalized part number — a part number appearing on
  // multiple lines (e.g. Iveco 1907570) is one Product with multiple
  // InventoryBatch rows, not a duplicate to collapse or overwrite.
  const groups = new Map<string, unknown[][]>();
  for (const row of dataRows) {
    const raw = String(row[itemNoIdx]).trim();
    const normalized = normalizePartNumber(raw);
    if (!groups.has(normalized)) groups.set(normalized, []);
    groups.get(normalized)!.push(row);
  }

  for (const [normalized, groupRows] of groups) {
    const first = groupRows[0];
    const rawPartNumber = String(first[itemNoIdx]).trim();
    const description = toTitleCase(String(first[descIdx]).trim());
    const category = classifyDescription(description);
    const productId = `${brand.slug}:${normalized}`;

    products.push({
      id: productId,
      brandSlug: brand.slug,
      equipmentCategorySlug: brand.equipmentCategorySlug,
      productCategorySlug: category.slug,
      productCategoryName: category.name,
      oemPartNumber: rawPartNumber,
      oemPartNumberNormalized: normalized,
      description,
      imagePath: IMAGE_BY_PRODUCT_ID[productId] ?? null,
    });

    groupRows.forEach((row) => {
      const sourceLine = Number(row[lineIdx]);
      batches.push({
        id: `${productId}:${sourceLine}`,
        productId,
        quantity: Number(row[qtyIdx]),
        sourceLine,
      });
    });
  }

  console.log(`${brand.name}: ${groups.size} products, ${dataRows.length} source rows`);
}

const output = {
  generatedAt: new Date().toISOString(),
  products,
  batches,
};

const outPath = resolve(ROOT, "lib/data/inventory.generated.json");
writeFileSync(outPath, JSON.stringify(output) + "\n");
console.log(`\nWrote ${products.length} products / ${batches.length} batches to ${outPath}`);
