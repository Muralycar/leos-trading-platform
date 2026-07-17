import { NextResponse } from "next/server";
import { getAllPublishedProducts, getBrands, getEquipmentCategories } from "@/lib/data/inventory";
import { matchesSearchQuery, searchProducts, type SortOption } from "@/lib/search";
import { AVAILABILITY_LABEL, type AvailabilityStatus } from "@/lib/types";

const AVAILABILITY_ORDER: AvailabilityStatus[] = ["in_stock", "limited_stock", "out_of_stock"];
const SORT_OPTIONS: SortOption[] = ["relevance", "part-number", "stock"];

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

  const [products, brands, categories] = await Promise.all([
    getAllPublishedProducts(),
    getBrands(),
    getEquipmentCategories(),
  ]);
  const brandNameBySlug = Object.fromEntries(brands.map((b) => [b.slug, b.name]));
  const liveCategories = categories.filter((c) => c.status === "live");

  const results = searchProducts({ query, brandSlugs, equipmentCategorySlugs, availabilityStatuses, sort }, brandNameBySlug, products);

  // Facet counts reflect the current query text plus every *other* selected
  // filter — never the facet's own selection — matching the Phase 2 UX.
  const brandOptions = brands.map((b) => ({
    slug: b.slug,
    label: b.name,
    count: products.filter(
      (p) =>
        p.brandSlug === b.slug &&
        (equipmentCategorySlugs.length === 0 || equipmentCategorySlugs.includes(p.equipmentCategorySlug)) &&
        (availabilityStatuses.length === 0 || availabilityStatuses.includes(p.status)) &&
        matchesSearchQuery(p, b.name, query),
    ).length,
  }));

  const categoryOptions = liveCategories.map((c) => ({
    slug: c.slug,
    label: c.name,
    count: products.filter(
      (p) =>
        p.equipmentCategorySlug === c.slug &&
        (brandSlugs.length === 0 || brandSlugs.includes(p.brandSlug)) &&
        (availabilityStatuses.length === 0 || availabilityStatuses.includes(p.status)) &&
        matchesSearchQuery(p, brandNameBySlug[p.brandSlug] ?? p.brandSlug, query),
    ).length,
  }));

  const availabilityOptions = AVAILABILITY_ORDER.map((status) => ({
    slug: status,
    label: AVAILABILITY_LABEL[status],
    count: products.filter(
      (p) =>
        p.status === status &&
        (brandSlugs.length === 0 || brandSlugs.includes(p.brandSlug)) &&
        (equipmentCategorySlugs.length === 0 || equipmentCategorySlugs.includes(p.equipmentCategorySlug)) &&
        matchesSearchQuery(p, brandNameBySlug[p.brandSlug] ?? p.brandSlug, query),
    ).length,
  })).filter((opt) => opt.count > 0 || opt.slug !== "out_of_stock");

  return NextResponse.json({
    results,
    total: products.length,
    brandOptions,
    categoryOptions,
    availabilityOptions,
  });
}
