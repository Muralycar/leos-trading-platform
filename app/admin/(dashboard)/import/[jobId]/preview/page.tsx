import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { getImportJob } from "@/lib/admin/import/jobs";
import type { ImportJobListItem, ImportBehavior } from "@/lib/admin/import/jobs";
import { listImportRowsByOutcome } from "@/lib/admin/import/rows";
import { computePreview, resetPreview, cancelImport, confirmImport } from "./actions";

export const metadata: Metadata = {
  title: "Preview Import — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ error?: string }>;
}

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";

const BEHAVIOR_OPTIONS: { value: ImportBehavior; label: string; description: string }[] = [
  {
    value: "replace",
    label: "Replace quantity (recommended)",
    description: "Existing stock for matched products is fully replaced by this file's quantities. Product details are left untouched.",
  },
  {
    value: "add",
    label: "Add to quantity",
    description: "This file's quantities are added as new stock lots on top of what's already on hand. Nothing is superseded.",
  },
  {
    value: "update_fields",
    label: "Update all mapped fields",
    description: "Matched products get their mapped fields (description, price, etc.) updated, and their quantity replaced by this file.",
  },
  {
    value: "skip",
    label: "Skip",
    description: "Leave every existing matched product untouched. Only brand-new part numbers in this file will be created.",
  },
];

export default async function AdminImportPreviewPage({ params, searchParams }: PageProps) {
  await requireRole("editor", "admin");
  const { jobId } = await params;
  const { error } = await searchParams;

  const job = await getImportJob(jobId);
  if (!job) redirect("/admin/import?error=" + encodeURIComponent("Import job not found."));
  if (job.status === "mapped") redirect(`/admin/import/${jobId}/map`);
  if (job.status !== "validated" && job.status !== "previewed" && job.status !== "imported" && job.status !== "cancelled") {
    redirect("/admin/import?error=" + encodeURIComponent("This job isn't ready for preview."));
  }

  const boundCompute = computePreview.bind(null, jobId);
  const boundReset = resetPreview.bind(null, jobId);
  const boundCancel = cancelImport.bind(null, jobId);
  const boundConfirm = confirmImport.bind(null, jobId);

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">Preview Import</h1>
      <p className="mt-2 max-w-[70ch] text-[15px] text-text-1">
        <span className="font-mono text-brass">{job.fileName}</span> — {job.brandName}.
      </p>

      {error ? <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p> : null}

      {job.duplicateOfFileName ? (
        <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">
          This file looks identical to <span className="font-mono">{job.duplicateOfFileName}</span>, already imported on{" "}
          {job.duplicateOfCreatedAt ? new Date(job.duplicateOfCreatedAt).toLocaleString() : "an earlier date"}.
        </p>
      ) : null}

      {job.status === "validated" ? (
        <BehaviorForm job={job} action={boundCompute} />
      ) : job.status === "previewed" ? (
        <PreviewResults jobId={jobId} job={job} resetAction={boundReset} cancelAction={boundCancel} confirmAction={boundConfirm} />
      ) : job.status === "imported" ? (
        <ImportedSummary job={job} />
      ) : (
        <p className="mt-6 text-sm text-text-2">This import was cancelled. No Products or Inventory Batches were changed.</p>
      )}
    </div>
  );
}

function BehaviorForm({ job, action }: { job: ImportJobListItem; action: (formData: FormData) => void }) {
  return (
    <form action={action} className="mt-6 flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <span className="tag">{job.validCount ?? 0} valid</span>
        <span className="tag">{job.duplicateCount ?? 0} repeated part number{job.duplicateCount === 1 ? "" : "s"}</span>
        <span className="tag">{job.errorCount ?? 0} error{job.errorCount === 1 ? "" : "s"}</span>
      </div>

      <div className="flex flex-col gap-3">
        <span className={labelClass}>How should existing matched products be handled?</span>
        {BEHAVIOR_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer flex-col gap-1 rounded-s border border-line-strong bg-bg-1 px-4 py-3 has-[:checked]:border-brass"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-text-0">
              <input type="radio" name="behavior" value={opt.value} defaultChecked={opt.value === "replace"} className="accent-brass" />
              {opt.label}
            </span>
            <span className="pl-6 text-[13px] text-text-2">{opt.description}</span>
          </label>
        ))}
      </div>

      <button type="submit" className="btn btn-primary self-start">
        Compute Preview
      </button>
    </form>
  );
}

async function PreviewResults({
  jobId,
  job,
  resetAction,
  cancelAction,
  confirmAction,
}: {
  jobId: string;
  job: ImportJobListItem;
  resetAction: () => void;
  cancelAction: () => void;
  confirmAction: () => void;
}) {
  const [validSamples, skippedSamples] = await Promise.all([
    listImportRowsByOutcome(jobId, ["create", "update"], 50),
    listImportRowsByOutcome(jobId, ["skip"], 50),
  ]);

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="flex flex-wrap gap-3">
        <span className="tag">{job.createCount ?? 0} new</span>
        <span className="tag">{job.updateCount ?? 0} updated</span>
        <span className="tag">{job.unchangedCount ?? 0} unchanged</span>
        <span className="tag">{job.skipCount ?? 0} skipped</span>
        <span className="tag">{job.errorCount ?? 0} error{job.errorCount === 1 ? "" : "s"}</span>
      </div>

      <p className="text-sm text-text-2">
        Behavior: <span className="text-text-0">{BEHAVIOR_OPTIONS.find((b) => b.value === job.behavior)?.label ?? job.behavior}</span>{" "}
        <form action={resetAction} className="inline">
          <button type="submit" className="ml-2 text-brass hover:underline">
            Change
          </button>
        </form>
      </p>

      <Section title={`Valid Rows — will be imported (${(job.createCount ?? 0) + (job.updateCount ?? 0)})`} tone="ok">
        {validSamples.length === 0 ? (
          <p className="text-text-2">No rows will be created or updated.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {validSamples.map((r) => (
              <li key={r.id} className="font-mono text-text-0">
                {String(r.mapped.oem_part_number ?? "")} — {String(r.mapped.description ?? "")} —{" "}
                <span className="tag">{r.outcome === "create" ? "New" : "Update"}</span>
              </li>
            ))}
          </ul>
        )}
        {(job.createCount ?? 0) + (job.updateCount ?? 0) > validSamples.length ? (
          <p className="mt-2 text-text-2">…and {(job.createCount ?? 0) + (job.updateCount ?? 0) - validSamples.length} more.</p>
        ) : null}
      </Section>

      <Section title={`Warnings (${job.duplicateCount ?? 0} repeated part number${job.duplicateCount === 1 ? "" : "s"})`} tone="warn">
        {job.repeatedPartNumbers && job.repeatedPartNumbers.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {job.repeatedPartNumbers.map((r) => (
              <li key={r.partNumber} className="font-mono text-text-0">
                {r.partNumber} — appears {r.count}× (becomes {r.count} batches under one product)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-2">No repeated part numbers in this file.</p>
        )}
      </Section>

      <Section title={`Errors — excluded from this import (${job.errorCount ?? 0})`} tone="error">
        {job.errorSamples && job.errorSamples.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {job.errorSamples.map((e) => (
              <li key={e.rowNumber}>
                Row {e.rowNumber}: {e.reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-2">No errors.</p>
        )}
      </Section>

      <Section title={`Rows To Be Skipped (${job.skipCount ?? 0})`} tone="neutral">
        {skippedSamples.length === 0 ? (
          <p className="text-text-2">No rows will be skipped.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {skippedSamples.map((r) => (
              <li key={r.id} className="font-mono text-text-0">
                {String(r.mapped.oem_part_number ?? "")} — {String(r.mapped.description ?? "")}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {job.missingFromFile && job.missingFromFile.length > 0 ? (
        <Section title={`Existing Products Not In This File (${job.missingFromFile.length})`} tone="neutral">
          <p className="mb-2 text-text-2">
            Nothing will be written for these — stock is never reduced just because a row is missing from a newer file.
          </p>
          <ul className="flex flex-col gap-1">
            {job.missingFromFile.slice(0, 50).map((p) => (
              <li key={p.id} className="font-mono text-text-0">
                {p.oemPartNumber} — {p.description} ({p.quantity} on hand)
              </li>
            ))}
          </ul>
          {job.missingFromFile.length > 50 ? <p className="mt-2 text-text-2">…and {job.missingFromFile.length - 50} more.</p> : null}
        </Section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <form action={confirmAction}>
          <button type="submit" className="btn btn-primary">
            Confirm Import
          </button>
        </form>
        <form action={cancelAction}>
          <button type="submit" className="btn btn-ghost">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

function ImportedSummary({ job }: { job: ImportJobListItem }) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <p className="rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-sm text-text-1">
        This import was completed. {job.createCount ?? 0} products created, {job.updateCount ?? 0} updated, {job.unchangedCount ?? 0}{" "}
        left unchanged, {job.skipCount ?? 0} skipped.
      </p>
      <Link href="/admin/products?status=draft" className="btn btn-primary self-start">
        Review New Draft Products
      </Link>
    </div>
  );
}

function Section({ title, tone, children }: { title: string; tone: "ok" | "warn" | "error" | "neutral"; children: React.ReactNode }) {
  const toneClass =
    tone === "warn"
      ? "border-warn/40 bg-warn/10"
      : tone === "error"
        ? "border-warn/40 bg-warn/10"
        : "border-line-strong bg-bg-1";
  return (
    <div className={`rounded-s border px-4 py-3.5 text-sm ${toneClass}`}>
      <p className={labelClass}>{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
