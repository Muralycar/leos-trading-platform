import type { Metadata } from "next";
import { IndustryLandingPage } from "@/components/seo/IndustryLandingPage";

export const metadata: Metadata = {
  title: "Generator Spare Parts Supplier UAE | Cummins, Perkins, Kohler",
  description:
    "Generator spare parts supplier in the UAE for Cummins, Perkins, Kohler, Yanmar and related engines, controls, filters, alternators and hard-to-find components.",
};

export default function GeneratorPartsPage() {
  return (
    <IndustryLandingPage
      eyebrow="Generator Parts"
      title="Generator Spare Parts Supplier UAE"
      description="Generator engine, control, filtration and electrical spare parts sourced for industrial, commercial, marine and backup-power applications."
      intro="Leos Trading FZE sources generator parts by OEM part number, engine model, genset model or serial number. We support genuine OEM, aftermarket and obsolete-part enquiries for customers in the UAE and export markets."
      brands={["Cummins", "Perkins", "Kohler", "Yanmar", "Caterpillar", "Donaldson", "Fleetguard", "Bosch"]}
      applications={["Diesel generator sets", "Standby and prime power systems", "Industrial power generation", "Marine generator sets", "Construction-site generators", "Engine-driven auxiliary equipment"]}
      capabilities={["Engine service and overhaul parts", "Filters, belts, hoses and cooling components", "Controllers, gauges, sensors and switches", "Fuel-system and injection components", "Starter, alternator and electrical parts", "Obsolete and hard-to-find generator part numbers"]}
    />
  );
}
