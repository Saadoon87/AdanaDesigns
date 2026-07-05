import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  Customer,
  Expense,
  Product,
  SalesOrder,
  SalesOrderItem,
  Shipment
} from "@/lib/supabase/types";

export async function signProductImage(path: string | null | undefined) {
  if (!path || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, 60 * 60);

  return data?.signedUrl ?? null;
}

export async function listProducts(filters?: {
  query?: string;
  category?: string;
  status?: string;
}) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*")
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (filters?.query) {
    query = query.or(`name.ilike.%${filters.query}%,sku.ilike.%${filters.query}%`);
  }

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return Promise.all(
    ((data ?? []) as Product[]).map(async (product) => ({
      ...product,
      signedImageUrl: await signProductImage(product.main_image_path)
    }))
  );
}

export async function getProduct(id: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    ...(data as Product),
    signedImageUrl: await signProductImage((data as Product).main_image_path)
  };
}

export async function listCustomers(queryText?: string) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (queryText) {
    query = query.or(
      `name.ilike.%${queryText}%,phone.ilike.%${queryText}%,instagram_username.ilike.%${queryText}%,facebook_name.ilike.%${queryText}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []) as Customer[];
}

export async function listOrders(limit = 50) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales_orders")
    .select("*, customers(name, phone, address, city)")
    .order("order_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as SalesOrder[];
}

export async function getOrder(id: string) {
  if (!isSupabaseConfigured()) {
    return { order: null, items: [] };
  }

  const supabase = await createClient();
  const [{ data: order, error: orderError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase
        .from("sales_orders")
        .select("*, customers(name, phone, address, city)")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("sales_order_items")
        .select("*, products(name, sku)")
        .eq("sales_order_id", id)
    ]);

  if (orderError) throw orderError;
  if (itemsError) throw itemsError;

  return {
    order: order as SalesOrder | null,
    items: (items ?? []) as SalesOrderItem[]
  };
}

export async function listShipments(status?: string) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  let query = supabase
    .from("shipments")
    .select("*, sales_orders(order_number, order_status, customers(name, phone, city))")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("shipping_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as Shipment[];
}

export async function listExpenses() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function getDashboardData() {
  if (!isSupabaseConfigured()) {
    return {
      orders: [],
      products: [],
      shipments: [],
      totalSales: 0,
      totalProfit: 0,
      stockValue: 0,
      availableProducts: 0,
      lowStockProducts: [],
      unpaidOrders: [],
      deliveredOrders: []
    };
  }

  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartIso = monthStart.toISOString().slice(0, 10);

  const [ordersResult, productsResult, shipmentsResult] = await Promise.all([
    supabase
      .from("sales_orders")
      .select("*, customers(name, phone, address, city)")
      .gte("order_date", monthStartIso)
      .order("order_date", { ascending: false }),
    supabase.from("products").select("*").neq("status", "archived"),
    supabase
      .from("shipments")
      .select("*, sales_orders(order_number, order_status, customers(name, phone, city))")
      .in("shipping_status", ["not_shipped", "preparing", "shipped"])
  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (productsResult.error) throw productsResult.error;
  if (shipmentsResult.error) throw shipmentsResult.error;

  const orders = (ordersResult.data ?? []) as SalesOrder[];
  const products = (productsResult.data ?? []) as Product[];
  const shipments = (shipmentsResult.data ?? []) as Shipment[];

  return {
    orders,
    products,
    shipments,
    totalSales: orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
    totalProfit: orders.reduce((sum, order) => sum + Number(order.profit), 0),
    stockValue: products.reduce(
      (sum, product) =>
        sum + Number(product.cost_price) * Number(product.quantity_available),
      0
    ),
    availableProducts: products.filter((product) => product.status === "available")
      .length,
    lowStockProducts: products.filter(
      (product) => product.status === "low_stock" || product.quantity_available <= 2
    ),
    unpaidOrders: orders.filter((order) => order.payment_status !== "paid"),
    deliveredOrders: orders.filter((order) => order.order_status === "delivered")
  };
}
