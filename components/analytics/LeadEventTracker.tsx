"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushLeadEvent(event: string, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

export function LeadEventTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.href || "";
      if (href.includes("wa.me/") || href.includes("whatsapp.com/")) {
        pushLeadEvent("whatsapp_click", {
          page_path: window.location.pathname,
          link_text: link.textContent?.trim().slice(0, 80) || "WhatsApp",
        });
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
