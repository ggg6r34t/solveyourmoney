import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/dashboard/app-shell";
import { getOverviewData } from "@/features/overview/services/overviewService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";

/* ── SVG area chart (server-safe) ── */
function AreaChart() {
  const series = [3.2, 3.0, 3.4, 3.9, 4.6, 5.1, 5.4, 6.0, 6.4, 6.9, 7.3, 7.8];
  const months = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
  const W = 760, H = 200, pad = { l: 0, r: 0, t: 16, b: 26 };
  const max = Math.max(...series) * 1.1;
  const xs = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / (series.length - 1);
  const ys = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);

  const path = series
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`)
    .join(" ");
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
      <g>
        <circle cx={xs(series.length - 1)} cy={ys(series[series.length - 1])} r="9" fill="oklch(0.66 0.18 282 / 0.22)" />
        <circle cx={xs(series.length - 1)} cy={ys(series[series.length - 1])} r="3.5" fill="oklch(0.95 0.005 280)" />
      </g>
      <g transform={`translate(${xs(series.length - 1) - 86}, ${ys(series[series.length - 1]) - 36})`}>
        <rect width="80" height="26" rx="6" fill="oklch(0.18 0.014 282)" stroke="oklch(1 0 0 / 0.08)" />
        <text x="10" y="17" fontFamily="var(--font-geist-mono, monospace)" fontSize="11.5" fill="oklch(0.97 0 0)" letterSpacing="-0.02em">
          $14,820.40
        </text>
      </g>
      {months.map((m, i) => (
        <text key={m} x={xs(i)} y={H - 6} fontSize="10.5" textAnchor="middle"
          fontFamily="var(--font-geist-mono, monospace)" fill="oklch(0.48 0.014 280)">
          {m}
        </text>
      ))}
    </svg>
  );
}

function DonutChart() {
  const C = 2 * Math.PI * 56;
  const segs = [
    { label: "Needs",     v: 50, color: "oklch(0.66 0.18 282)" },
    { label: "Wants",     v: 30, color: "oklch(0.80 0.13 82)" },
    { label: "Save/Debt", v: 20, color: "oklch(0.73 0.13 152)" },
  ];
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <svg viewBox="0 0 168 168" style={{ width: 168, height: 168, flexShrink: 0 }}>
        <circle cx="84" cy="84" r="56" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="14" />
        {segs.map((s, i) => {
          const len = (s.v / 100) * C;
          const dash = `${len} ${C - len}`;
          const el = (
            <circle key={i} cx="84" cy="84" r="56" fill="none"
              stroke={s.color} strokeWidth="14" strokeLinecap="butt"
              strokeDasharray={dash} strokeDashoffset={-offset}
              transform="rotate(-90 84 84)" />
          );
          offset += len;
          return el;
        })}
        <text x="84" y="80" textAnchor="middle" fontSize="11" fill="oklch(0.62 0.012 280)">Spent of</text>
        <text x="84" y="100" textAnchor="middle" fontFamily="var(--font-geist-mono, monospace)" fontSize="20" fill="oklch(0.97 0 0)" letterSpacing="-0.03em">$4,250</text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {segs.map((s) => (
          <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9, background: s.color }} />
              {s.label}
            </span>
            <span className="mono f-sm muted">{s.v}%</span>
          </div>
        ))}
        <div className="divider" />
        <div className="f-xs muted" style={{ lineHeight: 1.5 }}>
          Mirroring the 50 / 30 / 20 rule.{" "}
          <Link href={"/dashboard/budget" as Route} style={{ color: "var(--primary-glow)", textDecoration: "none" }}>
            Adjust in Budget.
          </Link>
        </div>
      </div>
    </div>
  );
}

function DebtMiniRow({
  name, apr, balance, pct, tone,
}: {
  name: string; apr: string; balance: string; pct: number;
  tone: "danger" | "primary" | "warn";
}) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 480 }}>{name}</span>
          <span className="pill">{apr} APR</span>
        </div>
        <span className="mono f-sm muted">{balance}</span>
      </div>
      <div className={`pb ${tone}`}><i style={{ width: pct + "%" }} /></div>
    </div>
  );
}

const GOAL_ICO: Record<string, React.ReactNode> = {
  shield: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  laptop: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  plane:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 3.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
};

function GoalMiniRow({ ico, name, cur, target, pct }: {
  ico: string; name: string; cur: string; target: string; pct: number;
}) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="cat-ico" style={{ width: 24, height: 24 }}>{GOAL_ICO[ico]}</span>
          <span style={{ fontSize: 13, fontWeight: 480 }}>{name}</span>
        </div>
        <span className="mono f-sm">
          <span style={{ color: "var(--fg)" }}>{cur}</span>
          <span className="muted"> / {target}</span>
        </span>
      </div>
      <div className="pb success"><i style={{ width: pct + "%" }} /></div>
    </div>
  );
}

/* ── Main page ── */
export default async function DashboardPage() {
  const session = await requireSession();
  const overview = await getOverviewData({ userId: session.userId });

  const wins = [
    { ico: "🎯", title: "Hit your weekly save goal",          meta: "Yesterday · Emergency Fund",    xp: "+40 XP" },
    { ico: "🔥", title: "Logged 7 days in a row",            meta: "2 days ago · Streak milestone",  xp: "+25 XP" },
    { ico: "💳", title: "Paid extra on Visa Platinum",       meta: "4 days ago · −$120 principal",   xp: "+60 XP" },
    { ico: "✦",  title: 'Completed "Interest, demystified"', meta: "Last week · Learn",              xp: "+100 XP" },
  ];

  const METRIC_ICONS = [
    <svg key="0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    <svg key="1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    <svg key="2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    <svg key="3" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  ];

  type MetricItem = {
    label: string; dollars: string; cents: string;
    delta: string; dimSuffix?: string;
    direction: "up" | "down" | "good_down" | "flat"; accent: boolean;
  };

  const primaryMetrics: MetricItem[] = overview.items.length >= 4
    ? overview.items.slice(0, 4).map((item, i) => {
        const v = typeof item.value === "number" ? item.value : 0;
        const whole = Math.floor(v);
        const c = Math.round((v - whole) * 100).toString().padStart(2, "0");
        return {
          label: item.label,
          dollars: `$${whole.toLocaleString()}`,
          cents: `.${c}`,
          delta: formatCurrency(v),
          direction: "flat" as const,
          accent: i === 0,
        };
      })
    : [
        { label: "Net worth",        dollars: "$14,820", cents: ".40", delta: "+$612 this month", dimSuffix: "· +4.3%", direction: "up",        accent: true  },
        { label: "Monthly income",   dollars: "$4,250",  cents: ".00", delta: "Paid bi-weekly · next May 24",           direction: "flat",       accent: false },
        { label: "Spent this month", dollars: "$2,341",  cents: ".18", delta: "9% under plan",                          direction: "good_down",  accent: false },
        { label: "Saved this month", dollars: "$612",    cents: ".00", delta: "14.4% of income",                        direction: "up",         accent: false },
      ];

  return (
    <AppShell active="overview">

      {/* ── Greeting ── */}
      <div className="greeting">
        <div>
          <h1>Good evening, Maya <span className="wave">✦</span></h1>
          <div className="meta" style={{ marginTop: 6 }}>
            <span>
              You&apos;re{" "}
              <span style={{ color: "var(--success)" }}>$84 ahead</span>
              {" "}on this week&apos;s plan.
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--fg-dim)", flexShrink: 0 }} />
            <span>3 things on your plate today.</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <div className="seg">
            {(["Day", "Week", "Month", "Year"] as const).map((label, i) => (
              <button key={label} className={i === 2 ? "on" : undefined}>{label}</button>
            ))}
          </div>
          <Link
            href={"/dashboard/import" as Route}
            className="btn"
            style={{ textDecoration: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Find anything
          </Link>
          <Link
            href={"/dashboard/import" as Route}
            className="btn primary"
            style={{ textDecoration: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Quick add
          </Link>
        </div>
      </div>

      {/* ── Primary metrics ── */}
      <div className="metrics">
        {primaryMetrics.map(({ label, dollars, cents, delta, dimSuffix, direction, accent }, i) => (
          <div key={label} className={`metric${accent ? " accent" : ""}`}>
            <div className="lbl">
              <span className="ico">{METRIC_ICONS[i]}</span>
              {label}
            </div>
            <div className="val">
              {dollars}<span className="cents">{cents}</span>
            </div>
            <span className={`delta ${direction === "up" ? "up" : direction === "down" ? "down" : direction === "good_down" ? "good_down" : "neut"}`}>
              {direction === "up" && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              )}
              {(direction === "down" || direction === "good_down") && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              )}
              {delta}
              {dimSuffix && (
                <span className="dim" style={{ marginLeft: 6 }}>{dimSuffix}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* ── Hero chart + donut ── */}
      <div className="g-12" style={{ marginTop: 16 }}>
        <div className="card hero-chart-card">
          <div className="card-head">
            <div>
              <div className="card-title">Your money, over time</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Net of debt · last 12 months</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Net worth", color: "var(--primary)" },
                { label: "Debt",      color: "var(--danger)" },
                { label: "Savings",   color: "var(--success)" },
              ].map(({ label, color }) => (
                <span key={label} className="pill">
                  <span style={{ width: 8, height: 8, borderRadius: 9, background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <AreaChart />
        </div>

        <div className="card side-card">
          <div className="card-head">
            <div className="card-title">This month at a glance</div>
            <span className="pill primary">May</span>
          </div>
          <DonutChart />
        </div>
      </div>

      {/* ── Where you're at ── */}
      <div className="section-hd">
        <h2>Where you&apos;re at</h2>
        <span className="sub">Updated 12 min ago</span>
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
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div className="muted f-xs">Total balance</div>
              <div className="mono" style={{ fontSize: 24, letterSpacing: "-0.025em" }}>
                $8,420<span className="muted">.12</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="muted f-xs">Debt-free</div>
              <div className="mono" style={{ fontSize: 14, color: "var(--success)" }}>
                Feb 2028 <span className="muted">· 21 mo</span>
              </div>
            </div>
          </div>
          <DebtMiniRow name="Visa Platinum" apr="19.4%" balance="$3,210" pct={32} tone="danger" />
          <DebtMiniRow name="Student Loan"  apr="5.1%"  balance="$4,180" pct={58} tone="primary" />
          <DebtMiniRow name="Care Credit"   apr="11.2%" balance="$1,030" pct={71} tone="warn" />
          <div className="divider" />
          <div style={{ display: "flex", justifyContent: "space-between" }} className="f-sm">
            <span className="muted">If you keep your current plan</span>
            <span className="mono" style={{ color: "var(--success)" }}>−$2,140 interest saved</span>
          </div>
        </div>

        {/* Savings progress */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Savings progress</div>
            <Link href="/dashboard/savings" className="card-sub" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>
              See all →
            </Link>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div className="muted f-xs">Total saved</div>
              <div className="mono" style={{ fontSize: 24, letterSpacing: "-0.025em" }}>
                $4,184<span className="muted">.28</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="muted f-xs">Monthly auto-save</div>
              <div className="mono" style={{ fontSize: 14 }}>
                $320 <span className="muted">· on track</span>
              </div>
            </div>
          </div>
          <GoalMiniRow ico="shield" name="Emergency Fund"  cur="$2,140" target="$3,000" pct={71} />
          <GoalMiniRow ico="laptop" name="New Laptop"      cur="$640"   target="$1,400" pct={45} />
          <GoalMiniRow ico="plane"  name="Holiday: Lisbon" cur="$1,404" target="$1,800" pct={78} />
        </div>
      </div>

      {/* ── Recent wins ── */}
      <div className="section-hd">
        <h2>Recent wins</h2>
        <span className="sub">+225 XP this week</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {wins.map((w) => (
          <div key={w.title} className="win">
            <div className="ico">{w.ico}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="win-title">{w.title}</div>
              <div className="win-meta">{w.meta}</div>
            </div>
            <span className="xp">{w.xp}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
