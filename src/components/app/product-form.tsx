import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/supabase/types";

const categories = ["necklace", "bracelet", "ring", "earrings", "anklet", "set", "other"];
const statuses = ["draft", "available", "low_stock", "sold_out", "archived"];

export function ProductForm({
  product,
  action,
  submitLabel
}: {
  product?: Product;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Edit product" : "Add product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={product?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select id="category" name="category" defaultValue={product?.category ?? "other"}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={product?.status ?? "draft"}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU / code</Label>
            <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Product image</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost_price">Cost price</Label>
            <Input
              id="cost_price"
              name="cost_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.cost_price ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="selling_price">Selling price</Label>
            <Input
              id="selling_price"
              name="selling_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.selling_price ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity_available">Available</Label>
            <Input
              id="quantity_available"
              name="quantity_available"
              type="number"
              min="0"
              defaultValue={product?.quantity_available ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity_reserved">Reserved</Label>
            <Input
              id="quantity_reserved"
              name="quantity_reserved"
              type="number"
              min="0"
              defaultValue={product?.quantity_reserved ?? 0}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={product?.notes ?? ""} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" size="lg">
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
