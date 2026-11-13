"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/ui/Icons";
import type { NavGroup } from "@/lib/nav";

export function MobileNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // While open: stop the page behind from scrolling, and let Escape close the menu.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="hidden h-11 w-11 items-center justify-center rounded-s border border-line-strong text-text-0 max-[1180px]:flex"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {mounted && open
        ? createPortal(
            <div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-bg-0 px-6 pb-10 pt-[max(16px,env(safe-area-inset-top,0px))]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[.14em] text-text-2">Menu</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={close}
                  className="flex h-11 w-11 items-center justify-center rounded-s border border-line-strong text-text-0"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <form action="/search" method="get" role="search" onSubmit={close} className="mt-4 flex gap-2">
                <input
                  type="search"
                  name="q"
                  aria-label="Search parts"
                  placeholder="Part number, product or brand"
                  className="h-12 min-w-0 flex-1 rounded-s border border-line-strong bg-bg-1 px-4 text-base text-text-0 placeholder:text-text-2 focus:border-yellow focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-12 flex-shrink-0 rounded-s border border-line-strong px-4 text-[13px] font-semibold text-text-0"
                >
                  Search
                </button>
              </form>

              <Link
                href="/contact"
                onClick={close}
                className="mt-3 flex h-12 items-center justify-center rounded-s bg-yellow text-[14px] font-semibold text-black"
              >
                Request Quotation
              </Link>

              {groups.map((group) => (
                <nav key={group.title} aria-label={group.title} className="mt-8">
                  <div className="mb-1 font-mono text-[11px] uppercase tracking-[.12em] text-yellow">{group.title}</div>
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="block border-b border-line py-3.5 text-[16px] font-semibold text-text-0"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
