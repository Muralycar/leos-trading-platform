import type { Metadata } from "next";
import { requireRole } from "@/lib/admin/auth";
import { getBrands } from "@/lib/data/inventory";
import { createImportJob } from "../actions";

export const metadata: Metadata = {
  title: "New Import — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";
const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

export default async function AdminNewImportPage({ searchParams }: PageProps) {
  await requireRole("editor", "admin");
  const { error } = await searchParams;
  const brands = await getBrands();

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">New Import</h1>
      <p className="mt-2 max-w-[60ch] text-[15px] text-text-1">
        Upload a brand&apos;s stock spreadsheet (.xlsx, .xls, or .csv, up to 10MB). This step only stores the file and
        detects its columns — nothing is written to Products or Inventory yet.
      </p>

      {error ? <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p> : null}

      <form action={createImportJob} encType="multipart/form-data" className="mt-6 flex max-w-[560px] flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Brand</span>
          <select name="brand_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select a brand…
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
            <option value="__new__">Create new brand…</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>New Brand Name (only if &quot;Create new brand…&quot; is selected)</span>
          <input name="new_brand_name" type="text" placeholder="e.g. Caterpillar" className={inputClass} />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Spreadsheet</span>
          <input name="file" type="file" accept=".xlsx,.xls,.csv" required className={inputClass} />
        </label>

        <button type="submit" className="btn btn-primary self-start">
          Upload &amp; Detect Columns
        </button>
      </form>
    </div>
  );
}
