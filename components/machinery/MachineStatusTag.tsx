import type { MachineStatus } from "@/lib/supabase/types";
import { MACHINE_STATUS_LABEL } from "@/lib/machinery";

export function MachineStatusTag({ status }: { status: MachineStatus }) {
  const className =
    status === "available" ? "tag tag-stock" : status === "sourcing" ? "tag tag-sourcing" : "tag tag-soon";
  return <span className={className}>{MACHINE_STATUS_LABEL[status]}</span>;
}
