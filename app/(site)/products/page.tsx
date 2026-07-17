import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Products — Leos Trading FZE",
  description: "Browse Leos Trading's equipment categories — live UAE inventory in Generator, Truck and Construction Equipment Parts, plus our multi-brand sourcing network.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Product Categories"
        title="Everything we stock and source"
        description="Live inventory in Generator Parts, Truck Parts and Construction Equipment Parts today, with the same architecture onboarding every other category as new spreadsheets come in."
      />
      <CategoryGrid />
      <CtaBanner />
    </>
  );
}
