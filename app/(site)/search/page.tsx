import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "@/components/search/SearchClient";

export const metadata: Metadata = {
  title: "Inventory Search — Leos Trading FZE",
  description: "Search Leos Trading's live OEM parts inventory by part number, description, brand or category.",
};

// Forces per-request rendering so the initial HTML reflects the real ?q=/
// ?cat=/?brand= values (matching the Hero's plain GET form) instead of
// falling back to the loading skeleton until client JS hydrates — without
// this, useSearchParams()'s Suspense boundary always serves the fallback
// from a statically-generated shell, since query strings aren't known at
// build time.
export const dynamic = "force-dynamic";

function ResultsSkeleton() {
  return (
    <div className="border-b border-line bg-bg-1 py-10">
      <div className="wrap">
        <div className="eyebrow">Inventory Search</div>
        <div className="mt-3.5 h-10 max-w-[560px] animate-pulse rounded-s bg-bg-2" />
        <div className="mt-6 h-[58px] max-w-[820px] animate-pulse rounded-m bg-bg-2" />
      </div>
      <div className="wrap mt-12 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[84px] animate-pulse rounded-m bg-bg-2" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <SearchClient />
    </Suspense>
  );
}
