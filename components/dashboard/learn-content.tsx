"use client";

import { useState } from "react";

type Lesson = {
  n: string; state: "done" | "active" | "next" | "lock";
  title: string; desc: string; xp: number; min: number; cat: string;
  progress?: number;
};

const CATS = ["All", "Debt", "Saving", "Investing", "Taxes", "Mindset"] as const;

const LESSONS: Lesson[] = [
  { n: "01", state: "done",   title: "The shape of your money",       desc: "Net worth, the simplest possible version.",              xp: 50,  min: 6,  cat: "Mindset" },
  { n: "02", state: "done",   title: "Interest, demystified",         desc: "Why APR moves your money faster than you think.",       xp: 80,  min: 9,  cat: "Debt" },
  { n: "03", state: "done",   title: "Snowball vs Avalanche",         desc: "Two paths out of debt — which suits you?",              xp: 80,  min: 8,  cat: "Debt" },
  { n: "04", state: "active", title: "Building a 3-month buffer",     desc: "How an emergency fund actually changes your life.",     xp: 100, min: 12, cat: "Saving", progress: 0.45 },
  { n: "05", state: "next",   title: "Reading a credit report",       desc: "Spot what helps you, what hurts you.",                 xp: 90,  min: 10, cat: "Debt" },
  { n: "06", state: "next",   title: "Spending without guilt",        desc: "A small framework for guilt-free wants.",              xp: 70,  min: 7,  cat: "Mindset" },
  { n: "07", state: "lock",   title: "Index funds in plain English",  desc: "Unlocks at Level 5.",                                  xp: 120, min: 11, cat: "Investing" },
  { n: "08", state: "lock",   title: "Tax-advantaged accounts",       desc: "Unlocks at Level 5.",                                  xp: 120, min: 13, cat: "Taxes" },
];

const BADGES = [
  { name: "First Step",      sub: "Day 1 · earned",   locked: false },
  { name: "Debt Slayer",     sub: "Apr 12 · earned",  locked: false },
  { name: "Saver",           sub: "Apr 28 · earned",  locked: false },
  { name: "Streak: 7 days",  sub: "May 6 · earned",   locked: false },
  { name: "Streak: 30 days", sub: "18 days to go",    locked: true  },
  { name: "Architect",       sub: "Level 5 unlock",   locked: true  },
];

const CHECK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const LOCK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const LOCK_ICON_LG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const FLAME_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

function BadgeIcon({ name, locked }: { name: string; locked: boolean }) {
  if (locked) return LOCK_ICON_LG;
  const icons: Record<string, React.ReactNode> = {
    "First Step":  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    "Debt Slayer": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    "Saver":       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "Streak: 7 days": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  };
  return <>{icons[name] ?? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}</>;
}

export function LearnContent() {
  const [cat, setCat] = useState<string>("All");
  const visible = cat === "All" ? LESSONS : LESSONS.filter(l => l.cat === cat);

  const pct = 940 / 1200;
  const ringR = 38;
  const C = 2 * Math.PI * ringR;

  const steps = [
    { t: "Money basics",         done: true,  active: false },
    { t: "Debt mastery",         done: true,  active: false },
    { t: "Saving the right way", done: true,  active: false },
    { t: "Investing 101",        done: false, active: true  },
    { t: "Taxes & long term",    done: false, active: false },
  ];

  return (
    <>
      {/* Level hero */}
      <div className="g-12">
        <div className="card" style={{ gridColumn: "span 8", padding: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(500px 220px at 90% 0%, oklch(0.66 0.18 282 / 0.16), transparent 60%)", pointerEvents: "none" }} />
          <div className="row between" style={{ position: "relative" }}>
            <div>
              <div className="row gap-8">
                <span className="lvl-chip">
                  <span className="dot" />
                  Level 4 · Steady
                </span>
                <span className="streak">
                  {FLAME_ICON}
                  12 day streak
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 520, letterSpacing: "-0.02em", marginTop: 12 }}>
                940 <span className="muted" style={{ fontSize: 14, fontWeight: 440 }}>/ 1,200 XP to <b style={{ color: "var(--fg)" }}>Architect</b></span>
              </div>
              <div className="muted f-sm" style={{ marginTop: 4 }}>3 lessons to next level · +260 XP needed</div>
            </div>

            {/* Level ring */}
            <svg viewBox="0 0 100 100" style={{ width: 104, height: 104, flexShrink: 0 }}>
              <defs>
                <linearGradient id="ringG" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 282)" />
                  <stop offset="100%" stopColor="oklch(0.72 0.17 250)" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r={ringR} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" />
              <circle cx="50" cy="50" r={ringR} fill="none" stroke="url(#ringG)" strokeWidth="6"
                strokeDasharray={`${C * pct} ${C}`} strokeLinecap="round"
                transform="rotate(-90 50 50)" />
              <text x="50" y="48" textAnchor="middle" fontSize="10" fill="oklch(0.62 0.012 280)">Level</text>
              <text x="50" y="66" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="24" fill="oklch(0.97 0 0)" letterSpacing="-0.04em">4</text>
            </svg>
          </div>

          <div className="pb xp thick" style={{ marginTop: 18 }}>
            <i style={{ width: `${pct * 100}%` }} />
          </div>

          <div className="row gap-12" style={{ marginTop: 18, flexWrap: "wrap" }}>
            {[
              { label: "+50 XP",  done: true,  text: "Today's check-in"    },
              { label: "+25 XP",  done: true,  text: "Logged spending"     },
              { label: "+100 XP", done: false, text: "Finish Lesson 4"     },
              { label: "+200 XP", done: false, text: "Reach 30-day streak" },
            ].map(({ label, done, text }) => (
              <div key={text} className="row gap-8" style={{
                padding: "8px 12px", borderRadius: 10,
                background: "oklch(1 0 0 / 0.04)",
                boxShadow: "0 0 0 1px var(--line)",
                fontSize: 12.5,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 6,
                  display: "grid", placeItems: "center",
                  background: done ? "var(--success-soft)" : "oklch(1 0 0 / 0.06)",
                  color: done ? "oklch(0.85 0.10 152)" : "var(--fg-mute)",
                }}>
                  {done
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                </span>
                <span style={{ color: done ? "var(--fg-soft)" : "var(--fg)" }}>{text}</span>
                <span className="mono f-xs" style={{ color: "var(--xp)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your path */}
        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-head">
            <div className="card-title">Your path</div>
            <span className="pill primary">3 / 5 modules</span>
          </div>
          <div style={{ position: "relative", paddingLeft: 14, marginTop: 4 }}>
            <div style={{
              position: "absolute", left: 7, top: 6, bottom: 6, width: 1.5,
              background: "linear-gradient(180deg, var(--success), var(--primary), oklch(1 0 0 / 0.06))",
            }} />
            {steps.map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 12, padding: "10px 0", alignItems: "center" }}>
                <span style={{
                  width: 14, height: 14, borderRadius: 999,
                  marginLeft: -7,
                  background: s.done ? "var(--success)" : s.active ? "var(--primary)" : "oklch(0.22 0.014 282)",
                  boxShadow: s.active ? "0 0 0 4px oklch(0.66 0.18 282 / 0.18)" : "0 0 0 3px var(--bg-1)",
                }} />
                <div className="row between">
                  <span className="f-sm" style={{ color: s.done || s.active ? "var(--fg)" : "var(--fg-mute)", fontWeight: 480 }}>{s.t}</span>
                  <span className="f-xs muted">{s.done ? "Complete" : s.active ? "In progress" : "Locked"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter + Lessons */}
      <div className="section-hd">
        <h2>Lessons</h2>
        <div className="row gap-8" style={{ flexWrap: "wrap" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} type="button" className="pill" style={{
              cursor: "pointer", border: 0, font: "inherit",
              background: cat === c ? "oklch(0.66 0.18 282 / 0.2)" : "oklch(1 0 0 / 0.05)",
              color: cat === c ? "oklch(0.92 0.06 282)" : "var(--fg-soft)",
              padding: "5px 12px", fontSize: 12, fontWeight: 500,
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map(l => {
          const locked = l.state === "lock";
          return (
            <div key={l.n} className={`lesson${l.state === "done" ? " done" : l.state === "active" ? " active" : ""}`}
              style={locked ? { opacity: 0.6 } : undefined}>
              <div className="num">
                {l.state === "done" ? CHECK_ICON : l.state === "lock" ? LOCK_ICON : l.n}
              </div>
              <div>
                <div className="ttl">{l.title}</div>
                <div className="desc">{l.desc}</div>
                {l.state === "active" && l.progress !== undefined && (
                  <div className="pb xp" style={{ marginTop: 8, maxWidth: 300 }}>
                    <i style={{ width: `${l.progress * 100}%` }} />
                  </div>
                )}
              </div>
              <span className="time">{l.min} min</span>
              <span className="xp-pill">+{l.xp} XP</span>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <div className="section-hd">
        <h2>Badges</h2>
        <span className="sub">7 of 14 earned</span>
      </div>
      <div className="g-3" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        {BADGES.map(b => (
          <div key={b.name} className={`badge-card${b.locked ? " locked" : ""}`}>
            <div className="badge-emblem">
              <BadgeIcon name={b.name} locked={b.locked} />
            </div>
            <div className="badge-name">{b.name}</div>
            <div className="badge-meta">{b.sub}</div>
          </div>
        ))}
      </div>
    </>
  );
}
