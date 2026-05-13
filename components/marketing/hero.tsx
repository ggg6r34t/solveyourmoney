"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function MiniProgressBar({ value, tone }: { value: number; tone: "primary" | "success" | "warning" | "danger" }) {
  const fill = {
    primary: "linear-gradient(90deg, oklch(0.66 0.18 282), oklch(0.78 0.14 250))",
    success: "oklch(0.73 0.13 152)",
    warning: "oklch(0.80 0.13 82)",
    danger:  "oklch(0.68 0.15 24)",
  }[tone];
  return (
    <div style={{ height: 6, borderRadius: 999, background: "oklch(1 0 0 / 0.06)", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", borderRadius: 999, background: fill }} />
    </div>
  );
}

export function Hero() {
  return (
    <section style={{
      maxWidth: 1280, margin: "0 auto",
      padding: "60px 40px 80px",
      display: "grid", gap: 64,
      alignItems: "center",
    }}
      className="md:grid-cols-[1fr_1fr]"
    >
      {/* Left: copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ display: "flex", flexDirection: "column", gap: 28 }}
      >
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 12px", borderRadius: 999,
          background: "oklch(0.66 0.18 282 / 0.10)",
          boxShadow: "0 0 0 1px oklch(0.66 0.18 282 / 0.25)",
          fontSize: 12, fontWeight: 500,
          color: "oklch(0.85 0.10 282)",
          width: "fit-content",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--primary-glow)",
            boxShadow: "0 0 8px var(--primary-glow)",
          }} />
          Financial clarity · Not a bank
        </div>

        {/* Headline */}
        <div>
          <h1 style={{
            fontSize: "clamp(44px, 6vw, 72px)",
            fontWeight: 540,
            letterSpacing: "-0.035em",
            lineHeight: 1.0,
            margin: 0,
            color: "var(--fg)",
          }}>
            Stop avoiding
            <br />
            <span style={{
              background: "linear-gradient(135deg, oklch(0.78 0.16 282), oklch(0.78 0.14 250))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              your money.
            </span>
          </h1>
          <p style={{
            maxWidth: 440,
            marginTop: 20, marginBottom: 0,
            fontSize: 18, fontWeight: 400, lineHeight: 1.65,
            color: "var(--fg-mute)",
            letterSpacing: "-0.01em",
          }}>
            A calm financial clarity tool that turns debt, spending, and savings into
            a clear picture you can actually act on.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/sign-up"
            style={{
              height: 42, padding: "0 22px", display: "inline-flex",
              alignItems: "center", borderRadius: 10,
              fontSize: 14, fontWeight: 500,
              color: "oklch(0.98 0 0)", textDecoration: "none",
              background: "linear-gradient(180deg, oklch(0.7 0.18 282), oklch(0.58 0.18 282))",
              boxShadow: "0 0 0 1px oklch(0.7 0.18 282), 0 8px 20px -8px oklch(0.66 0.18 282 / 0.7), 0 1px 0 oklch(1 0 0 / 0.18) inset",
            }}
          >
            Start free — takes 2 min
          </Link>
          <Link
            href="/how-it-works"
            style={{
              height: 42, padding: "0 18px", display: "inline-flex",
              alignItems: "center", borderRadius: 10,
              fontSize: 14, fontWeight: 500,
              color: "var(--fg-soft)", textDecoration: "none",
              background: "transparent",
              boxShadow: "0 0 0 1px var(--line)",
            }}
          >
            See how it works →
          </Link>
        </div>

        {/* Trust */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          fontSize: 12.5, color: "var(--fg-dim)",
        }}>
          {["No bank connection in v1", "No judgment", "Cancel anytime"].map((s, i) => (
            <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--fg-dim)" }} />}
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Right: product mockup */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ position: "relative" }}
      >
        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: -40,
          background: "radial-gradient(ellipse at 60% 40%, oklch(0.66 0.18 282 / 0.15), transparent 60%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Mock dashboard card */}
        <div style={{
          position: "relative", zIndex: 1,
          borderRadius: "var(--r-xl)",
          background: "var(--bg-1)",
          boxShadow: "0 0 0 1px var(--line), 0 1px 0 var(--inner-hl) inset, 0 40px 80px -20px oklch(0 0 0 / 0.7)",
          overflow: "hidden",
          padding: 24,
        }}>
          {/* Inner glow */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: 300, height: 200,
            background: "radial-gradient(circle at 80% 20%, oklch(0.66 0.18 282 / 0.12), transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "relative" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 540, letterSpacing: "-0.02em", color: "var(--fg)" }}>
                Good evening, Maya ✦
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-mute)", marginTop: 2 }}>
                You&apos;re{" "}
                <span style={{ color: "oklch(0.73 0.13 152)" }}>$84 ahead</span>{" "}
                on this week&apos;s plan.
              </div>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px 4px 8px", borderRadius: 999,
              background: "oklch(0.66 0.18 282 / 0.15)",
              boxShadow: "0 0 0 1px oklch(0.66 0.18 282 / 0.25)",
              fontSize: 11.5, fontWeight: 500, color: "oklch(0.85 0.10 282)",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--primary-glow)",
                boxShadow: "0 0 8px var(--primary-glow)",
              }} />
              Level 4 · Steady
            </div>
          </div>

          {/* 4 metric tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Net worth",     value: "$14,820", delta: "+$612 this month", tone: "primary", accent: true },
              { label: "Monthly income",value: "$4,250",  delta: "Paid bi-weekly",   tone: "flat" },
              { label: "Spent this mo", value: "$2,341",  delta: "9% under plan",    tone: "success" },
              { label: "Saved this mo", value: "$612",    delta: "14.4% of income",  tone: "success" },
            ].map(({ label, value, delta, tone, accent }) => (
              <div key={label} style={{
                padding: "14px 16px", borderRadius: "var(--r-md)",
                background: "var(--bg-2)",
                boxShadow: "0 0 0 1px var(--line)",
                position: "relative", overflow: "hidden",
              }}>
                {accent && (
                  <span style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: "radial-gradient(120px 80px at 100% 0%, oklch(0.66 0.18 282 / 0.12), transparent)",
                  }} />
                )}
                <div style={{ fontSize: 11, color: "var(--fg-dim)", marginBottom: 6 }}>{label}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 500,
                  letterSpacing: "-0.03em", color: "var(--fg)",
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: 10.5, marginTop: 4,
                  color: tone === "success" ? "oklch(0.73 0.13 152)" :
                         tone === "primary" ? "oklch(0.78 0.16 282)" :
                         "var(--fg-mute)",
                }}>
                  {delta}
                </div>
              </div>
            ))}
          </div>

          {/* Debt snapshot */}
          <div style={{
            padding: "14px 16px", borderRadius: "var(--r-md)",
            background: "var(--bg-2)",
            boxShadow: "0 0 0 1px var(--line)",
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>Debt overview</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(0.73 0.13 152)" }}>
                Debt-free Feb 2028
              </div>
            </div>
            {[
              { name: "Visa Platinum", pct: 32, tone: "danger" as const },
              { name: "Student Loan",  pct: 58, tone: "primary" as const },
            ].map(({ name, pct, tone }) => (
              <div key={name} style={{ marginBottom: 8 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 12, marginBottom: 4, color: "var(--fg-soft)",
                }}>
                  <span>{name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", fontSize: 11 }}>
                    {pct}%
                  </span>
                </div>
                <MiniProgressBar value={pct} tone={tone} />
              </div>
            ))}
          </div>

          {/* XP bar */}
          <div style={{
            padding: "10px 14px", borderRadius: "var(--r-md)",
            background: "oklch(0.66 0.18 282 / 0.08)",
            boxShadow: "0 0 0 1px oklch(0.66 0.18 282 / 0.18)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 11, color: "var(--fg-mute)", flexShrink: 0 }}>940 XP</span>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: "oklch(1 0 0 / 0.06)" }}>
              <div style={{
                width: "78%", height: "100%", borderRadius: 999,
                background: "linear-gradient(90deg, oklch(0.66 0.18 282), oklch(0.78 0.14 250))",
                boxShadow: "0 0 10px oklch(0.72 0.17 270 / 0.5)",
              }} />
            </div>
            <span style={{
              fontSize: 11, fontFamily: "var(--font-mono)",
              color: "oklch(0.85 0.10 282)",
            }}>
              Level 5 in +260 XP
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
