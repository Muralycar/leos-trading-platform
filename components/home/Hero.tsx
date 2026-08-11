import Image from "next/image";

const FEATURES = [
  {
    label: "Genuine OEM Parts",
    path: "M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z M8.5 12 11 14.5 15.5 10",
  },
  {
    label: "Global Sourcing Network",
    path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z",
  },
  {
    label: "Worldwide Export",
    path: "M3 7h18v13H3z M3 11h18M8 7V4h8v3",
  },
  {
    label: "Fast RFQ Turnaround",
    path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3.5 2",
  },
];

export function Hero() {
  return (
    <section className="relative flex items-center overflow-hidden border-b border-line min-[901px]:min-h-[600px]">
      <Image
        src="/images/Hero/hero-industrial-yellow.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_46%] brightness-[0.82] contrast-[1.08] saturate-[1.0] min-[901px]:object-[60%_48%]"
      />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(100deg,rgba(6,7,8,.92)_0%,rgba(6,7,8,.8)_35%,rgba(6,7,8,.5)_65%,rgba(6,7,8,.25)_100%)]" />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,transparent_62%,rgba(11,12,14,.95)_100%)]" />

      <div className="relative z-[2] mx-auto w-full max-w-[1400px] px-5 py-10 min-[640px]:px-6 min-[640px]:py-14 min-[901px]:px-8 min-[901px]:py-20 min-[1181px]:px-10">
        <div className="max-w-[720px]">
          <div className="font-mono text-[12px] uppercase tracking-[.14em] text-yellow">UAE · Global Industrial Supply</div>
          <h1 className="mt-3 text-[32px] leading-[1.1] min-[640px]:text-[48px] min-[901px]:text-[58px] min-[1181px]:text-[68px]">
            <span className="text-white">Parts &amp; Equipment.</span>
            <br />
            <span className="text-yellow">Sourced From The UAE.</span>
          </h1>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-snug text-white/90 min-[640px]:text-[17px] min-[640px]:leading-normal min-[901px]:text-[19px]">
            Genuine OEM and quality aftermarket parts for trucks, construction equipment, generators, mining, marine and industrial applications.
          </p>

          <form
            action="/search"
            method="get"
            className="mt-6 flex w-full max-w-[640px] flex-col gap-2 rounded-[10px] border border-white/10 bg-black/60 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,.55)] backdrop-blur-sm transition-shadow duration-200 focus-within:border-yellow/60 min-[640px]:flex-row min-[640px]:items-center min-[640px]:p-2"
          >
            <input
              type="text"
              name="q"
              placeholder="Search by part number, product or brand..."
              className="flex-1 bg-transparent px-4 py-2.5 text-base text-white placeholder:text-white/50 focus:outline-none min-[640px]:py-3.5"
            />
            <button
              type="submit"
              className="flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-[7px] bg-yellow px-6 py-3 text-[13px] font-semibold uppercase tracking-[.04em] text-black transition-colors hover:bg-yellow-glow min-[640px]:w-auto"
            >
              Search Stock
            </button>
          </form>

          <div className="mt-3.5 flex flex-wrap gap-4">
            <a
              href="/sourcing#request"
              className="inline-flex items-center gap-2 rounded-[7px] border border-white/25 px-6 py-3 text-[13px] font-semibold uppercase tracking-[.04em] text-white transition-colors hover:border-yellow hover:text-yellow"
            >
              Request a Part
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 min-[640px]:mt-10 min-[640px]:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5 flex-shrink-0 text-yellow">
                  <path d={f.path} />
                </svg>
                <span className="text-[12.5px] font-medium leading-tight text-white/85">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
