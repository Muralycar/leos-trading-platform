import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Anon-key client with no session/cookie dependency — safe to call from any
 * context, including generateStaticParams (build time, no HTTP request to
 * read cookies from) and Route Handlers. This is what lib/data/inventory.ts
 * uses for every public read: RLS's `status = 'published'` / `active`
 * policies apply the same whether or not anyone is signed in, so public
 * data has no reason to depend on request-scoped session state at all.
 */
export function createAnonSupabaseClient() {
  return createSupabaseJsClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Session-cookie-aware client — reserved for admin auth (Phase 3.12+),
// where a Server Component/Action genuinely needs to know who's signed in.
// Not used by any public page today.
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
