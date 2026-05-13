"use client";

import { useState, useTransition } from "react";
import type { LearnResponse } from "@/features/learn/services/learnSchema";
import { markLessonComplete } from "@/server/actions/dashboard";
import { useRouter } from "next/navigation";

type CatalogLesson = LearnResponse["lessons"][number];

const CHECK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const FLAME_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

export function LearnContent({ initialLessons }: { initialLessons: CatalogLesson[] }) {
  const [lessons, setLessons] = useState(initialLessons);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const CATS = ["All", ...Array.from(new Set(initialLessons.map((l) =>
    l.category.charAt(0).toUpperCase() + l.category.slice(1)
  )))];

  const filtered = activeCategory === "All"
    ? lessons
    : lessons.filter((l) => l.category.toLowerCase() === activeCategory.toLowerCase());

  const firstIncomplete = filtered.findIndex((l) => !l.completed);

  function handleComplete(slug: string) {
    startTransition(async () => {
      await markLessonComplete({ slug });
      setLessons((prev) =>
        prev.map((l) => (l.id === slug ? { ...l, completed: true } : l))
      );
      router.refresh();
    });
  }

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
            <button key={c} onClick={() => setActiveCategory(c)} type="button" className="pill" style={{
              cursor: "pointer", border: 0, font: "inherit",
              background: activeCategory === c ? "oklch(0.66 0.18 282 / 0.2)" : "oklch(1 0 0 / 0.05)",
              color: activeCategory === c ? "oklch(0.92 0.06 282)" : "var(--fg-soft)",
              padding: "5px 12px", fontSize: 12, fontWeight: 500,
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((l, idx) => {
          const state = l.completed ? "done" : idx === firstIncomplete ? "active" : "next";
          return (
            <div key={l.id} className={`lesson${state === "done" ? " done" : state === "active" ? " active" : ""}`}>
              <div className="num">
                {state === "done" ? CHECK_ICON : String(idx + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="ttl">{l.title}</div>
                <div className="desc">{l.category.charAt(0).toUpperCase() + l.category.slice(1)}</div>
                {state === "active" && (
                  <button
                    className="btn primary"
                    type="button"
                    disabled={isPending}
                    onClick={() => handleComplete(l.id)}
                    style={{ fontSize: 12, padding: "4px 10px" }}
                  >
                    Mark complete
                  </button>
                )}
              </div>
              <span className="time">{l.readingMinutes} min</span>
              <span className="xp-pill">+{l.xpReward} XP</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
