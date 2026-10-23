import { Hero } from "@/components/home/Hero";
import { StatStrip } from "@/components/home/StatStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { WhyGrid } from "@/components/home/WhyGrid";
import { DepthSplit } from "@/components/home/DepthSplit";
import { BrandStrip } from "@/components/home/BrandStrip";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { GlobalSourcing } from "@/components/home/GlobalSourcing";
import { MachineryBanner } from "@/components/home/MachineryBanner";
import { CtaBanner } from "@/components/home/CtaBanner";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "Leos Trading",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description:
    "UAE-based supplier of OEM and aftermarket parts, new and used machinery, trucks and forklifts, with global sourcing and export. Registered office in Sharjah, office in Dubai.",
  areaServed: "Worldwide",
  email: "trade@leosdubai.com",
  telephone: "+971508489640",
  address: [
    {
      "@type": "PostalAddress",
      name: "Registered office",
      streetAddress: "SRTIP",
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
    "Truck spare parts",
    "Construction equipment spare parts",
    "Generator spare parts",
    "Obsolete spare parts sourcing",
    "Used machinery and forklifts",
    "Spare parts export from the UAE",
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }} />
      <Hero />
      <CategoryGrid variant="light" />
      <StatStrip variant="dark-accent" />
      <WhyGrid />
      <DepthSplit />
      <FeaturedGrid />
      <MachineryBanner />
      <BrandStrip />
      <GlobalSourcing />
      <CtaBanner variant="dark-accent" />
    </>
  );
}
