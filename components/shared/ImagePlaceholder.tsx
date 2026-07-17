// Real photography is pending for these slots (see image-asset-map.md) —
// a labeled placeholder box, never a stock/stand-in photo, per the design
// QA rule against pairing unrelated imagery with real content.
export function ImagePlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex aspect-[4/3] items-center justify-center rounded-m border border-dashed border-line-strong bg-bg-2 p-6 text-center font-mono text-[12px] text-text-2 ${className}`}
    >
      {label}
    </div>
  );
}
