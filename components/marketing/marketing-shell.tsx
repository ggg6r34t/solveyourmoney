import Link from "next/link";
import type { Route } from "next";


export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg min-h-screen overflow-hidden" style={{ color: "var(--fg)" }}>
      {/* Nav */}
      <header style={{
        maxWidth: 1280, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px",
      }}>
        {/* Brand */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: "conic-gradient(from 220deg at 50% 50%, oklch(0.66 0.18 282), oklch(0.78 0.14 250), oklch(0.66 0.18 282))",
            position: "relative",
            boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08), 0 6px 18px -6px oklch(0.66 0.18 282 / 0.55)",
          }}>
            <span style={{
              position: "absolute", inset: 5, borderRadius: 5,
              background: "var(--bg-0)",
            }} />
            <span style={{
              position: "absolute", left: "50%", top: "50%",
              width: 8, height: 8, borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--fg)", zIndex: 1,
            }} />
          </div>
          <span style={{
            fontWeight: 560, letterSpacing: "-0.02em", fontSize: 14.5,
            color: "var(--fg)",
          }}>
            solve<span style={{ color: "var(--fg-mute)", fontWeight: 440 }}>your</span>money
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{
          display: "flex", alignItems: "center", gap: 2,
          padding: "4px",
          borderRadius: 999,
          background: "oklch(1 0 0 / 0.04)",
          boxShadow: "0 0 0 1px var(--line)",
        }}
          className="hidden md:flex"
        >
          {[
            ["Method",  "/how-it-works"],
            ["Pricing", "/pricing"],
            ["Trust",   "/about"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href as Route}
              style={{
                padding: "6px 14px", borderRadius: 999,
                fontSize: 13, fontWeight: 500,
                color: "var(--fg-soft)", textDecoration: "none",
                transition: "color 120ms ease, background 120ms ease",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/sign-in"
            style={{
              height: 34, padding: "0 14px", display: "inline-flex",
              alignItems: "center", borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              color: "var(--fg-soft)", textDecoration: "none",
              background: "transparent",
              boxShadow: "0 0 0 1px var(--line)",
              transition: "background 120ms ease",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            style={{
              height: 34, padding: "0 16px", display: "inline-flex",
              alignItems: "center", borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              color: "oklch(0.98 0 0)", textDecoration: "none",
              background: "linear-gradient(180deg, oklch(0.7 0.18 282), oklch(0.58 0.18 282))",
              boxShadow: "0 0 0 1px oklch(0.7 0.18 282), 0 6px 16px -6px oklch(0.66 0.18 282 / 0.6), 0 1px 0 oklch(1 0 0 / 0.18) inset",
              transition: "filter 120ms ease",
            }}
          >
            Start free
          </Link>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer style={{
        maxWidth: 1280, margin: "0 auto",
        display: "flex", flexDirection: "column", gap: 16,
        padding: "40px 40px",
        borderTop: "1px solid var(--line)",
      }}
        className="md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-soft)", margin: 0 }}>
            Financial clarity without the money shame.
          </p>
          <p style={{ fontSize: 12, color: "var(--fg-dim)", margin: "4px 0 0" }}>
            Not a bank. Not advice. A clearer way to think about your money.
          </p>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[["Privacy", "/privacy"], ["Terms", "/terms"]].map(([label, href]) => (
            <Link
              key={href} href={href as Route}
              style={{ fontSize: 13, color: "var(--fg-mute)", textDecoration: "none" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
