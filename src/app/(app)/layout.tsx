import { AppShell } from "@/components/app/app-shell";
import { SetupRequired } from "@/components/app/setup-required";
import { requireAllowedUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const user = await requireAllowedUser();
  return <AppShell email={user.email}>{children}</AppShell>;
}
