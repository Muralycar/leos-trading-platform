import Image from "next/image";
import Link from "next/link";
import type { Machine } from "@/lib/machinery";
import { MACHINE_CONDITION_LABEL, categoryLabel, formatPriceAed, formatUsage } from "@/lib/machinery";
import { MachineStatusTag } from "@/components/machinery/MachineStatusTag";

export function MachineCard({ machine }: { machine: Machine }) {
  const usage = formatUsage(machine);
  const facts = [
    machine.condition ? MACHINE_CONDITION_LABEL[machine.condition] : null,
    machine.year ? String(machine.year) : null,
    usage,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/machinery/${machine.slug}`}
      className="group flex flex-col overflow-hidden rounded-m border border-line bg-bg-1 transition-colors hover:border-yellow"
    >
      <div className="relative aspect-[4/3] bg-bg-2">
        {machine.imageUrls[0] ? (
          <Image
            src={machine.imageUrls[0]}
            alt={machine.title}
            fill
            sizes="(min-width: 1181px) 33vw, (min-width: 701px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          // No photo (e.g. sourcing listings): a brand card, never a stand-in photo.
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="font-display text-[28px] font-bold uppercase tracking-[.06em] text-text-0">{machine.brand}</span>
            <span className="font-mono text-[11px] uppercase tracking-[.08em] text-text-2">{categoryLabel(machine.category)}</span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <MachineStatusTag status={machine.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="font-mono text-[11px] uppercase tracking-[.06em] text-text-2">
          {machine.brand} · {categoryLabel(machine.category)}
        </div>
        <h3 className="text-[18px] leading-snug text-text-0 group-hover:text-yellow">{machine.title}</h3>
        {facts.length > 0 ? <div className="text-[13px] text-text-1">{facts.join(" · ")}</div> : null}
        <div className="mt-auto pt-3 text-[14px] font-semibold text-brass">{formatPriceAed(machine.priceAed)}</div>
      </div>
    </Link>
  );
}
