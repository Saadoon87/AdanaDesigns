"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=missing-config");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect("/login?error=invalid-login");
  }

  const { data: allowed } = await supabase
    .from("allowed_users")
    .select("email")
    .ilike("email", email)
    .maybeSingle();

  if (!allowed) {
    await supabase.auth.signOut();
    redirect("/login?error=not-allowed");
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
