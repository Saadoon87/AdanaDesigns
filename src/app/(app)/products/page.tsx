import Image from "next/image";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatMoney, formatPercent } from "@/lib/format";
import { listProducts } from "@/lib/data";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const params = await searchParams;
  const products = await listProducts(params);

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage stock, prices, images, and product status."
        actionHref="/products/new"
        actionLabel="Add product"
      />
      <form className="mb-4 grid gap-3 md:grid-cols-3">
        <Input name="q" placeholder="Search name or SKU" defaultValue={params.q ?? ""} />
        <Select name="category" defaultValue={params.category ?? "all"}>
          <option value="all">All categories</option>
          {["necklace", "bracelet", "ring", "earrings", "anklet", "set", "other"].map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            )
          )}
        </Select>
        <Select name="status" defaultValue={params.status ?? "all"}>
          <option value="all">All statuses</option>
          {["draft", "available", "low_stock", "sold_out"].map((item) => (
            <option key={item} value={item}>
              {item.replace("_", " ")}
            </option>
          ))}
        </Select>
      </form>
      {products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No products yet"
          description="Add your first jewelry piece or adjust the current filters."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const margin =
              Number(product.selling_price) > 0
                ? ((Number(product.selling_price) - Number(product.cost_price)) /
                    Number(product.selling_price)) *
                  100
                : 0;
            return (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="flex gap-3 p-3 transition hover:border-primary/60">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.signedImageUrl ? (
                      <Image
                        src={product.signedImageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="truncate font-semibold">{product.name}</h2>
                      <StatusBadge value={product.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatMoney(product.selling_price)} · {formatPercent(margin)} margin
                    </p>
                    <p className="mt-3 text-sm">
                      {product.quantity_available} available · {product.quantity_sold} sold
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
