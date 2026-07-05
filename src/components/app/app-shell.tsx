import Link from "next/link";
import {
  BarChart3,
  Gem,
  Home,
  Package,
  ReceiptText,
  Settings,
  Truck,
  Users,
  WalletCards
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/sales", label: "Sales", icon: ReceiptText },
  { href: "/shipping", label: "Shipping", icon: Truck },
  { href: "/more", label: "More", icon: Settings }
];

const desktopNav = [
  ...primaryNav.slice(0, 4),
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/expenses", label: "Expenses", icon: WalletCards },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children,
  email
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r bg-card/80 lg:block">
        <div className="flex h-screen flex-col p-5">
          <Link href="/dashboard" className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5c77e] bg-[#fff7df] text-[#8a6617]">
              <Gem className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold">Adana Designs</span>
              <span className="text-xs text-muted-foreground">Private studio admin</span>
            </span>
          </Link>
          <nav className="space-y-1">
            {desktopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-3 border-t pt-4">
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" className="w-full">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 pb-24 lg:pb-0">
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
