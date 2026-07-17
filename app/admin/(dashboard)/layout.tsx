import Link from "next/link";
import { getCurrentStaffProfile } from "@/lib/admin/auth";
import { signOut } from "./actions";

// middleware.ts already redirects unauthenticated requests before they
// reach here — getCurrentStaffProfile() re-checks (defense in depth, never
// trust one layer alone) and adds what middleware deliberately doesn't do:
// confirms a profiles row exists for this session.
const NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "RFQ Enquiries", href: "/admin/rfq" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentStaffProfile();

  return (
    <div className="min-h-screen bg-bg-0">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-bg-1 px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="font-mono text-[11px] uppercase tracking-[.06em] text-text-2">Leos Trading — Admin</span>
          <nav className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-[13px] font-medium text-text-1 hover:text-brass">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-1">
            {profile.email} <span className="text-text-2">· {profile.role}</span>
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
