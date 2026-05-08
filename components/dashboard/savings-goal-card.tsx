import type { SavingsGoal } from "@/features/dashboard/mockData";
import { Button } from "@/components/ui/button";
import { ProgressBar, toneBgSoft, toneText } from "./progress-bar";

export function SavingsGoalCard({ goal }: { goal: SavingsGoal }) {
  return (
    <article className="flex min-h-[500px] min-w-[320px] flex-col rounded-2xl border border-border bg-panel p-6">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${toneBgSoft(goal.tone)}`}>
          {goal.icon}
        </div>
        <div className="text-right">
          <p className="rounded-lg bg-panel-soft px-3 py-1 text-xs font-bold text-muted">
            {goal.targetDate}
          </p>
          <p className={`mt-2 text-xs font-black ${toneText(goal.tone)}`}>
            {goal.autoSave}
          </p>
        </div>
      </div>
      <h2 className="mt-6 text-xl font-black text-white">{goal.name}</h2>
      <p className={`mt-1 text-lg font-black ${toneText(goal.tone)}`}>
        {goal.saved} <span className="text-sm text-muted">of {goal.target}</span>
      </p>
      <div className="mt-4">
        <ProgressBar value={goal.percent} tone={goal.tone} />
        <div className="mt-2 flex justify-between text-xs font-bold text-muted">
          <span>€0</span>
          <span className={toneText(goal.tone)}>{goal.percent}%</span>
          <span>{goal.target}</span>
        </div>
      </div>
      <div className="mt-5 flex-1 rounded-xl bg-panel-soft p-4">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-muted">
          Projection — 12 months
        </p>
        <div className="mt-7 h-20 rounded-lg border-b border-l border-border">
          <div className={`h-0.5 translate-y-10 rotate-[-7deg] ${goal.tone === "danger" ? "bg-danger" : goal.tone === "primary" ? "bg-primary" : "bg-success"}`} />
        </div>
        <p className={`mt-5 text-xs font-black ${toneText(goal.tone)}`}>
          {goal.projection}
        </p>
      </div>
      <Button className={`mt-5 w-full ${goal.tone === "danger" ? "bg-danger" : goal.tone === "success" ? "bg-success" : ""}`}>
        + Add Money
      </Button>
    </article>
  );
}
