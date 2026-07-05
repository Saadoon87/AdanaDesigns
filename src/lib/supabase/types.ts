export type ProductCategory =
  | "necklace"
  | "bracelet"
  | "ring"
  | "earrings"
  | "anklet"
  | "set"
  | "other";

export type ProductStatus =
  | "draft"
  | "available"
  | "low_stock"
  | "sold_out"
  | "archived";

export type PaymentStatus = "unpaid" | "partially_paid" | "paid";

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type ShippingStatus =
  | "not_shipped"
  | "preparing"
  | "shipped"
  | "delivered"
  | "failed"
  | "returned";

export type ExpenseCategory =
  | "materials"
  | "packaging"
  | "shipping"
  | "ads"
  | "tools"
  | "other";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  sku: string | null;
  cost_price: number;
  selling_price: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_sold: number;
  status: ProductStatus;
  main_image_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  signedImageUrl?: string | null;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  instagram_username: string | null;
  facebook_name: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesOrder = {
  id: string;
  order_number: string;
  customer_id: string | null;
  order_date: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total_amount: number;
  total_cost: number;
  profit: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  stock_deducted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: Pick<Customer, "name" | "phone" | "address" | "city"> | null;
};

export type SalesOrderItem = {
  id: string;
  sales_order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit: number;
  products?: Pick<Product, "name" | "sku"> | null;
};

export type Shipment = {
  id: string;
  sales_order_id: string;
  shipping_company: string | null;
  tracking_number: string | null;
  shipping_status: ShippingStatus;
  shipped_date: string | null;
  delivered_date: string | null;
  address_snapshot: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  sales_orders?: Pick<SalesOrder, "order_number" | "order_status"> & {
    customers?: Pick<Customer, "name" | "phone" | "city"> | null;
  };
};

export type Expense = {
  id: string;
  expense_date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
