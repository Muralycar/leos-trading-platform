import type { Metadata } from "next";

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
        Authentication and route protection are live. Product/brand/category management, the Excel import wizard, and the
        RFQ inbox land in the next phase.
      </p>
    </div>
  );
}
