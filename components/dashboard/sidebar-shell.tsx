"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  LayoutDashboard, CreditCard, PieChart, Target, BookOpen,
  Upload, Bell, Settings, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import type { AppNavKey } from "./app-shell";

type IconNavItem = {
  id: string;
  label: string;
  href: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
};

const COLLAPSED_NAV: IconNavItem[] = [
  { id: "overview",      label: "Overview",      href: "/dashboard",                   Icon: LayoutDashboard },
  { id: "debt",          label: "Debt",          href: "/dashboard/debt",              Icon: CreditCard },
  { id: "budget",        label: "Budget",        href: "/dashboard/budget",            Icon: PieChart },
  { id: "savings",       label: "Savings",       href: "/dashboard/savings",           Icon: Target },
  { id: "learn",         label: "Learn",         href: "/dashboard/learn",             Icon: BookOpen },
  { id: "import",        label: "Import",        href: "/dashboard/import",            Icon: Upload },
  { id: "notifications", label: "Notifications", href: "/dashboard/notifications",     Icon: Bell },
  { id: "settings",      label: "Settings",      href: "/settings",                    Icon: Settings },
];

export function DesktopSidebarShell({
  active,
  sidebarContents,
  children,
}: {
  active: AppNavKey;
  sidebarContents: React.ReactNode;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar — display controlled entirely by className; no inline display override */}
      <aside
        className="hidden lg:flex"
        style={{
          position: "fixed", inset: "0 auto 0 0", zIndex: 20,
          width: collapsed ? 64 : 264,
          transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          borderRight: "1px solid var(--line)",
          background: "linear-gradient(180deg, oklch(0.16 0.014 282 / 0.6), oklch(0.135 0.012 282 / 0.6))",
          backdropFilter: "blur(12px)",
          flexDirection: "column",
          gap: collapsed ? 8 : 18,
          padding: collapsed ? "16px 0" : "20px 14px",
          overflowY: "auto", overflowX: "hidden",
        }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            alignSelf: collapsed ? "center" : "flex-end",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
            background: "transparent", border: "none",
            cursor: "pointer", color: "var(--fg-dim)",
            transition: "color 120ms ease",
          }}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>

        {collapsed ? (
          <nav aria-label="Main navigation" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {COLLAPSED_NAV.map(({ id, label, href, Icon }) => {
              const isActive = active === id;
              return (
                <Link
                  key={id}
                  href={href as Route}
                  title={label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 40, height: 40, borderRadius: 8,
                    textDecoration: "none",
                    color: isActive ? "var(--primary-glow)" : "var(--fg-soft)",
                    background: isActive ? "oklch(0.66 0.18 282 / 0.08)" : "transparent",
                    transition: "color 120ms ease, background 120ms ease",
                  }}
                >
                  <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                </Link>
              );
            })}
          </nav>
        ) : (
          sidebarContents
        )}
      </aside>

      {/* Main content — padding-left tracks sidebar width on desktop */}
      <main
        style={{ transition: "padding-left 200ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        className={collapsed ? "lg:pl-16" : "lg:pl-66"}
      >
        <div className="main-content">
          {children}
        </div>
      </main>
    </>
  );
}
