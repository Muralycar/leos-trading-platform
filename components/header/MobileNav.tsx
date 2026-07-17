"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/ui/Icons";
import { MOBILE_LINKS } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className="hidden h-[38px] w-[38px] items-center justify-center rounded-s border border-line-strong text-text-0 max-[1180px]:flex"
      >
        <MenuIcon className="h-[18px] w-[18px]" />
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-bg-0 px-6 pb-6 pt-[88px]">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="absolute right-5 top-5 flex h-[38px] w-[38px] items-center justify-center rounded-s border border-line-strong text-text-0"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
              {MOBILE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-line py-4 text-[17px] font-semibold text-text-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
