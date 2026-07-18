import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/admin/auth";
import { listImportJobs } from "@/lib/admin/import/jobs";
import type { ImportJobStatus } from "@/lib/supabase/types";

const MAPPABLE_STATUSES: ImportJobStatus[] = ["mapped", "validated"];

export const metadata: Metadata = {
  title: "Import Jobs — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ created?: string }>;
}

const STATUS_LABEL: Record<ImportJobStatus, string> = {
  pending: "Pending",
  mapped: "Columns Detected",
  validated: "Validated",
  previewed: "Previewed",
  imported: "Imported",
  failed: "Failed",
  cancelled: "Cancelled",
  rolled_back: "Rolled Back",
};

function formatHeaders(headers: string[] | null): string {
  if (!headers) return "—";
  const named = headers.filter((h) => h !== "");
  if (named.length === 0) return "(no column headers detected)";
  return named.join(", ");
}

export default async function AdminImportListPage({ searchParams }: PageProps) {
  await requireRole("editor", "admin");
  const { created } = await searchParams;
  const jobs = await listImportJobs();
  const createdJob = created ? jobs.find((j) => j.id === created) : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="mt-3.5 text-[28px]">Import Jobs</h1>
        </div>
        <Link href="/admin/import/new" className="btn btn-primary btn-sm">
          New Import
        </Link>
      </div>

      {createdJob ? (
        createdJob.status === "failed" ? (
          <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">
            Uploaded, but the file couldn&apos;t be parsed: {createdJob.parseError ?? "Unknown error."}
          </p>
        ) : (
          <div className="mt-4 rounded-s border border-line-strong bg-bg-1 px-3.5 py-2.5 text-sm text-text-1">
            <p>
              Uploaded <span className="font-mono text-brass">{createdJob.fileName}</span> — {createdJob.rowCount ?? 0} rows,{" "}
              {createdJob.headers?.filter((h) => h !== "").length ?? 0} columns detected.
            </p>
            {createdJob.duplicateOfFileName ? (
              <p className="mt-1.5 text-warn">
                This file looks identical to <span className="font-mono">{createdJob.duplicateOfFileName}</span>, already
                imported on {new Date(createdJob.duplicateOfCreatedAt!).toLocaleString()}.
              </p>
            ) : null}
          </div>
        )
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-m border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Rows</th>
              <th className="px-4 py-3 font-medium">Detected Columns</th>
              <th className="px-4 py-3 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-line bg-bg-0 last:border-0 hover:bg-bg-1">
                <td className="whitespace-nowrap px-4 py-3 text-text-1">{job.brandName}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-text-0">
                  {MAPPABLE_STATUSES.includes(job.status) ? (
                    <Link href={`/admin/import/${job.id}/map`} className="text-brass hover:underline">
                      {job.fileName}
                    </Link>
                  ) : (
                    job.fileName
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="tag">{STATUS_LABEL[job.status]}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-text-1">{job.rowCount ?? "—"}</td>
                <td className="max-w-[420px] truncate px-4 py-3 text-text-2" title={formatHeaders(job.headers)}>
                  {formatHeaders(job.headers)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-text-2">{new Date(job.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-2">
                  No import jobs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
