import Image from "next/image";
import Link from "next/link";
import { PhoneIcon, WhatsAppIcon, ChevronDownIcon } from "@/components/ui/Icons";
import { MobileNav } from "@/components/header/MobileNav";
import { buildInventoryLinks, buildMobileLinks, buildProductLinks, SOURCING_LINKS, TOP_LEVEL_LINKS } from "@/lib/nav";
import { getBrands, getEquipmentCategories, getSiteSettings } from "@/lib/data/inventory";
import { waLink } from "@/lib/whatsapp";

export async function Header() {
  const [brands, categories, settings] = await Promise.all([getBrands(), getEquipmentCategories(), getSiteSettings()]);

  const productLinks = buildProductLinks(categories);
  const inventoryLinks = buildInventoryLinks(brands);
  const mobileLinks = buildMobileLinks(categories);
  const dropdowns = [
    { label: "Products", links: productLinks },
    { label: "Inventory", links: inventoryLinks },
  ];

  const phoneHref = `tel:${settings.phonePrimary.replace(/\s+/g, "")}`;
  const waHref = waLink(settings);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg-0/[.88] backdrop-blur-[10px]">
      <div className="mx-auto flex h-16 max-w-container items-center gap-4 px-5 min-[1181px]:h-[76px] min-[1181px]:gap-9 min-[1181px]:px-8">
        <Link href="/" className="flex flex-shrink-0 items-center gap-3">
          <Image src="/logo.png" alt="Leos Trading crest" width={44} height={44} className="h-9 w-9 min-[1181px]:h-11 min-[1181px]:w-11" priority />
        </Link>

        <nav className="hidden flex-1 items-center gap-7 min-[1181px]:flex">
          <Link href="/" className="py-7 text-[13px] font-semibold tracking-[.03em] text-brass">
            Home
          </Link>
          {dropdowns.map((group) => (
            <div key={group.label} className="group relative">
              <span className="flex cursor-pointer items-center gap-1.5 py-7 text-[13px] font-semibold tracking-[.03em] text-text-1 group-hover:text-text-0">
                {group.label}
                <ChevronDownIcon className="h-[11px] w-[11px] opacity-60" />
              </span>
              <div className="absolute left-[-16px] top-full hidden min-w-[230px] flex-col gap-0.5 rounded-m border border-line-strong bg-bg-2 p-2.5 shadow-[0_20px_40px_rgba(0,0,0,.5)] group-hover:flex">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-s px-3 py-2.5 text-[13.5px] font-medium text-text-1 hover:bg-bg-3 hover:text-text-0"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link href="/brands" className="py-7 text-[13px] font-semibold tracking-[.03em] text-text-1 hover:text-text-0">
            Brands
          </Link>
          <div className="group relative">
            <span className="flex cursor-pointer items-center gap-1.5 py-7 text-[13px] font-semibold tracking-[.03em] text-text-1 group-hover:text-text-0">
              Sourcing
              <ChevronDownIcon className="h-[11px] w-[11px] opacity-60" />
            </span>
            <div className="absolute left-[-16px] top-full hidden min-w-[230px] flex-col gap-0.5 rounded-m border border-line-strong bg-bg-2 p-2.5 shadow-[0_20px_40px_rgba(0,0,0,.5)] group-hover:flex">
              {SOURCING_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-s px-3 py-2.5 text-[13.5px] font-medium text-text-1 hover:bg-bg-3 hover:text-text-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          {TOP_LEVEL_LINKS.filter((l) => l.label !== "Brands").map((link) => (
            <Link key={link.href} href={link.href} className="py-7 text-[13px] font-semibold tracking-[.03em] text-text-1 hover:text-text-0">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-3">
          <a
            href={phoneHref}
            aria-label="Call"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-s border border-line-strong text-text-1 transition-colors hover:border-brass hover:text-brass"
          >
            <PhoneIcon className="h-5 w-5" />
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-s bg-[#25D366] text-white transition-colors hover:bg-[#20bd5a]"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <Link href="/contact" className="btn btn-primary hidden h-[46px] min-[1181px]:inline-flex">
            Request Quotation
          </Link>
        </div>

        <MobileNav links={mobileLinks} />
      </div>
    </header>
  );
}
