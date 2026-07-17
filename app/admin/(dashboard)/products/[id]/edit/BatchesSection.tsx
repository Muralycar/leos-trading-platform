import type { AdminBatch } from "@/lib/admin/batches";
import { createBatch, setBatchCurrent, updateBatch } from "./batch-actions";

const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3 py-2 text-[13px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

function BatchRow({ batch, productId }: { batch: AdminBatch; productId: string }) {
  return (
    <div className={`rounded-s border border-line p-4 ${batch.isCurrent ? "" : "opacity-50"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[13px] text-text-0">{batch.quantity} units</span>
        <div className="flex items-center gap-2">
          <span className="tag">{batch.isCurrent ? "Current" : "Superseded"}</span>
          <span className="tag">{batch.isManual ? "Manual" : "Import"}</span>
        </div>
      </div>
      <div className="mt-1.5 text-[12.5px] text-text-2">
        {batch.condition ?? "—"} · {batch.binLocation ?? "no bin"} · {batch.arrivalDate ?? "no arrival date"}
      </div>

      {batch.isManual ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
          <form action={updateBatch.bind(null, batch.id, productId)} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase text-text-2">Quantity</span>
              <input name="quantity" type="number" min="0" step="1" defaultValue={batch.quantity} className={`w-24 ${inputClass}`} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase text-text-2">Condition</span>
              <input name="condition" type="text" defaultValue={batch.condition ?? ""} className={`w-32 ${inputClass}`} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase text-text-2">Bin</span>
              <input name="bin_location" type="text" defaultValue={batch.binLocation ?? ""} className={`w-24 ${inputClass}`} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase text-text-2">Arrival</span>
              <input name="arrival_date" type="date" defaultValue={batch.arrivalDate ?? ""} className={inputClass} />
            </label>
            <button type="submit" className="btn btn-ghost btn-sm">
              Save
            </button>
          </form>
          <form action={setBatchCurrent.bind(null, batch.id, productId, !batch.isCurrent)}>
            <button type="submit" className="btn btn-ghost btn-sm">
              {batch.isCurrent ? "Deactivate" : "Reactivate"}
            </button>
          </form>
        </div>
      ) : (
        <p className="mt-3 border-t border-line pt-3 text-[12.5px] text-text-2">
          Created by an import — never hand-edited here, to keep the import&apos;s audit trail trustworthy. Correct it with
          an offsetting manual batch, or a new import.
        </p>
      )}
    </div>
  );
}

export function BatchesSection({ productId, batches }: { productId: string; batches: AdminBatch[] }) {
  return (
    <div className="rounded-m border border-line bg-bg-1 p-6">
      <h3 className="text-[16px]">Inventory Batches</h3>
      <p className="mt-1 text-[13px] text-text-2">
        Products and batches stay separate records — this is the sum of {"is_current"} batches, never a field on the
        product itself.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {batches.map((b) => (
          <BatchRow key={b.id} batch={b} productId={productId} />
        ))}
        {batches.length === 0 ? <p className="text-sm text-text-2">No batches yet.</p> : null}
      </div>

      <form action={createBatch.bind(null, productId)} className="mt-5 flex flex-wrap items-end gap-2 border-t border-line pt-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] uppercase text-text-2">Quantity</span>
          <input name="quantity" type="number" min="0" step="1" required className={`w-24 ${inputClass}`} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] uppercase text-text-2">Condition</span>
          <input name="condition" type="text" className={`w-32 ${inputClass}`} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] uppercase text-text-2">Bin</span>
          <input name="bin_location" type="text" className={`w-24 ${inputClass}`} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] uppercase text-text-2">Arrival</span>
          <input name="arrival_date" type="date" className={inputClass} />
        </label>
        <button type="submit" className="btn btn-primary btn-sm">
          Add Batch
        </button>
      </form>
    </div>
  );
}
