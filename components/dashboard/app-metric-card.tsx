import type { Metric } from "@/features/dashboard/mockData";
import { toneText } from "./progress-bar";

export function AppMetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="relative min-h-[132px] overflow-hidden rounded-2xl border border-border bg-panel p-5">
      {metric.icon ? (
        <div className="absolute right-4 top-3 text-5xl font-black text-panel-soft/80">
          {metric.icon}
        </div>
      ) : null}
      <p className="text-xs font-black uppercase tracking-[0.1em] text-muted">
        {metric.label}
      </p>
      <p className={`mt-3 text-3xl font-black tracking-[-0.04em] ${toneText(metric.tone)}`}>
        {metric.value}
      </p>
      <p className="mt-2 text-sm font-semibold text-muted">{metric.helper}</p>
    </div>
  );
}
