import { Badge } from "@/components/ui/badge";

export function StatusBadge({ value }: { value: string }) {
  const danger = ["sold_out", "cancelled", "returned", "failed", "unpaid"];
  const warning = ["low_stock", "draft", "preparing", "partially_paid", "not_shipped"];
  const success = ["available", "paid", "delivered", "shipped", "confirmed"];

  const variant = danger.includes(value)
    ? "danger"
    : warning.includes(value)
      ? "warning"
      : success.includes(value)
        ? "success"
        : "neutral";

  return <Badge variant={variant}>{value.replaceAll("_", " ")}</Badge>;
}
