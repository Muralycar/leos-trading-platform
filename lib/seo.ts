// Shared metadata and structured data (JSON-LD) for the public site.
// Only facts already published on the site belong here — no ratings, prices,
// opening hours or authorisations that aren't shown to visitors.

import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Open Graph defaults every page inherits. No title/description on purpose:
 * Next fills those from each page's own title and description, so shared
 * links and AI citations describe the page rather than the homepage.
 * url "./" resolves to the page's own path, exactly like the canonical.
 */
export const BASE_OPEN_GRAPH = {
  type: "website",
  siteName: SITE_NAME,
  locale: "en_AE",
  url: "./",
  images: [{ url: "/logo.png", width: 275, height: 275, alt: `${SITE_NAME} logo` }],
} satisfies NonNullable<Metadata["openGraph"]>;

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  alternateName: "Leos Trading",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description:
    "UAE-based supplier of OEM, aftermarket, obsolete and hard-to-find spare parts for trucks, construction equipment, generators, marine and industrial applications, plus new and used machinery, trucks and forklifts, with global sourcing and export. Registered office in Sharjah, office in Dubai.",
  areaServed: "Worldwide",
  email: "trade@leosdubai.com",
  telephone: "+971508489640",
  address: [
    {
      "@type": "PostalAddress",
      name: "Registered office",
      streetAddress: "Block C, VL02-155, SRTIP",
      addressLocality: "Sharjah",
      addressCountry: "AE",
    },
    {
      "@type": "PostalAddress",
      name: "Dubai office",
      streetAddress: "612 Al Kaabi, Al Nahda 1",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+971508489640",
      email: "trade@leosdubai.com",
      availableLanguage: ["English"],
    },
  ],
  knowsAbout: [
    "OEM spare parts",
    "Aftermarket spare parts",
    "Obsolete and hard-to-find spare parts sourcing",
    "Truck spare parts",
    "Construction equipment spare parts",
    "Generator spare parts",
    "Marine spare parts",
    "Industrial spare parts",
    "Used machinery and forklifts",
    "Spare parts export from the UAE",
  ],
};

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en",
  publisher: { "@id": ORGANIZATION_ID },
};

/** A page-level entity (e.g. AboutPage, ContactPage) tied to the site and organisation. */
export function webPageJsonLd(type: string, path: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
  };
}

/** BreadcrumbList from ordered [name, absolute-or-root-relative url] pairs; the last item may omit its url. */
export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}` } : {}),
    })),
  };
}

/**
 * Indexable landing page for each equipment category. The visible breadcrumb
 * links to /search?cat=…, which robots.txt blocks, so structured data points
 * at the matching landing page instead where one exists.
 */
const CATEGORY_LANDING_PAGE: Record<string, string> = {
  "truck-parts": "/truck-parts",
  "construction-equipment-parts": "/construction-equipment-parts",
  "generator-parts": "/generator-spare-parts-uae",
  "marine-parts": "/marine-parts",
};

export function categoryUrl(slug: string): string {
  return CATEGORY_LANDING_PAGE[slug] ?? `/search?cat=${encodeURIComponent(slug)}`;
}

/** Serialise JSON-LD for a <script> tag; escapes "<" so content can't close the tag early. */
export function jsonLdHtml(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
