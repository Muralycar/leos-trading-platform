import type { Metadata } from "next";
import { IndustryLandingPage } from "@/components/seo/IndustryLandingPage";

export const metadata: Metadata = {
  title: "Caterpillar CAT Spare Parts Supplier UAE | Leos Trading",
  description:
    "Source Caterpillar CAT spare parts in the UAE for construction, mining, engines and generators, including OEM, aftermarket, obsolete and hard-to-find part numbers.",
};

export default function CaterpillarPartsPage() {
  return (
    <IndustryLandingPage
      eyebrow="Caterpillar / CAT Parts"
      title="Caterpillar CAT Spare Parts Supplier UAE"
      description="CAT engine, hydraulic, drivetrain, filtration and machine components sourced for construction, mining, power-generation and industrial applications."
      intro="Leos Trading FZE sources Caterpillar parts by part number, machine model or serial number through UAE and international suppliers. We can check genuine OEM, quality aftermarket, surplus and hard-to-find options depending on availability and customer requirements."
      brands={["Caterpillar", "CAT", "Donaldson", "Fleetguard", "Bosch", "SKF", "Rexroth", "Parker"]}
      applications={["Excavators and loaders", "Bulldozers and graders", "Mining equipment", "CAT diesel engines", "Generator sets and power systems", "Industrial and marine engine applications"]}
      capabilities={["Engine overhaul and service parts", "Hydraulic pumps, valves and cylinders", "Transmission, final drive and drivetrain parts", "Filters, belts, hoses and cooling components", "Electrical sensors, switches and controls", "Obsolete, surplus and hard-to-find CAT part numbers"]}
    />
  );
}
