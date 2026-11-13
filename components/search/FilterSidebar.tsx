"use client";

import { useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/Icons";

export interface FilterOption {
  slug: string;
  label: string;
  count: number;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (slug: string) => void;
}

function FilterGroup({ title, options, selected, onToggle }: FilterGroupProps) {
  return (
    <div className="mb-8">
      <h4 className="mb-3.5 font-mono text-[11px] uppercase tracking-[.08em] text-text-2">{title}</h4>
      <div className="flex flex-col gap-0.5">
        {options.map((opt) => (
          <label
            key={opt.slug}
            className={`flex cursor-pointer items-center gap-2.5 rounded-s px-1.5 py-2 text-sm text-text-1 transition-colors hover:bg-bg-2 ${
              opt.count === 0 ? "opacity-40" : ""
            }`}
          >
            <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={selected.includes(opt.slug)}
                onChange={() => onToggle(opt.slug)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-[3px] border border-line-strong bg-bg-1 transition-colors peer-checked:border-brass peer-checked:bg-brass peer-focus-visible:ring-2 peer-focus-visible:ring-brass peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-0" />
              <CheckIcon className="relative h-2.5 w-2.5 text-[#181300] opacity-0 transition-opacity peer-checked:opacity-100" />
            </span>
            <span>{opt.label}</span>
            <span className="ml-auto font-mono text-[11px] text-text-2">{opt.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface FilterSidebarProps {
  categoryOptions: FilterOption[];
  availabilityOptions: FilterOption[];
  selectedCategories: string[];
  selectedAvailability: string[];
  onToggleCategory: (slug: string) => void;
  onToggleAvailability: (slug: string) => void;
}

// Brand is deliberately not a filter group here — it's surfaced as the
// top-level quick-filter chips in SearchClient instead (single-select,
// live-inventory brands only), matching the approved Inventory redesign.
export function FilterSidebar({
  categoryOptions,
  availabilityOptions,
  selectedCategories,
  selectedAvailability,
  onToggleCategory,
  onToggleAvailability,
}: FilterSidebarProps) {
  // Phones: filters collapse behind a toggle so results show first. Desktop: always open.
  const [open, setOpen] = useState(false);
  const activeCount = selectedCategories.length + selectedAvailability.length;

  return (
    <aside className="min-[901px]:sticky min-[901px]:top-24 min-[901px]:self-start min-[901px]:border-r min-[901px]:border-line min-[901px]:pr-8">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="search-filters"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center justify-between rounded-s border border-line-strong bg-bg-1 px-4 font-mono text-[13px] font-semibold uppercase tracking-[.04em] text-text-0 min-[901px]:hidden"
      >
        <span>
          Filters
          {activeCount > 0 ? <span className="ml-2 text-brass">({activeCount})</span> : null}
        </span>
        <ChevronDownIcon className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div id="search-filters" className={`${open ? "block" : "hidden"} mt-6 min-[901px]:mt-0 min-[901px]:block`}>
        <FilterGroup title="Category" options={categoryOptions} selected={selectedCategories} onToggle={onToggleCategory} />
        <FilterGroup
          title="Availability"
          options={availabilityOptions}
          selected={selectedAvailability}
          onToggle={onToggleAvailability}
        />
      </div>
    </aside>
  );
}
