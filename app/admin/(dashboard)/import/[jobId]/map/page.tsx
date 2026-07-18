import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { getImportJob } from "@/lib/admin/import/jobs";
import { getTemplateForBrand } from "@/lib/admin/import/templates";
import { downloadJobFile } from "@/lib/admin/import/storage";
import { parseWorkbook } from "@/lib/admin/import/parseSheet";
import { IMPORT_TARGET_FIELDS, importFieldLabel } from "@/lib/admin/import/fields";
import { getEquipmentCategories } from "@/lib/data/inventory";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { saveMapping, resetMapping } from "./actions";

export const metadata: Metadata = {
  title: "Map Columns — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ error?: string }>;
}

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";
const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";
const selectClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-2.5 py-2 text-[13px] text-text-0 focus:border-brass focus:outline-none";

export default async function AdminImportMapPage({ params, searchParams }: PageProps) {
  await requireRole("editor", "admin");
  const { jobId } = await params;
  const { error } = await searchParams;

  const job = await getImportJob(jobId);
  if (!job) notFound();
  if (!job.brandId || !job.headers) {
    redirect("/admin/import?error=" + encodeURIComponent("This job isn't ready for mapping."));
  }
  if (job.status !== "mapped" && job.status !== "validated") {
    redirect("/admin/import?error=" + encodeURIComponent("This job isn't ready for mapping."));
  }

  const [categories, template] = await Promise.all([getEquipmentCategories(), getTemplateForBrand(job.brandId)]);

  const supabase = await createServerSupabaseClient();
  const bytes = await downloadJobFile(supabase, job.storagePath);
  const { dataRows } = parseWorkbook(bytes);
  const sampleRow = dataRows[0] ?? [];

  const headers = job.headers;
  const boundSaveMapping = saveMapping.bind(null, jobId);
  const boundResetMapping = resetMapping.bind(null, jobId);

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">Map Columns</h1>
      <p className="mt-2 max-w-[70ch] text-[15px] text-text-1">
        <span className="font-mono text-brass">{job.fileName}</span> — {job.brandName}. Nothing is written to Products or
        Inventory yet; this step only validates rows and stages them for the next preview step.
      </p>

      {error ? <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p> : null}

      {job.status === "validated" ? (
        <ValidatedView jobId={jobId} job={job} headers={headers} resetAction={boundResetMapping} />
      ) : (
        <EditableForm
          headers={headers}
          sampleRow={sampleRow}
          categories={categories}
          template={template}
          saveAction={boundSaveMapping}
        />
      )}
    </div>
  );
}

function EditableForm({
  headers,
  sampleRow,
  categories,
  template,
  saveAction,
}: {
  headers: string[];
  sampleRow: unknown[];
  categories: { id: string; name: string }[];
  template: Awaited<ReturnType<typeof getTemplateForBrand>>;
  saveAction: (formData: FormData) => void;
}) {
  return (
    <form action={saveAction} className="mt-6 flex flex-col gap-6">
      <div className="overflow-x-auto rounded-m border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
              <th className="px-4 py-3 font-medium">Source Column</th>
              <th className="px-4 py-3 font-medium">Sample Value</th>
              <th className="px-4 py-3 font-medium">Maps To</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header, i) => {
              const defaultValue = header && template?.columnMapping[header] ? template.columnMapping[header] : "";
              const sample = sampleRow[i];
              return (
                <tr key={i} className="border-b border-line bg-bg-0 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-text-0">{header || `(Column ${i + 1})`}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-text-2">{sample !== undefined && sample !== "" ? String(sample) : "—"}</td>
                  <td className="px-4 py-3">
                    <select name={`mapping_${i}`} defaultValue={defaultValue} className={selectClass}>
                      <option value="">Ignore this column</option>
                      {IMPORT_TARGET_FIELDS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                          {f.required ? " (required)" : ""}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <label className="flex max-w-[420px] flex-col gap-2">
        <span className={labelClass}>Default Equipment Category (for new products from this file)</span>
        <select name="equipment_category_id" required defaultValue={template?.defaultEquipmentCategoryId ?? ""} className={inputClass}>
          <option value="" disabled>
            Select a category…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-text-1">
        <input type="checkbox" name="save_template" value="1" defaultChecked className="accent-brass" />
        Save this mapping as {template ? "the" : "a"} default template for this brand
      </label>

      <button type="submit" className="btn btn-primary self-start">
        Validate &amp; Continue
      </button>
    </form>
  );
}

function ValidatedView({
  job,
  headers,
  resetAction,
}: {
  jobId: string;
  job: Awaited<ReturnType<typeof getImportJob>>;
  headers: string[];
  resetAction: () => void;
}) {
  if (!job) return null;
  const mapping = job.mapping ?? {};

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <span className="tag">{job.validCount ?? 0} valid</span>
        <span className="tag">{job.duplicateCount ?? 0} repeated part number{job.duplicateCount === 1 ? "" : "s"}</span>
        <span className="tag">{job.errorCount ?? 0} error{job.errorCount === 1 ? "" : "s"}</span>
      </div>

      <div className="overflow-x-auto rounded-m border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
              <th className="px-4 py-3 font-medium">Source Column</th>
              <th className="px-4 py-3 font-medium">Maps To</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header, i) => {
              const target = header ? mapping[header] : undefined;
              return (
                <tr key={i} className="border-b border-line bg-bg-0 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-text-0">{header || `(Column ${i + 1})`}</td>
                  <td className="px-4 py-3 text-text-1">{target ? importFieldLabel(target) : "Ignored"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {job.repeatedPartNumbers && job.repeatedPartNumbers.length > 0 ? (
        <div className="rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-sm text-text-1">
          <p className={labelClass}>Repeated part numbers in this file</p>
          <ul className="mt-2 flex flex-col gap-1">
            {job.repeatedPartNumbers.map((r) => (
              <li key={r.partNumber} className="font-mono text-text-0">
                {r.partNumber} — appears {r.count}×
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {job.errorSamples && job.errorSamples.length > 0 ? (
        <div className="rounded-s border border-warn/40 bg-warn/10 px-3.5 py-3 text-sm text-warn">
          <p className={labelClass}>Rows with errors (excluded from this import)</p>
          <ul className="mt-2 flex flex-col gap-1">
            {job.errorSamples.map((e) => (
              <li key={e.rowNumber}>
                Row {e.rowNumber}: {e.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form action={resetAction}>
        <button type="submit" className="btn btn-ghost btn-sm">
          Re-map This File
        </button>
      </form>
    </div>
  );
}
