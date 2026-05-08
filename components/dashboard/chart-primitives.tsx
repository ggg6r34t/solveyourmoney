import { formatCurrency } from "@/lib/format";

export function MiniTrendChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex items-end gap-3">
      {data.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="flex flex-1 flex-col items-center gap-3"
        >
          <div className="flex h-40 w-full items-end rounded-[1.2rem] bg-primary/7 p-2">
            <div
              className="w-full rounded-[0.95rem] bg-gradient-to-t from-primary to-xp"
              style={{ height: `${Math.max(12, (item.value / max) * 100)}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-soft">
              {item.label}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted">
              {formatCurrency(item.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressSparkline({
  values,
  strokeClassName = "stroke-chart-2",
}: {
  values: number[];
  strokeClassName?: string;
}) {
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 48 - (value / max) * 42;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 50" className="h-20 w-full overflow-visible">
      <line
        x1="0"
        y1="46"
        x2="100"
        y2="46"
        className="stroke-primary/10 stroke-[1.2]"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={points}
        fill="none"
        className={`${strokeClassName} stroke-[3]`}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
