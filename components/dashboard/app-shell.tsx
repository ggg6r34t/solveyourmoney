import Link from "next/link";
import type { Route } from "next";
import { signOutAction } from "@/server/actions/auth";
import { requireSession } from "@/server/dal/session";
import { getGamificationData } from "@/features/gamification/services/gamificationService";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  Target,
  BookOpen,
  Upload,
  Settings,
  Bell,
  Flame,
  LogOut,
} from "lucide-react";

export type AppNavKey =
  | "overview"
  | "debt"
  | "budget"
  | "savings"
  | "learn"
  | "import"
  | "notifications"
  | "onboarding"
  | "plan"
  | "guidance"
  | "settings"
  | "admin";

type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
  count?: string;
};

const primaryNav: NavItem[] = [
  { id: "overview", label: "Overview",  href: "/dashboard",         Icon: LayoutDashboard },
  { id: "debt",     label: "Debt",      href: "/dashboard/debt",    Icon: CreditCard },
  { id: "budget",   label: "Budget",    href: "/dashboard/budget",  Icon: PieChart },
  { id: "savings",  label: "Savings",   href: "/dashboard/savings", Icon: Target },
  { id: "learn",    label: "Learn",     href: "/dashboard/learn",   Icon: BookOpen },
  { id: "import",   label: "Import",    href: "/dashboard/import",  Icon: Upload },
];

const accountNav: NavItem[] = [
  { id: "notifications",  label: "Notifications",  href: "/dashboard/notifications",     Icon: Bell },
  { id: "settings",       label: "Settings",       href: "/settings",                    Icon: Settings },
];

async function SidebarContents({ active }: { active: AppNavKey }) {
  let session: Awaited<ReturnType<typeof requireSession>> | null = null;
  try { session = await requireSession(); } catch {}

  const userId = session?.userId;
  const userName = session?.displayName ?? session?.email?.split("@")[0] ?? "Guest";
  const userEmail = session?.email ?? "";
  const initials = userName.slice(0, 2).toUpperCase();

  let xp = 0, xpMax = 250, level = 1, streak = 0, xpPct = 0;
  let levelName = "Starter", nextLevelName: string | null = "Explorer";

  if (userId) {
    try {
      const gam = await getGamificationData({ userId });
      xp = gam.xp;
      xpMax = gam.xpForNextLevel ?? (gam.xpForCurrentLevel + 1);
      level = gam.level;
      streak = gam.streak;
      xpPct = gam.xpPct;
      levelName = gam.levelName;
      nextLevelName = gam.nextLevelName;
    } catch (err) {
      console.error("[app-shell] Failed to load gamification data:", err);
    }
  }

  return (
    <>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px 10px" }}>
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
            background: "var(--fg)",
            zIndex: 1,
          }} />
        </div>
        <span style={{
          fontWeight: 560, letterSpacing: "-0.02em", fontSize: 14, color: "var(--fg)",
        }}>
          solve<span style={{ color: "var(--fg-mute)", fontWeight: 440 }}>your</span>money
        </span>
      </div>

      {/* XP Card */}
      <div style={{
        borderRadius: "var(--r-md)", padding: "14px 14px 12px",
        background: "linear-gradient(180deg, oklch(0.66 0.18 282 / 0.10), oklch(0.66 0.18 282 / 0.02))",
        boxShadow: "0 0 0 1px var(--line), 0 1px 0 var(--inner-hl) inset",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 8px 3px 6px", borderRadius: 999,
            background: "oklch(0.66 0.18 282 / 0.18)",
            fontSize: 11, fontWeight: 540, color: "oklch(0.85 0.10 282)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--primary-glow)",
              boxShadow: "0 0 8px var(--primary-glow)",
            }} />
            Level {level} · {levelName}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--streak)",
          }}>
            <Flame size={11} />
            {streak} day
          </span>
        </div>

        <div style={{
          display: "flex", alignItems: "baseline", gap: 4,
          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-soft)",
        }}>
          <span style={{ color: "var(--fg)" }}>{xp.toLocaleString()}</span>
          <span style={{ color: "var(--fg-dim)" }}>/ {xpMax.toLocaleString()} XP</span>
          <span style={{ marginLeft: "auto", color: "var(--fg-dim)" }}>{xpPct}%</span>
        </div>

        <div style={{
          height: 6, borderRadius: 999,
          background: "oklch(1 0 0 / 0.06)",
          overflow: "hidden", marginTop: 8,
        }}>
          <div style={{
            width: `${xpPct}%`, height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg, var(--primary), var(--xp-2))",
            boxShadow: "0 0 12px oklch(0.72 0.17 270 / 0.6)",
          }} />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", marginTop: 8,
          fontSize: 11, color: "var(--fg-mute)",
        }}>
          <span>Next: <span style={{ color: "var(--fg-soft)" }}>{nextLevelName ?? "Max level"}</span></span>
          <span style={{ fontFamily: "var(--font-mono)" }}>{xpMax > xp ? `+${xpMax - xp} to go` : "Legend"}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 4px" }}>
        <div style={{
          fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em",
          color: "var(--fg-dim)", padding: "12px 10px 6px",
        }}>
          Workspace
        </div>
        {primaryNav.map(({ id, label, href, Icon, count }) => {
          const isActive = active === id;
          return (
            <Link
              key={id}
              href={href as Route}
              className={isActive ? "sidebar-nav-link nav-item-active" : "sidebar-nav-link"}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8,
                fontSize: 13.5, fontWeight: 460,
                color: isActive ? "var(--fg)" : "var(--fg-soft)",
                textDecoration: "none", position: "relative",
              }}
            >
              {isActive && (
                <span style={{
                  position: "absolute", left: -8, top: 8, bottom: 8,
                  width: 2, borderRadius: 2,
                  background: "linear-gradient(180deg, var(--primary-glow), var(--xp-2))",
                  boxShadow: "0 0 8px var(--primary-glow)",
                }} />
              )}
              <Icon size={16} style={{ opacity: 0.85, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {count && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-dim)",
                }}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        <div style={{
          fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em",
          color: "var(--fg-dim)", padding: "12px 10px 6px",
        }}>
          Account
        </div>
        {accountNav.map(({ id, label, href, Icon, count }) => {
          const isActive = active === id;
          return (
            <Link
              key={id}
              href={href as Route}
              className={isActive ? "sidebar-nav-link nav-item-active" : "sidebar-nav-link"}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8,
                fontSize: 13.5, fontWeight: 460,
                color: isActive ? "var(--fg)" : "var(--fg-soft)",
                textDecoration: "none",
              }}
            >
              <Icon size={16} style={{ opacity: 0.85, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {count && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10.5,
                  color: id === "notifications" ? "var(--primary-glow)" : "var(--fg-dim)",
                }}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}

      </nav>

      {/* Profile */}
      <div style={{ marginTop: "auto" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: 10, borderRadius: "var(--r-md)",
          border: "1px solid var(--line)",
          background: "oklch(1 0 0 / 0.02)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, oklch(0.6 0.12 320), oklch(0.55 0.14 260))",
            display: "grid", placeItems: "center",
            fontSize: 12, fontWeight: 560, color: "oklch(0.98 0 0)",
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>
              {userName}
            </div>
            {userEmail && (
              <div style={{
                fontSize: 11, color: "var(--fg-mute)",
                fontFamily: "var(--font-mono)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {userEmail}
              </div>
            )}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--fg-dim)", padding: 4, borderRadius: 6,
                transition: "color 120ms ease",
              }}
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: AppNavKey;
}) {
  return (
    <div className="app-bg min-h-screen" style={{ color: "var(--fg)" }}>
      {/* Sidebar */}
      <aside style={{
        position: "fixed", inset: "0 auto 0 0", zIndex: 20,
        width: 264,
        borderRight: "1px solid var(--line)",
        background: "linear-gradient(180deg, oklch(0.16 0.014 282 / 0.6), oklch(0.135 0.012 282 / 0.6))",
        backdropFilter: "blur(12px)",
        padding: "20px 14px",
        display: "flex", flexDirection: "column", gap: 18,
        overflowY: "auto",
      }}
        className="hidden lg:flex"
      >
        <SidebarContents active={active} />
      </aside>

      {/* Main content */}
      <main style={{ paddingLeft: 0 }} className="lg:pl-66">
        <div style={{
          maxWidth: 1280, width: "100%", margin: "0 auto",
          padding: "28px 40px 56px",
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
