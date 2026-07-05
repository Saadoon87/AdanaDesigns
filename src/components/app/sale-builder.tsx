"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { calculateOrderTotals } from "@/lib/domain";
import { formatMoney } from "@/lib/format";
import type { Customer, Product } from "@/lib/supabase/types";

type Line = {
  productId: string;
  quantity: number;
};

export function SaleBuilder({
  products,
  customers,
  action
}: {
  products: Product[];
  customers: Customer[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [lines, setLines] = useState<Line[]>([
    { productId: products[0]?.id ?? "", quantity: 1 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  const enrichedLines = lines
    .map((line) => {
      const product = products.find((item) => item.id === line.productId);
      return product
        ? {
            product,
            quantity: line.quantity,
            unitPrice: Number(product.selling_price),
            unitCost: Number(product.cost_price)
          }
        : null;
    })
    .filter(Boolean);

  const totals = useMemo(
    () =>
      calculateOrderTotals({
        discount,
        shippingFee,
        items: enrichedLines.map((line) => ({
          quantity: line?.quantity,
          unitPrice: line?.unitPrice,
          unitCost: line?.unitCost
        }))
      }),
    [discount, shippingFee, enrichedLines]
  );

  const payload = JSON.stringify(
    enrichedLines.map((line) => ({
      productId: line?.product.id,
      quantity: line?.quantity,
      unitPrice: line?.unitPrice,
      unitCost: line?.unitCost
    }))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create sale</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <input type="hidden" name="items" value={payload} />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customer_id">Customer</Label>
              <Select id="customer_id" name="customer_id">
                <option value="">Walk-in / no customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment</Label>
              <Select id="payment_status" name="payment_status" defaultValue="unpaid">
                <option value="unpaid">unpaid</option>
                <option value="partially_paid">partially paid</option>
                <option value="paid">paid</option>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => {
              const product = products.find((item) => item.id === line.productId);
              return (
                <div
                  key={`${line.productId}-${index}`}
                  className="grid gap-3 rounded-lg border bg-background/60 p-3 md:grid-cols-[1fr_120px_44px]"
                >
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={line.productId}
                      onChange={(event) => {
                        const next = [...lines];
                        next[index] = { ...line, productId: event.target.value };
                        setLines(next);
                      }}
                    >
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.quantity_available} available)
                        </option>
                      ))}
                    </Select>
                    {product && line.quantity > product.quantity_available ? (
                      <p className="text-xs text-destructive">
                        Only {product.quantity_available} available.
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      max={product?.quantity_available ?? 1}
                      value={line.quantity}
                      onChange={(event) => {
                        const next = [...lines];
                        next[index] = {
                          ...line,
                          quantity: Number(event.target.value)
                        };
                        setLines(next);
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setLines(lines.filter((_, itemIndex) => itemIndex !== index))}
                      disabled={lines.length === 1}
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setLines([...lines, { productId: products[0]?.id ?? "", quantity: 1 }])
              }
            >
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                name="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_fee">Shipping fee</Label>
              <Input
                id="shipping_fee"
                name="shipping_fee"
                type="number"
                min="0"
                step="0.01"
                value={shippingFee}
                onChange={(event) => setShippingFee(Number(event.target.value))}
              />
            </div>
            <div className="rounded-lg border bg-muted/70 p-3 text-sm">
              <p className="flex justify-between">
                <span>Total</span>
                <strong>{formatMoney(totals.totalAmount)}</strong>
              </p>
              <p className="mt-1 flex justify-between text-muted-foreground">
                <span>Profit</span>
                <span>{formatMoney(totals.profit)}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <Button type="submit" size="lg" disabled={products.length === 0}>
            Save sale draft
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
