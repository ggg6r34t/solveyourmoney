# Premium UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform SolveYourMoney's generic dashboard UI into a premium, emotionally intelligent fintech product on par with Monarch Money / Linear by upgrading design tokens, typography, navigation, component hierarchy, page layouts, and motion — without changing any product logic.

**Architecture:** All existing server components remain server components. Client-side interactivity (Framer Motion animations, sign-out dropdown) is isolated into small dedicated client components that server components render as children. New components (`HeroPageShell`, `HeroStat`, `MetricGrid`, `PageEntrance`, `SignOutMenu`) are added; existing components (`ProgressBar`, `XPBar`, `AppShell`, `PageShell`, `MetricCard`, `EmptyState`) are rewritten in-place.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Framer Motion v12, lucide-react (new), next/font/google (Geist)

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Modify | `app/layout.tsx` | Add Geist font variable |
| Modify | `app/globals.css` | Update color tokens + font-sans reference |
| Modify | `components/dashboard/progress-bar.tsx` | Add Framer Motion fill animation |
| Modify | `components/dashboard/xp-bar.tsx` | SVG arc ring + Framer Motion |
| Create | `components/dashboard/sign-out-menu.tsx` | Client dropdown for sign-out |
| Modify | `components/dashboard/app-shell.tsx` | Lucide icons, active state, mobile nav, user block |
| Create | `components/dashboard/page-entrance.tsx` | Client wrapper for page entrance animation |
| Modify | `components/dashboard/page-shell.tsx` | Eyebrow prop, typography, spacing |
| Create | `components/dashboard/hero-page-shell.tsx` | Shell for Overview (no header) |
| Modify | `components/dashboard/metric-card.tsx` | Variants, trend icons, inline insight |
| Modify | `components/dashboard/empty-state.tsx` | Icon + heading + body + cta props |
| Create | `components/dashboard/hero-stat.tsx` | Client animated number counter |
| Create | `components/dashboard/metric-grid.tsx` | Client staggered metric grid |
| Modify | `app/(dashboard)/dashboard/page.tsx` | Hero layout |
| Modify | `app/(dashboard)/dashboard/budget/page.tsx` | Summary band + list layout |
| Modify | `app/(dashboard)/dashboard/debt/page.tsx` | Summary band + list layout + interest line |
| Modify | `app/(dashboard)/dashboard/savings/page.tsx` | Card layout + milestones |
| Modify | `app/(dashboard)/dashboard/learn/page.tsx` | Progress band + lesson rows + XP |

---

## Task 1: Foundation — lucide-react, Geist font, color tokens

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Read the Next.js font guide**

  ```
  node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md
  ```

  Confirms: use `Geist` from `next/font/google` with `variable` option to expose a CSS custom property.

- [ ] **Step 2: Install lucide-react**

  ```bash
  npm install lucide-react
  ```

  Expected output: `added 1 package` (lucide-react has no runtime dependencies).

- [ ] **Step 3: Update `app/layout.tsx`**

  Add Geist font and apply its CSS variable to `<html>`. Complete file:

  ```tsx
  import type { Metadata } from "next";
  import { Geist } from "next/font/google";
  import { AppProviders } from "./providers";
  import "./globals.css";

  const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist",
    display: "swap",
  });

  export const metadata: Metadata = {
    metadataBase: new URL("https://solveyourmoney.com"),
    title: {
      default: "SolveYourMoney | Turn financial chaos into a clear plan",
      template: "%s | SolveYourMoney",
    },
    description:
      "A financial decision coach for young adults: clarity dashboard, paid personalized money plan, and ongoing guidance.",
    applicationName: "SolveYourMoney",
    keywords: [
      "financial decision coach",
      "money plan",
      "young adults",
      "debt payoff",
      "financial clarity",
    ],
    openGraph: {
      title: "SolveYourMoney",
      description: "Turn financial chaos into a clear plan.",
      siteName: "SolveYourMoney",
      type: "website",
      url: "https://solveyourmoney.com",
    },
    robots: {
      index: true,
      follow: true,
    },
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html
        lang="en"
        className={`h-full antialiased ${geist.variable}`}
      >
        <body className="min-h-full">
          <AppProviders>{children}</AppProviders>
        </body>
      </html>
    );
  }
  ```

- [ ] **Step 4: Update `app/globals.css` — font-sans reference**

  Replace the `--font-sans` line inside `@theme inline { ... }`:

  Old:
  ```css
  --font-sans: "Aptos", "Segoe UI Variable Display", "Trebuchet MS", sans-serif;
  ```

  New:
  ```css
  --font-sans: var(--font-geist, "Segoe UI Variable Display", system-ui, sans-serif);
  ```

- [ ] **Step 5: Update `app/globals.css` — color token adjustments**

  Inside `:root { ... }`, change these six values (all other tokens unchanged):

  ```css
  --danger: #f04e5e;
  --accent: #0fb97c;
  --track: #1e2535;
  --border: #1d2438;
  --ink-muted: #7a8698;
  --surface-elevated: #0f1522;
  ```

- [ ] **Step 6: Verify font loads**

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000`. Open DevTools → Computed → `body` → `font-family`. Value should start with `Geist` or a Geist-derived name. Dismiss with Ctrl+C.

- [ ] **Step 7: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 8: Commit**

  ```bash
  git add app/layout.tsx app/globals.css package.json package-lock.json
  git commit -m "feat: install lucide-react, add Geist font, update color tokens"
  ```

---

## Task 2: Animate ProgressBar with Framer Motion

**Files:**
- Modify: `components/dashboard/progress-bar.tsx`

- [ ] **Step 1: Rewrite `components/dashboard/progress-bar.tsx`**

  Complete file. Adds `"use client"` and replaces the static fill div with a `motion.div`:

  ```tsx
  "use client";

  import { motion } from "framer-motion";
  import { cn } from "@/lib/utils";
  import type { Tone } from "@/features/dashboard/mockData";

  const toneClass: Record<Tone, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  };

  export function toneText(tone: Tone) {
    return {
      primary: "text-primary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      info: "text-info",
    }[tone];
  }

  export function toneBgSoft(tone: Tone) {
    return {
      primary: "bg-primary-soft",
      success: "bg-surface-success",
      warning: "bg-warning-soft",
      danger: "bg-danger-soft",
      info: "bg-info/15",
    }[tone];
  }

  export function ProgressBar({
    value,
    tone,
    className,
  }: {
    value: number;
    tone: Tone;
    className?: string;
  }) {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
      <div className={cn("h-2 overflow-hidden rounded-full bg-track", className)}>
        <motion.div
          className={cn("h-full rounded-full", toneClass[tone])}
          initial={{ width: "0%" }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify animation**

  ```bash
  npm run dev
  ```

  Navigate to any page using `ProgressBar` (e.g. `/dashboard/learn`). The progress bar fill should animate from 0% to its value on first render. Dismiss with Ctrl+C.

- [ ] **Step 3: Commit**

  ```bash
  git add components/dashboard/progress-bar.tsx
  git commit -m "feat: animate ProgressBar fill on mount with Framer Motion"
  ```

---

## Task 3: XPBar — SVG arc ring + Framer Motion

**Files:**
- Modify: `components/dashboard/xp-bar.tsx`

- [ ] **Step 1: Rewrite `components/dashboard/xp-bar.tsx`**

  Complete file. Replaces the badge+bar layout with an SVG arc ring avatar. The arc animates its `strokeDashoffset` from full (empty) to the correct offset (filled) on mount:

  ```tsx
  "use client";

  import { motion } from "framer-motion";

  export function XPBar({
    level,
    xp,
    max,
  }: {
    level: number;
    xp: number;
    max: number;
    compact?: boolean; // kept for API compatibility, ignored — sidebar always shows full
  }) {
    const percent = Math.max(0, Math.min(100, (xp / max) * 100));
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const targetOffset = circumference - (percent / 100) * circumference;

    return (
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="relative h-10 w-10 shrink-0">
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="18"
              cy="18"
              r={radius}
              stroke="var(--track)"
              strokeWidth="2"
            />
            <motion.circle
              cx="18"
              cy="18"
              r={radius}
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: targetOffset }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
            {level}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">Level {level}</p>
          <p className="text-[10px] text-muted">
            {xp}/{max} XP
          </p>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Verify in browser**

  ```bash
  npm run dev
  ```

  Navigate to any dashboard page. Sidebar should show the arc ring with a level number inside, animating the arc on load. Dismiss with Ctrl+C.

- [ ] **Step 4: Commit**

  ```bash
  git add components/dashboard/xp-bar.tsx
  git commit -m "feat: rewrite XPBar with SVG arc ring and Framer Motion animation"
  ```

---

## Task 4: AppShell — Lucide icons, premium active state, mobile tab bar

**Files:**
- Create: `components/dashboard/sign-out-menu.tsx`
- Modify: `components/dashboard/app-shell.tsx`

- [ ] **Step 1: Create `components/dashboard/sign-out-menu.tsx`**

  Client component for the `⋯` user menu. Extracts sign-out from the server-side AppShell:

  ```tsx
  "use client";

  import { useState } from "react";
  import { MoreHorizontal, LogOut } from "lucide-react";
  import { signOutAction } from "@/server/actions/auth";

  export function SignOutMenu() {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/6 hover:text-foreground"
          aria-label="User menu"
        >
          <MoreHorizontal size={16} />
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute bottom-full right-0 z-20 mb-1 min-w-[140px] rounded-xl border border-border bg-panel p-1 shadow-lift">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/6 hover:text-foreground"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Rewrite `components/dashboard/app-shell.tsx`**

  Complete file. Replaces Unicode icons with Lucide, rewrites active state, adds mobile bottom tab bar, updates user block and spacing:

  ```tsx
  import Link from "next/link";
  import type { Route } from "next";
  import {
    LayoutDashboard,
    TrendingDown,
    Wallet,
    PiggyBank,
    GraduationCap,
    Upload,
    ClipboardCheck,
    Map,
    Compass,
    Settings,
    ShieldCheck,
  } from "lucide-react";
  import type { LucideIcon } from "lucide-react";
  import { XPBar } from "./xp-bar";
  import { SignOutMenu } from "./sign-out-menu";

  export type AppNavKey =
    | "overview"
    | "debt"
    | "budget"
    | "savings"
    | "learn"
    | "import"
    | "onboarding"
    | "plan"
    | "guidance"
    | "settings"
    | "admin";

  type NavItem = {
    icon: LucideIcon;
    label: string;
    href: string;
    key: AppNavKey;
  };

  const navSections: Array<{ label: string; items: NavItem[] }> = [
    {
      label: "Core",
      items: [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard", key: "overview" },
        { icon: TrendingDown, label: "Debt", href: "/dashboard/debt", key: "debt" },
        { icon: Wallet, label: "Budget", href: "/dashboard/budget", key: "budget" },
        { icon: PiggyBank, label: "Savings", href: "/dashboard/savings", key: "savings" },
        { icon: GraduationCap, label: "Learn", href: "/dashboard/learn", key: "learn" },
        { icon: Upload, label: "Import", href: "/dashboard/import", key: "import" },
      ],
    },
    {
      label: "Product",
      items: [
        { icon: ClipboardCheck, label: "Reality Check", href: "/onboarding", key: "onboarding" },
        { icon: Map, label: "Plan", href: "/plan", key: "plan" },
        { icon: Compass, label: "Guidance", href: "/guidance", key: "guidance" },
        { icon: Settings, label: "Settings", href: "/settings", key: "settings" },
        { icon: ShieldCheck, label: "Admin", href: "/admin", key: "admin" },
      ],
    },
  ];

  const mobileTabs: NavItem[] = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard", key: "overview" },
    { icon: TrendingDown, label: "Debt", href: "/dashboard/debt", key: "debt" },
    { icon: Wallet, label: "Budget", href: "/dashboard/budget", key: "budget" },
    { icon: PiggyBank, label: "Savings", href: "/dashboard/savings", key: "savings" },
    { icon: GraduationCap, label: "Learn", href: "/dashboard/learn", key: "learn" },
  ];

  export function AppShell({
    children,
    active,
  }: {
    children: React.ReactNode;
    active: AppNavKey;
  }) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-[240px] flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
          <Link
            href="/dashboard"
            className="px-2 text-lg font-black tracking-[-0.04em]"
          >
            <span className="text-primary">solve</span>
            <span className="text-foreground">your</span>
            <span className="text-danger">money</span>
          </Link>

          <div className="mt-6 px-2">
            <XPBar level={7} xp={1240} max={1600} />
          </div>

          <div className="my-5 h-px bg-border/60" />

          <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.label} className="flex flex-col gap-0.5">
                <p className="mb-1 px-3 text-[10px] font-medium tracking-[0.1em] text-soft uppercase">
                  {section.label}
                </p>
                {section.items.map(({ icon: Icon, label, href, key }) => {
                  const isActive = active === key;
                  return (
                    <Link
                      key={href}
                      href={href as Route}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                        isActive
                          ? "border-l-2 border-primary bg-primary/8 text-primary"
                          : "text-muted hover:bg-white/4 hover:text-foreground"
                      }`}
                    >
                      <Icon
                        size={16}
                        className="shrink-0 transition-transform duration-150 group-hover:translate-x-[1px]"
                      />
                      <span className="font-medium">{label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between px-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  J
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    Jordan
                  </p>
                  <p className="text-[11px] text-muted">Level 7</p>
                </div>
              </div>
              <SignOutMenu />
            </div>
          </div>
        </aside>

        {/* Mobile bottom tab bar */}
        <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[60px] items-center border-t border-border bg-sidebar/90 backdrop-blur-md lg:hidden">
          {mobileTabs.map(({ icon: Icon, label, href, key }) => {
            const isActive = active === key;
            return (
              <Link
                key={href}
                href={href as Route}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors ${
                  isActive ? "text-primary" : "text-muted"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 lg:pl-[240px]">
          <div className="mx-auto min-h-screen w-full max-w-[1280px] px-6 pb-[76px] pt-10 md:px-8 lg:pb-10">
            {children}
          </div>
        </main>
      </div>
    );
  }
  ```

  > Note: `pb-[76px]` on mobile adds space above the bottom tab bar (60px bar + 16px gap). `lg:pb-10` resets it on desktop.

- [ ] **Step 3: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 4: Verify sidebar in browser**

  ```bash
  npm run dev
  ```

  Navigate to `/dashboard`. Verify:
  - Lucide icons appear for all nav items
  - Active item has left accent bar + subtle fill
  - User block shows avatar + Level + `⋯` button
  - `⋯` button opens dropdown with "Sign out"
  - On mobile viewport (<1024px), bottom tab bar appears with 5 tabs
  - XP arc ring animates on load

  Dismiss with Ctrl+C.

- [ ] **Step 5: Commit**

  ```bash
  git add components/dashboard/app-shell.tsx components/dashboard/sign-out-menu.tsx
  git commit -m "feat: rewrite AppShell with Lucide icons, premium nav, mobile tab bar"
  ```

---

## Task 5: PageEntrance + PageShell + HeroPageShell

**Files:**
- Create: `components/dashboard/page-entrance.tsx`
- Modify: `components/dashboard/page-shell.tsx`
- Create: `components/dashboard/hero-page-shell.tsx`

- [ ] **Step 1: Create `components/dashboard/page-entrance.tsx`**

  Client wrapper that animates page content in on mount:

  ```tsx
  "use client";

  import { motion } from "framer-motion";

  export function PageEntrance({ children }: { children: React.ReactNode }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }
  ```

- [ ] **Step 2: Rewrite `components/dashboard/page-shell.tsx`**

  Adds `eyebrow` prop, fixes typography weights, increases spacing, wraps content in `PageEntrance`:

  ```tsx
  import { AppShell } from "./app-shell";
  import { PageEntrance } from "./page-entrance";
  import type { AppNavKey } from "./app-shell";

  export function PageShell({
    active,
    title,
    subtitle,
    eyebrow,
    children,
  }: {
    active: AppNavKey;
    title: string;
    subtitle: string;
    eyebrow?: string;
    children: React.ReactNode;
  }) {
    return (
      <AppShell active={active}>
        <PageEntrance>
          <header className="mb-8">
            {eyebrow && (
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-soft">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-1 text-sm font-normal text-muted">{subtitle}</p>
          </header>
          {children}
        </PageEntrance>
      </AppShell>
    );
  }
  ```

- [ ] **Step 3: Create `components/dashboard/hero-page-shell.tsx`**

  Shell for the Overview page — no pre-built header, children render directly:

  ```tsx
  import { AppShell } from "./app-shell";
  import { PageEntrance } from "./page-entrance";
  import type { AppNavKey } from "./app-shell";

  export function HeroPageShell({
    active,
    children,
  }: {
    active: AppNavKey;
    children: React.ReactNode;
  }) {
    return (
      <AppShell active={active}>
        <PageEntrance>{children}</PageEntrance>
      </AppShell>
    );
  }
  ```

- [ ] **Step 4: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 5: Verify page entrance animation**

  ```bash
  npm run dev
  ```

  Navigate between any two dashboard pages (e.g. `/dashboard/budget` → `/dashboard/debt`). Content should fade up subtly on each page load. Page titles should be `font-semibold` (not heavy). Dismiss with Ctrl+C.

- [ ] **Step 6: Commit**

  ```bash
  git add components/dashboard/page-entrance.tsx components/dashboard/page-shell.tsx components/dashboard/hero-page-shell.tsx
  git commit -m "feat: add PageEntrance animation, refine PageShell typography, add HeroPageShell"
  ```

---

## Task 6: MetricCard — variants, Lucide trend icons, inline insight

**Files:**
- Modify: `components/dashboard/metric-card.tsx`

- [ ] **Step 1: Rewrite `components/dashboard/metric-card.tsx`**

  Complete file. Adds variant system, replaces status pill with icon + text, removes nested insight box:

  ```tsx
  import { TrendingUp, TrendingDown, Minus } from "lucide-react";
  import { formatCurrency } from "@/lib/format";

  type Variant = "default" | "success" | "danger" | "primary";

  const variantStyles: Record<
    Variant,
    { card: string; value: string; dot?: string }
  > = {
    default: {
      card: "bg-surface-elevated ring-1 ring-border/50",
      value: "text-foreground",
    },
    success: {
      card: "bg-surface-elevated ring-1 ring-border/50 border-l-2 border-accent",
      value: "text-foreground",
      dot: "text-accent",
    },
    danger: {
      card: "bg-surface-elevated ring-1 ring-border/50 border-l-2 border-danger",
      value: "text-danger",
    },
    primary: {
      card: "bg-primary/5 ring-1 ring-primary/20",
      value: "text-foreground",
    },
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    flat: Minus,
  } as const;

  function inferVariant(trendDirection: "up" | "down" | "flat"): Variant {
    if (trendDirection === "up") return "success";
    if (trendDirection === "down") return "danger";
    return "default";
  }

  export function MetricCard({
    label,
    value,
    trendValue = "Stable",
    trendDirection = "flat",
    insight,
    helper,
    variant,
  }: {
    label: string;
    value: number | string;
    trendValue?: string;
    trendDirection?: "up" | "down" | "flat";
    insight?: string;
    helper?: string;
    variant?: Variant;
  }) {
    const resolvedVariant = variant ?? inferVariant(trendDirection);
    const styles = variantStyles[resolvedVariant];
    const resolvedValue =
      typeof value === "number" ? formatCurrency(value) : value;
    const resolvedInsight = insight ?? helper ?? "";
    const TrendIcon = trendIcons[trendDirection];

    return (
      <div
        className={`rounded-2xl p-6 transition-shadow duration-200 hover:shadow-lift ${styles.card}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
              {styles.dot && <span className={styles.dot}>●</span>}
              {label}
            </p>
            <p className={`mt-3 text-3xl font-semibold tabular-nums ${styles.value}`}>
              {resolvedValue}
            </p>
            {resolvedInsight && (
              <p className="mt-2 text-sm font-normal leading-5 text-soft">
                {resolvedInsight}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-muted">
            <TrendIcon size={14} />
            <span>{trendValue}</span>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Verify in browser**

  ```bash
  npm run dev
  ```

  Navigate to `/dashboard`. MetricCards should show Lucide trend icons (not pill badges), `text-3xl font-semibold` values, inline insight text without a nested box. Hover should lift shadow. Dismiss with Ctrl+C.

- [ ] **Step 4: Commit**

  ```bash
  git add components/dashboard/metric-card.tsx
  git commit -m "feat: rewrite MetricCard with variant system, Lucide trend icons, inline insight"
  ```

---

## Task 7: EmptyState — icon, heading, body, cta props

**Files:**
- Modify: `components/dashboard/empty-state.tsx`

- [ ] **Step 1: Rewrite `components/dashboard/empty-state.tsx`**

  Replaces the single-string component with a structured, open-layout empty state:

  ```tsx
  import type { LucideIcon } from "lucide-react";
  import { ButtonLink } from "@/components/ui/button";
  import type { Route } from "next";

  export function EmptyState({
    icon: Icon,
    heading,
    body,
    cta,
  }: {
    icon: LucideIcon;
    heading: string;
    body: string;
    cta?: { label: string; href: string };
  }) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Icon size={32} className="text-muted" strokeWidth={1.5} />
        <h2 className="mt-4 text-base font-semibold text-foreground">
          {heading}
        </h2>
        <p className="mt-2 max-w-xs text-sm text-muted">{body}</p>
        {cta && (
          <ButtonLink href={cta.href as Route} className="mt-6">
            {cta.label}
          </ButtonLink>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Commit**

  ```bash
  git add components/dashboard/empty-state.tsx
  git commit -m "feat: rewrite EmptyState with icon/heading/body/cta props"
  ```

  > Note: Pages that use EmptyState will fail to compile until their calls are updated (Tasks 8–12). This is expected — complete all page tasks before verifying.

---

## Task 8: Overview page — hero layout with animated number counter

**Files:**
- Create: `components/dashboard/hero-stat.tsx`
- Create: `components/dashboard/metric-grid.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create `components/dashboard/hero-stat.tsx`**

  Client component. Uses Framer Motion's `animate` to count from 0 to the real value on mount:

  ```tsx
  "use client";

  import { useEffect, useRef } from "react";
  import { animate, useMotionValue } from "framer-motion";
  import { TrendingUp, TrendingDown, Minus } from "lucide-react";
  import type { LucideIcon } from "lucide-react";

  const trendIcons: Record<"up" | "down" | "flat", LucideIcon> = {
    up: TrendingUp,
    down: TrendingDown,
    flat: Minus,
  };

  function formatEur(v: number): string {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(v);
  }

  export function HeroStat({
    label,
    value,
    trendDirection = "flat",
    trendLabel = "Stable",
    subtitle,
  }: {
    label: string;
    value: number;
    trendDirection?: "up" | "down" | "flat";
    trendLabel?: string;
    subtitle?: string;
  }) {
    const motionValue = useMotionValue(0);
    const displayRef = useRef<HTMLSpanElement>(null);
    const TrendIcon = trendIcons[trendDirection];

    useEffect(() => {
      const controls = animate(motionValue, value, {
        duration: 0.8,
        ease: "easeOut",
        onUpdate(v) {
          if (displayRef.current) {
            displayRef.current.textContent = formatEur(v);
          }
        },
      });
      return controls.stop;
    }, [value, motionValue]);

    return (
      <div className="mb-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-soft">
          {label}
        </p>
        <div className="mt-2 flex items-end gap-4">
          <span
            ref={displayRef}
            className="text-5xl font-semibold tabular-nums text-foreground"
            aria-live="polite"
          >
            {formatEur(0)}
          </span>
          <div className="mb-1.5 flex items-center gap-1 text-sm text-muted">
            <TrendIcon size={14} />
            <span>{trendLabel}</span>
          </div>
        </div>
        {subtitle && (
          <p className="mt-1 text-sm font-normal text-muted">{subtitle}</p>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Create `components/dashboard/metric-grid.tsx`**

  Client component. Renders the supporting metric cards with stagger entrance animation:

  ```tsx
  "use client";

  import { motion } from "framer-motion";
  import { MetricCard } from "./metric-card";

  type MetricItem = { id: string; label: string; value: number | null };

  export function MetricGrid({ items }: { items: MetricItem[] }) {
    return (
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
              delay: index * 0.05,
            }}
          >
            <MetricCard label={item.label} value={item.value ?? 0} />
          </motion.div>
        ))}
      </div>
    );
  }
  ```

- [ ] **Step 3: Rewrite `app/(dashboard)/dashboard/page.tsx`**

  Complete file. Uses `HeroPageShell`, `HeroStat`, `MetricGrid`, updated `EmptyState`:

  ```tsx
  import { HeroPageShell } from "@/components/dashboard/hero-page-shell";
  import { HeroStat } from "@/components/dashboard/hero-stat";
  import { MetricGrid } from "@/components/dashboard/metric-grid";
  import { EmptyState } from "@/components/dashboard/empty-state";
  import { getOverviewData } from "@/features/overview/services/overviewService";
  import { requireSession } from "@/server/dal/session";
  import { LayoutDashboard } from "lucide-react";

  export default async function DashboardPage() {
    const session = await requireSession();
    const overview = await getOverviewData({ userId: session.userId });

    if (overview.items.length === 0) {
      return (
        <HeroPageShell active="overview">
          <EmptyState
            icon={LayoutDashboard}
            heading="Your financial picture starts here"
            body="Import a bank statement to populate your dashboard automatically."
            cta={{ label: "Import bank statement", href: "/dashboard/import" }}
          />
        </HeroPageShell>
      );
    }

    const [hero, ...rest] = overview.items;

    return (
      <HeroPageShell active="overview">
        <HeroStat
          label={hero.label}
          value={hero.value ?? 0}
          subtitle="Your financial snapshot"
        />
        {rest.length > 0 && <MetricGrid items={rest} />}
      </HeroPageShell>
    );
  }
  ```

- [ ] **Step 4: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 5: Verify Overview page**

  ```bash
  npm run dev
  ```

  Navigate to `/dashboard`. Verify:
  - Large hero stat at top (no card border, counts up from 0)
  - Supporting metrics below in a 2–3 column grid, staggering in
  - Empty state (if no data) shows icon + heading + CTA

  Dismiss with Ctrl+C.

- [ ] **Step 6: Commit**

  ```bash
  git add components/dashboard/hero-stat.tsx components/dashboard/metric-grid.tsx app/(dashboard)/dashboard/page.tsx
  git commit -m "feat: rewrite Overview with hero stat, MetricGrid stagger, updated empty state"
  ```

---

## Task 9: Budget page — summary band + animated list layout

**Files:**
- Modify: `app/(dashboard)/dashboard/budget/page.tsx`

- [ ] **Step 1: Rewrite `app/(dashboard)/dashboard/budget/page.tsx`**

  Complete file. Summary band at top, list rows with dividers, animated `ProgressBar`, over-budget indicators:

  ```tsx
  import { EmptyState } from "@/components/dashboard/empty-state";
  import { PageShell } from "@/components/dashboard/page-shell";
  import { ProgressBar } from "@/components/dashboard/progress-bar";
  import { getBudgetData } from "@/features/budget/services/budgetService";
  import { requireSession } from "@/server/dal/session";
  import { Wallet, AlertCircle } from "lucide-react";

  function fmt(value: number): string {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  export default async function BudgetPage() {
    const session = await requireSession();
    const { categories } = await getBudgetData({ userId: session.userId });
    const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

    if (categories.length === 0) {
      return (
        <PageShell
          active="budget"
          title="Budget"
          subtitle="Track your monthly spending by category."
          eyebrow="Finances › Budget"
        >
          <EmptyState
            icon={Wallet}
            heading="No budget categories yet"
            body="Import a bank statement to get started automatically."
            cta={{ label: "Import bank statement", href: "/dashboard/import" }}
          />
        </PageShell>
      );
    }

    const overallPct =
      totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

    return (
      <PageShell
        active="budget"
        title="Budget"
        subtitle={`${categories.length} categor${categories.length === 1 ? "y" : "ies"} tracked this month`}
        eyebrow="Finances › Budget"
      >
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-soft">
            Monthly Budget
          </p>
          <p className="mt-1 text-sm text-muted">
            <span className="font-semibold text-foreground">
              {fmt(totalSpent)}
            </span>{" "}
            spent of{" "}
            <span className="font-semibold text-foreground">
              {fmt(totalAllocated)}
            </span>{" "}
            budgeted
            <span className="ml-2">({overallPct}%)</span>
          </p>
        </div>

        <div className="divide-y divide-border/50">
          {categories.map((category) => {
            const pct =
              category.allocated > 0
                ? Math.round((category.spent / category.allocated) * 100)
                : 0;
            const over = category.spent > category.allocated;
            return (
              <div
                key={category.id}
                className="flex items-center gap-4 py-4"
              >
                <div className="w-36 shrink-0 sm:w-44">
                  <div className="flex items-center gap-1.5">
                    {over && (
                      <AlertCircle size={12} className="shrink-0 text-danger" />
                    )}
                    <p
                      className={`truncate text-sm font-medium ${
                        over ? "text-danger" : "text-foreground"
                      }`}
                    >
                      {category.label}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <ProgressBar
                    value={pct}
                    tone={over ? "danger" : "primary"}
                    className="h-3"
                  />
                </div>
                <div className="hidden shrink-0 text-right text-xs text-muted sm:block">
                  <span>{fmt(category.spent)}</span>
                  <span className="mx-1">/</span>
                  <span>{fmt(category.allocated)}</span>
                </div>
                <p
                  className={`w-12 shrink-0 text-right text-sm font-semibold ${
                    over ? "text-danger" : "text-foreground"
                  }`}
                >
                  {pct}%
                </p>
              </div>
            );
          })}
        </div>
      </PageShell>
    );
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Verify Budget page**

  ```bash
  npm run dev
  ```

  Navigate to `/dashboard/budget`. Verify:
  - Summary band at top (open, no card)
  - List rows with `border-b` dividers (no per-row card box)
  - Progress bars animate from 0 to actual width
  - Over-budget rows show `AlertCircle` icon and danger color

  Dismiss with Ctrl+C.

- [ ] **Step 4: Commit**

  ```bash
  git add app/(dashboard)/dashboard/budget/page.tsx
  git commit -m "feat: rewrite Budget page with summary band, list layout, animated bars"
  ```

---

## Task 10: Debt page — summary band + list layout + monthly interest line

**Files:**
- Modify: `app/(dashboard)/dashboard/debt/page.tsx`

- [ ] **Step 1: Rewrite `app/(dashboard)/dashboard/debt/page.tsx`**

  Complete file. Summary band, sorted by balance descending, monthly interest cost for interest-bearing debts:

  ```tsx
  import { EmptyState } from "@/components/dashboard/empty-state";
  import { PageShell } from "@/components/dashboard/page-shell";
  import { getDebtData } from "@/features/debt/services/debtService";
  import { requireSession } from "@/server/dal/session";
  import { TrendingDown } from "lucide-react";

  function fmt(value: number): string {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  export default async function DebtPage() {
    const session = await requireSession();
    const { items } = await getDebtData({ userId: session.userId });
    const totalDebt = items.reduce((sum, d) => sum + d.principal, 0);

    if (items.length === 0) {
      return (
        <PageShell
          active="debt"
          title="Debt Tracker"
          subtitle="Track what you owe and build a payoff plan."
          eyebrow="Finances › Debt"
        >
          <EmptyState
            icon={TrendingDown}
            heading="No debts tracked"
            body="Add your first debt to build a payoff plan."
            cta={{ label: "Import bank statement", href: "/dashboard/import" }}
          />
        </PageShell>
      );
    }

    // Highest balance first — most urgent debt is at the top
    const sorted = [...items].sort((a, b) => b.principal - a.principal);

    return (
      <PageShell
        active="debt"
        title="Debt Tracker"
        subtitle={`${items.length} account${items.length === 1 ? "" : "s"} tracked`}
        eyebrow="Finances › Debt"
      >
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-soft">
            Total Debt
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground">
              {fmt(totalDebt)}
            </span>
            <span className="text-sm text-muted">
              across {items.length} account{items.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {sorted.map((debt) => {
            const monthlyInterest =
              debt.interestRate > 0
                ? (debt.principal * debt.interestRate) / 12
                : 0;
            return (
              <div
                key={debt.id}
                className="flex items-start justify-between py-5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {debt.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {debt.interestRate > 0
                      ? `${(debt.interestRate * 100).toFixed(1)}% APR`
                      : "No interest"}
                  </p>
                  {monthlyInterest > 0 && (
                    <p className="mt-1 text-xs text-warning">
                      ~{fmt(monthlyInterest)}/mo in interest
                    </p>
                  )}
                </div>
                <p className="text-base font-semibold text-foreground">
                  {fmt(debt.principal)}
                </p>
              </div>
            );
          })}
        </div>
      </PageShell>
    );
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Verify Debt page**

  ```bash
  npm run dev
  ```

  Navigate to `/dashboard/debt`. Verify:
  - Summary band at top with total debt amount
  - Items sorted by balance (highest first)
  - APR line below each label
  - Warning-colored monthly interest cost for interest-bearing debts
  - Empty state shows `TrendingDown` icon

  Dismiss with Ctrl+C.

- [ ] **Step 4: Commit**

  ```bash
  git add app/(dashboard)/dashboard/debt/page.tsx
  git commit -m "feat: rewrite Debt page with summary band, sorted list, monthly interest line"
  ```

---

## Task 11: Savings page — cards with milestones and completion state

**Files:**
- Modify: `app/(dashboard)/dashboard/savings/page.tsx`

- [ ] **Step 1: Rewrite `app/(dashboard)/dashboard/savings/page.tsx`**

  Complete file. Goal cards with `ProgressBar`, milestone labels, and completion state:

  ```tsx
  import { EmptyState } from "@/components/dashboard/empty-state";
  import { PageShell } from "@/components/dashboard/page-shell";
  import { ProgressBar } from "@/components/dashboard/progress-bar";
  import { getSavingsData } from "@/features/savings/services/savingsService";
  import { requireSession } from "@/server/dal/session";
  import { PiggyBank, CheckCircle } from "lucide-react";

  function fmt(value: number): string {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getMilestoneLabel(pct: number): string | null {
    if (pct >= 100) return null;
    if (pct >= 75) return "Almost there";
    if (pct >= 50) return "Halfway there";
    if (pct >= 25) return "Quarter of the way there";
    return null;
  }

  export default async function SavingsPage() {
    const session = await requireSession();
    const { goals } = await getSavingsData({ userId: session.userId });
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.current, 0);

    if (goals.length === 0) {
      return (
        <PageShell
          active="savings"
          title="Savings Goals"
          subtitle="Build toward what matters most."
          eyebrow="Finances › Savings"
        >
          <EmptyState
            icon={PiggyBank}
            heading="No savings goals yet"
            body="Set your first goal — even a small one builds momentum."
            cta={{ label: "Import bank statement", href: "/dashboard/import" }}
          />
        </PageShell>
      );
    }

    return (
      <PageShell
        active="savings"
        title="Savings Goals"
        subtitle={`${fmt(totalCurrent)} saved of ${fmt(totalTarget)} total target`}
        eyebrow="Finances › Savings"
      >
        <div className="grid gap-6">
          {goals.map((goal) => {
            const pct =
              goal.target > 0
                ? Math.round((goal.current / goal.target) * 100)
                : 0;
            const complete = pct >= 100;
            const milestone = getMilestoneLabel(pct);

            return (
              <div
                key={goal.id}
                className={`rounded-2xl bg-surface-elevated p-6 ring-1 ring-border/50 ${
                  complete ? "border-l-2 border-accent" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {complete && (
                      <CheckCircle
                        size={16}
                        className="shrink-0 text-accent"
                      />
                    )}
                    <p className="text-base font-semibold text-foreground">
                      {goal.label}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-semibold ${
                      complete ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {Math.min(pct, 100)}%
                  </p>
                </div>
                {milestone && (
                  <p className="mt-2 text-[10px] font-medium text-primary">
                    {milestone}
                  </p>
                )}
                <div className="mt-3">
                  <ProgressBar
                    value={pct}
                    tone={complete ? "success" : "primary"}
                    className="h-3"
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted">
                  <span>{fmt(goal.current)} saved</span>
                  <span>{fmt(goal.target)} target</span>
                </div>
              </div>
            );
          })}
        </div>
      </PageShell>
    );
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Verify Savings page**

  ```bash
  npm run dev
  ```

  Navigate to `/dashboard/savings`. Verify:
  - Goals in individual cards (not list rows)
  - Progress bars animate from 0 on load, height `h-3`
  - Milestone labels appear at ≥25% / ≥50% / ≥75%
  - 100% goals show `CheckCircle`, green bar, left accent border
  - Empty state shows `PiggyBank` icon

  Dismiss with Ctrl+C.

- [ ] **Step 4: Commit**

  ```bash
  git add app/(dashboard)/dashboard/savings/page.tsx
  git commit -m "feat: rewrite Savings page with milestone labels and completion state"
  ```

---

## Task 12: Learn page — progress band, lesson rows, XP display

**Files:**
- Modify: `app/(dashboard)/dashboard/learn/page.tsx`

- [ ] **Step 1: Rewrite `app/(dashboard)/dashboard/learn/page.tsx`**

  Complete file. Progress band at top, lesson list rows with completion circles and XP display. `XP_PER_LESSON = 50` is a constant (the `Lesson` schema has no `xpReward` field):

  ```tsx
  import { EmptyState } from "@/components/dashboard/empty-state";
  import { PageShell } from "@/components/dashboard/page-shell";
  import { ProgressBar } from "@/components/dashboard/progress-bar";
  import { getLearnData } from "@/features/learn/services/learnService";
  import { requireSession } from "@/server/dal/session";
  import { GraduationCap, CheckCircle } from "lucide-react";

  const XP_PER_LESSON = 50;

  export default async function LearnPage() {
    const session = await requireSession();
    const { lessons } = await getLearnData({ userId: session.userId });
    const completedCount = lessons.filter((l) => l.completed).length;
    const completedPct =
      lessons.length > 0
        ? Math.round((completedCount / lessons.length) * 100)
        : 0;

    if (lessons.length === 0) {
      return (
        <PageShell
          active="learn"
          title="Learn & Earn XP"
          subtitle="Build your money knowledge."
          eyebrow="Growth › Learn"
        >
          <EmptyState
            icon={GraduationCap}
            heading="No lessons yet"
            body="Check back soon — lessons are being added."
          />
        </PageShell>
      );
    }

    return (
      <PageShell
        active="learn"
        title="Learn & Earn XP"
        subtitle={`${completedCount} of ${lessons.length} lesson${lessons.length === 1 ? "" : "s"} complete`}
        eyebrow="Growth › Learn"
      >
        <div className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-soft">
            Financial Literacy
          </p>
          <div className="mt-2">
            <ProgressBar value={completedPct} tone="primary" className="h-2" />
          </div>
          <p className="mt-2 text-xs text-muted">
            Keep going — each lesson builds on the last.
          </p>
        </div>

        <div className="divide-y divide-border/40">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center gap-4 py-4">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  lesson.completed ? "bg-primary/15" : "ring-1 ring-border"
                }`}
              >
                {lesson.completed && (
                  <CheckCircle size={16} className="text-primary" />
                )}
              </div>
              <p
                className={`flex-1 text-sm ${
                  lesson.completed
                    ? "font-normal text-muted"
                    : "font-medium text-foreground"
                }`}
              >
                {lesson.title}
              </p>
              <p
                className={`shrink-0 text-xs font-medium ${
                  lesson.completed ? "text-primary/60" : "text-primary"
                }`}
              >
                {lesson.completed
                  ? `✓ ${XP_PER_LESSON} XP`
                  : `+${XP_PER_LESSON} XP`}
              </p>
            </div>
          ))}
        </div>
      </PageShell>
    );
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Verify Learn page**

  ```bash
  npm run dev
  ```

  Navigate to `/dashboard/learn`. Verify:
  - Progress band at top with animated progress bar
  - Lesson rows with `border-b` dividers (no per-row card box)
  - Incomplete: empty ring circle, full-weight title, `+50 XP` in primary color
  - Completed: filled primary-tinted circle with `CheckCircle`, muted title (no strikethrough), `✓ 50 XP` in subdued primary
  - Empty state shows `GraduationCap` icon

  Dismiss with Ctrl+C.

- [ ] **Step 4: Final full test run**

  ```bash
  npm run test:local
  ```

  Expected: `All tests passed (lightweight)`

- [ ] **Step 5: Commit**

  ```bash
  git add app/(dashboard)/dashboard/learn/page.tsx
  git commit -m "feat: rewrite Learn page with progress band, lesson rows, XP display"
  ```

---

## Done

All 12 tasks complete. The full redesign covers:

- Geist font + refined color tokens
- Framer Motion progress bar + XP arc ring animations
- Lucide icons throughout
- Premium sidebar with Linear-quality active state and mobile tab bar
- Page entrance animations
- MetricCard variant system
- EmptyState with contextual icons
- Overview hero layout with animated number counter + staggered grid
- Budget list layout with animated bars + over-budget indicators
- Debt list with sorted balances + monthly interest warning
- Savings cards with milestone labels + completion state
- Learn page with progress band + completion circles + XP display
