import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/dashboard/app-shell";
import { getOverviewData } from "@/features/overview/services/overviewService";
import { getDebtData } from "@/features/debt/services/debtService";
import { getSavingsData } from "@/features/savings/services/savingsService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* ── Static SVG charts (decorative, no user data) ── */
function AreaChart() {
  const series = [3.2, 3.0, 3.4, 3.9, 4.6, 5.1, 5.4, 6.0, 6.4, 6.9, 7.3, 7.8];
  const months = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
  const W = 760, H = 200, pad = { l: 0, r: 0, t: 16, b: 26 };
  const max = Math.max(...series) * 1.1;
  const xs = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / (series.length - 1);
  const ys = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const path = series.map((v, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(" ");
  const area = path + ` L ${xs(series.length - 1)} ${H - pad.b} L ${xs(0)} ${H - pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 240, display: "block" }}>
      <defs>
        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.66 0.18 282 / 0.45)" />
          <stop offset="100%" stopColor="oklch(0.66 0.18 282 / 0)" />
        </linearGradient>
        <linearGradient id="lineStroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="oklch(0.78 0.16 282)" />
          <stop offset="100%" stopColor="oklch(0.78 0.14 250)" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => {
        const y = pad.t + (H - pad.t - pad.b) * t;
        return <line key={i} x1="0" x2={W} y1={y} y2={y} stroke="oklch(1 0 0 / 0.05)" />;
      })}
      <path d={area} fill="url(#areaFill)" />
      <path d={path} fill="none" stroke="url(#lineStroke)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {months.map((m, i) => (
        <text key={m} x={xs(i)} y={H - 6} fontSize="10.5" textAnchor="middle"
          fontFamily="var(--font-geist-mono, monospace)" fill="oklch(0.48 0.014 280)">{m}</text>
      ))}
    </svg>
  );
}

function DebtMiniRow({ name, apr, balance }: {
  name: string; apr: string; balance: string;
}) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 480 }}>{name}</span>
          <span className="pill">{apr} APR</span>
        </div>
        <span className="mono f-sm muted">{balance}</span>
      </div>
    </div>
  );
}

function GoalMiniRow({ name, cur, target, pct }: {
  name: string; cur: string; target: string; pct: number;
}) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 480 }}>{name}</span>
        <span className="mono f-sm">
          <span style={{ color: "var(--fg)" }}>{cur}</span>
          <span className="muted"> / {target}</span>
        </span>
      </div>
      <div className="pb success"><i style={{ width: pct + "%" }} /></div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();

  const [overview, debtData, savingsData] = await Promise.all([
    getOverviewData({ userId: session.userId }),
    getDebtData({ userId: session.userId }),
    getSavingsData({ userId: session.userId }),
  ]);

  // Activity log (most recent 4 entries)
  let wins: { title: string; meta: string; xp: string }[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from("activity_logs")
        .select("title, description, occurred_at")
        .eq("user_id", session.userId)
        .order("occurred_at", { ascending: false })
        .limit(4);
      if (data) {
        wins = data.map((row) => ({
          title: row.title as string,
          meta: new Date(row.occurred_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          xp: "+XP",
        }));
      }
    }
  } catch {}

  // Map overview items by id
  const byId = Object.fromEntries(overview.items.map((item) => [item.id, item.value ?? 0]));
  const income = byId["income"] ?? 0;
  const totalDebt = byId["total_debt"] ?? 0;
  const totalSaved = byId["total_saved"] ?? 0;
  const spentMonth = byId["spent_month"] ?? 0;

  const greeting = session.displayName ?? session.email?.split("@")[0] ?? "there";
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  type MetricItem = { label: string; val: string; delta: string; accent: boolean };
  const primaryMetrics: MetricItem[] = [
    { label: "Monthly income",   val: formatCurrency(income),     delta: income > 0 ? "From your profile" : "Set in onboarding",           accent: true  },
    { label: "Total debt",       val: formatCurrency(totalDebt),  delta: totalDebt > 0 ? `${debtData.items.length} accounts` : "No debt tracked", accent: false },
    { label: "Total saved",      val: formatCurrency(totalSaved), delta: totalSaved > 0 ? `${savingsData.goals.length} goals` : "Start a savings goal", accent: false },
    { label: "Spent this month", val: formatCurrency(spentMonth), delta: income > 0 ? `${Math.round((spentMonth / income) * 100)}% of income` : "—", accent: false },
  ];

  return (
    <AppShell active="overview">
      {/* Greeting */}
      <div className="greeting">
        <div>
          <h1>Good {timeOfDay}, {greeting} <span className="wave">✦</span></h1>
          <div className="meta" style={{ marginTop: 6 }}>
            <Link href={"/dashboard/import" as Route} style={{ color: "var(--primary-glow)", textDecoration: "none" }}>
              Import transactions
            </Link>
          </div>
        </div>
      </div>

      {/* Primary metrics */}
      <div className="metrics">
        {primaryMetrics.map(({ label, val, delta, accent }) => (
          <div key={label} className={`metric${accent ? " accent" : ""}`}>
            <div className="lbl">{label}</div>
            <div className="val">{val}</div>
            <span className="delta neut">{delta}</span>
          </div>
        ))}
      </div>

      {/* Hero chart */}
      <div className="g-12" style={{ marginTop: 16 }}>
        <div className="card hero-chart-card" style={{ gridColumn: "span 12" }}>
          <div className="card-head">
            <div>
              <div className="card-title">Savings trajectory</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Illustrative — import data to personalize</div>
            </div>
          </div>
          <AreaChart />
        </div>
      </div>

      {/* Where you're at */}
      <div className="section-hd">
        <h2>Where you&apos;re at</h2>
      </div>

      <div className="g-2">
        {/* Debt overview */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Debt overview</div>
            <Link href="/dashboard/debt" className="card-sub" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>
              See all →
            </Link>
          </div>
          {debtData.items.length === 0 ? (
            <div className="muted f-sm" style={{ padding: "24px 0", textAlign: "center" }}>
              No debts tracked. <Link href="/dashboard/debt" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>Add one →</Link>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div className="muted f-xs">Total balance</div>
                  <div className="mono" style={{ fontSize: 24, letterSpacing: "-0.025em" }}>
                    {formatCurrency(debtData.computed.totalBalance)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="muted f-xs">Debt-free est.</div>
                  <div className="mono" style={{ fontSize: 14, color: "var(--success)" }}>
                    {debtData.computed.debtFreeDate}
                  </div>
                </div>
              </div>
              {debtData.items.slice(0, 3).map((d) => (
                <DebtMiniRow
                  key={d.id}
                  name={d.label}
                  apr={`${(d.interestRate * 100).toFixed(1)}%`}
                  balance={formatCurrency(d.principal)}
                />
              ))}
            </>
          )}
        </div>

        {/* Savings progress */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Savings progress</div>
            <Link href="/dashboard/savings" className="card-sub" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>
              See all →
            </Link>
          </div>
          {savingsData.goals.length === 0 ? (
            <div className="muted f-sm" style={{ padding: "24px 0", textAlign: "center" }}>
              No savings goals yet. <Link href="/dashboard/savings" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>Start one →</Link>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div className="muted f-xs">Total saved</div>
                  <div className="mono" style={{ fontSize: 24, letterSpacing: "-0.025em" }}>
                    {formatCurrency(savingsData.computed.totalSaved)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="muted f-xs">Monthly total</div>
                  <div className="mono" style={{ fontSize: 14 }}>
                    {formatCurrency(savingsData.computed.monthlyTotal)}
                  </div>
                </div>
              </div>
              {savingsData.goals.slice(0, 3).map((g) => (
                <GoalMiniRow
                  key={g.id}
                  name={g.label}
                  cur={formatCurrency(g.current)}
                  target={formatCurrency(g.target)}
                  pct={g.pctComplete}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Recent wins */}
      {wins.length > 0 && (
        <>
          <div className="section-hd">
            <h2>Recent activity</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {wins.map((w, i) => (
              <div key={i} className="win">
                <div className="ico">✦</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="win-title">{w.title}</div>
                  <div className="win-meta">{w.meta}</div>
                </div>
                <span className="xp">{w.xp}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
