export interface Step {
  number: string;
  title: string;
  description: string;
}

export function StepList({ steps }: { steps: Step[] }) {
  return (
    <div className="grid grid-cols-1 gap-px bg-line min-[701px]:grid-cols-2 min-[1181px]:grid-cols-4">
      {steps.map((s) => (
        <div key={s.number} className="bg-bg-0 p-7">
          <div className="font-mono text-[22px] font-semibold text-brass">{s.number}</div>
          <h3 className="mt-3">{s.title}</h3>
          <p className="mt-2.5 text-sm">{s.description}</p>
        </div>
      ))}
    </div>
  );
}
