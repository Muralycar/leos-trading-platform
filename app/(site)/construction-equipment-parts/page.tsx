import type { Metadata } from "next";
import { IndustryLandingPage } from "@/components/seo/IndustryLandingPage";

export const metadata: Metadata = {
  title: "Construction Equipment Spare Parts UAE | CAT, Komatsu, Kobelco",
  description:
    "Construction equipment spare parts supplier in the UAE for Caterpillar, Komatsu, Kobelco, Volvo, Hyundai and other excavators, dozers, loaders and heavy machinery.",
};

export default function ConstructionEquipmentPartsPage() {
  return (
    <IndustryLandingPage
      eyebrow="Construction Equipment Parts"
      title="Construction Equipment Spare Parts Supplier UAE"
      description="Engine, hydraulic, undercarriage, electrical and drivetrain parts sourced for excavators, dozers, loaders, graders and other heavy construction equipment."
      intro="Send the machine model, serial number, part number or nameplate details. Leos Trading FZE sources genuine OEM, aftermarket and hard-to-find components for major construction-equipment brands from UAE and international suppliers."
      brands={["Caterpillar", "Komatsu", "Kobelco", "Volvo", "Hyundai", "Hitachi", "JCB", "Doosan"]}
      applications={["Excavators", "Bulldozers", "Wheel loaders", "Motor graders", "Compactors and rollers", "Forklifts and material-handling equipment"]}
      capabilities={["Hydraulic pumps, motors, cylinders and seal kits", "Engine and cooling-system components", "Undercarriage and final-drive parts", "Transmission and drivetrain components", "Electrical sensors, switches and control parts", "Serial-number identification and hard-to-find sourcing"]}
    />
  );
}
