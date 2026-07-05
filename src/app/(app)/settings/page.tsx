import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Private app setup notes." />
      <Card>
        <CardHeader><CardTitle>Approved users</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Add approved emails in the `allowed_users` table. A user must both
            exist in Supabase Auth and be present in that table to access the app.
          </p>
          <p>
            Product images use the private `product-images` bucket and are shown
            through signed URLs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
