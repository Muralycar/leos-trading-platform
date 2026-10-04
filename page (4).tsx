import type { Metadata } from "next";
import { requireRole } from "@/lib/admin/auth";
import { createMachine } from "../actions";
import { MachineForm } from "../MachineForm";

export const metadata: Metadata = {
  title: "New Machine — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminNewMachinePage({ searchParams }: PageProps) {
  await requireRole("admin");
  const { error } = await searchParams;

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 className="mt-3.5 text-[28px]">New Machine</h1>
      <p className="mt-2 max-w-[60ch] text-[15px] text-text-1">Photos can be added after saving.</p>

      {error ? <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p> : null}

      <div className="mt-6 max-w-[720px]">
        <MachineForm action={createMachine} submitLabel="Create machine" />
      </div>
    </div>
  );
}
