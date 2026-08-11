import type { ReactNode } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { waLink } from "@/lib/whatsapp";
import { getSiteSettings } from "@/lib/data/inventory";

interface CtaBannerProps {
  heading?: ReactNode;
  primaryHref?: string;
  primaryLabel?: string;
  waMessage?: string;
  variant?: "default" | "dark-accent";
}

export async function CtaBanner({
  heading = (
    <>
      Can&apos;t find your part number?
      <br />
      Send it to us.
    </>
  ),
  primaryHref = "/sourcing#request",
  primaryLabel = "Request a Part",
  waMessage,
  variant = "default",
}: CtaBannerProps) {
  const settings = await getSiteSettings();

  if (variant === "dark-accent") {
    return (
      <section className="border-t border-line bg-bg-0">
        <div className="wrap flex flex-col items-start justify-between gap-6 py-14 min-[901px]:flex-row min-[901px]:items-center">
          <h2 className="max-w-[18ch] text-white">{heading}</h2>
          <div className="flex flex-shrink-0 gap-3.5">
            <a
              href={waLink(settings, waMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[7px] bg-[#1e2b22] px-6 py-3 text-[13px] font-semibold text-[#7fe0a0] transition-colors hover:bg-[#25392c]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp Us
            </a>
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-[7px] bg-yellow px-6 py-3 text-[13px] font-semibold uppercase tracking-[.02em] text-black transition-colors hover:bg-yellow-glow"
            >
              {primaryLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-line bg-bg-1">
      <div className="wrap flex flex-col items-start justify-between gap-6 py-16 min-[901px]:flex-row min-[901px]:items-center">
        <h2 className="max-w-[16ch]">{heading}</h2>
        <div className="flex flex-shrink-0 gap-3.5">
          <a href={waLink(settings, waMessage)} target="_blank" rel="noreferrer" className="btn btn-wa">
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp Us
          </a>
          <Link href={primaryHref} className="btn btn-primary">
            {primaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
