import Image from "next/image";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden border-b border-line">
      <Image
        src="/images/marketing/hero-industrial-new.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[35%_50%] min-[901px]:object-[45%_50%]"
      />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,.75)_0%,rgba(0,0,0,.15)_100%)]" />
      <div className="wrap relative z-[2] w-full pb-16">
        <div className="relative">
          <div className="absolute -inset-x-4 -inset-y-3 -z-10 rounded-xl bg-black/20 backdrop-blur-[7px]" />
          <div className="eyebrow text-brass-glow">UAE · GLOBAL INDUSTRIAL SUPPLY</div>
          <h1 className="mt-4 max-w-[15ch] leading-[1.15] [text-shadow:0_1px_3px_rgba(0,0,0,.8),0_4px_20px_rgba(0,0,0,.6)]">
            PARTS &amp; EQUIPMENT.
            <br />
            SOURCED FROM THE UAE.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[19px] text-text-0 opacity-95">
            Genuine and aftermarket supply for trucks, construction equipment, generators, mining, marine and industrial applications.
          </p>
        </div>
        <form
          action="/search"
          method="get"
          className="mt-10 flex max-w-[760px] gap-2 rounded-m border border-line-strong bg-bg-2 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_20px_60px_rgba(0,0,0,.4)] transition-shadow duration-200 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_24px_70px_rgba(0,0,0,.5),0_0_0_3px_rgba(212,175,90,.15)] max-[900px]:flex-col"
        >
          <input
            type="text"
            name="q"
            placeholder="Search part number, description, or brand — e.g. GM123551"
            className="flex-1 bg-transparent px-4 py-3.5 font-mono text-base text-text-0 placeholder:font-sans placeholder:text-text-2 focus:outline-none"
          />
          <button type="submit" className="btn btn-primary flex-shrink-0 transition-transform duration-150 hover:-translate-y-0.5">
            Search Available Stock
          </button>
        </form>
        <div className="mt-5 flex gap-4">
          <a href="/search" className="btn btn-ghost transition-transform duration-150 hover:-translate-y-0.5">Search Available Stock</a>
          <a href="/sourcing#request" className="btn btn-ghost transition-transform duration-150 hover:-translate-y-0.5">Request a Part</a>
        </div>
      </div>
    </section>
  );
}
