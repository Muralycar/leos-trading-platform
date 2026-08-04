import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import {
  getRfqEnquiryById,
  listRfqStatusHistory,
  listRfqNotes,
  buildRfqTimeline,
  type RfqTimelineEvent,
} from "@/lib/admin/rfq";
import { getCurrentQuotationForRfq, listQuotationActivityForRfq } from "@/lib/admin/quotations";
import type { RfqStatus } from "@/lib/supabase/types";
import {
  updateRfqStatusAction,
  addRfqNoteAction,
  updateRfqNoteAction,
  deleteRfqNoteAction,
  createQuotationAction,
} from "../actions";

export const metadata: Metadata = {
  title: "RFQ Detail — Admin",
  robots: { index: false, follow: false },
};

const STATUSES: RfqStatus[] = [
  "new",
  "reviewing",
  "waiting_supplier",
  "quotation_preparation",
  "quotation_ready",
  "sent",
  "accepted",
  "revision_requested",
  "lost",
  "closed",
];

const STATUS_LABEL: Record<RfqStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  waiting_supplier: "Waiting for Supplier",
  quotation_preparation: "Preparing Quotation",
  quotation_ready: "Quotation Ready",
  sent: "Sent",
  accepted: "Accepted",
  revision_requested: "Revision Requested",
  lost: "Lost",
  closed: "Closed",
};

const STATUS_COLOR: Record<RfqStatus, string> = {
  new: "text-brass",
  reviewing: "text-text-1",
  waiting_supplier: "text-warn",
  quotation_preparation: "text-text-1",
  quotation_ready: "text-brass",
  sent: "text-text-0",
  accepted: "text-ok",
  revision_requested: "text-warn",
  lost: "text-safety",
  closed: "text-text-2",
};

const SOURCE_LABEL: Record<string, string> = {
  product_page: "Product Page",
  sourcing_request: "Sourcing Request",
  contact: "Contact Form",
  search_no_result: "Search (No Result)",
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

function StatusBadge({ status }: { status: RfqStatus }) {
  return <span className={`tag ${STATUS_COLOR[status]}`}>{STATUS_LABEL[status]}</span>;
}

const QUOTATION_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  under_review: "Under Review",
  approved: "Approved",
  sent: "Sent",
  accepted: "Accepted",
  revision_requested: "Revision Requested",
  rejected: "Rejected",
  expired: "Expired",
  cancelled: "Cancelled",
};

function timelineLabel(event: RfqTimelineEvent): string {
  if (event.type === "received") return "RFQ received";
  if (event.type === "status_change") {
    return `Status changed: ${STATUS_LABEL[event.entry.oldStatus]} → ${STATUS_LABEL[event.entry.newStatus]}`;
  }
  if (event.type === "quotation_event") {
    const q = event.event;
    if (q.eventType === "quotation_created") return `Quotation ${q.revisionLabel} created`;
    if (q.eventType === "revision_created") return `Quotation revision ${q.revisionLabel} created`;
    if (q.eventType === "status_changed") {
      const oldLabel = q.oldStatus ? (QUOTATION_STATUS_LABEL[q.oldStatus] ?? q.oldStatus) : "?";
      const newLabel = q.newStatus ? (QUOTATION_STATUS_LABEL[q.newStatus] ?? q.newStatus) : "?";
      return `Quotation ${q.revisionLabel} status changed: ${oldLabel} → ${newLabel}`;
    }
    if (q.eventType === "email_sent") return `Quotation ${q.revisionLabel} emailed to customer`;
    return `Quotation ${q.revisionLabel} updated`;
  }
  return "Internal note added";
}

function timelineActor(event: RfqTimelineEvent): string | null {
  if (event.type === "status_change") return event.entry.changedByEmail;
  if (event.type === "note_added") return event.note.authorEmail;
  if (event.type === "quotation_event") return event.event.actorEmail;
  return null;
}

export default async function AdminRfqDetailPage({ params }: PageProps) {
  await requireRole("admin");
  const { id } = await params;
  const rfq = await getRfqEnquiryById(id);
  if (!rfq) notFound();

  const [history, notes, existingQuotation, quotationEvents] = await Promise.all([
    listRfqStatusHistory(id),
    listRfqNotes(id),
    getCurrentQuotationForRfq(id),
    listQuotationActivityForRfq(id),
  ]);
  const timeline = buildRfqTimeline(rfq.createdAt, history, notes, quotationEvents);

  return (
    <div>
      <Link href="/admin/rfq" className="text-sm text-text-2 hover:text-brass">
        ← RFQ Enquiries
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">RFQ {rfq.id.slice(0, 8)}</div>
          <h1 className="mt-3.5 text-[28px]">{rfq.name}</h1>
          {rfq.company ? <p className="mt-1 text-text-1">{rfq.company}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={rfq.status} />
          {existingQuotation ? (
            <Link href={`/admin/quotations/${existingQuotation.id}`} className="btn btn-ghost btn-sm">
              Open Quotation
            </Link>
          ) : (
            <form action={createQuotationAction.bind(null, rfq.id)}>
              <button type="submit" className="btn btn-primary btn-sm">
                Create Quotation
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 min-[901px]:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <Field label="RFQ ID" value={<span className="font-mono text-[13px] text-text-1">{rfq.id}</span>} />
            <Field label="Email" value={<a href={`mailto:${rfq.email}`} className="hover:text-brass">{rfq.email}</a>} />
            <Field label="Phone" value={rfq.phone ?? "—"} />
            <Field label="WhatsApp" value={rfq.whatsapp ?? "—"} />
            <Field label="Country" value={rfq.country ?? "—"} />
            <Field label="Source" value={SOURCE_LABEL[rfq.source] ?? rfq.source} />
            <Field label="Brand" value={rfq.brand ?? "—"} />
            <Field label="Part Number" value={rfq.partNumber ?? "—"} />
            <Field
              label="Product"
              value={
                rfq.linkedProduct ? (
                  <Link href={`/admin/products/${rfq.linkedProduct.id}/edit`} className="hover:text-brass">
                    {rfq.linkedProduct.brandName} — {rfq.linkedProduct.oemPartNumber} — {rfq.linkedProduct.description}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
            <Field label="Quantity Required" value={rfq.quantityRequired ?? "—"} />
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
            <Field label="Last Updated" value={new Date(rfq.updatedAt).toLocaleString()} />
          </div>

          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Activity Timeline</h3>
            <ol className="mt-4 flex flex-col gap-4">
              {timeline.map((event, i) => {
                const actor = timelineActor(event);
                return (
                  <li key={i} className="border-l-2 border-line-strong pl-4 text-sm">
                    <div className="text-text-0">{timelineLabel(event)}</div>
                    <div className="mt-0.5 text-[12px] text-text-2">
                      {new Date(event.at).toLocaleString()}
                      {actor ? ` — ${actor}` : ""}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Status</h3>
            <form action={updateRfqStatusAction.bind(null, rfq.id)} className="mt-4 flex flex-col gap-3">
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

            <div className="mt-4 flex flex-col gap-4">
              {notes.map((note) => (
                <div key={note.id} className="rounded-s border border-line bg-bg-0 p-4">
                  <div className="text-[12px] text-text-2">
                    {note.authorEmail ?? "Legacy note (author unknown)"} · {new Date(note.createdAt).toLocaleString()}
                    {note.updatedAt !== note.createdAt ? " (edited)" : ""}
                  </div>
                  <form action={updateRfqNoteAction.bind(null, note.id, rfq.id)} className="mt-2 flex flex-col gap-2">
                    <textarea name="body" rows={3} defaultValue={note.body} className={inputClass} />
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-ghost btn-sm">
                        Save
                      </button>
                    </div>
                  </form>
                  <form action={deleteRfqNoteAction.bind(null, note.id, rfq.id)} className="mt-2">
                    <button type="submit" className="text-[12px] text-safety hover:underline">
                      Delete note
                    </button>
                  </form>
                </div>
              ))}
              {notes.length === 0 ? <p className="text-[13px] text-text-2">No notes yet.</p> : null}
            </div>

            <form action={addRfqNoteAction.bind(null, rfq.id)} className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
              <textarea name="body" rows={3} placeholder="Add a note…" className={inputClass} required />
              <button type="submit" className="btn btn-ghost btn-sm self-start">
                Add Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
