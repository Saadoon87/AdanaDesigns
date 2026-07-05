import {
  AlertCircle,
  BadgeDollarSign,
  Boxes,
  CheckCircle2,
  Package,
  Truck,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/components/app/metric-card";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick view of sales, stock health, and shipping work."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Sales this month" value={formatMoney(data.totalSales)} icon={BadgeDollarSign} tone="gold" />
        <MetricCard label="Profit this month" value={formatMoney(data.totalProfit)} icon={Wallet} tone="sage" />
        <MetricCard label="Stock value" value={formatMoney(data.stockValue)} icon={Boxes} />
        <MetricCard label="Available products" value={String(data.availableProducts)} icon={Package} tone="blush" />
        <MetricCard label="Low stock" value={String(data.lowStockProducts.length)} icon={AlertCircle} tone="gold" />
        <MetricCard label="Pending shipments" value={String(data.shipments.length)} icon={Truck} />
        <MetricCard label="Delivered orders" value={String(data.deliveredOrders.length)} icon={CheckCircle2} tone="sage" />
        <MetricCard label="Unpaid orders" value={String(data.unpaidOrders.length)} icon={AlertCircle} tone="blush" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent sales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-md border bg-background/50 p-3"
              >
                <span>
                  <span className="block text-sm font-medium">{order.order_number}</span>
                  <span className="text-xs text-muted-foreground">
                    {order.customers?.name ?? "No customer"}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold">
                    {formatMoney(order.total_amount)}
                  </span>
                  <StatusBadge value={order.payment_status} />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low stock products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.lowStockProducts.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex items-center justify-between rounded-md border bg-background/50 p-3"
              >
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-sm text-muted-foreground">
                  {product.quantity_available} left
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waiting for shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.shipments.slice(0, 6).map((shipment) => (
              <Link
                key={shipment.id}
                href="/shipping"
                className="flex items-center justify-between rounded-md border bg-background/50 p-3"
              >
                <span>
                  <span className="block text-sm font-medium">
                    {shipment.sales_orders?.order_number}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {shipment.sales_orders?.customers?.name ?? "No customer"}
                  </span>
                </span>
                <StatusBadge value={shipment.shipping_status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
