import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-[#c8d8c4] bg-[#ecf3ea] text-[#526f57]",
  warning: "border-[#ead6a4] bg-[#fff5d9] text-[#866622]",
  danger: "border-[#efc3bc] bg-[#fff1ee] text-[#a04438]",
  premium: "border-[#e5c77e] bg-[#fff7df] text-[#7a5b16]"
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
