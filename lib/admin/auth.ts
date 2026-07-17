import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export interface StaffProfile {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * The signed-in staff member for this request, or redirects to login.
 * Wrapped in cache() so app/admin/(dashboard)/layout.tsx and any
 * role-gated page/module (e.g. RFQ, admin-only) share one lookup per
 * request instead of querying profiles twice.
 */
export const getCurrentStaffProfile = cache(async (): Promise<StaffProfile> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (!profile) {
    // A valid Supabase session with no profiles row — shouldn't happen
    // with no public signup, but never trust an unprovisioned account.
    await supabase.auth.signOut();
    redirect(`/admin/login?error=${encodeURIComponent("Your account isn't provisioned for admin access.")}`);
  }

  return { id: user.id, email: user.email ?? "", role: profile.role };
});

/** For modules restricted beyond "any signed-in staff" — e.g. RFQ is admin-only. */
export async function requireRole(...roles: UserRole[]): Promise<StaffProfile> {
  const profile = await getCurrentStaffProfile();
  if (!roles.includes(profile.role)) {
    redirect("/admin");
  }
  return profile;
}
