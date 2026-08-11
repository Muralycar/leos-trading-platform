"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AvailabilityStatus, Product, SiteSettings } from "@/lib/types";
import type { SortOption } from "@/lib/search";
import { waLink } from "@/lib/whatsapp";
import { FilterSidebar, type FilterOption } from "@/components/search/FilterSidebar";
import { ResultRow } from "@/components/search/ResultRow";
import { Pagination } from "@/components/search/Pagination";
import { RfqForm } from "@/components/rfq/RfqForm";

interface SearchResponse {
  results: Product[];
  matchedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  brandOptions: FilterOption[];
  categoryOptions: FilterOption[];
  availabilityOptions: FilterOption[];
}

const EMPTY_RESPONSE: SearchResponse = {
  results: [],
  matchedCount: 0,
  page: 1,
  pageSize: 30,
  totalPages: 1,
  brandOptions: [],
  categoryOptions: [],
  availabilityOptions: [],
};

export interface InventoryStats {
  totalSkus: number;
  totalUnits: number;
  liveBrandCount: number;
}

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function SearchClient({ settings, stats }: { settings: SiteSettings; stats: InventoryStats }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
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
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get("page") ?? "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Debounce the free-text query ~300ms per search-spec.md before it drives
  // either the URL or a network request; checkbox/sort changes apply at once.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // A new query or filter selection always starts back at page 1 — but not
  // on initial mount, where `page` may legitimately come from a shared/
  // refreshed URL (?page=3) and must be preserved rather than reset.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedQuery, selectedBrands, selectedCategories, selectedAvailability, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (selectedBrands.length === 1) params.set("brand", selectedBrands[0]);
    if (selectedCategories.length === 1) params.set("cat", selectedCategories[0]);
    if (sort !== "relevance") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });

    const apiParams = new URLSearchParams();
    if (debouncedQuery) apiParams.set("q", debouncedQuery);
    selectedBrands.forEach((b) => apiParams.append("brand", b));
    selectedCategories.forEach((c) => apiParams.append("cat", c));
    selectedAvailability.forEach((a) => apiParams.append("availability", a));
    apiParams.set("sort", sort);
    apiParams.set("page", String(page));

    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?${apiParams.toString()}`)
      .then((res) => res.json() as Promise<SearchResponse>)
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedBrands, selectedCategories, selectedAvailability, sort, page]);

  const { results, matchedCount, totalPages, brandOptions, categoryOptions, availabilityOptions } = data ?? EMPTY_RESPONSE;
  const brandNameBySlug = Object.fromEntries(brandOptions.map((b) => [b.slug, b.label]));

  function selectBrand(slug: string | null) {
    setSelectedBrands(slug ? [slug] : []);
  }

  return (
    <>
      <div className="border-b border-line bg-bg-1 py-9 min-[901px]:py-11">
        <div className="wrap">
          <div className="eyebrow">Live Parts Inventory</div>
          <h1 className="mt-3.5 text-[clamp(28px,4vw,38px)]">Search Our Parts Inventory</h1>
          <p className="mt-3 max-w-[64ch] text-[15px] text-text-1">
            Search thousands of genuine OEM and quality aftermarket parts by part number, description or brand.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex max-w-[820px] flex-col gap-2 rounded-[14px] border border-[rgba(196,162,106,.28)] bg-[#17191d] p-2 shadow-[0_20px_50px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.05)] transition-shadow duration-200 focus-within:border-[rgba(196,162,106,.55)] focus-within:shadow-[0_20px_50px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.06),0_0_0_3px_rgba(196,162,106,.15)] min-[540px]:flex-row min-[540px]:items-center"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search part number, description or brand..."
              className="flex-1 bg-transparent px-4 py-3.5 font-mono text-base text-text-0 placeholder:font-sans placeholder:text-text-2 focus:outline-none"
            />
            <button type="submit" className="btn btn-primary w-full flex-shrink-0 justify-center min-[540px]:w-auto">
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[.08em] text-text-2">
            <span>{stats.totalSkus.toLocaleString()} SKUs</span>
            <span className="text-line-strong">•</span>
            <span>{stats.totalUnits.toLocaleString()} Units</span>
            <span className="text-line-strong">•</span>
            <span>{stats.liveBrandCount} Live Inventory Brands</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => selectBrand(null)}
              className={`rounded-full border px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-[.04em] transition-colors ${
                selectedBrands.length === 0
                  ? "border-brass bg-brass text-[#181300]"
                  : "border-line-strong text-text-1 hover:border-brass hover:text-brass"
              }`}
            >
              All
            </button>
            {brandOptions.map((b) => (
              <button
                key={b.slug}
                type="button"
                onClick={() => selectBrand(b.slug)}
                className={`rounded-full border px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-[.04em] transition-colors ${
                  selectedBrands.includes(b.slug)
                    ? "border-brass bg-brass text-[#181300]"
                    : "border-line-strong text-text-1 hover:border-brass hover:text-brass"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap grid grid-cols-1 gap-10 py-12 min-[901px]:grid-cols-[240px_1fr] min-[901px]:py-14">
        <FilterSidebar
          categoryOptions={categoryOptions}
          availabilityOptions={availabilityOptions}
          selectedCategories={selectedCategories}
          selectedAvailability={selectedAvailability}
          onToggleCategory={(slug) => setSelectedCategories((prev) => toggleInList(prev, slug))}
          onToggleAvailability={(slug) =>
            setSelectedAvailability((prev) => toggleInList(prev, slug as AvailabilityStatus))
          }
        />

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="font-mono text-[13px] font-semibold uppercase tracking-[.04em] text-text-0">
                {matchedCount.toLocaleString()} {matchedCount === 1 ? "Part" : "Parts"} Found
              </span>
              <span className="ml-2 text-text-2">· {stats.totalSkus.toLocaleString()} SKUs in live inventory</span>
              {loading ? <span className="ml-2 text-text-2">Searching…</span> : null}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-s border border-line-strong bg-bg-1 px-3 py-2.5 font-mono text-[13px] text-text-0 transition-colors hover:border-brass focus:border-brass focus:outline-none"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="part-number">Sort: Part Number</option>
              <option value="stock">Sort: Stock Availability</option>
            </select>
          </div>

          {data === null ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[64px] animate-pulse rounded-m bg-bg-2" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div
                className={`flex flex-col overflow-hidden rounded-m border border-line transition-opacity ${loading ? "opacity-60" : ""}`}
              >
                {results.map((p) => (
                  <ResultRow key={p.id} product={p} brandName={brandNameBySlug[p.brandSlug] ?? p.brandSlug} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <div className="rounded-m border border-dashed border-[rgba(196,162,106,.35)] bg-bg-1 px-6 py-14 text-center">
              <h3 className="text-brass-glow">Can&apos;t Find The Part?</h3>
              <p className="mx-auto mt-2.5 max-w-[52ch] text-[15px]">
                Send us the part number. Our sourcing team can locate genuine OEM, aftermarket, obsolete and hard-to-find
                parts through our global supplier network.
              </p>
              <div className="mx-auto mt-8 max-w-[520px] text-left">
                <RfqForm variant="search-no-result" prefillPartNumber={query} submitLabel="Request This Part" />
              </div>
              <a
                href={waLink(settings, query ? `Inquiry — Part Number ${query}` : "Inquiry — part not found in online stock")}
                target="_blank"
                rel="noreferrer"
                className="btn btn-wa btn-sm mt-6 inline-flex"
              >
                Ask on WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
