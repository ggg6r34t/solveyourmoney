import { cn } from "@/lib/utils";

export function ProgressRail({
  value,
  label,
  detail,
  tone = "primary",
}: {
  value: number;
  label: string;
  detail?: string;
  tone?: "primary" | "success" | "warning";
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  const toneClass = {
    primary: "from-primary to-xp",
    success: "from-accent to-chart-2",
    warning: "from-warning to-chart-3",
  }[tone];

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-soft">
            {label}
          </p>
          {detail ? (
            <p className="mt-1 text-sm font-semibold text-muted">{detail}</p>
          ) : null}
        </div>
        <span className="status-pill" data-tone={tone}>
          {safeValue}%
        </span>
      </div>
      <div className="progress-glow h-3.5 overflow-hidden rounded-full bg-primary/10">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
            toneClass,
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
