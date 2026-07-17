import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Browser-side, anon-key, RLS-scoped client. Not yet used anywhere — every
// current public page is a Server Component reading through lib/data/inventory.ts.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
