import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin — Leos Trading FZE",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">Dashboard</h1>
      <p className="mt-3 max-w-[60ch] text-[15px] text-text-1">
        Product/brand/category management and the Excel import wizard land in a later phase.
      </p>
      <Link href="/admin/rfq" className="btn btn-primary mt-6 inline-flex">
        RFQ Enquiries
      </Link>
    </div>
  );
}
