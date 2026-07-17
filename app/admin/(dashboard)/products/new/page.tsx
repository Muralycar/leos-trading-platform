import type { Metadata } from "next";
import { requireRole } from "@/lib/admin/auth";
import { getBrands, getEquipmentCategories } from "@/lib/data/inventory";
import { createProduct } from "../actions";
import type { ProductCondition } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "New Product — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const CONDITIONS: ProductCondition[] = ["genuine_oem", "aftermarket", "obsolete_dead_stock", "used_serviceable"];
const CONDITION_LABEL: Record<ProductCondition, string> = {
  genuine_oem: "Genuine OEM",
  aftermarket: "Aftermarket",
  obsolete_dead_stock: "Obsolete / Dead Stock",
  used_serviceable: "Used / Serviceable",
};

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";
const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

export default async function AdminNewProductPage({ searchParams }: PageProps) {
  await requireRole("editor", "admin");
  const { error } = await searchParams;
  const [brands, categories] = await Promise.all([getBrands(), getEquipmentCategories()]);

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">New Product</h1>
      <p className="mt-2 max-w-[60ch] text-[15px] text-text-1">
        Brand can&apos;t be changed after creation — it&apos;s half of the dedupe key. Categories, batches, and media are
        added after saving.
      </p>

      {error ? <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p> : null}

      <form action={createProduct} className="mt-6 flex max-w-[720px] flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Brand</span>
            <select name="brand_id" required className={inputClass}>
              <option value="">Select a brand…</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Equipment Category</span>
            <select name="equipment_category_id" required className={inputClass}>
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>OEM Part Number</span>
            <input name="oem_part_number" type="text" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Status</span>
            <select name="status" defaultValue="draft" className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Description</span>
          <input name="description" type="text" required className={inputClass} />
        </label>

        <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Equipment Make</span>
            <input name="equipment_make" type="text" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Equipment Model</span>
            <input name="equipment_model" type="text" className={inputClass} />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Application</span>
          <input name="application" type="text" className={inputClass} />
        </label>

        <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Condition</span>
            <select name="condition" defaultValue="" className={inputClass}>
              <option value="">Not specified</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {CONDITION_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Country of Origin</span>
            <input name="country_of_origin" type="text" className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Weight</span>
            <input name="weight" type="number" step="any" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Dimensions</span>
            <input name="dimensions" type="text" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Min Order Qty</span>
            <input name="min_order_qty" type="number" step="1" min="0" className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Price (private)</span>
            <input name="price" type="number" step="any" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Currency</span>
            <input name="currency" type="text" placeholder="AED" className={inputClass} />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Public Notes</span>
          <textarea name="public_notes" rows={3} className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Internal Notes (private)</span>
          <textarea name="internal_notes" rows={3} className={inputClass} />
        </label>

        <button type="submit" className="btn btn-primary self-start">
          Create Product
        </button>
      </form>
    </div>
  );
}
