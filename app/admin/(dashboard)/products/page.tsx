import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/admin/auth";
import { listProducts } from "@/lib/admin/products";
import { getBrands, getEquipmentCategories } from "@/lib/data/inventory";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import type { ProductStatus } from "@/lib/supabase/types";
import { bulkArchive, bulkDelete, bulkPublish, bulkUnpublish } from "./actions";

export const metadata: Metadata = {
  title: "Products — Admin",
  robots: { index: false, follow: false },
};

const STATUSES: ProductStatus[] = ["draft", "published", "archived"];
const STATUS_LABEL: Record<ProductStatus, string> = { draft: "Draft", published: "Published", archived: "Archived" };

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; brand?: string; cat?: string; q?: string }>;
}

function isProductStatus(value: string | undefined): value is ProductStatus {
  return !!value && (STATUSES as string[]).includes(value);
}

function pageHref(page: number, params: { status?: string; brand?: string; cat?: string; q?: string }): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.brand) search.set("brand", params.brand);
  if (params.cat) search.set("cat", params.cat);
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

const inputClass =
  "rounded-s border border-line-strong bg-bg-1 px-3.5 py-2.5 text-sm text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

export default async function AdminProductsListPage({ searchParams }: PageProps) {
  const profile = await requireRole("editor", "admin");
  const { page, status, brand, cat, q } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const statusFilter = isProductStatus(status) ? status : undefined;

  const [{ rows, total, pageSize }, brands, categories] = await Promise.all([
    listProducts({ page: pageNum, status: statusFilter, brandSlug: brand, equipmentCategorySlug: cat, query: q }),
    getBrands(),
    getEquipmentCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="mt-3.5 text-[28px]">Products</h1>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          New Product
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search OEM part number, description, brand…"
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
        <select name="brand" defaultValue={brand ?? ""} className={inputClass}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <select name="cat" defaultValue={cat ?? ""} className={inputClass}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-ghost btn-sm">
          Filter
        </button>
      </form>

      <div className="mt-6 text-sm text-text-2">{total.toLocaleString()} products</div>

      <form>
        <div className="mt-3 overflow-x-auto rounded-m border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-line bg-bg-0 last:border-0 hover:bg-bg-1">
                  <td className="px-4 py-3">
                    <input type="checkbox" name="ids" value={p.id} className="accent-brass" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-brass">
                    <Link href={`/admin/products/${p.id}/edit`} className="hover:underline">
                      {p.oemPartNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-0">{p.description}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-1">{p.brandName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-2">{p.equipmentCategoryName}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <AvailabilityBadge quantity={p.quantity} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="tag">{STATUS_LABEL[p.status]}</span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-text-2">
                    No products match.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {rows.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-text-2">Selected rows:</span>
            <button type="submit" formAction={bulkPublish} className="btn btn-ghost btn-sm">
              Publish
            </button>
            <button type="submit" formAction={bulkUnpublish} className="btn btn-ghost btn-sm">
              Unpublish
            </button>
            <button type="submit" formAction={bulkArchive} className="btn btn-ghost btn-sm">
              Archive
            </button>
            {profile.role === "admin" ? (
              <button type="submit" formAction={bulkDelete} className="btn btn-ghost btn-sm">
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </form>

      <div className="mt-4 flex items-center justify-between text-sm text-text-2">
        <span>
          Page {pageNum} of {totalPages}
        </span>
        <div className="flex gap-2">
          {pageNum > 1 ? (
            <Link href={pageHref(pageNum - 1, { status, brand, cat, q })} className="btn btn-ghost btn-sm">
              Previous
            </Link>
          ) : null}
          {pageNum < totalPages ? (
            <Link href={pageHref(pageNum + 1, { status, brand, cat, q })} className="btn btn-ghost btn-sm">
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
