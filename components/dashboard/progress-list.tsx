import type { ProgressItem } from "@/features/dashboard/mockData";
import { ProgressBar, toneText } from "./progress-bar";

export function ProgressList({ items }: { items: ProgressItem[] }) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span>{item.icon}</span>
              <span className="truncate text-sm font-black text-white">{item.label}</span>
            </div>
            <span className={`text-sm font-black ${toneText(item.tone)}`}>{item.value}</span>
          </div>
          <ProgressBar value={item.percent} tone={item.tone} />
        </div>
      ))}
    </div>
  );
}
