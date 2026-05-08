import type { DebtAccount } from "@/features/dashboard/mockData";
import { ProgressBar, toneBgSoft, toneText } from "./progress-bar";
import { StatBadge } from "./stat-badge";

export function DebtCard({ debt }: { debt: DebtAccount }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-border bg-panel p-5 md:grid-cols-[3rem_1fr_5rem_4rem_5rem] md:items-center">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${toneBgSoft(debt.tone)}`}>
        {debt.icon}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-black text-white">{debt.name}</h2>
          {debt.focus ? <StatBadge tone="danger">Focus first</StatBadge> : null}
          <span className="text-xs font-bold text-muted">{debt.provider}</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={debt.percent} tone={debt.tone} />
        </div>
      </div>
      <div className="text-left md:text-right">
        <p className={`text-xl font-black ${toneText(debt.tone)}`}>{debt.balance}</p>
        <p className="text-xs font-semibold text-muted">{debt.limit}</p>
      </div>
      <div className="text-left md:text-right">
        <p className="text-base font-black text-white">{debt.payoff}</p>
        <p className="text-xs font-semibold text-muted">payoff</p>
      </div>
      <div className="text-left md:text-right">
        <p className="text-base font-black text-white">{debt.payment}</p>
        <p className="text-xs font-semibold text-muted">{debt.apr}</p>
      </div>
    </article>
  );
}
