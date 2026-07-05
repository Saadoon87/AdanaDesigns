import { notFound } from "next/navigation";
import {
  confirmSaleAction,
  reverseSaleAction,
  updateOrderStatusAction
} from "@/app/(app)/actions";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";
import { getOrder } from "@/lib/data";

export default async function OrderDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { order, items } = await getOrder(id);
  if (!order) notFound();

  return (
    <div>
      <PageHeader title={order.order_number} description="Order details, profit, and fulfillment status." />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Items sold</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Unit price</Th>
                  <Th>Total</Th>
                  <Th>Profit</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <Td>{item.products?.name ?? "Archived product"}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>{formatMoney(item.unit_price)}</Td>
                    <Td>{formatMoney(item.total_price)}</Td>
                    <Td>{formatMoney(item.profit)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex justify-between"><span>Date</span><span>{formatDate(order.order_date)}</span></p>
              <p className="flex justify-between"><span>Payment</span><StatusBadge value={order.payment_status} /></p>
              <p className="flex justify-between"><span>Order</span><StatusBadge value={order.order_status} /></p>
              <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(order.subtotal)}</span></p>
              <p className="flex justify-between"><span>Discount</span><span>{formatMoney(order.discount)}</span></p>
              <p className="flex justify-between"><span>Shipping</span><span>{formatMoney(order.shipping_fee)}</span></p>
              <p className="flex justify-between text-base font-semibold"><span>Total</span><span>{formatMoney(order.total_amount)}</span></p>
              <p className="flex justify-between text-base font-semibold text-[#526f57]"><span>Profit</span><span>{formatMoney(order.profit)}</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.customers?.name ?? "No customer"}</p>
              <p className="text-muted-foreground">{order.customers?.phone ?? ""}</p>
              <p className="text-muted-foreground">{order.customers?.address ?? ""}</p>
            </CardContent>
          </Card>
          <div className="grid gap-3">
            <form action={confirmSaleAction}>
              <input type="hidden" name="id" value={order.id} />
              <Button type="submit" className="w-full">Confirm sale and deduct stock</Button>
            </form>
            <form action={reverseSaleAction}>
              <input type="hidden" name="id" value={order.id} />
              <Button type="submit" variant="outline" className="w-full">Cancel and restore stock</Button>
            </form>
            <form action={updateOrderStatusAction} className="flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <Select name="order_status" defaultValue={order.order_status}>
                {["draft", "confirmed", "preparing", "shipped", "delivered", "cancelled", "returned"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
              <Button type="submit" variant="secondary">Update</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
