"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendQuotationEmailAction } from "./send-actions";

interface Props {
  quotationId: string;
  quotationNumber: string;
  revisionLabel: string;
  customerEmail: string;
  currency: string | null;
  grandTotal: number;
  validUntil: string | null;
  status: string;
}

const SENDABLE_STATUSES = new Set(["approved", "sent"]);

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function SendQuotationButton({
  quotationId,
  quotationNumber,
  revisionLabel,
  customerEmail,
  currency,
  grandTotal,
  validUntil,
  status,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!SENDABLE_STATUSES.has(status)) return null;

  const subject = `Quotation ${quotationNumber} from Leos Trading FZE`;
  const label = status === "sent" ? "Resend to Customer" : "Send to Customer";

  async function handleConfirm() {
    setBusy(true);
    setMessage(null);
    const result = await sendQuotationEmailAction(quotationId);
    setBusy(false);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setMessage(result.error ?? "Something went wrong.");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary btn-sm w-full">
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[440px] rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px] text-text-0">{label}?</h3>
            <p className="mt-1 text-[13px] text-text-2">Review before sending — this cannot be undone.</p>

            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-2">Recipient</dt>
                <dd className="text-right text-text-0">{customerEmail}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-2">Quotation</dt>
                <dd className="text-right text-text-0">{revisionLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-2">Subject</dt>
                <dd className="text-right text-text-0">{subject}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-2">Grand Total</dt>
                <dd className="text-right text-text-0">
                  {currency ? `${currency} ` : ""}
                  {fmt(grandTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-2">Valid Until</dt>
                <dd className="text-right text-text-0">{validUntil ?? "—"}</dd>
              </div>
            </dl>

            {message ? <p className="mt-4 text-[13px] text-safety">{message}</p> : null}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} disabled={busy} className="btn btn-ghost btn-sm">
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} disabled={busy} className="btn btn-primary btn-sm">
                {busy ? "Sending…" : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
