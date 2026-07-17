interface SpecRow {
  label: string;
  value: string;
}

export function SpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <div className="mt-6 border-t border-line">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[140px_1fr] gap-4 border-b border-line py-3.5 text-sm min-[601px]:grid-cols-[180px_1fr]"
        >
          <div className="font-mono text-[11.5px] uppercase tracking-[.06em] text-text-2">{row.label}</div>
          <div className="text-text-0">{row.value}</div>
        </div>
      ))}
    </div>
  );
}
