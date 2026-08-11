import { NextResponse } from "next/server";
import { getAllPublishedProducts, getBrands, getEquipmentCategories } from "@/lib/data/inventory";
import { matchesSearchQuery, searchProducts, type SortOption } from "@/lib/search";
import { AVAILABILITY_LABEL, type AvailabilityStatus } from "@/lib/types";

const AVAILABILITY_ORDER: AvailabilityStatus[] = ["in_stock", "limited_stock", "out_of_stock"];
const SORT_OPTIONS: SortOption[] = ["relevance", "part-number", "stock"];

// Server-side response pagination — searchProducts() still ranks the full
// matched set in one pass (cheap at today's ~2,200 products, and stays
// cheap into the tens of thousands per the redesign's pagination proposal),
// but only one page of that ranked array is ever serialized into the HTTP
// response. The browser never receives the other matches for a broad query.
const PAGE_SIZE = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const brandSlugs = searchParams.getAll("brand");
  const equipmentCategorySlugs = searchParams.getAll("cat");
  const availabilityStatuses = searchParams.getAll("availability").filter((s): s is AvailabilityStatus =>
    AVAILABILITY_ORDER.includes(s as AvailabilityStatus),
  );
  const sortParam = searchParams.get("sort");
  const sort: SortOption = SORT_OPTIONS.includes(sortParam as SortOption) ? (sortParam as SortOption) : "relevance";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [products, brands, categories] = await Promise.all([
    getAllPublishedProducts(),
    getBrands(),
    getEquipmentCategories(),
  ]);
  const brandNameBySlug = Object.fromEntries(brands.map((b) => [b.slug, b.name]));
  const liveCategories = categories.filter((c) => c.status === "live");

  const matches = searchProducts({ query, brandSlugs, equipmentCategorySlugs, availabilityStatuses, sort }, brandNameBySlug, products);
  const matchedCount = matches.length;
  const totalPages = Math.max(1, Math.ceil(matchedCount / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const results = matches.slice(start, start + PAGE_SIZE);

  // Facet counts reflect the current query text plus every *other* selected
  // filter — never the facet's own selection — matching the Phase 2 UX.
  // Computed in a single pass over products (previously three separate
  // .filter() passes, each re-running matchesSearchQuery — which lowercases
  // and normalizes the query string — per product; a product's query-match
  // doesn't depend on which facet is being counted, so it's evaluated once
  // per product here, not up to three times).
  const brandCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const availabilityCounts = new Map<AvailabilityStatus, number>();

  for (const p of products) {
    const brandName = brandNameBySlug[p.brandSlug] ?? p.brandSlug;
    if (!matchesSearchQuery(p, brandName, query)) continue;

    const brandOk = brandSlugs.length === 0 || brandSlugs.includes(p.brandSlug);
    const categoryOk = equipmentCategorySlugs.length === 0 || equipmentCategorySlugs.includes(p.equipmentCategorySlug);
    const availabilityOk = availabilityStatuses.length === 0 || availabilityStatuses.includes(p.status);

    if (categoryOk && availabilityOk) brandCounts.set(p.brandSlug, (brandCounts.get(p.brandSlug) ?? 0) + 1);
    if (brandOk && availabilityOk) categoryCounts.set(p.equipmentCategorySlug, (categoryCounts.get(p.equipmentCategorySlug) ?? 0) + 1);
    if (brandOk && categoryOk) availabilityCounts.set(p.status, (availabilityCounts.get(p.status) ?? 0) + 1);
  }

  const brandOptions = brands.map((b) => ({ slug: b.slug, label: b.name, count: brandCounts.get(b.slug) ?? 0 }));

  const categoryOptions = liveCategories.map((c) => ({ slug: c.slug, label: c.name, count: categoryCounts.get(c.slug) ?? 0 }));

  const availabilityOptions = AVAILABILITY_ORDER.map((status) => ({
    slug: status,
    label: AVAILABILITY_LABEL[status],
    count: availabilityCounts.get(status) ?? 0,
  })).filter((opt) => opt.count > 0 || opt.slug !== "out_of_stock");

  return NextResponse.json({
    results,
    matchedCount,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    brandOptions,
    categoryOptions,
    availabilityOptions,
  });
}
