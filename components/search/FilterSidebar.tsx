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
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <label
            key={opt.slug}
            className={`flex cursor-pointer items-center gap-2.5 text-sm text-text-1 ${opt.count === 0 ? "opacity-40" : ""}`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.slug)}
              onChange={() => onToggle(opt.slug)}
              className="accent-brass"
            />
            <span>{opt.label}</span>
            <span className="ml-auto font-mono text-[11px] text-text-2">{opt.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface FilterSidebarProps {
  brandOptions: FilterOption[];
  categoryOptions: FilterOption[];
  availabilityOptions: FilterOption[];
  selectedBrands: string[];
  selectedCategories: string[];
  selectedAvailability: string[];
  onToggleBrand: (slug: string) => void;
  onToggleCategory: (slug: string) => void;
  onToggleAvailability: (slug: string) => void;
}

export function FilterSidebar({
  brandOptions,
  categoryOptions,
  availabilityOptions,
  selectedBrands,
  selectedCategories,
  selectedAvailability,
  onToggleBrand,
  onToggleCategory,
  onToggleAvailability,
}: FilterSidebarProps) {
  return (
    <aside className="border-b border-line pb-8 min-[901px]:sticky min-[901px]:top-24 min-[901px]:self-start min-[901px]:border-b-0 min-[901px]:border-r min-[901px]:pb-0 min-[901px]:pr-8">
      <FilterGroup title="Brand" options={brandOptions} selected={selectedBrands} onToggle={onToggleBrand} />
      <FilterGroup title="Category" options={categoryOptions} selected={selectedCategories} onToggle={onToggleCategory} />
      <FilterGroup
        title="Availability"
        options={availabilityOptions}
        selected={selectedAvailability}
        onToggle={onToggleAvailability}
      />
    </aside>
  );
}
