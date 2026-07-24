import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/admin/auth";
import { listProducts, getProductById } from "@/lib/admin/products";
import { listMediaForProduct } from "@/lib/admin/media";
import { getCurrentDraftForProduct } from "@/lib/admin/listing-generator";
import { buildReviewData } from "@/lib/listing-generator/templates";
import { ListingWorkspace } from "./ListingWorkspace";

export const metadata: Metadata = {
  title: "Listing Generator — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ q?: string; productId?: string }>;
}

const inputClass =
  "rounded-s border border-line-strong bg-bg-1 px-3.5 py-2.5 text-sm text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

export default async function ListingGeneratorPage({ searchParams }: PageProps) {
  await requireRole("editor", "admin");
  const { q, productId } = await searchParams;

  if (!productId) {
    const { rows, total } = q ? await listProducts({ query: q, page: 1 }) : { rows: [], total: 0 };

    return (
      <div>
        <div className="eyebrow">Admin — Phase 1</div>
        <h1 className="mt-3.5 text-[28px]">Listing Generator</h1>
        <p className="mt-2 max-w-[70ch] text-text-1">
          Select an existing inventory product to generate reusable draft content for the website, eBay, Alibaba,
          SEO and LinkedIn. This tool produces drafts only — nothing here publishes to any external marketplace.
        </p>

        <form className="mt-6 flex flex-wrap gap-3" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search OEM part number, product name or brand…"
            className={`min-w-[320px] flex-1 ${inputClass}`}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        {q ? (
          <div className="mt-6">
            <div className="text-sm text-text-2">{total.toLocaleString()} product(s) match &ldquo;{q}&rdquo;</div>
            <div className="mt-3 overflow-x-auto rounded-m border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Brand</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-b border-line bg-bg-0 last:border-0 hover:bg-bg-1">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-brass">{p.oemPartNumber}</td>
                      <td className="px-4 py-3 text-text-0">{p.description}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-1">{p.brandName}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-2">{p.equipmentCategoryName}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link href={`/admin/listing-generator?productId=${p.id}`} className="btn btn-ghost btn-sm">
                          Select →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-text-2">
                        No products match.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const product = await getProductById(productId);
  if (!product) {
    return (
      <div>
        <div className="eyebrow">Admin — Phase 1</div>
        <h1 className="mt-3.5 text-[28px]">Listing Generator</h1>
        <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">
          Product not found.
        </p>
        <Link href="/admin/listing-generator" className="btn btn-ghost btn-sm mt-4">
          ← Back to search
        </Link>
      </div>
    );
  }

  const [media, existingDraft] = await Promise.all([listMediaForProduct(productId), getCurrentDraftForProduct(productId)]);
  const images = media.map((m) => m.publicUrl);
  const initialReviewData = existingDraft?.reviewData ?? buildReviewData(product, images);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Admin — Phase 1</div>
          <h1 className="mt-3.5 text-[28px]">Listing Generator</h1>
          <p className="mt-1 text-text-1">
            {product.brandName} — {product.oemPartNumber} — {product.description}
          </p>
        </div>
        <Link href="/admin/listing-generator" className="btn btn-ghost btn-sm">
          ← Search another product
        </Link>
      </div>

      <ListingWorkspace
        productId={product.id}
        draftId={existingDraft?.id ?? null}
        initialReviewData={initialReviewData}
        initialOutputs={existingDraft?.generatedOutputs ?? {}}
        initialStatus={existingDraft?.status ?? "draft"}
        version={existingDraft?.version ?? 0}
      />
    </div>
  );
}
