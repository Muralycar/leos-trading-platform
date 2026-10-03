import Link from "next/link";

const BRANDS = ["Komatsu", "Caterpillar", "Tadano", "Volvo", "Iveco", "Renault", "Toyota", "Linde"];

export function MachineryBanner() {
  return (
    <section className="border-t border-line bg-bg-1 py-16">
      <div className="wrap grid grid-cols-1 gap-10 min-[901px]:grid-cols-[1fr_1.2fr] min-[901px]:items-center min-[901px]:gap-16">
        <div>
          <div className="eyebrow">Machinery &amp; Vehicles</div>
          <h2 className="mt-3.5">New &amp; used machines, trucks and forklifts</h2>
          <p className="mt-4 max-w-[48ch] text-[15px]">
            Beyond parts, we source and supply construction machinery, heavy trucks and forklifts — in stock or found to your
            specification, with export from the UAE.
          </p>
          <Link href="/machinery" className="btn btn-primary mt-6 inline-flex">
            Browse Machinery
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-px bg-line min-[601px]:grid-cols-4">
          {BRANDS.map((b) => (
            <li key={b} className="bg-bg-0 px-4 py-7 text-center font-display text-[18px] font-bold uppercase tracking-[.06em] text-text-0">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
