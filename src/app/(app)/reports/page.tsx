import { BarChart3, Boxes, Gem, Wallet } from "lucide-react";
import { MetricCard } from "@/components/app/metric-card";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { getDashboardData, listExpenses, listOrders } from "@/lib/data";

export default async function ReportsPage() {
  const [dashboard, orders, expenses] = await Promise.all([
    getDashboardData(),
    listOrders(200),
    listExpenses()
  ]);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netProfit = orders.reduce((sum, order) => sum + Number(order.profit), 0) - totalExpenses;
  const bestCustomers = new Map<string, number>();
  orders.forEach((order) => {
    const name = order.customers?.name ?? "No customer";
    bestCustomers.set(name, (bestCustomers.get(name) ?? 0) + Number(order.total_amount));
  });

  return (
    <div>
      <PageHeader title="Reports" description="Simple revenue, profit, customer, expense, and stock reports." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Monthly revenue" value={formatMoney(dashboard.totalSales)} icon={BarChart3} tone="gold" />
        <MetricCard label="Monthly profit" value={formatMoney(dashboard.totalProfit)} icon={Wallet} tone="sage" />
        <MetricCard label="Net profit after expenses" value={formatMoney(netProfit)} icon={Gem} tone="blush" />
        <MetricCard label="Stock value" value={formatMoney(dashboard.stockValue)} icon={Boxes} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Best customers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[...bestCustomers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => (
              <p key={name} className="flex justify-between rounded-md border bg-background/60 p-3 text-sm">
                <span>{name}</span><strong>{formatMoney(value)}</strong>
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expenses by category</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {["materials", "packaging", "shipping", "ads", "tools", "other"].map((category) => {
              const total = expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + Number(expense.amount), 0);
              return (
                <p key={category} className="flex justify-between rounded-md border bg-background/60 p-3 text-sm">
                  <span>{category}</span><strong>{formatMoney(total)}</strong>
                </p>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
