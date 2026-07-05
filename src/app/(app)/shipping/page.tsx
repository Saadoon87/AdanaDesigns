import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { listShipments } from "@/lib/data";
import { updateShipmentAction } from "../actions";

export default async function ShippingPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const shipments = await listShipments(params.status);

  return (
    <div>
      <PageHeader title="Shipping" description="Track orders from preparation through delivery." />
      <form className="mb-4 max-w-xs">
        <Select name="status" defaultValue={params.status ?? "all"}>
          <option value="all">All shipping statuses</option>
          {["not_shipped", "preparing", "shipped", "delivered", "failed", "returned"].map((status) => (
            <option key={status} value={status}>{status.replace("_", " ")}</option>
          ))}
        </Select>
      </form>
      <div className="grid gap-3">
        {shipments.map((shipment) => (
          <Card key={shipment.id}>
            <CardContent className="p-4">
              <form action={updateShipmentAction} className="grid gap-3 lg:grid-cols-[1fr_1fr_160px_160px_1fr_auto]">
                <input type="hidden" name="id" value={shipment.id} />
                <div>
                  <p className="font-semibold">{shipment.sales_orders?.order_number}</p>
                  <p className="text-sm text-muted-foreground">{shipment.sales_orders?.customers?.name}</p>
                  <StatusBadge value={shipment.shipping_status} />
                </div>
                <Input name="shipping_company" placeholder="Company" defaultValue={shipment.shipping_company ?? ""} />
                <Input name="tracking_number" placeholder="Tracking" defaultValue={shipment.tracking_number ?? ""} />
                <Select name="shipping_status" defaultValue={shipment.shipping_status}>
                  {["not_shipped", "preparing", "shipped", "delivered", "failed", "returned"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
                <Textarea name="notes" placeholder="Notes" defaultValue={shipment.notes ?? ""} />
                <Button type="submit">Save</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
