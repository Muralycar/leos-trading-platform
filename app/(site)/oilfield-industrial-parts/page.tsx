import type { Metadata } from "next";
import { IndustryLandingPage } from "@/components/seo/IndustryLandingPage";

export const metadata: Metadata = {
  title: "Oilfield & Industrial Spare Parts Supplier UAE | Leos Trading",
  description:
    "Source oilfield and industrial spare parts in the UAE, including Parker, Swagelok, Honeywell, Rexroth, Danfoss and other hydraulic, pneumatic and instrumentation brands.",
};

export default function OilfieldIndustrialPartsPage() {
  return (
    <IndustryLandingPage
      eyebrow="Oilfield & Industrial Parts"
      title="Oilfield & Industrial Spare Parts Supplier UAE"
      description="Hydraulic, pneumatic, instrumentation and industrial components sourced from the UAE and international supplier networks for oil & gas, marine, utilities and process-industry customers."
      intro="Leos Trading FZE supports RFQs for Parker, Swagelok, Honeywell, Rexroth, Danfoss and other industrial brands. Send the manufacturer, part number, equipment tag or specification and our sourcing team will check genuine OEM, aftermarket and hard-to-find options."
      brands={["Parker", "Swagelok", "Honeywell", "Bosch Rexroth", "Danfoss", "SKF", "Donaldson", "Fleetguard"]}
      applications={["Oil & gas production and processing", "Hydraulic power units and control systems", "Pneumatic and instrumentation systems", "Marine and offshore equipment", "Water and utility plants", "Industrial maintenance and MRO"]}
      capabilities={["Hydraulic pumps, valves, filters and hose components", "Instrumentation fittings, valves and tubing accessories", "Pressure, temperature and process-control components", "Pneumatic filters, regulators, lubricators and valves", "Industrial filtration and engine consumables", "Obsolete, discontinued and hard-to-find part-number sourcing"]}
    />
  );
}
