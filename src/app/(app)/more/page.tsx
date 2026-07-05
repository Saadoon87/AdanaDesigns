import Link from "next/link";
import { BarChart3, Settings, Users, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";

const links = [
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/expenses", label: "Expenses", icon: WalletCards },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function MorePage() {
  return (
    <div>
      <PageHeader title="More" description="Additional management areas." />
      <div className="grid gap-3">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="flex items-center gap-3 p-4">
              <item.icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{item.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
