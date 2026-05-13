import { AppShell } from "@/components/dashboard/app-shell";
import { getBudgetData } from "@/features/budget/services/budgetService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";
import { captureServerEvent, events } from "@/observability/posthog";

function CategoryRow({ c }: { c: { label: string; allocated: number; spent: number } }) {
  const pct = c.allocated > 0 ? Math.round((c.spent / c.allocated) * 100) : 0;
  const pbTone = pct > 100 ? "danger" : pct > 90 ? "warn" : "success";
  return (
    <tr>
      <td><span style={{ fontSize: 13.5, fontWeight: 480 }}>{c.label}</span></td>
      <td className="num" style={{ textAlign: "right", fontSize: 13.5 }}>{formatCurrency(c.spent)}</td>
      <td className="num muted" style={{ textAlign: "right", fontSize: 13 }}>{formatCurrency(c.allocated)}</td>
      <td style={{ width: 200 }}>
        <div className="row between" style={{ marginBottom: 4 }}>
          <span className="mono f-xs muted">{pct}%</span>
          <span className="mono f-xs muted">{formatCurrency(c.allocated - c.spent)} left</span>
        </div>
        <div className={`pb ${pbTone}`}>
          <i style={{ width: Math.min(pct, 100) + "%" }} />
        </div>
      </td>
    </tr>
  );
}

export default async function BudgetPage() {
  const session = await requireSession();
  await captureServerEvent({ distinctId: session.userId, event: events.budgetPageViewed, properties: {} });
  const { income, categories, computed } = await getBudgetData({ userId: session.userId });

  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayPct = dayOfMonth / daysInMonth;
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Pace arc geometry
  const W = 220, H = 120, cx = W / 2, cy = H - 8, r = 90;
  const pctSpent = computed.totalAllocated > 0
    ? Math.min(computed.totalSpent / computed.totalAllocated, 1)
    : 0;
  function arcPt(p: number) {
    const a = Math.PI - p * Math.PI;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  }
  function arcPath(p: number) {
    const start = arcPt(0); const end = arcPt(p);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  }
  const valPt = arcPt(pctSpent);

  return (
    <AppShell active="budget">
      <div className="page-hd">
        <div>
          <h1>Budget</h1>
          <div className="sub">{monthLabel}</div>
        </div>
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="lbl">Income</div>
          <div className="val">{formatCurrency(income)}</div>
          <span className="delta neut">{income > 0 ? "From your profile" : "Set in onboarding"}</span>
        </div>
        <div className="metric">
          <div className="lbl">Spent</div>
          <div className="val">{formatCurrency(computed.totalSpent)}</div>
          <span className="delta neut">{computed.percentSpent}% of income · day {dayOfMonth}</span>
        </div>
        <div className="metric">
          <div className="lbl">Budgeted</div>
          <div className="val">{formatCurrency(computed.totalAllocated)}</div>
          <span className="delta neut">{income > 0 ? `${Math.round((computed.totalAllocated / income) * 100)}% of income` : "—"}</span>
        </div>
        <div className="metric accent">
          <div className="lbl">Surplus / Deficit</div>
          <div className="val">{formatCurrency(Math.abs(computed.surplusDeficit))}</div>
          <span className={`delta ${computed.surplusDeficit >= 0 ? "up" : "down"}`}>
            {computed.surplusDeficit >= 0 ? "↑ Surplus" : "↓ Deficit"}
          </span>
        </div>
      </div>

      {/* Pace arc */}
      <div className="g-12" style={{ marginTop: 16 }}>
        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-head">
            <div className="card-title">Pace this month</div>
            <span className="muted f-xs">Day {dayOfMonth} / {daysInMonth}</span>
          </div>
          <div style={{ display: "grid", placeItems: "center", padding: "4px 0 0" }}>
            <svg viewBox={`0 0 ${W} ${H + 8}`} style={{ width: "100%" }}>
              <defs>
                <linearGradient id="gauge" x1="0" x2="1">
                  <stop offset="0%" stopColor="oklch(0.66 0.18 282)" />
                  <stop offset="100%" stopColor="oklch(0.80 0.13 82)" />
                </linearGradient>
              </defs>
              <path d={arcPath(1)} fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="10" strokeLinecap="round" />
              <path d={arcPath(pctSpent)} fill="none" stroke="url(#gauge)" strokeWidth="10" strokeLinecap="round" />
              <line
                x1={cx + (r - 12) * Math.cos(Math.PI - dayPct * Math.PI)}
                y1={cy - (r - 12) * Math.sin(Math.PI - dayPct * Math.PI)}
                x2={cx + (r + 12) * Math.cos(Math.PI - dayPct * Math.PI)}
                y2={cy - (r + 12) * Math.sin(Math.PI - dayPct * Math.PI)}
                stroke="oklch(0.95 0 0 / 0.5)" strokeWidth="1.5"
              />
              <circle cx={valPt.x} cy={valPt.y} r="5" fill="oklch(0.97 0 0)" />
              <text x={cx} y={cy - 28} textAnchor="middle" fontSize="11" fill="oklch(0.62 0.012 280)">Spent / Budgeted</text>
              <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="18" letterSpacing="-0.03em" fill="oklch(0.97 0 0)">
                {Math.round(computed.totalSpent).toLocaleString()} / {computed.totalAllocated.toLocaleString()}
              </text>
            </svg>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 8" }}>
          <div className="card-head">
            <div className="card-title">Summary</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Savings rate", value: `${computed.savingsRate}%`, sub: "of income unspent" },
              { label: "Categories tracked", value: String(categories.length), sub: "this month" },
              { label: "Days remaining", value: String(daysInMonth - dayOfMonth), sub: "in this month" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="row between">
                <div>
                  <div className="f-xs muted">{label}</div>
                  <div className="f-sm" style={{ fontWeight: 500 }}>{value}</div>
                </div>
                <div className="f-xs muted" style={{ textAlign: "right" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories table */}
      <div className="section-hd">
        <h2>Categories</h2>
        <span className="muted f-xs">This month</span>
      </div>

      {categories.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div className="card-title" style={{ marginBottom: 8 }}>No categories this month</div>
          <div className="muted f-sm">Import transactions to populate your budget automatically.</div>
        </div>
      ) : (
        <div className="card flat" style={{ padding: "4px 4px", overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Spent</th>
                <th style={{ textAlign: "right" }}>Budget</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => <CategoryRow key={c.id} c={c} />)}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
