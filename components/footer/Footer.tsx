import Image from "next/image";
import Link from "next/link";
import { getEquipmentCategories, getSiteSettings } from "@/lib/data/inventory";

export async function Footer() {
  const [categories, settings] = await Promise.all([getEquipmentCategories(), getSiteSettings()]);
  const liveCategories = categories.filter((c) => c.status === "live");

  return (
    <footer className="border-t border-line bg-bg-1 pt-16">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-8 px-5 pb-12 min-[1181px]:grid-cols-[1.4fr_1fr_1fr_1.2fr] min-[1181px]:gap-12 min-[1181px]:px-8">
        <div>
          <div className="mb-3.5 flex items-center gap-2.5">
            <Image src="/logo.png" alt="Leos Trading crest" width={40} height={40} className="h-8 w-8" />
            <span className="font-display text-base font-bold tracking-[.08em]">LEOS TRADING</span>
          </div>
          <p className="max-w-[34ch] text-sm">
            UAE-based global supplier of OEM parts, industrial equipment and sourcing solutions. Sales · Service · Rental.
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[.1em] text-text-2">Products</h4>
          {liveCategories.map((c) => (
            <Link key={c.slug} href={`/search?cat=${encodeURIComponent(c.slug)}`} className="mb-2.5 block text-sm text-text-1 hover:text-brass">
              {c.name}
            </Link>
          ))}
        </div>
        <div>
          <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[.1em] text-text-2">Company</h4>
          <Link href="/about" className="mb-2.5 block text-sm text-text-1 hover:text-brass">About</Link>
          <Link href="/sourcing" className="mb-2.5 block text-sm text-text-1 hover:text-brass">Sourcing</Link>
          <Link href="/export" className="mb-2.5 block text-sm text-text-1 hover:text-brass">Export</Link>
          <Link href="/brands" className="mb-2.5 block text-sm text-text-1 hover:text-brass">Brands</Link>
        </div>
        <div>
          <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[.1em] text-text-2">Contact</h4>
          <div className="mb-2.5 text-sm text-text-1">{settings.address}</div>
          <div className="mb-2.5 text-sm text-text-1">{settings.phonePrimary}</div>
          <div className="mb-2.5 text-sm text-text-1">{settings.phoneSecondary}</div>
          <div className="mb-2.5 text-sm text-text-1">{settings.email}</div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-container flex-col gap-2 px-5 py-5 text-xs text-text-2 min-[601px]:flex-row min-[601px]:items-center min-[601px]:justify-between min-[1181px]:px-8">
          <span>© {new Date().getFullYear()} Leos Trading FZE. All rights reserved.</span>
          <span className="font-mono tracking-[.04em]">SALES · SERVICE · RENTAL</span>
        </div>
      </div>
    </footer>
  );
}
