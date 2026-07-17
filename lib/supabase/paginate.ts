// PostgREST caps unpaginated selects at 1000 rows by default — Iveco alone
// has 1,561 products, so any plain .select() over the full catalog silently
// truncates. Shared by the app runtime (lib/data/inventory.ts) and
// scripts/migrate-to-supabase.mts. Pages with .range() until a page comes
// back short of pageSize.
//
// The `page` query MUST include a deterministic `.order(...)` (e.g. by a
// unique column like `id`, as a tiebreaker after any business sort) —
// without one, Postgres/PostgREST don't guarantee stable row order across
// separate paged requests, and rows can be skipped or duplicated across the
// page boundary. This bit a real query once (a cross-brand search that
// should have matched 2 products only found 1) before every call site here
// got an explicit order added.
export async function selectAllPaginated<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = 1000,
): Promise<T[]> {
  const results: T[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    results.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return results;
}
