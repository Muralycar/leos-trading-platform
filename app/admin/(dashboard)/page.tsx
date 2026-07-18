import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentStaffProfile } from "@/lib/admin/auth";
import { getDashboardSummary } from "@/lib/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin — Leos Trading FZE",
  robots: { index: false, follow: false },
};

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";

function Card({ label, value, sublabel, href }: { label: string; value: string; sublabel?: string; href: string }) {
  return (
    <Link href={href} className="rounded-m border border-line bg-bg-1 p-5 transition-colors hover:border-brass">
      <span className={labelClass}>{label}</span>
      <div className="mt-2 text-[32px] leading-none text-text-0">{value}</div>
      {sublabel ? <div className="mt-1.5 text-[13px] text-text-2">{sublabel}</div> : null}
    </Link>
  );
}

export default async function AdminHomePage() {
  const profile = await getCurrentStaffProfile();
  const isAdmin = profile.role === "admin";
  const summary = await getDashboardSummary(isAdmin);

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">Dashboard</h1>
      <p className="mt-3 max-w-[60ch] text-[15px] text-text-1">
        Manage the product catalog, run brand spreadsheet imports through the Excel Import Wizard, and review RFQ enquiries
        below.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 min-[601px]:grid-cols-2 min-[1001px]:grid-cols-4">
        {isAdmin ? (
          <Card label="New RFQs" value={String(summary.newRfqCount ?? 0)} sublabel="Awaiting a first response" href="/admin/rfq?status=new" />
        ) : null}
        <Card label="Total Products" value={summary.totalProductCount.toLocaleString()} sublabel="Draft, published, and archived" href="/admin/products" />
        <Card label="Current Inventory Units" value={summary.currentInventoryUnits.toLocaleString()} sublabel="Sum of current stock batches" href="/admin/products" />
        <Card label="Recent Imports" value={String(summary.recentImportCount)} sublabel="Completed in the last 7 days" href="/admin/import" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/products" className="btn btn-primary">
          Products
        </Link>
        <Link href="/admin/import" className="btn btn-ghost">
          Import Wizard
        </Link>
        {isAdmin ? (
          <Link href="/admin/rfq" className="btn btn-ghost">
            RFQ Enquiries
          </Link>
        ) : null}
      </div>
    </div>
  );
}
