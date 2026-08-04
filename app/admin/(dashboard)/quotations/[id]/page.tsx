import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { getQuotationById, listQuotationItems, listQuotationActivity, listQuotationRevisions } from "@/lib/admin/quotations";
import { QuotationEditor } from "./QuotationEditor";

export const metadata: Metadata = {
  title: "Quotation — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminQuotationPage({ params }: PageProps) {
  await requireRole("admin");
  const { id } = await params;

  const quotation = await getQuotationById(id);
  if (!quotation) notFound();

  const [items, activity, revisions] = await Promise.all([
    listQuotationItems(id),
    listQuotationActivity(id),
    listQuotationRevisions(quotation.quotationNumber),
  ]);

  return (
    <QuotationEditor
      quotationId={id}
      quotation={quotation}
      items={items}
      activity={activity}
      revisions={revisions}
      rfqId={quotation.rfqId}
    />
  );
}
