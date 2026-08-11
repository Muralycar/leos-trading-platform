"use client";

type PageItem = number | "ellipsis";

/** First page, last page, current page, and its immediate neighbors — everything else collapses to a single ellipsis. */
function getPageWindow(current: number, total: number): PageItem[] {
  const keep = new Set<number>([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = Array.from(keep).sort((a, b) => a - b);

  const items: PageItem[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) items.push("ellipsis");
    items.push(page);
    previous = page;
  }
  return items;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="btn btn-ghost btn-sm disabled:pointer-events-none disabled:opacity-40"
      >
        Previous
      </button>

      {getPageWindow(page, totalPages).map((item, i) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-1 font-mono text-[13px] text-text-2">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-s border font-mono text-[12.5px] transition-colors ${
              item === page
                ? "border-brass bg-brass font-semibold text-[#181300]"
                : "border-line-strong text-text-1 hover:border-brass hover:text-brass"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="btn btn-ghost btn-sm disabled:pointer-events-none disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
