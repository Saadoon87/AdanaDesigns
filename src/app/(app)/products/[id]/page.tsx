import Image from "next/image";
import { notFound } from "next/navigation";
import { archiveProductAction, updateProductAction } from "@/app/(app)/actions";
import { ProductForm } from "@/components/app/product-form";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { getProduct } from "@/lib/data";

export default async function ProductDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const update = updateProductAction.bind(null, product.id);
  const profit = Number(product.selling_price) - Number(product.cost_price);

  return (
    <div>
      <PageHeader title={product.name} description="Product details and stock." />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card>
            <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
              {product.signedImageUrl ? (
                <Image src={product.signedImageUrl} alt={product.name} fill className="object-cover" />
              ) : null}
            </div>
            <CardContent className="space-y-3 p-5">
              <StatusBadge value={product.status} />
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <span>Cost: {formatMoney(product.cost_price)}</span>
                <span>Price: {formatMoney(product.selling_price)}</span>
                <span>Profit: {formatMoney(profit)}</span>
                <span>SKU: {product.sku ?? "None"}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Stock movement</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-center text-sm">
              <span><strong className="block text-xl">{product.quantity_available}</strong>Available</span>
              <span><strong className="block text-xl">{product.quantity_reserved}</strong>Reserved</span>
              <span><strong className="block text-xl">{product.quantity_sold}</strong>Sold</span>
            </CardContent>
          </Card>
          <form action={archiveProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <Button type="submit" variant="destructive" className="w-full">
              Archive product
            </Button>
          </form>
        </div>
        <ProductForm product={product} action={update} submitLabel="Save changes" />
      </div>
    </div>
  );
}
