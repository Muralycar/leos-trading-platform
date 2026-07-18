import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { getImportJob, getAffectedProducts } from "@/lib/admin/import/jobs";
import { rollbackImport } from "./actions";

export const metadata: Metadata = {
  title: "Import Job — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ error?: string }>;
}

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";

const BEHAVIOR_LABEL: Record<string, string> = {
  skip: "Skip",
  replace: "Replace quantity",
  add: "Add to quantity",
  update_fields: "Update all mapped fields",
};

export default async function AdminImportJobDetailPage({ params, searchParams }: PageProps) {
  const profile = await requireRole("editor", "admin");
  const { jobId } = await params;
  const { error } = await searchParams;

  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (job.status === "pending" || job.status === "mapped") redirect(`/admin/import/${jobId}/map`);
  if (job.status === "validated" || job.status === "previewed") redirect(`/admin/import/${jobId}/preview`);
  if (job.status === "failed") redirect("/admin/import?error=" + encodeURIComponent("This file couldn't be parsed."));

  const affectedProducts = job.status === "imported" ? await getAffectedProducts(jobId) : [];
  const boundRollback = rollbackImport.bind(null, jobId);

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">Import Job</h1>
      <p className="mt-2 max-w-[70ch] text-[15px] text-text-1">
        <span className="font-mono text-brass">{job.fileName}</span> — {job.brandName}. Uploaded {new Date(job.createdAt).toLocaleString()}.
      </p>

      {error ? <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p> : null}

      <div className="mt-4">
        <span className="tag">{job.status === "imported" ? "Imported" : job.status === "rolled_back" ? "Rolled Back" : "Cancelled"}</span>
      </div>

      {job.status === "cancelled" ? (
        <p className="mt-6 text-sm text-text-2">This import was cancelled. No Products or Inventory Batches were changed.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            <span className="tag">{job.createCount ?? 0} new</span>
            <span className="tag">{job.updateCount ?? 0} updated</span>
            <span className="tag">{job.unchangedCount ?? 0} unchanged</span>
            <span className="tag">{job.skipCount ?? 0} skipped</span>
            <span className="tag">{job.errorCount ?? 0} error{job.errorCount === 1 ? "" : "s"}</span>
          </div>

          {job.behavior ? (
            <p className="text-sm text-text-2">
              Behavior used: <span className="text-text-0">{BEHAVIOR_LABEL[job.behavior] ?? job.behavior}</span>
            </p>
          ) : null}

          {job.status === "rolled_back" ? (
            <p className="rounded-s border border-line-strong bg-bg-1 px-3.5 py-2.5 text-sm text-text-1">
              This import has been rolled back — every batch it created was removed, everything it superseded was restored, and
              any product it created that was never edited since was removed. Products it created that were later edited are
              kept, with their batch from this job removed.
            </p>
          ) : null}

          {affectedProducts.length > 0 ? (
            <div className="overflow-x-auto rounded-m border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {affectedProducts.map((p) => (
                    <tr key={p.id} className="border-b border-line bg-bg-0 last:border-0 hover:bg-bg-1">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-brass">
                        <Link href={`/admin/products/${p.id}/edit`} className="hover:underline">
                          {p.oemPartNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-0">{p.description}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-1">{p.quantity}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="tag">{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : job.status === "imported" ? (
            <p className={labelClass}>No products were created or updated by this import.</p>
          ) : null}

          {job.status === "imported" && profile.role === "admin" ? (
            <form action={boundRollback} className="flex flex-col items-start gap-2">
              <p className="max-w-[60ch] text-[13px] text-text-2">
                Rolling back restores everything this import superseded and removes everything it created — undoing a rollback
                isn&apos;t supported.
              </p>
              <button type="submit" className="btn btn-ghost btn-sm">
                Roll Back This Import
              </button>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
}
