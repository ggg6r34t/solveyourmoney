import { AppShell } from "@/components/dashboard/app-shell";
import { getSavingsData } from "@/features/savings/services/savingsService";
import { requireSession } from "@/server/dal/session";

type GoalData = {
  ico: string; name: string; tag: string;
  target: number; cur: number; monthly: number; eta: string;
  g1: string; g2: string;
};

const DEMO_GOALS: GoalData[] = [
  { ico: "shield", name: "Emergency Fund", tag: "3 months of expenses", target: 3000, cur: 2140, monthly: 180, eta: "Sep 2026", g1: "oklch(0.45 0.13 152)", g2: "oklch(0.30 0.08 200)" },
  { ico: "laptop", name: "New Laptop",     tag: "M4 MacBook Air",       target: 1400, cur:  640, monthly:  80, eta: "Jan 2027", g1: "oklch(0.42 0.11 282)", g2: "oklch(0.30 0.10 240)" },
  { ico: "plane",  name: "Lisbon, July",   tag: "Flight + 8 nights",    target: 1800, cur: 1404, monthly:  60, eta: "Jun 2026", g1: "oklch(0.48 0.12 50)",  g2: "oklch(0.35 0.10 28)"  },
];

const GOAL_ICONS: Record<string, React.ReactNode> = {
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  laptop: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  plane:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 3.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
};

function GoalCard({ g }: { g: GoalData }) {
  const pct = Math.round((g.cur / g.target) * 100);
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="goal-art" style={{ background: `linear-gradient(135deg, ${g.g1}, ${g.g2})` }}>
        <div className="ribbon">
          <span className="dot" style={{ background: "oklch(0.95 0.005 280)" }} />
          ETA {g.eta}
        </div>
        <div style={{ position: "absolute", right: 14, top: 14 }}>
          <div className="cat-ico" style={{ background: "oklch(0 0 0 / 0.35)", color: "oklch(0.98 0 0)", width: 36, height: 36, borderRadius: 10 }}>
            {GOAL_ICONS[g.ico]}
          </div>
        </div>
        <div style={{ position: "absolute", left: 14, bottom: 12, fontSize: 16, fontWeight: 520, letterSpacing: "-0.02em" }}>
          {g.name}
        </div>
        <div style={{ position: "absolute", right: 14, bottom: 14, fontFamily: "var(--font-mono)", fontSize: 12, color: "oklch(0.95 0 0 / 0.85)" }}>
          {pct}%
        </div>
      </div>

      <div className="muted f-xs">{g.tag}</div>
      <div className="row between mt-8" style={{ alignItems: "baseline" }}>
        <span className="mono" style={{ fontSize: 22, letterSpacing: "-0.025em" }}>
          ${g.cur.toLocaleString()}
        </span>
        <span className="mono f-xs muted">of ${g.target.toLocaleString()}</span>
      </div>
      <div className="pb success" style={{ marginTop: 6 }}>
        <i style={{ width: pct + "%" }} />
      </div>

      <div className="row between mt-16">
        <div>
          <div className="muted f-xs">Monthly</div>
          <div className="mono f-sm">${g.monthly}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="muted f-xs">Remaining</div>
          <div className="mono f-sm">${(g.target - g.cur).toLocaleString()}</div>
        </div>
      </div>

      <div className="row gap-8" style={{ marginTop: 14 }}>
        <button className="btn primary" type="button" style={{ flex: 1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add money
        </button>
        <button className="btn ghost" type="button">···</button>
      </div>
    </div>
  );
}

export default async function SavingsPage() {
  const session = await requireSession();
  const { goals: live } = await getSavingsData({ userId: session.userId });

  const goals: GoalData[] = live.length > 0
    ? live.map((g, i) => ({
        ico: ["shield","laptop","plane"][i % 3],
        name: g.label, tag: "", target: g.target, cur: g.current,
        monthly: Math.round(g.target * 0.05), eta: "Dec 2026",
        g1: DEMO_GOALS[i % 3].g1, g2: DEMO_GOALS[i % 3].g2,
      }))
    : DEMO_GOALS;

  const totalSaved   = goals.reduce((s, g) => s + g.cur, 0);
  const totalTarget  = goals.reduce((s, g) => s + g.target, 0);
  const totalRemain  = totalTarget - totalSaved;
  const monthlyAuto  = goals.reduce((s, g) => s + g.monthly, 0);

  // Projection chart data
  const real = [3.2,3.4,3.5,3.6,3.8,3.9,4.0,4.05,4.10,4.13,4.16,4.18];
  const proj = [4.18,4.46,4.74,5.02,5.30,5.58,5.86,6.14];
  const all  = [...real, ...proj.slice(1)];
  const CW = 760, CH = 200, pad = { t: 12, b: 26 };
  const maxV = Math.max(...all) * 1.1;
  const xs = (i: number) => (CW * i) / (all.length - 1);
  const ys = (v: number) => pad.t + (CH - pad.t - pad.b) * (1 - v / maxV);
  const realPath = real.map((v, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(" ");
  const projPath = proj.map((v, i) => `${i === 0 ? "M" : "L"} ${xs(i + real.length - 1).toFixed(1)} ${ys(v).toFixed(1)}`).join(" ");
  const realArea = realPath + ` L ${xs(real.length - 1)} ${CH - pad.b} L ${xs(0)} ${CH - pad.b} Z`;
  const chartMonths = ["J","J","A","S","O","N","D","J","F","M","A","M","J","J","A","S","O","N","D"];

  const boostGoals = [
    { ico: "shield", name: "Emergency Fund", diff: "−2 months",      pct: 71, done: false },
    { ico: "laptop", name: "New Laptop",     diff: "−1 month",       pct: 45, done: false },
    { ico: "plane",  name: "Lisbon, July",   diff: "hit target now", pct: 78, done: true  },
  ];

  return (
    <AppShell active="savings">
      <div className="page-hd">
        <div>
          <h1>Savings</h1>
          <div className="sub">Three goals, one quiet plan.</div>
        </div>
        <div className="row gap-8">
          <button className="btn ghost" type="button">Adjust auto-save</button>
          <button className="btn primary" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New goal
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics">
        <div className="metric accent">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </span>
            Total saved
          </div>
          <div className="val">
            ${Math.floor(totalSaved).toLocaleString()}
            <span className="cents">.{((totalSaved * 100) % 100).toFixed(0).padStart(2, "0")}</span>
          </div>
          <span className="delta up">↑ +$612 this month</span>
        </div>
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </span>
            Target
          </div>
          <div className="val">${totalTarget.toLocaleString()}</div>
          <span className="delta neut">Across {goals.length} goals</span>
        </div>
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </span>
            Remaining
          </div>
          <div className="val">
            ${Math.floor(totalRemain).toLocaleString()}
            <span className="cents">.{((totalRemain * 100) % 100).toFixed(0).padStart(2, "0")}</span>
          </div>
          <span className="delta neut">~6 months at current pace</span>
        </div>
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </span>
            Monthly auto-save
          </div>
          <div className="val">${monthlyAuto}</div>
          <span className="delta up">↑ +$20 from last month</span>
        </div>
      </div>

      <div className="section-hd">
        <h2>Your goals</h2>
        <span className="sub">Drag to reorder priority</span>
      </div>

      <div className="g-3">
        {goals.map((g, i) => <GoalCard key={i} g={g} />)}
      </div>

      {/* Projection + Boost */}
      <div className="g-12" style={{ marginTop: 24 }}>
        <div className="card" style={{ gridColumn: "span 8" }}>
          <div className="card-head">
            <div className="card-title">Projected balance</div>
            <div className="row gap-8">
              <span className="pill">
                <span style={{ width: 8, height: 8, borderRadius: 9, background: "var(--success)" }} />
                Saved
              </span>
              <span className="pill">
                <span style={{ width: 8, height: 8, borderRadius: 9, background: "oklch(0.66 0.18 282 / 0.6)" }} />
                Projection
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${CW} ${CH}`} style={{ width: "100%", height: 230 }}>
            <defs>
              <linearGradient id="saveFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.73 0.13 152 / 0.35)" />
                <stop offset="100%" stopColor="oklch(0.73 0.13 152 / 0)" />
              </linearGradient>
            </defs>
            <path d={realArea} fill="url(#saveFill)" />
            <path d={realPath} fill="none" stroke="oklch(0.78 0.14 152)" strokeWidth="1.8" strokeLinecap="round" />
            <path d={projPath} fill="none" stroke="oklch(0.78 0.16 282)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="4 5" />
            <line x1={xs(real.length - 1)} x2={xs(real.length - 1)} y1={pad.t} y2={CH - pad.b} stroke="oklch(1 0 0 / 0.15)" strokeDasharray="3 3" />
            <text x={xs(real.length - 1) + 6} y={pad.t + 12} fontSize="10.5" fill="oklch(0.62 0.012 280)" fontFamily="var(--font-mono)">Today</text>
            <line x1="0" x2={CW} y1={ys(6.2)} y2={ys(6.2)} stroke="oklch(0.73 0.13 152 / 0.35)" strokeDasharray="3 4" />
            <text x={CW - 80} y={ys(6.2) - 6} fontSize="10.5" fill="oklch(0.85 0.10 152)" fontFamily="var(--font-mono)">Target $6.2k</text>
            {chartMonths.map((m, i) => (
              <text key={i} x={xs(i)} y={CH - 8} fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)" fill="oklch(0.48 0.014 280)">{m}</text>
            ))}
          </svg>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-head">
            <div className="card-title">If you saved a little more</div>
            <span className="pill primary">+$50/mo</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {boostGoals.map((b, i) => (
              <div key={i}>
                <div className="row between" style={{ marginBottom: 6 }}>
                  <div className="row gap-8">
                    <span className="cat-ico" style={{ width: 24, height: 24 }}>{GOAL_ICONS[b.ico]}</span>
                    <span className="f-sm" style={{ fontWeight: 480 }}>{b.name}</span>
                  </div>
                  <span className="f-xs" style={{ color: b.done ? "var(--success)" : "var(--primary-glow)" }}>{b.diff}</span>
                </div>
                <div className="pb">
                  <i style={{ width: b.pct + "%", background: b.done ? "var(--success)" : "linear-gradient(90deg, var(--primary), var(--xp-2))" }} />
                </div>
              </div>
            ))}
          </div>
          <button className="btn primary" type="button" style={{ width: "100%", marginTop: 14, height: 34 }}>
            Bump auto-save to $370/mo
          </button>
        </div>
      </div>
    </AppShell>
  );
}
