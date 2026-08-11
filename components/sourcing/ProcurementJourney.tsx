export interface JourneyStep {
  number: string;
  title: string;
  description: string;
}

/**
 * A connected process/timeline rather than StepList's plain 4-box grid —
 * five steps read better as a continuous flow (RFQ -> export) than as
 * disconnected cards. CSS-only connector line, no SVG/JS.
 */
export function ProcurementJourney({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-[linear-gradient(to_right,transparent,rgba(196,162,106,.35)_8%,rgba(196,162,106,.35)_92%,transparent)] min-[901px]:block" />
      <div className="grid grid-cols-1 gap-10 min-[641px]:grid-cols-2 min-[901px]:grid-cols-5 min-[901px]:gap-6">
        {steps.map((s) => (
          <div key={s.number} className="relative flex flex-col items-start">
            <div className="relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(196,162,106,.4)] bg-bg-0 font-mono text-[16px] font-semibold text-brass shadow-[0_0_20px_rgba(196,162,106,.14)]">
              {s.number}
            </div>
            <h3 className="mt-4 text-[16px]">{s.title}</h3>
            <p className="mt-2 text-sm text-text-1">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
