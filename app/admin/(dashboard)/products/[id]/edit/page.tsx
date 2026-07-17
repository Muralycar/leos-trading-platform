import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { getAllProductCategories, getProductById, getProductCategoryIds } from "@/lib/admin/products";
import type { ProductCondition } from "@/lib/supabase/types";
import { updateProduct, updateProductCategories } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Product — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
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

export default async function AdminEditProductPage({ params, searchParams }: PageProps) {
  await requireRole("editor", "admin");
  const { id } = await params;
  const { error, saved } = await searchParams;

  const product = await getProductById(id);
  if (!product) notFound();

  const [allCategories, selectedCategoryIds] = await Promise.all([getAllProductCategories(), getProductCategoryIds(id)]);

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">{product.oemPartNumber}</h1>
      <p className="mt-1 text-text-1">
        {product.brandName} <span className="text-text-2">(brand can&apos;t be changed here)</span>
      </p>

      {error ? <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p> : null}
      {saved ? <p className="mt-4 rounded-s border border-ok/40 bg-ok/10 px-3.5 py-2.5 text-sm text-ok">Saved.</p> : null}

      <div className="mt-8 grid grid-cols-1 gap-8 min-[901px]:grid-cols-[1.4fr_1fr]">
        <form action={updateProduct.bind(null, product.id)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>OEM Part Number</span>
              <input name="oem_part_number" type="text" defaultValue={product.oemPartNumber} required className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Status</span>
              <select name="status" defaultValue={product.status} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Description</span>
            <input name="description" type="text" defaultValue={product.description} required className={inputClass} />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Equipment Category</span>
            <select name="equipment_category_id" defaultValue={product.equipmentCategoryId} required className={inputClass}>
              {/* The product's own category is guaranteed present since it was fetched via this exact id. */}
              <option value={product.equipmentCategoryId}>{product.equipmentCategoryName}</option>
            </select>
          </label>

          <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Equipment Make</span>
              <input name="equipment_make" type="text" defaultValue={product.equipmentMake ?? ""} className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Equipment Model</span>
              <input name="equipment_model" type="text" defaultValue={product.equipmentModel ?? ""} className={inputClass} />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Application</span>
            <input name="application" type="text" defaultValue={product.application ?? ""} className={inputClass} />
          </label>

          <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Condition</span>
              <select name="condition" defaultValue={product.condition ?? ""} className={inputClass}>
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
              <input name="country_of_origin" type="text" defaultValue={product.countryOfOrigin ?? ""} className={inputClass} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Weight</span>
              <input name="weight" type="number" step="any" defaultValue={product.weight ?? ""} className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Dimensions</span>
              <input name="dimensions" type="text" defaultValue={product.dimensions ?? ""} className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Min Order Qty</span>
              <input
                name="min_order_qty"
                type="number"
                step="1"
                min="0"
                defaultValue={product.minOrderQty ?? ""}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Price (private)</span>
              <input name="price" type="number" step="any" defaultValue={product.price ?? ""} className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Currency</span>
              <input name="currency" type="text" defaultValue={product.currency ?? ""} className={inputClass} />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Public Notes</span>
            <textarea name="public_notes" rows={3} defaultValue={product.publicNotes ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Internal Notes (private)</span>
            <textarea name="internal_notes" rows={3} defaultValue={product.internalNotes ?? ""} className={inputClass} />
          </label>

          <button type="submit" className="btn btn-primary self-start">
            Save Product
          </button>
        </form>

        <div className="flex flex-col gap-6">
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Categories</h3>
            <form action={updateProductCategories.bind(null, product.id)} className="mt-4 flex flex-col gap-3">
              {allCategories.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 text-sm text-text-1">
                  <input
                    type="checkbox"
                    name="category_ids"
                    value={c.id}
                    defaultChecked={selectedCategoryIds.includes(c.id)}
                    className="accent-brass"
                  />
                  {c.name}
                </label>
              ))}
              <button type="submit" className="btn btn-ghost btn-sm mt-2 self-start">
                Save Categories
              </button>
            </form>
          </div>

          <div className="rounded-m border border-dashed border-line-strong p-6 text-sm text-text-2">
            Inventory batches and media are managed here in a later checkpoint.
          </div>
        </div>
      </div>
    </div>
  );
}
