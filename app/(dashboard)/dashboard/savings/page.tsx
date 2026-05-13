import { AppShell } from "@/components/dashboard/app-shell";
import { getSavingsData } from "@/features/savings/services/savingsService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";
import { captureServerEvent, events } from "@/observability/posthog";
import { AddMoneyForm } from "@/components/dashboard/add-money-form";
import { SavingsGoalForm } from "@/components/dashboard/savings-goal-form";
import type { SavingsResponse } from "@/features/savings/services/savingsSchema";

type SavingsGoal = SavingsResponse["goals"][number];

const GOAL_COLORS = [
  { g1: "oklch(0.45 0.13 152)", g2: "oklch(0.30 0.08 200)" },
  { g1: "oklch(0.42 0.11 282)", g2: "oklch(0.30 0.10 240)" },
  { g1: "oklch(0.48 0.12 50)",  g2: "oklch(0.35 0.10 28)"  },
];

function GoalCard({ g, idx }: { g: SavingsGoal; idx: number }) {
  const colors = GOAL_COLORS[idx % GOAL_COLORS.length];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="goal-art" style={{ background: `linear-gradient(135deg, ${colors.g1}, ${colors.g2})` }}>
        <div className="ribbon">
          <span className="dot" style={{ background: "oklch(0.95 0.005 280)" }} />
          ETA {g.etaDate}
        </div>
        <div style={{ position: "absolute", left: 14, bottom: 12, fontSize: 16, fontWeight: 520, letterSpacing: "-0.02em" }}>
          {g.label}
        </div>
        <div style={{ position: "absolute", right: 14, bottom: 14, fontFamily: "var(--font-mono)", fontSize: 12, color: "oklch(0.95 0 0 / 0.85)" }}>
          {g.pctComplete}%
        </div>
      </div>

      <div className="row between mt-8" style={{ alignItems: "baseline" }}>
        <span className="mono" style={{ fontSize: 22, letterSpacing: "-0.025em" }}>
          {formatCurrency(g.current)}
        </span>
        <span className="mono f-xs muted">of {formatCurrency(g.target)}</span>
      </div>
      <div className="pb success" style={{ marginTop: 6 }}>
        <i style={{ width: g.pctComplete + "%" }} />
      </div>

      <div className="row between mt-16">
        <div>
          <div className="muted f-xs">Monthly</div>
          <div className="mono f-sm">{formatCurrency(g.monthlyContribution)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="muted f-xs">Remaining</div>
          <div className="mono f-sm">{formatCurrency(g.remaining)}</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <AddMoneyForm goalId={g.id} goalLabel={g.label} />
      </div>
    </div>
  );
}

export default async function SavingsPage() {
  const session = await requireSession();
  await captureServerEvent({ distinctId: session.userId, event: events.savingsPageViewed, properties: {} });
  const { goals, computed } = await getSavingsData({ userId: session.userId });

  return (
    <AppShell active="savings">
      <div className="page-hd">
        <div>
          <h1>Savings</h1>
          <div className="sub">{goals.length > 0 ? `${goals.length} active goal${goals.length !== 1 ? "s" : ""}` : "Start your first goal"}</div>
        </div>
        <SavingsGoalForm />
      </div>

      <div className="metrics">
        <div className="metric accent">
          <div className="lbl">Total saved</div>
          <div className="val">{formatCurrency(computed.totalSaved)}</div>
          <span className="delta up">{goals.length} goal{goals.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="metric">
          <div className="lbl">Target</div>
          <div className="val">{formatCurrency(computed.totalTarget)}</div>
          <span className="delta neut">Across all goals</span>
        </div>
        <div className="metric">
          <div className="lbl">Remaining</div>
          <div className="val">{formatCurrency(computed.totalRemaining)}</div>
          <span className="delta neut">To reach all targets</span>
        </div>
        <div className="metric">
          <div className="lbl">Monthly contribution</div>
          <div className="val">{formatCurrency(computed.monthlyTotal)}</div>
          <span className="delta neut">Estimated total</span>
        </div>
      </div>

      <div className="section-hd">
        <h2>Your goals</h2>
      </div>

      {goals.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div className="card-title" style={{ marginBottom: 8 }}>No savings goals yet</div>
          <div className="muted f-sm" style={{ marginBottom: 16 }}>Create your first goal to start tracking progress.</div>
          <SavingsGoalForm />
        </div>
      ) : (
        <div className="g-3">
          {goals.map((g, i) => <GoalCard key={g.id} g={g} idx={i} />)}
        </div>
      )}
    </AppShell>
  );
}
