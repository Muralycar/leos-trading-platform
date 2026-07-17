import type { SiteSettings } from "@/lib/types";

/** Always sourced from a fetched SiteSettings — never a hardcoded number per call site. */
export function waLink(settings: Pick<SiteSettings, "whatsappNumber">, message?: string): string {
  const base = `https://wa.me/${settings.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(settings: Pick<SiteSettings, "email">, subject?: string): string {
  const base = `mailto:${settings.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
