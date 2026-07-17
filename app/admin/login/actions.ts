"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function loginError(message: string, next: string): never {
  redirect(`/admin/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    loginError("Email and password are required.", next);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately generic — never confirm/deny whether an email is
    // registered, or surface Supabase's internal error text.
    loginError("Invalid email or password.", next);
  }

  redirect(next || "/admin");
}
