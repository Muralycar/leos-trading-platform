import type { Metadata } from "next";
import { IndustryLandingPage } from "@/components/seo/IndustryLandingPage";

export const metadata: Metadata = {
  title: "Truck Spare Parts Supplier Dubai UAE | Iveco, MAN, Mercedes",
  description:
    "Truck spare parts supplier in Dubai and the UAE for Iveco, MAN, Mercedes-Benz, Volvo, Hino and other commercial vehicles, including OEM and aftermarket parts.",
};

export default function TruckPartsPage() {
  return (
    <IndustryLandingPage
      eyebrow="Truck Spare Parts"
      title="Truck Spare Parts Supplier Dubai UAE"
      description="Commercial-vehicle engine, drivetrain, brake, suspension, filtration and electrical parts sourced for fleet operators, workshops, exporters and industrial customers."
      intro="We support truck RFQs by VIN, chassis number, engine number or part number. Leos Trading FZE holds selected Iveco inventory and sources additional genuine OEM, aftermarket and hard-to-find commercial-vehicle parts through international supplier networks."
      brands={["Iveco", "MAN", "Mercedes-Benz", "Volvo", "Hino", "Scania", "Renault Trucks", "WABCO"]}
      applications={["Heavy trucks and tractor heads", "Tippers and dump trucks", "Tankers and utility vehicles", "Buses and commercial fleets", "Construction-site trucks", "Fleet maintenance and workshop supply"]}
      capabilities={["Engine, cooling and fuel-system parts", "Transmission, clutch and driveline components", "Brake, air and pneumatic-system parts", "Suspension, steering and chassis components", "Filters, belts, bearings and service items", "VIN/chassis-based identification and hard-to-find sourcing"]}
    />
  );
}
