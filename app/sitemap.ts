import type { MetadataRoute } from "next";
import { getAllProductParams, getBrands } from "@/lib/data/inventory";
import { getPublishedMachines } from "@/lib/machinery";
import { SITE_URL } from "@/lib/site";

// Rebuilt at most once an hour, so new products and machines appear without a redeploy.
export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/products", priority: 0.9 },
  { path: "/machinery", priority: 0.9 },
  { path: "/sourcing", priority: 0.8 },
  { path: "/brands", priority: 0.8 },
  { path: "/export", priority: 0.6 },
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p.priority,
  }));

  // Each source is fetched defensively: if one fails, the rest of the sitemap still renders.
  try {
    const brands = await getBrands();
    for (const b of brands) {
      entries.push({ url: `${SITE_URL}/brands/${b.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    }
  } catch (err) {
    console.error("[sitemap] brands failed", err);
  }

  try {
    const machines = await getPublishedMachines();
    for (const m of machines) {
      entries.push({ url: `${SITE_URL}/machinery/${m.slug}`, lastModified: new Date(m.createdAt), changeFrequency: "weekly", priority: 0.7 });
    }
  } catch (err) {
    console.error("[sitemap] machines failed", err);
  }

  try {
    const products = await getAllProductParams();
    for (const p of products) {
      entries.push({
        url: `${SITE_URL}/parts/${p.brand}/${encodeURIComponent(p.sku)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch (err) {
    console.error("[sitemap] products failed", err);
  }

  return entries;
}
