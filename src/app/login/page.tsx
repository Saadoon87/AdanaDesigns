import { Gem } from "lucide-react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const errorCopy: Record<string, string> = {
  "missing-config": "Supabase environment variables are not configured yet.",
  "invalid-login": "Email or password is incorrect.",
  "not-allowed": "This email is not approved for Adana Designs."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? errorCopy[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#e5c77e] bg-[#fff7df] text-[#8a6617]">
            <Gem className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Adana Designs</CardTitle>
          <CardDescription>
            Private jewelry stock, sales, and shipping management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-4 rounded-md border border-[#efc3bc] bg-[#fff1ee] px-3 py-2 text-sm text-[#a04438]">
              {error}
            </div>
          ) : null}
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
