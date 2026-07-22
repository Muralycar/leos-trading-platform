import Image from "next/image";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden border-b border-line">
      <Image
        src="/images/marketing/hero-industrial.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(160deg,theme(colors.bg.2)_0%,theme(colors.bg.0)_70%)] opacity-80 mix-blend-multiply" />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(11,12,14,.55)_0%,rgba(11,12,14,.8)_55%,#0b0c0e_100%)]" />
      <div className="wrap relative z-[2] w-full pb-16">
        <div className="eyebrow text-brass-glow">UAE · GLOBAL INDUSTRIAL SUPPLY</div>
        <h1 className="mt-4 max-w-[15ch]">
          PARTS &amp; EQUIPMENT.
          <br />
          SOURCED FROM THE UAE.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[19px] text-text-0 opacity-85">
          Genuine and aftermarket supply for trucks, construction equipment, generators, mining, marine and industrial applications.
        </p>
        <form action="/search" method="get" className="mt-10 flex max-w-[760px] gap-2 rounded-m border border-line-strong bg-bg-2 p-2 shadow-[0_20px_60px_rgba(0,0,0,.4)] max-[900px]:flex-col">
          <input
            type="text"
            name="q"
            placeholder="Search part number, description, or brand — e.g. GM123551"
            className="flex-1 bg-transparent px-4 py-3.5 font-mono text-base text-text-0 placeholder:font-sans placeholder:text-text-2 focus:outline-none"
          />
          <button type="submit" className="btn btn-primary flex-shrink-0">
            Search Available Stock
          </button>
        </form>
        <div className="mt-5 flex gap-4">
          <a href="/search" className="btn btn-ghost">Search Available Stock</a>
          <a href="/sourcing#request" className="btn btn-ghost">Request a Part</a>
        </div>
      </div>
    </section>
  );
}
