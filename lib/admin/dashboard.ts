import { createServerSupabaseClient } from "@/lib/supabase/server";
import { selectAllPaginated } from "@/lib/supabase/paginate";

const RECENT_IMPORT_WINDOW_DAYS = 7;

export interface DashboardSummary {
  /** null when the caller isn't allowed to see RFQ counts (RFQ viewing is admin-only, same as /admin/rfq itself). */
  newRfqCount: number | null;
  totalProductCount: number;
  currentInventoryUnits: number;
  recentImportCount: number;
}

/**
 * One query per card, run in parallel. Total products and current
 * inventory units deliberately cover every product status (not just
 * published) — this is the admin's view of the real catalog and real
 * physical stock, not the public site's. Current inventory units reuses
 * product_admin_view's already-summed is_current-batch quantity per
 * product (same aggregation product_public_availability does for the
 * public site), rather than re-summing inventory_batches directly.
 */
export async function getDashboardSummary(includeRfqCount: boolean): Promise<DashboardSummary> {
  const supabase = await createServerSupabaseClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_IMPORT_WINDOW_DAYS);

  const [newRfqResult, productCountResult, unitRows, recentImportResult] = await Promise.all([
    includeRfqCount
      ? supabase.from("rfq_enquiries").select("*", { count: "exact", head: true }).eq("status", "new")
      : Promise.resolve({ count: null as number | null, error: null }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    selectAllPaginated<{ id: string; quantity: number }>((from, to) =>
      supabase.from("product_admin_view").select("id, quantity").order("id", { ascending: true }).range(from, to),
    ),
    // Recent-imports uses created_at (upload time), not a "confirmed at"
    // timestamp — there isn't one as a real queryable column, only inside
    // import_jobs.report jsonb. Close enough for a dashboard tile: most
    // imports are confirmed the same session they're uploaded.
    supabase
      .from("import_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "imported")
      .gte("created_at", cutoff.toISOString()),
  ]);

  if (newRfqResult.error) throw newRfqResult.error;
  if (productCountResult.error) throw productCountResult.error;
  if (recentImportResult.error) throw recentImportResult.error;

  return {
    newRfqCount: includeRfqCount ? (newRfqResult.count ?? 0) : null,
    totalProductCount: productCountResult.count ?? 0,
    currentInventoryUnits: unitRows.reduce((sum, r) => sum + r.quantity, 0),
    recentImportCount: recentImportResult.count ?? 0,
  };
}
