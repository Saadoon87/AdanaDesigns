import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "sage" | "gold" | "blush";
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    sage: "bg-[#ecf3ea] text-[#526f57]",
    gold: "bg-[#fff7df] text-[#8a6617]",
    blush: "bg-[#fff1ee] text-[#a05f52]"
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className={`rounded-md p-3 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
