import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { getMachineById } from "@/lib/admin/machines";
import { deleteMachine, updateMachine } from "../../actions";
import { DeleteMachineButton } from "../../DeleteMachineButton";
import { MachineForm } from "../../MachineForm";
import { MachineImages } from "../../MachineImages";

export const metadata: Metadata = {
  title: "Edit Machine — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}

export default async function AdminEditMachinePage({ params, searchParams }: PageProps) {
  await requireRole("admin");
  const { id } = await params;
  const { error, saved } = await searchParams;

  const machine = await getMachineById(id);
  if (!machine) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="mt-3.5 text-[28px]">{machine.title}</h1>
        </div>
        <div className="flex gap-2">
          {machine.isPublished ? (
            <Link href={`/machinery/${machine.slug}`} target="_blank" className="btn btn-ghost btn-sm">
              View on site
            </Link>
          ) : null}
          <Link href="/admin/machines" className="btn btn-ghost btn-sm">
            All machines
          </Link>
        </div>
      </div>

      {error ? <p className="mt-4 rounded-s border border-warn/40 bg-warn/10 px-3.5 py-2.5 text-sm text-warn">{error}</p> : null}
      {saved ? <p className="mt-4 rounded-s border border-ok/40 bg-ok/10 px-3.5 py-2.5 text-sm text-ok">Saved.</p> : null}

      <div className="mt-8 grid grid-cols-1 gap-8 min-[901px]:grid-cols-[1.4fr_1fr]">
        <MachineForm action={updateMachine.bind(null, machine.id)} machine={machine} submitLabel="Save changes" />

        <div className="flex flex-col gap-6">
          <MachineImages
            machineId={machine.id}
            images={machine.imagePaths.map((path, i) => ({ path, url: machine.imageUrls[i] }))}
          />
          <div className="rounded-m border border-line bg-bg-1 p-6">
            <h3 className="text-[16px]">Danger zone</h3>
            <form action={deleteMachine.bind(null, machine.id)} className="mt-4">
              <DeleteMachineButton />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
