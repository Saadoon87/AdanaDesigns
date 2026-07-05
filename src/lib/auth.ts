import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims;

  if (error || !claims?.sub) {
    return null;
  }

  const email = String(claims.email ?? "");
  const { data: allowed } = await supabase
    .from("allowed_users")
    .select("email")
    .ilike("email", email)
    .maybeSingle();

  if (!allowed) {
    return { id: claims.sub, email, allowed: false };
  }

  return { id: claims.sub, email, allowed: true };
}

export async function requireAllowedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.allowed) {
    redirect("/login?error=not-allowed");
  }

  return user;
}
