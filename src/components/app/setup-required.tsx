import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupRequired() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
      <Card className="w-full min-w-0">
        <CardHeader>
          <CardTitle>Supabase setup needed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 break-words text-sm text-muted-foreground">
          <p>
            Add `NEXT_PUBLIC_SUPABASE_URL` and
            `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`, then run the
            SQL migration and seed your approved emails.
          </p>
          <p>
            The app is intentionally private, so protected pages stay unavailable
            until Supabase is configured.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
