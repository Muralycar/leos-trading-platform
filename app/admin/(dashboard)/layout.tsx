import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

// middleware.ts already redirects unauthenticated requests before they
// reach here — this re-checks (defense in depth, never trust one layer
// alone) and adds the check middleware deliberately doesn't do: that a
// profiles row actually exists for this session. A valid Supabase Auth
// session with no profiles row means the account was never provisioned as
// staff (there's no public signup, so this shouldn't happen in practice,
// but never silently trust an unprovisioned account).
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    redirect(`/admin/login?error=${encodeURIComponent("Your account isn't provisioned for admin access.")}`);
  }

  return (
    <div className="min-h-screen bg-bg-0">
      <header className="flex items-center justify-between border-b border-line bg-bg-1 px-6 py-4">
        <span className="font-mono text-[11px] uppercase tracking-[.06em] text-text-2">Leos Trading — Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-1">
            {user.email} <span className="text-text-2">· {profile.role}</span>
          </span>
          <form action={signOut}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
