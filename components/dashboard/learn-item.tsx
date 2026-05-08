import type { LearnItemData } from "@/features/dashboard/mockData";
import { toneBgSoft, toneText } from "./progress-bar";

export function LearnItem({ item }: { item: LearnItemData }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-border bg-panel p-4 md:grid-cols-[3rem_1fr_auto] md:items-center">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${toneBgSoft(item.tone)}`}>
        {item.icon}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-black ${toneText(item.tone)}`}>
            {item.category}
          </span>
          <span className="text-xs font-bold text-muted">{item.readTime}</span>
          {item.read ? (
            <span className="text-xs font-black text-success">✓ Read</span>
          ) : null}
        </div>
        <h2 className="mt-1 text-base font-black text-white">{item.title}</h2>
      </div>
      <span className={`justify-self-start rounded-lg px-3 py-2 text-sm font-black md:justify-self-end ${item.read ? "bg-surface-success text-success" : "bg-warning-soft text-warning"}`}>
        +{item.xp} XP
      </span>
    </article>
  );
}
