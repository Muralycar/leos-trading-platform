import { AVAILABILITY_LABEL, getAvailabilityStatus } from "@/lib/types";

export function AvailabilityBadge({ quantity }: { quantity: number }) {
  const status = getAvailabilityStatus(quantity);
  const className = status === "in_stock" ? "tag tag-stock" : status === "limited_stock" ? "tag tag-sourcing" : "tag tag-soon";
  return <span className={className}>{AVAILABILITY_LABEL[status]}</span>;
}
