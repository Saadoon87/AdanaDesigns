import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { SaleBuilder } from "@/components/app/sale-builder";
import { StatusBadge } from "@/components/app/status-badge";
import { Card } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";
import { listCustomers, listOrders, listProducts } from "@/lib/data";
import { createSaleAction } from "../actions";

export default async function SalesPage() {
  const [products, customers, orders] = await Promise.all([
    listProducts({ status: "available" }),
    listCustomers(),
    listOrders(30)
  ]);

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Create sales drafts, validate quantities, then confirm to deduct stock."
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_520px]">
        <SaleBuilder products={products} customers={customers} action={createSaleAction} />
        <div>
          <h2 className="mb-3 text-base font-semibold">Order history</h2>
          {orders.length === 0 ? (
            <EmptyState icon={ReceiptText} title="No sales yet" description="Create your first sale draft." />
          ) : (
            <Card>
              <Table>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Status</Th>
                    <Th>Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <Td>
                        <Link className="font-medium hover:underline" href={`/orders/${order.id}`}>
                          {order.order_number}
                        </Link>
                        <span className="block text-xs text-muted-foreground">{formatDate(order.order_date)}</span>
                      </Td>
                      <Td>{order.customers?.name ?? "-"}</Td>
                      <Td><StatusBadge value={order.order_status} /></Td>
                      <Td>{formatMoney(order.total_amount)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
