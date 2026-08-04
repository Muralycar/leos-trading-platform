import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/admin/auth";
import { listQuotations } from "@/lib/admin/quotations";
import type { QuotationStatus } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Quotations — Admin",
  robots: { index: false, follow: false },
};

const STATUSES: QuotationStatus[] = [
  "draft",
  "under_review",
  "approved",
  "sent",
  "accepted",
  "revision_requested",
  "rejected",
  "expired",
  "cancelled",
];

const STATUS_LABEL: Record<QuotationStatus, string> = {
  draft: "Draft",
  under_review: "Under Review",
  approved: "Approved",
  sent: "Sent",
  accepted: "Accepted",
  revision_requested: "Revision Requested",
  rejected: "Rejected",
  expired: "Expired",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<QuotationStatus, string> = {
  draft: "text-text-1",
  under_review: "text-brass",
  approved: "text-ok",
  sent: "text-text-0",
  accepted: "text-ok",
  revision_requested: "text-warn",
  rejected: "text-safety",
  expired: "text-text-2",
  cancelled: "text-text-2",
};

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}

function isQuotationStatus(value: string | undefined): value is QuotationStatus {
  return !!value && (STATUSES as string[]).includes(value);
}

function pageHref(page: number, status: string | undefined, q: string | undefined): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/quotations?${qs}` : "/admin/quotations";
}

const inputClass =
  "rounded-s border border-line-strong bg-bg-1 px-3.5 py-2.5 text-sm text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

export default async function AdminQuotationsListPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const { page, status, q } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const statusFilter = isQuotationStatus(status) ? status : undefined;

  const { rows, total, pageSize } = await listQuotations({ page: pageNum, status: statusFilter, query: q });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">Quotations</h1>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search quotation number, customer, company, email…"
          className={`min-w-[280px] flex-1 ${inputClass}`}
        />
        <select name="status" defaultValue={status ?? ""} className={inputClass}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-ghost btn-sm">
          Filter
        </button>
      </form>

      <div className="mt-6 text-sm text-text-2">{total.toLocaleString()} quotations</div>

      <div className="mt-3 overflow-x-auto rounded-m border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Customer / Company</th>
              <th className="px-4 py-3 font-medium">Grand Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="relative border-b border-line bg-bg-0 last:border-0 hover:bg-bg-1">
                <td className="whitespace-nowrap px-4 py-3">
                  <Link href={`/admin/quotations/${r.id}`} className="font-mono text-brass after:absolute after:inset-0 hover:text-brass-glow">
                    {r.revisionLabel}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-text-0">{r.customerName}</div>
                  {r.companyName ? <div className="text-text-2">{r.companyName}</div> : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-text-1">
                  {r.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {r.currency ? ` ${r.currency}` : ""}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`tag ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-text-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-text-2">{new Date(r.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-2">
                  No quotations match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-text-2">
        <span>
          Page {pageNum} of {totalPages}
        </span>
        <div className="flex gap-2">
          {pageNum > 1 ? (
            <Link href={pageHref(pageNum - 1, status, q)} className="btn btn-ghost btn-sm">
              Previous
            </Link>
          ) : null}
          {pageNum < totalPages ? (
            <Link href={pageHref(pageNum + 1, status, q)} className="btn btn-ghost btn-sm">
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
