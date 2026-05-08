import type { BudgetCategory } from "@/features/dashboard/mockData";
import { ProgressBar, toneText } from "./progress-bar";

export function BudgetCategoryRow({ category }: { category: BudgetCategory }) {
  return (
    <article className="rounded-2xl border border-border bg-panel p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.icon}</span>
          <h2 className="text-base font-black text-white">{category.name}</h2>
        </div>
        <div className="text-right">
          {category.alert ? (
            <p className="mb-1 text-xs font-black uppercase text-danger">{category.alert}</p>
          ) : null}
          <p className="text-sm font-bold text-muted">
            {category.spent} / {category.budgeted}{" "}
            <span className={toneText(category.tone)}>{category.percent}%</span>
          </p>
        </div>
      </div>
      <ProgressBar value={category.percent} tone={category.tone} />
    </article>
  );
}
