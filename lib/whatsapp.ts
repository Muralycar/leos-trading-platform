import { SITE_SETTINGS } from "@/lib/placeholder-data";

/** Always sourced from SITE_SETTINGS — never a hardcoded number per call site. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${SITE_SETTINGS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(subject?: string): string {
  const base = `mailto:${SITE_SETTINGS.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
