import type { createServerSupabaseClient } from "@/lib/supabase/server";

const BUCKET = "import-uploads";

/**
 * Re-downloads the originally uploaded file rather than caching row data in
 * Postgres — the file in Storage is the durable source of truth, and
 * mapping/validation can always be re-run against it (e.g. "re-map this
 * file" after a bad column choice) without ever risking drift from what was
 * actually uploaded.
 */
export async function downloadJobFile(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  storagePath: string,
): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
  if (error || !data) throw new Error(error?.message ?? "Could not download the uploaded file.");
  return Buffer.from(await data.arrayBuffer());
}
