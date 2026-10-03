import { MACHINE_CATEGORIES, MACHINE_STATUS_LABEL, type Machine } from "@/lib/machinery";
import type { MachineStatus } from "@/lib/supabase/types";

const labelClass = "font-mono text-[11px] uppercase tracking-[.06em] text-text-2";
const inputClass =
  "w-full rounded-s border border-line-strong bg-bg-1 px-3.5 py-3 text-[14px] text-text-0 placeholder:text-text-2 focus:border-brass focus:outline-none";

const STATUSES: MachineStatus[] = ["available", "sourcing", "reserved", "sold"];

function specsToText(specs: Record<string, string>): string {
  return Object.entries(specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  machine?: Machine;
  submitLabel: string;
}

export function MachineForm({ action, machine, submitLabel }: Props) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Title</span>
        <input
          name="title"
          type="text"
          required
          defaultValue={machine?.title ?? ""}
          placeholder="e.g. Komatsu D475A-8 Crawler Dozer"
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Category</span>
          <select name="category" defaultValue={machine?.category ?? "excavator"} className={inputClass}>
            {MACHINE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Brand</span>
          <input name="brand" type="text" required defaultValue={machine?.brand ?? ""} placeholder="e.g. Komatsu" className={inputClass} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Model</span>
          <input name="model" type="text" defaultValue={machine?.model ?? ""} placeholder="e.g. D475A-8" className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Condition</span>
          <select name="condition" defaultValue={machine?.condition ?? ""} className={inputClass}>
            <option value="">Not specified</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Year</span>
          <input name="year" type="number" min="1950" max="2100" defaultValue={machine?.year ?? ""} className={inputClass} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Hours (machines) / KM (trucks)</span>
          <input name="hours_or_km" type="number" min="0" defaultValue={machine?.hoursOrKm ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Capacity</span>
          <input name="capacity" type="text" defaultValue={machine?.capacity ?? ""} placeholder="e.g. 3 ton, 50 ton crane" className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Location</span>
          <input name="location" type="text" defaultValue={machine?.location ?? ""} placeholder="e.g. Sharjah, UAE" className={inputClass} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Price (AED) — leave empty for “Price on request”</span>
          <input name="price_aed" type="number" min="0" step="any" defaultValue={machine?.priceAed ?? ""} className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Availability</span>
          <select name="status" defaultValue={machine?.status ?? "available"} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {MACHINE_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Description</span>
        <textarea name="description" rows={5} defaultValue={machine?.description ?? ""} className={inputClass} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Extra specs — one per line as “Label: value”</span>
        <textarea
          name="specs"
          rows={5}
          defaultValue={machine ? specsToText(machine.specs) : ""}
          placeholder={"Engine: Komatsu SAA12V140E-3\nOperating weight: 112,000 kg\nSerial number: 12345"}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>URL slug (auto-generated from the title if empty)</span>
        <input name="slug" type="text" defaultValue={machine?.slug ?? ""} className={inputClass} />
      </label>

      <label className="flex items-center gap-3 text-sm text-text-0">
        <input name="is_published" type="checkbox" defaultChecked={machine?.isPublished ?? false} className="accent-brass" />
        Published (visible on the public website)
      </label>

      <button type="submit" className="btn btn-primary w-fit">
        {submitLabel}
      </button>
    </form>
  );
}
