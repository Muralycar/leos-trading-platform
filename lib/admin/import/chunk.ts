// Shared batching primitives for the Import Wizard's writes — the whole
// point is that time-to-complete grows with catalog size divided by chunk
// size and concurrency, not with catalog size directly, so an arbitrarily
// large brand catalog completes in bounded, predictable time instead of
// one round trip per row (which is what made a ~1,500-product first import
// take minutes, not seconds, and risk exceeding a serverless function's
// execution limit).

/** Body-payload chunk size (insert/upsert) — matches the size already proven safe elsewhere in this codebase (batch inserts, row-outcome upserts). */
export const WRITE_CHUNK_SIZE = 500;

/**
 * Chunk size for values passed into a PostgREST `.in(...)` filter, which
 * travels in the request URL, not the body — UUIDs are 36 chars, and
 * generic proxies/CDNs commonly cap URL length around 8-16KB, so this stays
 * well under that (200 UUIDs ≈ 7.6KB with encoding overhead) regardless of
 * how many products a job actually touches.
 */
export const FILTER_CHUNK_SIZE = 200;

/** How many chunks run concurrently — bounded so a huge catalog doesn't fire thousands of simultaneous requests at Supabase's connection pool. */
export const CHUNK_CONCURRENCY = 4;

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * Runs `handler` over `items` split into chunks of `chunkSize`, with at most
 * `concurrency` chunks in flight at once (a small worker-pool, not an
 * unbounded Promise.all — firing e.g. 300 concurrent requests for a 150,000
 * row catalog would just move the bottleneck to Supabase's connection pool).
 * Any chunk's failure propagates immediately; already-issued requests for
 * other in-flight chunks are not cancelled, but every chunk-level write this
 * module uses is itself idempotent, so a later retry naturally repairs
 * whatever was left incomplete.
 */
export async function processInChunks<T>(
  items: T[],
  chunkSize: number,
  concurrency: number,
  handler: (chunk: T[]) => Promise<void>,
): Promise<void> {
  if (items.length === 0) return;
  const chunks = chunkArray(items, chunkSize);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const index = nextIndex++;
      if (index >= chunks.length) return;
      await handler(chunks[index]);
    }
  }

  const workerCount = Math.min(concurrency, chunks.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}
