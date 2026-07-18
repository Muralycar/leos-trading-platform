import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export interface ImportTemplate {
  id: string;
  brandId: string;
  name: string;
  /** Header text -> target field key, e.g. {"Item No.": "oem_part_number"} — keyed by name, not position, so a future file with reordered columns still matches. */
  columnMapping: Record<string, string>;
  defaultEquipmentCategoryId: string | null;
}

function mapRow(row: Database["public"]["Tables"]["import_templates"]["Row"]): ImportTemplate {
  return {
    id: row.id,
    brandId: row.brand_id ?? "",
    name: row.name,
    columnMapping: row.column_mapping as Record<string, string>,
    defaultEquipmentCategoryId: row.default_equipment_category_id,
  };
}

/**
 * Treated as one template per brand by convention (saveTemplateForBrand
 * always updates-if-exists rather than inserting a second row) — the
 * schema technically allows multiple named templates per brand, but that's
 * deliberately out of scope for this first version. Takes the first match
 * rather than .maybeSingle() so a stray extra row can never turn this into
 * a hard error.
 */
export async function getTemplateForBrand(brandId: string): Promise<ImportTemplate | undefined> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("import_templates").select("*").eq("brand_id", brandId).order("id").limit(1);
  if (error) throw error;
  return data[0] ? mapRow(data[0]) : undefined;
}

export interface SaveTemplateParams {
  brandId: string;
  brandName: string;
  columnMapping: Record<string, string>;
  defaultEquipmentCategoryId: string;
  createdBy: string;
}

export async function saveTemplateForBrand(params: SaveTemplateParams): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const existing = await getTemplateForBrand(params.brandId);

  if (existing) {
    const { error } = await supabase
      .from("import_templates")
      .update({
        column_mapping: params.columnMapping,
        default_equipment_category_id: params.defaultEquipmentCategoryId,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("import_templates").insert({
    brand_id: params.brandId,
    name: `${params.brandName} Default Mapping`,
    column_mapping: params.columnMapping,
    default_equipment_category_id: params.defaultEquipmentCategoryId,
    created_by: params.createdBy,
  });
  if (error) throw error;
}
