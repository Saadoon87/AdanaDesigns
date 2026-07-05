export type MoneyInput = number | string | null | undefined;

export type OrderLineInput = {
  quantity: MoneyInput;
  unitPrice: MoneyInput;
  unitCost: MoneyInput;
};

export type OrderTotalsInput = {
  items: OrderLineInput[];
  discount?: MoneyInput;
  shippingFee?: MoneyInput;
};

export type OrderTotals = {
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  totalCost: number;
  profit: number;
};

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled", "returned"],
  preparing: ["shipped", "cancelled", "returned"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: []
};

export function toMoney(value: MoneyInput): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.round(numeric * 100) / 100;
}

export function calculateOrderTotals(input: OrderTotalsInput): OrderTotals {
  const subtotal = input.items.reduce(
    (sum, item) => sum + toMoney(item.quantity) * toMoney(item.unitPrice),
    0
  );
  const totalCost = input.items.reduce(
    (sum, item) => sum + toMoney(item.quantity) * toMoney(item.unitCost),
    0
  );
  const discount = Math.max(0, toMoney(input.discount));
  const shippingFee = Math.max(0, toMoney(input.shippingFee));
  const totalAmount = Math.max(0, subtotal - discount + shippingFee);

  return {
    subtotal: toMoney(subtotal),
    discount,
    shippingFee,
    totalAmount: toMoney(totalAmount),
    totalCost: toMoney(totalCost),
    profit: toMoney(totalAmount - totalCost)
  };
}

export function validateStockRequest({
  requested,
  available
}: {
  requested: number;
  available: number;
}): { ok: true } | { ok: false; message: string } {
  if (!Number.isInteger(requested) || requested < 1) {
    return { ok: false, message: "Quantity must be at least 1." };
  }

  if (requested > available) {
    return { ok: false, message: `Only ${available} item(s) available.` };
  }

  return { ok: true };
}

export function canTransitionOrder(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
): boolean {
  if (fromStatus === toStatus) {
    return true;
  }

  return orderTransitions[fromStatus].includes(toStatus);
}
