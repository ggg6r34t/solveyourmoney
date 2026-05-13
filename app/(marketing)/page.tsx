import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 999,
      background: "oklch(0.66 0.18 282 / 0.10)",
      boxShadow: "0 0 0 1px oklch(0.66 0.18 282 / 0.20)",
      fontSize: 11.5, fontWeight: 500,
      color: "oklch(0.85 0.10 282)",
      marginBottom: 16,
    }}>
      {children}
    </span>
  );
}

function FeatureBlock({
  tag,
  headline,
  body,
  side,
}: {
  tag: string;
  headline: string;
  body: string;
  side: React.ReactNode;
}) {
  return (
    <div style={{
      display: "grid", gap: 48, alignItems: "center",
      padding: "80px 0",
    }}
      className="grid-cols-1 md:grid-cols-2"
    >
      <div>
        <SectionTag>{tag}</SectionTag>
        <h2 style={{
          fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 540,
          letterSpacing: "-0.03em", lineHeight: 1.08,
          margin: "0 0 16px", color: "var(--fg)",
        }}>
          {headline}
        </h2>
        <p style={{
          fontSize: 16, lineHeight: 1.7, color: "var(--fg-mute)",
          margin: 0, maxWidth: 400,
        }}>
          {body}
        </p>
      </div>
      <div>{side}</div>
    </div>
  );
}

function CardMockup({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{
      borderRadius: "var(--r-xl)",
      background: "var(--bg-1)",
      boxShadow: "0 0 0 1px var(--line), 0 1px 0 var(--inner-hl) inset, 0 24px 60px -16px oklch(0 0 0 / 0.6)",
      padding: 24,
      position: "relative", overflow: "hidden",
    }}>
      {accent && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(400px 200px at 80% -10%, oklch(0.66 0.18 282 / 0.12), transparent 60%)",
          pointerEvents: "none",
        }} />
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <MarketingShell>
      <Hero />

      {/* Divider */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ height: 1, background: "var(--line)" }} />
      </div>

      {/* ── Feature sections ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>

        {/* 1. Clarity section */}
        <FeatureBlock
          tag="01 — Clarity"
          headline={"Stop guessing what\nyour money is doing."}
          body="SolveYourMoney gives you one clear dashboard — total debt, monthly budget, savings goals, and net worth — in one calm place. No spreadsheets. No anxiety scrolling."
          side={
            <CardMockup accent>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)", marginBottom: 16 }}>
                Where you stand
              </div>
              {[
                { label: "Total debt",    value: "$8,420",  color: "var(--danger)",  pct: 38 },
                { label: "Total savings", value: "$4,184",  color: "var(--success)", pct: 67 },
                { label: "Net worth",     value: "$14,820", color: "var(--primary)", pct: 82 },
              ].map(({ label, value, color, pct }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: 5, fontSize: 12,
                  }}>
                    <span style={{ color: "var(--fg-mute)" }}>{label}</span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontWeight: 500,
                      letterSpacing: "-0.02em", color: "var(--fg)",
                    }}>
                      {value}
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: "oklch(1 0 0 / 0.06)" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 999,
                      background: color,
                      boxShadow: `0 0 8px ${color} / 0.4`,
                    }} />
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 16, padding: "10px 14px", borderRadius: "var(--r-md)",
                background: "var(--bg-2)", boxShadow: "0 0 0 1px var(--line)",
                fontSize: 12.5, color: "var(--fg-mute)", lineHeight: 1.6,
              }}>
                At your current pace, you&apos;ll be debt-free by{" "}
                <span style={{ color: "oklch(0.73 0.13 152)" }}>Feb 2028</span> — 4 months earlier than last quarter.
              </div>
            </CardMockup>
          }
        />

        <div style={{ height: 1, background: "var(--line)" }} />

        {/* 2. Guidance section */}
        <FeatureBlock
          tag="02 — Guidance"
          headline={"One next move,\nnot ten overwhelming tabs."}
          body="The debt payoff simulator lets you drag a slider and instantly see how an extra $50/month changes your interest and timeline. No formulas. Just clarity."
          side={
            <CardMockup>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)", marginBottom: 4 }}>
                Payoff simulator
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-mute)", marginBottom: 16 }}>
                See what an extra payment does.
              </div>

              <div style={{
                padding: "14px 16px", borderRadius: "var(--r-md)",
                background: "oklch(1 0 0 / 0.025)", boxShadow: "0 0 0 1px var(--line)",
                marginBottom: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11.5, color: "var(--fg-mute)" }}>Extra each month</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 22,
                    letterSpacing: "-0.025em", color: "var(--fg)",
                  }}>
                    $120
                  </span>
                </div>
                {/* Fake slider track */}
                <div style={{ height: 6, borderRadius: 999, background: "oklch(1 0 0 / 0.08)", position: "relative", marginBottom: 8 }}>
                  <div style={{ width: "20%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg, oklch(0.66 0.18 282), oklch(0.78 0.14 250))" }} />
                  <div style={{
                    position: "absolute", left: "20%", top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 16, height: 16, borderRadius: "50%",
                    background: "linear-gradient(180deg, oklch(0.95 0.005 280), oklch(0.85 0.01 280))",
                    boxShadow: "0 0 0 1px oklch(0 0 0 / 0.4), 0 0 12px oklch(0.66 0.18 282 / 0.4)",
                  }} />
                </div>
              </div>

              {[
                { label: "Interest saved",   value: "$368",    color: "oklch(0.73 0.13 152)" },
                { label: "Debt-free sooner", value: "2 months", color: "oklch(0.78 0.16 282)" },
                { label: "New payoff date",  value: "Dec 2027", color: "var(--fg)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: "1px solid var(--line)",
                  fontSize: 13,
                }}>
                  <span style={{ color: "var(--fg-mute)" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", color }}>
                    {value}
                  </span>
                </div>
              ))}
            </CardMockup>
          }
        />

        <div style={{ height: 1, background: "var(--line)" }} />

        {/* 3. Gamification section */}
        <FeatureBlock
          tag="03 — Progress"
          headline={"Money habits that\nactually stick."}
          body="Every check-in, every logged expense, every lesson completed earns XP. Level up through Foundations to Architect. Streaks, badges, and bite-sized lessons make steady progress feel real."
          side={
            <CardMockup accent>
              {/* Level ring + XP */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16, marginBottom: 16,
              }}>
                {/* Ring */}
                <svg viewBox="0 0 100 100" style={{ width: 80, height: 80, flexShrink: 0 }}>
                  <defs>
                    <linearGradient id="ringG" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.16 282)" />
                      <stop offset="100%" stopColor="oklch(0.72 0.17 250)" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="url(#ringG)" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 38 * 0.78} ${2 * Math.PI * 38}`}
                    strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <text x="50" y="47" textAnchor="middle" fontSize="9.5" fill="oklch(0.62 0.012 280)">Level</text>
                  <text x="50" y="64" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="24" fill="oklch(0.97 0 0)" letterSpacing="-0.04em">4</text>
                </svg>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 520, letterSpacing: "-0.02em", color: "var(--fg)" }}>
                    940{" "}
                    <span style={{ fontSize: 13, fontWeight: 440, color: "var(--fg-mute)" }}>
                      / 1,200 XP
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-mute)", marginTop: 2 }}>
                    3 lessons to <strong style={{ color: "var(--fg-soft)" }}>Architect</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontFamily: "var(--font-mono)", fontSize: 11,
                      color: "oklch(0.78 0.14 48)",
                    }}>
                      🔥 12 day streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Reward pills */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Today's check-in",  xp: "+50 XP",  done: true },
                  { label: "Logged spending",    xp: "+25 XP",  done: true },
                  { label: "Finish Lesson 4",    xp: "+100 XP", done: false },
                ].map(({ label, xp, done }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: 10,
                    background: "oklch(1 0 0 / 0.04)",
                    boxShadow: "0 0 0 1px var(--line)",
                    fontSize: 12.5,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 6,
                        display: "grid", placeItems: "center",
                        background: done ? "var(--success-soft)" : "oklch(1 0 0 / 0.06)",
                        fontSize: 10, color: done ? "oklch(0.85 0.10 152)" : "var(--fg-mute)",
                      }}>
                        {done ? "✓" : "○"}
                      </span>
                      <span style={{ color: done ? "var(--fg-soft)" : "var(--fg)" }}>{label}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--xp)" }}>
                      {xp}
                    </span>
                  </div>
                ))}
              </div>
            </CardMockup>
          }
        />

        <div style={{ height: 1, background: "var(--line)" }} />

        {/* ── Calm CTA ── */}
        <div style={{ padding: "100px 0", textAlign: "center" }}>
          <SectionTag>Ready when you are</SectionTag>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 540,
            letterSpacing: "-0.03em", lineHeight: 1.06,
            margin: "0 auto 20px", maxWidth: 560,
            color: "var(--fg)",
          }}>
            One check-in.
            <br />
            <span style={{ color: "var(--fg-mute)" }}>One next move.</span>
          </h2>
          <p style={{
            maxWidth: 400, margin: "0 auto 36px", fontSize: 16,
            lineHeight: 1.65, color: "var(--fg-mute)",
          }}>
            Financial clarity doesn&apos;t come from having all the answers.
            It comes from having a clear picture of where you are right now.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/sign-up"
              style={{
                height: 46, padding: "0 28px", display: "inline-flex",
                alignItems: "center", borderRadius: 10,
                fontSize: 15, fontWeight: 500,
                color: "oklch(0.98 0 0)", textDecoration: "none",
                background: "linear-gradient(180deg, oklch(0.7 0.18 282), oklch(0.58 0.18 282))",
                boxShadow: "0 0 0 1px oklch(0.7 0.18 282), 0 8px 24px -8px oklch(0.66 0.18 282 / 0.7), 0 1px 0 oklch(1 0 0 / 0.18) inset",
              }}
            >
              Get started free
            </Link>
            <Link
              href="/pricing"
              style={{
                height: 46, padding: "0 20px", display: "inline-flex",
                alignItems: "center", borderRadius: 10,
                fontSize: 15, fontWeight: 500,
                color: "var(--fg-soft)", textDecoration: "none",
                boxShadow: "0 0 0 1px var(--line)",
              }}
            >
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
