import type { Metadata } from "next";
import { IndustryLandingPage } from "@/components/seo/IndustryLandingPage";

export const metadata: Metadata = {
  title: "Marine Spare Parts Supplier Dubai UAE | Leos Trading",
  description:
    "Marine spare parts supplier in Dubai and the UAE for Yanmar, Volvo Penta, Cummins, pumps, controls, cooling, filtration and hard-to-find vessel components.",
};

export default function MarinePartsPage() {
  return (
    <IndustryLandingPage
      eyebrow="Marine Spare Parts"
      title="Marine Spare Parts Supplier Dubai UAE"
      description="Marine engine, pump, cooling, control and auxiliary-system spare parts sourced for commercial vessels, workboats, offshore equipment and marine service companies."
      intro="We handle marine RFQs by part number, engine model, vessel details or nameplate. Genuine OEM, aftermarket and hard-to-find options can be checked through UAE and international sources, with export support for worldwide delivery."
      brands={["Yanmar", "Volvo Penta", "Cummins", "Perkins", "Gilkes", "Kohler", "Rexroth", "Parker"]}
      applications={["Marine diesel engines", "Cooling and seawater systems", "Pumps and water systems", "Control panels and instrumentation", "Filtration and fuel systems", "Commercial vessels and workboats"]}
      capabilities={["Engine overhaul and service parts", "Water pumps, impellers, seals and pump assemblies", "Filters, belts, hoses and cooling components", "Sensors, gauges, panels and electrical controls", "Marine hydraulic and steering components", "Obsolete and vessel-specific part-number sourcing"]}
    />
  );
}
