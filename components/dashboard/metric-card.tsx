import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function MetricCard({
  label,
  value,
  trendValue = "Stable",
  trendDirection = "flat",
  insight,
  helper,
}: {
  label: string;
  value: number | string;
  trendValue?: string;
  trendDirection?: "up" | "down" | "flat";
  insight?: string;
  helper?: string;
}) {
  const tone =
    trendDirection === "down"
      ? "warning"
      : trendDirection === "up"
        ? "success"
        : "primary";
  const resolvedValue =
    typeof value === "number" ? formatCurrency(value) : value;
  const resolvedInsight = insight ?? helper ?? "";
  const trendLabel =
    trendDirection === "up"
      ? "Up"
      : trendDirection === "down"
        ? "Down"
        : "Steady";

  return (
    <Card className="metric-panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-soft">
            {label}
          </p>
          <p className="metric-value mt-4 text-foreground">{resolvedValue}</p>
        </div>
        <span className="status-pill" data-tone={tone}>
          {trendLabel} {trendValue}
        </span>
      </div>
      <div className="dashboard-card-soft rounded-[1.45rem] p-4">
        <p className="text-sm font-semibold leading-6 text-muted">
          {resolvedInsight}
        </p>
      </div>
    </Card>
  );
}
