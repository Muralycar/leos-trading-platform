"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AvailabilityStatus, Product, SiteSettings } from "@/lib/types";
import type { SortOption } from "@/lib/search";
import { waLink } from "@/lib/whatsapp";
import { FilterSidebar, type FilterOption } from "@/components/search/FilterSidebar";
import { ResultRow } from "@/components/search/ResultRow";
import { RfqForm } from "@/components/rfq/RfqForm";

interface SearchResponse {
  results: Product[];
  total: number;
  brandOptions: FilterOption[];
  categoryOptions: FilterOption[];
  availabilityOptions: FilterOption[];
}

const EMPTY_RESPONSE: SearchResponse = { results: [], total: 0, brandOptions: [], categoryOptions: [], availabilityOptions: [] };

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function SearchClient({ settings }: { settings: SiteSettings }) {
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

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Debounce the free-text query ~300ms per search-spec.md before it drives
  // either the URL or a network request; checkbox/sort changes apply at once.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (selectedBrands.length === 1) params.set("brand", selectedBrands[0]);
    if (selectedCategories.length === 1) params.set("cat", selectedCategories[0]);
    if (sort !== "relevance") params.set("sort", sort);
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });

    const apiParams = new URLSearchParams();
    if (debouncedQuery) apiParams.set("q", debouncedQuery);
    selectedBrands.forEach((b) => apiParams.append("brand", b));
    selectedCategories.forEach((c) => apiParams.append("cat", c));
    selectedAvailability.forEach((a) => apiParams.append("availability", a));
    apiParams.set("sort", sort);

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
  }, [debouncedQuery, selectedBrands, selectedCategories, selectedAvailability, sort]);

  const { results, total, brandOptions, categoryOptions, availabilityOptions } = data ?? EMPTY_RESPONSE;
  const brandNameBySlug = Object.fromEntries(brandOptions.map((b) => [b.slug, b.label]));

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
              <span className="text-text-2">of {total.toLocaleString()} in network</span>
              {loading ? <span className="ml-2 text-text-2">Searching…</span> : null}
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

          {data === null ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[84px] animate-pulse rounded-m bg-bg-2" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div
              className={`flex flex-col gap-px overflow-hidden rounded-m border border-line bg-line transition-opacity ${loading ? "opacity-60" : ""}`}
            >
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
                href={waLink(settings, query ? `Inquiry — Part Number ${query}` : "Inquiry — part not found in online stock")}
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
