"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BRANDS, PRODUCTS, getAvailability } from "@/lib/data/inventory";
import { EQUIPMENT_CATEGORIES } from "@/lib/placeholder-data";
import { DEFAULT_FILTERS, matchesSearchQuery, searchProducts, type SearchFilters, type SortOption } from "@/lib/search";
import { AVAILABILITY_LABEL, type AvailabilityStatus } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { FilterSidebar, type FilterOption } from "@/components/search/FilterSidebar";
import { ResultRow } from "@/components/search/ResultRow";
import { RfqForm } from "@/components/rfq/RfqForm";

const AVAILABILITY_ORDER: AvailabilityStatus[] = ["in_stock", "limited_stock", "on_request", "out_of_stock"];

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const brand = searchParams.get("brand");
    return brand ? [brand.toLowerCase()] : [];
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get("cat");
    return cat ? [cat] : [];
  });
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityStatus[]>([]);
  const [sort, setSort] = useState<SortOption>(() => {
    const s = searchParams.get("sort");
    // "recent" is a legacy nav-link alias (Header's "Recently Added" link) —
    // there's no real created_at in the source spreadsheets, so stock depth
    // is the defensible recency proxy already used by getFeaturedProducts().
    if (s === "stock" || s === "recent") return "stock";
    if (s === "part-number") return "part-number";
    return "relevance";
  });

  // Keep the URL shareable/bookmarkable as filters change, without a full navigation.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedBrands.length === 1) params.set("brand", selectedBrands[0]);
    if (selectedCategories.length === 1) params.set("cat", selectedCategories[0]);
    if (sort !== "relevance") params.set("sort", sort);
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedBrands, selectedCategories, sort]);

  const brandNameBySlug = useMemo(() => Object.fromEntries(BRANDS.map((b) => [b.slug, b.name])), []);
  const liveCategories = useMemo(() => EQUIPMENT_CATEGORIES.filter((c) => c.status === "live"), []);

  const filters: SearchFilters = {
    ...DEFAULT_FILTERS,
    query,
    brandSlugs: selectedBrands,
    equipmentCategorySlugs: selectedCategories,
    availabilityStatuses: selectedAvailability,
    sort,
  };

  const results = useMemo(
    () => searchProducts(filters, brandNameBySlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, selectedBrands, selectedCategories, selectedAvailability, sort, brandNameBySlug],
  );

  // Facet counts reflect the current query text plus every *other* selected
  // filter — never the facet's own selection — so counts stay meaningful as
  // you narrow down.
  const brandOptions: FilterOption[] = useMemo(
    () =>
      BRANDS.map((b) => ({
        slug: b.slug,
        label: b.name,
        count: PRODUCTS.filter(
          (p) =>
            p.brandSlug === b.slug &&
            (selectedCategories.length === 0 || selectedCategories.includes(p.equipmentCategorySlug)) &&
            (selectedAvailability.length === 0 || selectedAvailability.includes(getAvailability(p.id).status)) &&
            matchesSearchQuery(p, b.name, query),
        ).length,
      })),
    [query, selectedCategories, selectedAvailability],
  );

  const categoryOptions: FilterOption[] = useMemo(
    () =>
      liveCategories.map((c) => ({
        slug: c.slug,
        label: c.name,
        count: PRODUCTS.filter(
          (p) =>
            p.equipmentCategorySlug === c.slug &&
            (selectedBrands.length === 0 || selectedBrands.includes(p.brandSlug)) &&
            (selectedAvailability.length === 0 || selectedAvailability.includes(getAvailability(p.id).status)) &&
            matchesSearchQuery(p, brandNameBySlug[p.brandSlug] ?? p.brandSlug, query),
        ).length,
      })),
    [query, selectedBrands, selectedAvailability, brandNameBySlug, liveCategories],
  );

  const availabilityOptions: FilterOption[] = useMemo(
    () =>
      AVAILABILITY_ORDER.map((status) => ({
        slug: status,
        label: AVAILABILITY_LABEL[status],
        count: PRODUCTS.filter(
          (p) =>
            getAvailability(p.id).status === status &&
            (selectedBrands.length === 0 || selectedBrands.includes(p.brandSlug)) &&
            (selectedCategories.length === 0 || selectedCategories.includes(p.equipmentCategorySlug)) &&
            matchesSearchQuery(p, brandNameBySlug[p.brandSlug] ?? p.brandSlug, query),
        ).length,
      })).filter((opt) => opt.count > 0 || opt.slug !== "out_of_stock"),
    [query, selectedBrands, selectedCategories, brandNameBySlug],
  );

  return (
    <>
      <div className="border-b border-line bg-bg-1 py-10">
        <div className="wrap">
          <div className="eyebrow">Inventory Search</div>
          <h1 className="mt-3.5 text-[clamp(28px,4vw,40px)]">Search by part number, description, brand or category</h1>
          <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex max-w-[820px] gap-2 rounded-m border border-line-strong bg-bg-2 p-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="e.g. KH330560633, oil filter, Kohler…"
              className="flex-1 bg-transparent px-4 py-3.5 font-mono text-base text-text-0 placeholder:font-sans placeholder:text-text-2 focus:outline-none"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="wrap grid grid-cols-1 gap-10 py-12 min-[901px]:grid-cols-[260px_1fr] min-[901px]:py-16">
        <FilterSidebar
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          availabilityOptions={availabilityOptions}
          selectedBrands={selectedBrands}
          selectedCategories={selectedCategories}
          selectedAvailability={selectedAvailability}
          onToggleBrand={(slug) => setSelectedBrands((prev) => toggleInList(prev, slug))}
          onToggleCategory={(slug) => setSelectedCategories((prev) => toggleInList(prev, slug))}
          onToggleAvailability={(slug) =>
            setSelectedAvailability((prev) => toggleInList(prev, slug as AvailabilityStatus))
          }
        />

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-text-1">
              <strong className="text-text-0">{results.length}</strong> parts found{" "}
              <span className="text-text-2">of {PRODUCTS.length.toLocaleString()} in network</span>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-s border border-line-strong bg-bg-1 px-3 py-2.5 font-mono text-[13px] text-text-0"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="part-number">Sort: Part Number</option>
              <option value="stock">Sort: Stock Availability</option>
            </select>
          </div>

          {results.length > 0 ? (
            <div className="flex flex-col gap-px overflow-hidden rounded-m border border-line bg-line">
              {results.map((p) => (
                <ResultRow key={p.id} product={p} brandName={brandNameBySlug[p.brandSlug] ?? p.brandSlug} />
              ))}
            </div>
          ) : (
            <div className="rounded-m border border-dashed border-line-strong px-6 py-16 text-center">
              <h3>Part Not Found In Current Online Stock</h3>
              <p className="mx-auto mt-2.5 max-w-[46ch] text-[15px]">
                Availability subject to confirmation. Send the part number or equipment details and our sourcing network
                will confirm supply.
              </p>
              <div className="mx-auto mt-8 max-w-[520px] text-left">
                <RfqForm variant="search-no-result" prefillPartNumber={query} />
              </div>
              <a
                href={waLink(query ? `Inquiry — Part Number ${query}` : "Inquiry — part not found in online stock")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-wa btn-sm mt-6 inline-flex"
              >
                Continue on WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
