import { AppShell } from "@/components/dashboard/app-shell";
import { getBudgetData } from "@/features/budget/services/budgetService";
import { requireSession } from "@/server/dal/session";

const DEMO_CATEGORIES = [
  { name: "Housing",       spent: 1280, budget: 1300, kind: "Needs", trend: [3,4,4,3,5,4,5,4,5,5,5,5], delta: -2  },
  { name: "Food",          spent:  412, budget:  480, kind: "Needs", trend: [2,3,2,4,3,5,3,4,5,4,3,4], delta: +8  },
  { name: "Transport",     spent:  184, budget:  220, kind: "Needs", trend: [3,2,3,2,2,3,2,3,2,3,2,2], delta: -4  },
  { name: "Entertainment", spent:  178, budget:  150, kind: "Wants", trend: [1,2,3,2,4,3,5,4,5,4,3,5], delta: +19 },
  { name: "Clothing",      spent:   92, budget:  120, kind: "Wants", trend: [2,1,2,3,2,1,2,3,2,2,1,2], delta: -10 },
  { name: "Health",        spent:  195, budget:  200, kind: "Needs", trend: [3,3,4,3,4,3,3,4,3,3,4,3], delta: +1  },
];

const DEMO_SPLIT = [
  { key: "Needs",     allocated: 2400, target: 2125, color: "oklch(0.66 0.18 282)" },
  { key: "Wants",     allocated: 1100, target: 1275, color: "oklch(0.80 0.13 82)"  },
  { key: "Save/Debt", allocated:  750, target:  850, color: "oklch(0.73 0.13 152)" },
];

function Spark({ data, delta }: { data: number[]; delta: number }) {
  const max = Math.max(...data);
  const W = 90, H = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H + 2}`).join(" ");
  const positive = delta < 0;
  const color = positive ? "oklch(0.73 0.13 152)" : "oklch(0.80 0.13 82)";
  return (
    <div className="row gap-8">
      <svg viewBox={`0 0 ${W} ${H + 2}`} style={{ width: 80, height: H + 2, display: "block" }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="mono f-xs" style={{ color, minWidth: 32 }}>
        {delta > 0 ? "+" : ""}{delta}%
      </span>
    </div>
  );
}

function CategoryRow({ c }: { c: typeof DEMO_CATEGORIES[number] }) {
  const pct = Math.round((c.spent / c.budget) * 100);
  const pbTone = pct > 100 ? "danger" : pct > 90 ? "warn" : "success";
  const catIco: Record<string, React.ReactNode> = {
    Housing:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Food:          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    Transport:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    Entertainment: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    Clothing:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>,
    Health:        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  };
  const typePct = c.kind === "Needs" ? "50%" : c.kind === "Wants" ? "30%" : "20%";

  return (
    <tr>
      <td>
        <div className="row gap-12">
          <span className="cat-ico">{catIco[c.name] ?? null}</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 480 }}>{c.name}</div>
            <div className="f-xs muted">{c.kind}</div>
          </div>
        </div>
      </td>
      <td className="muted f-sm">{typePct}</td>
      <td style={{ width: 120 }}><Spark data={c.trend} delta={c.delta} /></td>
      <td className="num" style={{ textAlign: "right", fontSize: 13.5 }}>${c.spent}</td>
      <td className="num muted" style={{ textAlign: "right", fontSize: 13 }}>${c.budget}</td>
      <td style={{ width: 200 }}>
        <div className="row between" style={{ marginBottom: 4 }}>
          <span className="mono f-xs muted">{pct}%</span>
          <span className="mono f-xs muted">${c.budget - c.spent} left</span>
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
  const { categories: live } = await getBudgetData({ userId: session.userId });

  const cats = live.length > 0
    ? live.map(c => ({
        name: c.label, spent: c.spent, budget: c.allocated,
        kind: "Needs" as const, trend: [3,3,3,3,3,3,3,3,3,3,3,3], delta: 0,
      }))
    : DEMO_CATEGORIES;

  const income    = 4250;
  const spent     = cats.reduce((s, c) => s + c.spent, 0);
  const budgeted  = cats.reduce((s, c) => s + c.budget, 0);
  const leftover  = income - spent;

  // PaceArc geometry
  const W = 220, H = 120, cx = W / 2, cy = H - 8, r = 90;
  const pctSpent = Math.min(spent / budgeted, 1);
  const dayPct   = 17 / 31;
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
          <div className="sub">May 2026 · You&apos;re on a calm, sustainable pace.</div>
        </div>
        <div className="row gap-8">
          <div className="seg">
            <button className="on" type="button">May</button>
            <button type="button">Apr</button>
            <button type="button">Mar</button>
          </div>
          <button className="btn ghost" type="button">Adjust plan</button>
          <button className="btn primary" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add category
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics">
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </span>
            Income
          </div>
          <div className="val">${income.toLocaleString()}</div>
          <span className="delta neut">Bi-weekly · 2 deposits</span>
        </div>
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </span>
            Spent
          </div>
          <div className="val">
            ${Math.floor(spent).toLocaleString()}<span className="cents">.{((spent * 100) % 100).toFixed(0).padStart(2, "0")}</span>
          </div>
          <span className="delta neut">55% of income · 17 days in</span>
        </div>
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </span>
            Budgeted
          </div>
          <div className="val">${budgeted.toLocaleString()}</div>
          <span className="delta neut">{Math.round((budgeted / income) * 100)}% of income</span>
        </div>
        <div className="metric accent">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </span>
            Leftover
          </div>
          <div className="val">
            ${Math.floor(leftover).toLocaleString()}<span className="cents">.{((leftover * 100) % 100).toFixed(0).padStart(2, "0")}</span>
          </div>
          <span className="delta up">↑ Auto-saving 60% of this</span>
        </div>
      </div>

      {/* 50/30/20 + Pace */}
      <div className="g-12" style={{ marginTop: 16 }}>
        <div className="card" style={{ gridColumn: "span 8" }}>
          <div className="card-head">
            <div>
              <div className="card-title">50 / 30 / 20 balance</div>
              <div className="card-sub">How your plan splits — vs the classic rule</div>
            </div>
            <span className="pill">✦ Close to target</span>
          </div>

          {/* Stacked bar */}
          <div>
            <div style={{ display: "flex", height: 32, borderRadius: 10, overflow: "hidden", boxShadow: "inset 0 0 0 1px var(--line)" }}>
              {DEMO_SPLIT.map((s, i) => (
                <div key={i} style={{
                  flex: s.allocated,
                  background: `linear-gradient(180deg, ${s.color}, oklch(from ${s.color} calc(l - 0.06) c h))`,
                  display: "grid", placeItems: "center",
                }}>
                  <span className="mono" style={{ fontSize: 11.5, color: "oklch(0.98 0 0 / 0.92)" }}>
                    ${s.allocated.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              {DEMO_SPLIT.map((s, i) => (
                <div key={i} className="row gap-8" style={{ flex: s.target, fontSize: 11.5, color: "var(--fg-mute)" }}>
                  <span style={{ height: 6, width: 2, background: "var(--line-strong)" }} />
                  <span>target {[50, 30, 20][i]}% · ${s.target.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="g-3" style={{ marginTop: 18 }}>
            {DEMO_SPLIT.map((s) => {
              const diff = s.allocated - s.target;
              const ok   = Math.abs(diff) < 60;
              return (
                <div key={s.key} style={{ paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <div className="row gap-8" style={{ marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 9, background: s.color }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{s.key}</span>
                    <span className="muted f-xs" style={{ marginLeft: "auto" }}>{Math.round((s.allocated / income) * 100)}%</span>
                  </div>
                  <div className="mono" style={{ fontSize: 20, letterSpacing: "-0.025em" }}>${s.allocated.toLocaleString()}</div>
                  <div className="f-xs" style={{ color: ok ? "var(--success)" : "var(--warn)", marginTop: 4 }}>
                    {diff === 0 ? "on target" : `${diff > 0 ? "+" : ""}${diff} vs target`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pace arc */}
        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-head">
            <div className="card-title">Pace this month</div>
            <span className="muted f-xs">Day 17 / 31</span>
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
              <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="20" letterSpacing="-0.03em" fill="oklch(0.97 0 0)">
                ${Math.round(spent).toLocaleString()} / ${budgeted.toLocaleString()}
              </text>
            </svg>
            <div className="row gap-12" style={{ fontSize: 11, color: "var(--fg-mute)", marginTop: -4 }}>
              <span className="row gap-8">
                <span style={{ width: 8, height: 8, borderRadius: 9, background: "linear-gradient(90deg, oklch(0.66 0.18 282), oklch(0.80 0.13 82))" }} />
                Spend so far
              </span>
              <span className="row gap-8">
                <span style={{ width: 2, height: 10, background: "oklch(0.95 0 0 / 0.5)" }} />
                Today
              </span>
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Daily safe-to-spend", value: "$56",           sub: "Stays within budget", tone: null  },
              { label: "Best week so far",    value: "Week 2",        sub: "−$84 vs plan",        tone: null  },
              { label: "Watch out for",       value: "Entertainment", sub: "+19% vs target",      tone: "warn" },
            ].map(({ label, value, sub, tone }) => (
              <div key={label} className="row between">
                <div style={{ minWidth: 0 }}>
                  <div className="f-xs muted">{label}</div>
                  <div className="f-sm" style={{ fontWeight: 500, color: tone === "warn" ? "var(--warn)" : "var(--fg)" }}>{value}</div>
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
        <div className="row gap-8">
          <span className="muted f-xs">Sorted by spend</span>
          <button className="btn sm ghost" type="button">Filter</button>
        </div>
      </div>
      <div className="card flat" style={{ padding: "4px 4px", overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Category</th><th>Type</th><th>Trend</th>
              <th style={{ textAlign: "right" }}>Spent</th>
              <th style={{ textAlign: "right" }}>Budget</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c, i) => <CategoryRow key={i} c={c} />)}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
