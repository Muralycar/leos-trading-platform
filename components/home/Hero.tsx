import Image from "next/image";
import { WorldMap } from "@/components/home/WorldMap";

export function Hero() {
  return (
    <section className="relative flex items-center overflow-hidden border-b border-line min-[901px]:min-h-[660px] min-[1181px]:min-h-[700px]">
      <Image
        src="/images/marketing/hero-industrial-new.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[38%_50%] brightness-[0.68] contrast-[1.05] saturate-[0.9] min-[901px]:object-[62%_50%]"
      />
      {/* dark wash across the full width — both columns sit on the same solid ground */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(100deg,rgba(6,7,8,.95)_0%,rgba(6,7,8,.9)_35%,rgba(6,7,8,.84)_65%,rgba(6,7,8,.8)_100%)]" />
      {/* subtle vignette */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_80%_at_50%_38%,transparent_58%,rgba(0,0,0,.4)_100%)]" />
      {/* fade into page background at the bottom edge */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,transparent_62%,rgba(11,12,14,.95)_100%)]" />

      <div className="relative z-[2] mx-auto w-full max-w-[1400px] px-5 py-6 min-[640px]:px-6 min-[640px]:py-8 min-[901px]:px-8 min-[901px]:py-14 min-[1181px]:px-10">
        <div className="grid grid-cols-1 items-center gap-4 min-[640px]:gap-7 min-[901px]:grid-cols-[1fr_1fr] min-[901px]:gap-10">
          {/* LEFT — existing hero content, unchanged */}
          <div>
            <div className="relative">
              <div className="absolute -inset-x-4 -inset-y-3 -z-10 rounded-xl bg-black/15 backdrop-blur-[6px]" />
              <div className="eyebrow text-brass-glow">UAE · GLOBAL INDUSTRIAL SUPPLY</div>
              <h1 className="mt-2.5 max-w-[650px] text-[32px] leading-[1.12] [text-shadow:0_1px_3px_rgba(0,0,0,.8),0_4px_20px_rgba(0,0,0,.6)] min-[640px]:mt-4 min-[640px]:text-[46px] min-[901px]:text-[52px] min-[1181px]:text-[64px]">
                PARTS &amp; EQUIPMENT.
                <br />
                SOURCED FROM THE UAE.
              </h1>
              <p className="mt-2 max-w-[52ch] text-[15px] leading-snug text-text-0 opacity-95 min-[640px]:mt-4 min-[640px]:text-[17px] min-[640px]:leading-normal min-[901px]:text-[19px]">
                Genuine OEM and quality aftermarket parts for trucks, construction equipment, generators, mining, marine and industrial applications.
              </p>
            </div>

            <form
              action="/search"
              method="get"
              className="mt-3 flex w-full max-w-[640px] flex-col gap-2 rounded-[14px] border border-[rgba(196,162,106,.28)] bg-[#17191d]/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.05)] transition-shadow duration-200 focus-within:border-[rgba(196,162,106,.55)] focus-within:shadow-[0_20px_50px_rgba(0,0,0,.6),inset_0_1px_0_rgba(255,255,255,.06),0_0_0_3px_rgba(196,162,106,.15)] min-[640px]:mt-6 min-[640px]:flex-row min-[640px]:items-center min-[640px]:p-2"
            >
              <input
                type="text"
                name="q"
                placeholder="Search part number, description or brand..."
                className="flex-1 bg-transparent px-4 py-2.5 font-mono text-base text-text-0 placeholder:font-sans placeholder:text-text-2 focus:outline-none min-[640px]:py-3.5"
              />
              <button type="submit" className="btn btn-primary w-full flex-shrink-0 justify-center min-[640px]:w-auto">
                Search Stock
              </button>
            </form>

            <div className="mt-2.5 flex flex-wrap gap-4 min-[640px]:mt-4">
              <a href="/sourcing#request" className="btn btn-ghost">
                Request a Part
              </a>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2 min-[640px]:mt-5">
              <span>Genuine OEM Parts</span>
              <span className="hidden h-3 w-px bg-line-strong min-[541px]:block" />
              <span>Global Sourcing</span>
              <span className="hidden h-3 w-px bg-line-strong min-[541px]:block" />
              <span>Worldwide Export</span>
            </div>
          </div>

          {/* RIGHT — global supply map, integrated into the hero backdrop (no visible box) */}
          <div className="relative mx-auto w-full max-w-[300px] min-[640px]:max-w-[420px] min-[901px]:max-w-none">
            {/* soft radial darkening so the map reads clearly against the photo, no hard-edged panel */}
            <div className="pointer-events-none absolute -inset-x-6 -inset-y-8 -z-10 bg-[radial-gradient(ellipse_62%_62%_at_50%_46%,rgba(6,7,8,.62)_0%,rgba(6,7,8,.32)_55%,transparent_78%)] min-[901px]:-inset-x-10 min-[901px]:-inset-y-10" />
            <div className="mb-1.5 text-center font-mono text-[10.5px] uppercase tracking-[.14em] text-brass-glow min-[640px]:mb-2.5 min-[901px]:text-left min-[901px]:text-[11px]">
              UAE Sourcing Hub · Worldwide Delivery
            </div>
            <div className="hidden min-[901px]:block">
              <WorldMap />
            </div>
            <div className="min-[901px]:hidden">
              <WorldMap compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
