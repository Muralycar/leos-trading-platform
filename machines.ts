import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapMachineRow, type Machine } from "@/lib/machinery";

/** Admin reads go through the session client: RLS ("admin manages machines") lets admins see unpublished rows too. */
export async function listAllMachines(): Promise<Machine[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("machines").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapMachineRow);
}

export const getMachineById = cache(async (id: string): Promise<Machine | undefined> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("machines").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapMachineRow(data) : undefined;
});
