import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/admin/auth";
import { listAllMachines } from "@/lib/admin/machines";
import { MACHINE_CONDITION_LABEL, MACHINE_STATUS_LABEL, categoryLabel, formatPriceAed } from "@/lib/machinery";

export const metadata: Metadata = {
  title: "Machinery — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMachinesPage() {
  await requireRole("admin");
  const machines = await listAllMachines();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="mt-3.5 text-[28px]">Machinery</h1>
        </div>
        <Link href="/admin/machines/new" className="btn btn-primary btn-sm">
          New Machine
        </Link>
      </div>

      <div className="mt-6 text-sm text-text-2">{machines.length} machines</div>

      <div className="mt-3 overflow-x-auto rounded-m border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-1 text-left font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Condition</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Photos</th>
              <th className="px-4 py-3 font-medium">Availability</th>
              <th className="px-4 py-3 font-medium">Published</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <tr key={m.id} className="border-b border-line bg-bg-0 last:border-0 hover:bg-bg-1">
                <td className="px-4 py-3">
                  <Link href={`/admin/machines/${m.id}/edit`} className="text-text-0 hover:text-brass">
                    {m.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-text-1">{m.brand}</td>
                <td className="whitespace-nowrap px-4 py-3 text-text-2">{categoryLabel(m.category)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-text-2">{m.condition ? MACHINE_CONDITION_LABEL[m.condition] : "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-text-1">{formatPriceAed(m.priceAed)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-text-2">{m.imagePaths.length}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="tag">{MACHINE_STATUS_LABEL[m.status]}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={m.isPublished ? "tag tag-stock" : "tag tag-soon"}>{m.isPublished ? "Live" : "Draft"}</span>
                </td>
              </tr>
            ))}
            {machines.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-text-2">
                  No machines yet. Add your first one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
