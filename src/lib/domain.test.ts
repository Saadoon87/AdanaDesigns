import { describe, expect, it } from "vitest";
import {
  calculateOrderTotals,
  canTransitionOrder,
  validateStockRequest
} from "./domain";

describe("calculateOrderTotals", () => {
  it("calculates subtotal, total cost, total amount, and profit", () => {
    const totals = calculateOrderTotals({
      discount: 50,
      shippingFee: 30,
      items: [
        { quantity: 2, unitPrice: 350, unitCost: 120 },
        { quantity: 1, unitPrice: 200, unitCost: 80 }
      ]
    });

    expect(totals).toEqual({
      subtotal: 900,
      discount: 50,
      shippingFee: 30,
      totalAmount: 880,
      totalCost: 320,
      profit: 560
    });
  });

  it("does not allow discount to make the total negative", () => {
    const totals = calculateOrderTotals({
      discount: 500,
      shippingFee: 0,
      items: [{ quantity: 1, unitPrice: 120, unitCost: 40 }]
    });

    expect(totals.totalAmount).toBe(0);
    expect(totals.profit).toBe(-40);
  });
});

describe("validateStockRequest", () => {
  it("accepts quantities within available stock", () => {
    expect(validateStockRequest({ requested: 2, available: 3 })).toEqual({
      ok: true
    });
  });

  it("rejects quantities above available stock", () => {
    expect(validateStockRequest({ requested: 4, available: 3 })).toEqual({
      ok: false,
      message: "Only 3 item(s) available."
    });
  });
});

describe("canTransitionOrder", () => {
  it("allows forward fulfillment transitions", () => {
    expect(canTransitionOrder("confirmed", "preparing")).toBe(true);
    expect(canTransitionOrder("preparing", "shipped")).toBe(true);
    expect(canTransitionOrder("shipped", "delivered")).toBe(true);
  });

  it("prevents delivered orders from moving back to draft", () => {
    expect(canTransitionOrder("delivered", "draft")).toBe(false);
  });
});
