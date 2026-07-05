"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { calculateOrderTotals } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";
import type {
  ExpenseCategory,
  OrderStatus,
  PaymentStatus,
  ProductCategory,
  ProductStatus,
  ShippingStatus
} from "@/lib/supabase/types";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  sku: z.string().optional(),
  cost_price: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  quantity_available: z.coerce.number().int().min(0),
  quantity_reserved: z.coerce.number().int().min(0).default(0),
  status: z.string().min(1),
  notes: z.string().optional()
});

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  instagram_username: z.string().optional(),
  facebook_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional()
});

const expenseSchema = z.object({
  expense_date: z.string().min(1),
  category: z.string().min(1),
  amount: z.coerce.number().min(0),
  description: z.string().min(1),
  notes: z.string().optional()
});

function nullableText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseForm<T extends z.ZodRawShape>(schema: z.ZodObject<T>, formData: FormData) {
  return schema.parse(Object.fromEntries(formData.entries()));
}

export async function createProductAction(formData: FormData) {
  const parsed = parseForm(productSchema, formData);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: parsed.name,
      description: nullableText(parsed.description),
      category: parsed.category as ProductCategory,
      sku: nullableText(parsed.sku),
      cost_price: parsed.cost_price,
      selling_price: parsed.selling_price,
      quantity_available: parsed.quantity_available,
      quantity_reserved: parsed.quantity_reserved,
      status: parsed.status as ProductStatus,
      notes: nullableText(parsed.notes)
    })
    .select("id")
    .single();

  if (error) throw error;

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const path = `products/${data.id}/${Date.now()}-${image.name}`;
    const upload = await supabase.storage.from("product-images").upload(path, image);
    if (upload.error) throw upload.error;

    await supabase.from("product_images").insert({
      product_id: data.id,
      image_path: path
    });
    await supabase.from("products").update({ main_image_path: path }).eq("id", data.id);
  }

  revalidatePath("/products");
  redirect(`/products/${data.id}`);
}

export async function updateProductAction(id: string, formData: FormData) {
  const parsed = parseForm(productSchema, formData);
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.name,
      description: nullableText(parsed.description),
      category: parsed.category as ProductCategory,
      sku: nullableText(parsed.sku),
      cost_price: parsed.cost_price,
      selling_price: parsed.selling_price,
      quantity_available: parsed.quantity_available,
      quantity_reserved: parsed.quantity_reserved,
      status: parsed.status as ProductStatus,
      notes: nullableText(parsed.notes)
    })
    .eq("id", id);

  if (error) throw error;

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const path = `products/${id}/${Date.now()}-${image.name}`;
    const upload = await supabase.storage.from("product-images").upload(path, image);
    if (upload.error) throw upload.error;
    await supabase.from("product_images").insert({ product_id: id, image_path: path });
    await supabase.from("products").update({ main_image_path: path }).eq("id", id);
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
}

export async function archiveProductAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/products");
  redirect("/products");
}

export async function createCustomerAction(formData: FormData) {
  const parsed = parseForm(customerSchema, formData);
  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert({
    name: parsed.name,
    phone: nullableText(parsed.phone),
    instagram_username: nullableText(parsed.instagram_username),
    facebook_name: nullableText(parsed.facebook_name),
    address: nullableText(parsed.address),
    city: nullableText(parsed.city),
    notes: nullableText(parsed.notes)
  });

  if (error) throw error;
  revalidatePath("/customers");
}

export async function createExpenseAction(formData: FormData) {
  const parsed = parseForm(expenseSchema, formData);
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    expense_date: parsed.expense_date,
    category: parsed.category as ExpenseCategory,
    amount: parsed.amount,
    description: parsed.description,
    notes: nullableText(parsed.notes)
  });

  if (error) throw error;
  revalidatePath("/expenses");
  revalidatePath("/reports");
}

export async function createSaleAction(formData: FormData) {
  const customerId = nullableText(String(formData.get("customer_id") ?? ""));
  const discount = Number(formData.get("discount") ?? 0);
  const shippingFee = Number(formData.get("shipping_fee") ?? 0);
  const paymentStatus = String(formData.get("payment_status") ?? "unpaid") as PaymentStatus;
  const notes = nullableText(String(formData.get("notes") ?? ""));
  const rawItems = String(formData.get("items") ?? "[]");
  const items = z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
        unitPrice: z.coerce.number().min(0),
        unitCost: z.coerce.number().min(0)
      })
    )
    .min(1)
    .parse(JSON.parse(rawItems));

  const totals = calculateOrderTotals({
    discount,
    shippingFee,
    items: items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost
    }))
  });

  const supabase = await createClient();
  const orderNumber = `AD-${Date.now().toString().slice(-8)}`;
  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping_fee: totals.shippingFee,
      total_amount: totals.totalAmount,
      total_cost: totals.totalCost,
      profit: totals.profit,
      payment_status: paymentStatus,
      order_status: "draft",
      notes
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase.from("sales_order_items").insert(
    items.map((item) => ({
      sales_order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      unit_cost: item.unitCost,
      total_price: item.quantity * item.unitPrice,
      total_cost: item.quantity * item.unitCost,
      profit: item.quantity * (item.unitPrice - item.unitCost)
    }))
  );

  if (itemsError) throw itemsError;

  revalidatePath("/sales");
  redirect(`/orders/${order.id}`);
}

export async function confirmSaleAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_sale", { order_id: id });
  if (error) throw error;
  revalidatePath("/sales");
  revalidatePath(`/orders/${id}`);
}

export async function reverseSaleAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.rpc("reverse_sale", { order_id: id });
  if (error) throw error;
  revalidatePath("/sales");
  revalidatePath(`/orders/${id}`);
}

export async function updateOrderStatusAction(formData: FormData) {
  const id = String(formData.get("id"));
  const order_status = String(formData.get("order_status")) as OrderStatus;
  const supabase = await createClient();
  const { error } = await supabase
    .from("sales_orders")
    .update({ order_status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/orders/${id}`);
  revalidatePath("/sales");
}

export async function updateShipmentAction(formData: FormData) {
  const id = String(formData.get("id"));
  const shipping_status = String(formData.get("shipping_status")) as ShippingStatus;
  const supabase = await createClient();
  const { error } = await supabase
    .from("shipments")
    .update({
      shipping_company: nullableText(String(formData.get("shipping_company") ?? "")),
      tracking_number: nullableText(String(formData.get("tracking_number") ?? "")),
      shipping_status,
      shipped_date: nullableText(String(formData.get("shipped_date") ?? "")),
      delivered_date: nullableText(String(formData.get("delivered_date") ?? "")),
      notes: nullableText(String(formData.get("notes") ?? ""))
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/shipping");
}
