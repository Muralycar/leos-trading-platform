import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { getRfqEnquiryById } from "@/lib/admin/rfq";
import type { RfqStatus } from "@/lib/supabase/types";
import { updateRfqNotes, updateRfqStatus } from "../actions";

export const metadata: Metadata = {
  title: "RFQ Detail — Admin",
  robots: { index: false, follow: false },
};

const STATUSES: RfqStatus[] = ["new", "in_progress", "quoted", "closed"];
const STATUS_LABEL: Record<RfqStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  quoted: "Quoted",
  closed: "Closed",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";
const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-line py-3 text-sm">
      <div className={labelClass}>{label}</div>
      <div className="text-text-0">{value}</div>
    </div>
  );
}

export default async function AdminRfqDetailPage({ params }: PageProps) {
  await requireRole("admin");
  const { id } = await params;
  const rfq = await getRfqEnquiryById(id);
  if (!rfq) notFound();

  return (
    <div>
      <Link href="/admin/rfq" className="text-sm text-text-2 hover:text-brass">
        ← RFQ Enquiries
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">RFQ</div>
          <h1 className="mt-3.5 text-[28px]">{rfq.name}</h1>
          {rfq.company ? <p className="mt-1 text-text-1">{rfq.company}</p> : null}
        </div>
        <span className="tag">{STATUS_LABEL[rfq.status]}</span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 min-[901px]:grid-cols-[1.3fr_1fr]">
        <div className="rounded-m border border-line bg-bg-1 p-6">
          <Field label="Email" value={<a href={`mailto:${rfq.email}`} className="hover:text-brass">{rfq.email}</a>} />
          <Field label="Phone" value={rfq.phone ?? "—"} />
          <Field label="WhatsApp" value={rfq.whatsapp ?? "—"} />
          <Field label="Country" value={rfq.country ?? "—"} />
          <Field label="Brand" value={rfq.brand ?? "—"} />
          <Field label="Part Number" value={rfq.partNumber ?? "—"} />
          <Field label="Quantity Required" value={rfq.quantityRequired ?? "—"} />
          <Field label="Source" value={rfq.source} />
          <Field label="Message" value={rfq.message ?? "—"} />
          <Field
            label="Attachment"
            value={
              rfq.attachmentUrl ? (
                <a href={rfq.attachmentUrl} target="_blank" rel="noreferrer" className="hover:text-brass">
                  View attachment
                </a>
              ) : (
                "—"
              )
            }
          />
          <Field label="Created" value={new Date(rfq.createdAt).toLocaleString()} />
          <Field label="Updated" value={new Date(rfq.updatedAt).toLocaleString()} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Status</h3>
            <form action={updateRfqStatus.bind(null, rfq.id)} className="mt-4 flex flex-col gap-3">
              <select name="status" defaultValue={rfq.status} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-sm self-start">
                Update Status
              </button>
            </form>
          </div>

          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Internal Notes</h3>
            <p className="mt-1 text-[13px] text-text-2">Never shown to the customer.</p>
            <form action={updateRfqNotes.bind(null, rfq.id)} className="mt-4 flex flex-col gap-3">
              <textarea name="notes" rows={6} defaultValue={rfq.internalNotes ?? ""} className={inputClass} />
              <button type="submit" className="btn btn-ghost btn-sm self-start">
                Save Notes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
