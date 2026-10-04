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
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description:
    "UAE-based supplier of OEM and aftermarket parts, new and used machinery, trucks and forklifts, with global sourcing and export.",
  areaServed: "Worldwide",
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
