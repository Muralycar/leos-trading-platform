import { createAnonSupabaseClient } from "@/lib/supabase/server";
import { getPublicMediaUrl } from "@/lib/supabase/storage";
import type { Database, MachineCondition, MachineStatus } from "@/lib/supabase/types";

type MachineRow = Database["public"]["Tables"]["machines"]["Row"];

export const MACHINE_BUCKET = "machine-images";

export const MACHINE_CATEGORIES: { value: string; label: string }[] = [
  { value: "dozer", label: "Dozers" },
  { value: "excavator", label: "Excavators" },
  { value: "wheel_loader", label: "Wheel Loaders" },
  { value: "crane", label: "Cranes" },
  { value: "truck", label: "Trucks" },
  { value: "forklift", label: "Forklifts" },
  { value: "other", label: "Other Equipment" },
];

export const MACHINE_STATUS_LABEL: Record<MachineStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  sourcing: "Available on Request",
};

export const MACHINE_CONDITION_LABEL: Record<MachineCondition, string> = {
  new: "New",
  used: "Used",
};

export function categoryLabel(value: string): string {
  return MACHINE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export interface Machine {
  id: string;
  slug: string;
  title: string;
  category: string;
  brand: string;
  model: string | null;
  condition: MachineCondition | null;
  year: number | null;
  hoursOrKm: number | null;
  capacity: string | null;
  location: string | null;
  priceAed: number | null;
  description: string | null;
  specs: Record<string, string>;
  imagePaths: string[];
  imageUrls: string[];
  status: MachineStatus;
  isPublished: boolean;
  createdAt: string;
}

export function mapMachineRow(row: MachineRow): Machine {
  const imagePaths = row.images ?? [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    brand: row.brand,
    model: row.model,
    condition: row.condition,
    year: row.year,
    hoursOrKm: row.hours_or_km,
    capacity: row.capacity,
    location: row.location,
    priceAed: row.price_aed,
    description: row.description,
    specs: row.specs ?? {},
    imagePaths,
    imageUrls: imagePaths.map((p) => getPublicMediaUrl(MACHINE_BUCKET, p)),
    status: row.status,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}

/**
 * Public reads use the anon client; RLS only ever returns published rows.
 * If the machines table hasn't been created yet (migration not run), the
 * pages degrade to "no machines" instead of crashing the site.
 */
export async function getPublishedMachines(): Promise<Machine[]> {
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[machinery] list failed", error.message);
    return [];
  }
  return (data ?? []).map(mapMachineRow);
}

export async function getMachineBySlug(slug: string): Promise<Machine | undefined> {
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase.from("machines").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) {
    console.error("[machinery] detail failed", error.message);
    return undefined;
  }
  return data ? mapMachineRow(data) : undefined;
}

export function formatPriceAed(price: number | null): string {
  return price === null ? "Price on request" : `AED ${price.toLocaleString("en-US")}`;
}

/** "9,800 hrs" for machines, "120,000 km" for trucks. */
export function formatUsage(machine: Pick<Machine, "hoursOrKm" | "category">): string | null {
  if (machine.hoursOrKm === null) return null;
  const unit = machine.category === "truck" ? "km" : "hrs";
  return `${machine.hoursOrKm.toLocaleString("en-US")} ${unit}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
