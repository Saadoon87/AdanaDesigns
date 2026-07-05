import { ProductForm } from "@/components/app/product-form";
import { PageHeader } from "@/components/app/page-header";
import { createProductAction } from "../../actions";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="Add product" description="Create a new stock item." />
      <ProductForm action={createProductAction} submitLabel="Create product" />
    </div>
  );
}
