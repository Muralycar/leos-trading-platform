import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/admin/auth";
import { listRfqEnquiries } from "@/lib/admin/rfq";
import type { RfqStatus } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "RFQ Enquiries — Admin",
  robots: { index: false, follow: false },
};

const STATUSES: RfqStatus[] = ["new", "in_progress", "quoted", "closed"];
const STATUS_LABEL: Record<RfqStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  quoted: "Quoted",
  closed: "Closed",
};

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}

function isRfqStatus(value: string | undefined): value is RfqStatus {
  return !!value && (STATUSES as string[]).includes(value);
}

function pageHref(page: number, status: string | undefined, q: string | undefined): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/rfq?${qs}` : "/admin/rfq";
}

const inputClass =
  "rounded-s border border-line-strong bg-bg-1 px-3.5 py-2.5 text-sm text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

export default async function AdminRfqListPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const { page, status, q } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const statusFilter = isRfqStatus(status) ? status : undefined;

  const { rows, total, pageSize } = await listRfqEnquiries({ page: pageNum, status: statusFilter, query: q });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">RFQ Enquiries</h1>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search company, name, email, phone, part number…"
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

      <div className="mt-6 text-sm text-text-2">{total.toLocaleString()} enquiries</div>

      <div className="mt-3 overflow-x-auto rounded-m border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Name / Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Part Number</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line bg-bg-0 last:border-0 hover:bg-bg-1">
                <td className="whitespace-nowrap px-4 py-3 text-text-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/rfq/${r.id}`} className="text-text-0 hover:text-brass">
                    {r.name}
                  </Link>
                  {r.company ? <div className="text-text-2">{r.company}</div> : null}
                </td>
                <td className="px-4 py-3 text-text-1">
                  <div>{r.email}</div>
                  {r.phone ? <div className="text-text-2">{r.phone}</div> : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-brass">{r.partNumber ?? "—"}</td>
                <td className="px-4 py-3 text-text-2">{r.source}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="tag">{STATUS_LABEL[r.status]}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-2">
                  No enquiries match.
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
