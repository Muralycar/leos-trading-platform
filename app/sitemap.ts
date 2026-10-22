import type { MetadataRoute } from "next";
import { getAllProductParams, getBrands } from "@/lib/data/inventory";
import { getPublishedMachines } from "@/lib/machinery";
import { SITE_URL } from "@/lib/site";

// Refresh the sitemap periodically so new products and machines are discoverable.
// Do not emit synthetic lastModified timestamps: Google recommends lastmod only
// when it reflects a real, significant page update. The site does not currently
// store reliable public modified-at dates for every catalog page.
export const revalidate = 21600;

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/products", priority: 0.9 },
  { path: "/truck-parts", priority: 0.9 },
  { path: "/construction-equipment-parts", priority: 0.9 },
  { path: "/generator-parts", priority: 0.9 },
  { path: "/marine-parts", priority: 0.9 },
  { path: "/oilfield-industrial-parts", priority: 0.9 },
  { path: "/caterpillar-parts", priority: 0.85 },
  { path: "/machinery", priority: 0.9 },
  { path: "/sourcing", priority: 0.8 },
  { path: "/brands", priority: 0.8 },
  { path: "/export", priority: 0.6 },
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: "weekly",
    priority: p.priority,
  }));

  try {
    const brands = await getBrands();
    for (const b of brands) {
      entries.push({ url: `${SITE_URL}/brands/${b.slug}`, changeFrequency: "weekly", priority: 0.7 });
    }
  } catch (err) {
    console.error("[sitemap] brands failed", err);
  }

  try {
    const machines = await getPublishedMachines();
    for (const m of machines) {
      entries.push({ url: `${SITE_URL}/machinery/${m.slug}`, changeFrequency: "weekly", priority: 0.7 });
    }
  } catch (err) {
    console.error("[sitemap] machines failed", err);
  }

  try {
    const products = await getAllProductParams();
    for (const p of products) {
      entries.push({
        url: `${SITE_URL}/parts/${p.brand}/${encodeURIComponent(p.sku)}`,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch (err) {
    console.error("[sitemap] products failed", err);
  }

  return entries;
}
