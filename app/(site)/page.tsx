import { Hero } from "@/components/home/Hero";
import { StatStrip } from "@/components/home/StatStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { WhyGrid } from "@/components/home/WhyGrid";
import { DepthSplit } from "@/components/home/DepthSplit";
import { BrandStrip } from "@/components/home/BrandStrip";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { CtaBanner } from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatStrip />
      <CategoryGrid />
      <WhyGrid />
      <DepthSplit />
      <BrandStrip />
      <FeaturedGrid />
      <CtaBanner />
    </>
  );
}
