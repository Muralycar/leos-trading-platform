import { BRANDS } from "@/lib/placeholder-data";

export function BrandStrip() {
  return (
    <div className="overflow-hidden border-y border-line py-9">
      <div className="wrap flex flex-wrap justify-center gap-12">
        {BRANDS.map((b) => (
          <span key={b.slug} className="font-display text-xl font-semibold uppercase tracking-[.05em] text-text-2">
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}
