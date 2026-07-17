import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

// Server Component / Server Action / Route Handler client — uses the
// request's session cookie, so reads are RLS-scoped to whoever is signed
// in (or anonymous). This is what every public Server Component page will
// use once the data layer moves off the local JSON file.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a context that can't set cookies (e.g. a Server
            // Component render) — safe to ignore once middleware is
            // refreshing the session on every request (added in Phase 3.12).
          }
        },
      },
    },
  );
}

/**
 * Service-role client — bypasses RLS entirely. Server-only. Only ever call
 * this from inside an admin Server Action / Route Handler, and only after
 * that handler has already checked profiles.role itself — never trust RLS
 * as the sole gate when this client is in use, and never import this file
 * from a Client Component.
 */
export function createServiceRoleClient() {
  return createSupabaseJsClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
