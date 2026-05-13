# SolveYourMoney — Premium UI Redesign

**Date:** 2026-05-13
**Approach:** Structural Refinement + Premium Polish (Approach B)
**Status:** Approved — ready for implementation planning

---

## Goal

Transform SolveYourMoney from a generic AI-dashboard feel into a premium, emotionally intelligent fintech product that feels credible alongside Monarch Money, YNAB, Linear, and Apple Health. All existing functionality, pages, and product logic are preserved. Only quality is elevated.

---

## Decisions Made

| Decision | Choice |
|---|---|
| Icon system | `lucide-react` (install) |
| Typography | Geist via `next/font/google` |
| Overview layout | Hero stat + supporting grid |
| Gamification scope | Sidebar only — quiet |
| Animation library | Framer Motion (already installed) |

---

## Section 1 — Design System: Tokens, Typography, Spacing

### Typography

Install Geist via `next/font/google`. Apply as `--font-sans` CSS variable in `app/layout.tsx`. No other files need to change — the existing `font-family: var(--font-sans)` on `body` picks it up automatically.

**Type scale:**

| Role | Size | Weight | Where used |
|---|---|---|---|
| Page title | `text-2xl` / 24px | 600 (`font-semibold`) | `h1` in PageShell |
| Section heading | `text-lg` / 18px | 600 | Card headings, panel titles |
| Eyebrow label | `text-[11px]` | 500 (`font-medium`) | Uppercase tracking labels |
| Body | `text-sm` / 14px | 400 (`font-normal`) | Descriptions, supporting text |
| Hero metric value | `text-5xl` / 48px | 600 | Overview hero stat |
| Metric value | `text-3xl` / 30px | 600 | MetricCard values |
| Micro | `text-xs` / 12px | 400–500 | XP count, dates, secondary labels |
| Brand wordmark | — | 900 (`font-black`) | Sidebar logo only |

**Rule:** `font-black` (900) is used **only** on the brand wordmark. Everything else uses 400–600.

### Color Token Adjustments

Existing token names are kept. Only values change:

| Token | Current value | New value | Reason |
|---|---|---|---|
| `--danger` | `#ff3d55` | `#f04e5e` | Muted red — less alarming, more trustworthy |
| `--accent` | `#10c987` | `#0fb97c` | Slightly warmer green, less crypto |
| `--track` | `#2b3244` | `#1e2535` | Darker track — less visible as an element |
| `--border` | `#293244` | `#1d2438` | Quieter borders |
| `--ink-muted` | `#8d99ae` | `#7a8698` | Lower contrast for muted text |
| `--surface-elevated` | `#111724` | `#0f1522` | Tighter surface layering |

All other token values remain unchanged.

### Spacing

Use Tailwind's existing scale consistently. Core changes:
- Outer page padding: `py-10` (up from `py-7`), `px-6 md:px-8` (up from `px-5 md:px-7`)
- Card internal padding: `p-6` (up from `p-5`)
- Grid gaps: `gap-6` for content grids (up from `gap-4`)
- Page header bottom margin: `mb-8` (up from `mb-6`)

---

## Section 2 — Sidebar / Navigation

### Icon Mapping

Install `lucide-react`. Map nav items:

| Nav item | Lucide icon |
|---|---|
| Overview | `LayoutDashboard` |
| Debt | `TrendingDown` |
| Budget | `Wallet` |
| Savings | `PiggyBank` |
| Learn | `GraduationCap` |
| Import | `Upload` |
| Reality Check | `ClipboardCheck` |
| Plan | `Map` |
| Guidance | `Compass` |
| Settings | `Settings` |
| Admin | `ShieldCheck` |

### Active State

Replace `bg-primary-soft` block background with:
- `border-l-2 border-primary` — left accent bar
- `bg-primary/8` — subtle fill
- `text-primary` — label color

Inactive items: `text-muted hover:text-foreground hover:bg-white/4` with `transition-colors duration-150`.

Icon hover: add `transition-transform duration-150` + `group-hover:translate-x-[1px]` nudge.

### Section Labels

Section labels ("Core", "Product"):
- `text-[10px] font-medium tracking-[0.1em] text-soft` (down from `font-black uppercase tracking-[0.12em]`)
- They should whisper, not compete

### Sidebar Dimensions

- Width: `w-[240px]` (up from `w-[230px]`)
- Inner padding: `px-4 py-6` (up from `px-3 py-5`)
- Nav item padding: `px-3 py-2` (down from `px-4 py-2.5`) — icons do the visual work

### XP System in Sidebar

Replace the `LVL {n}` rectangle badge + `ProgressBar` with:
- User avatar: `w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-semibold` with initial letter
- Wrap in a thin arc progress ring using `conic-gradient` on a `::before` pseudo-element in `--primary` color
- Below avatar: `Level {n}` at `text-xs font-medium text-foreground` + `{xp}/{max} XP` at `text-[10px] text-muted`
- XP progress bar: `h-[1.5px]` at rest, animates to `h-[3px]` on hover — nearly invisible until focused
- Framer Motion animate-on-mount: fill from 0% to actual XP over 600ms ease-out

### Sign-out

Move sign-out from a full-width ghost `Button` to a `⋯` button (`MoreHorizontal` Lucide icon) on the user block row. Clicking opens a small inline dropdown with "Sign out". Saves vertical space, matches Linear's user block pattern.

### Bottom User Block

Remove `border-t border-border`. Replace with `mt-auto pt-5` — whitespace as separator.

### Mobile Navigation

On mobile (`lg:hidden`), render a **bottom tab bar** instead of the sidebar:
- 5 core tabs: Overview, Debt, Budget, Savings, Learn
- `More` tab (ellipsis icon) for Import, Settings, etc.
- Height: `60px`, `bg-sidebar/90 backdrop-blur-md`, `border-t border-border`
- Icons at 20px, labels at `text-[10px]`, active tab: `text-primary`
- Fixed to bottom of viewport: `fixed bottom-0 inset-x-0 z-20`

---

## Section 3 — Page Shell & Layout System

### PageShell Component Changes

**Title:**
- Size: `text-2xl` (down from `text-3xl`)
- Weight: `font-semibold` (down from `font-black`)
- Tracking: remove `tracking-[-0.04em]` — Geist doesn't need forced negative tracking

**Subtitle:**
- Weight: `font-normal` (down from `font-semibold`)
- Color: `text-muted` (unchanged)

**New `eyebrow` prop:**
- Type: `string | undefined`
- Renders as `text-[10px] font-medium tracking-[0.14em] uppercase text-soft mb-1` above the title
- Example: `eyebrow="Finances › Budget"`
- Optional — only Budget, Debt, Savings, Learn pages use it

**Spacing:**
- Header bottom margin: `mb-8`
- Outer content padding: `py-10 px-6 md:px-8`

### HeroPageShell

New component for Overview page only. Same `active` prop, same AppShell wrapper, but renders no header block — the hero stat zone serves as the header. Children render directly in the content area.

### Mobile Shell

Bottom tab bar replaces sidebar on `< lg` breakpoints (implemented in `AppShell`, see Section 2).

---

## Section 4 — Overview Page (Hero Layout)

### Zone 1 — Hero Stat

Full-width, no card border, no background fill. Open section on the page background.

Structure:
```
[eyebrow: "NET WORTH · AS OF TODAY"  —  text-[11px] font-medium tracking-[0.1em] text-soft]
[value: €24,850  —  text-5xl font-semibold text-foreground]  [trend: ↑ Stable  —  inline, text-sm text-muted]
[subtitle: "Your financial foundation"  —  text-sm text-muted font-normal]
[timestamp: "Updated just now"  —  text-xs text-soft, rendered if lastUpdated available]
```

The trend indicator: a Lucide `TrendingUp` / `TrendingDown` / `Minus` icon at 14px + label text, no pill shape.

Number counter animation: on mount, hero value counts up from 0 to actual value over 800ms using Framer Motion's `useMotionValue` + `animate` (not raw `requestAnimationFrame`) for consistency with the rest of the motion system. Applied only to the hero stat, nowhere else.

### Zone 2 — Supporting Grid

`grid grid-cols-2 xl:grid-cols-3 gap-6 mt-10`

Renders `overview.items` from index 1 onward as refined `MetricCard` components (see Section 5). Stagger entrance: each card delays by `index * 50ms`.

### Divider

`mt-8 mb-2` whitespace gap between Zone 1 and Zone 2. No `<hr>`.

### Zero-item State

`HeroPageShell` renders a centered empty state with `LayoutDashboard` icon, heading `"Your financial picture starts here"`, body `"Import a bank statement to populate your dashboard automatically."`, and a primary CTA button linking to `/dashboard/import`.

---

## Section 5 — MetricCard Component

### Variants

Driven by a `variant` prop: `"default" | "success" | "danger" | "primary"`. Inferred from `trendDirection` if not explicitly passed.

**`default`:**
- Background: `bg-surface-elevated`
- Border: `ring-1 ring-border/50` (no explicit border — ring gives depth)
- Value: `text-3xl font-semibold text-foreground`
- Label: `text-[11px] font-medium tracking-[0.1em] uppercase text-muted`

**`success`:**
- Same as default + `border-l-2 border-accent`
- Small `●` dot in `text-accent` before the label

**`danger`:**
- Same as default + `border-l-2 border-danger`
- Value color: `text-danger`

**`primary`:**
- Background: `bg-primary/5 ring-1 ring-primary/20`

### Insight Text

Remove the nested `dashboard-card-soft` box. Insight renders as:
```
text-sm font-normal text-soft leading-5 mt-3
```
Flat text on the card background. No container.

### Trend Indicator

Replace the status pill with:
```
[Lucide icon: TrendingUp / TrendingDown / Minus, size 14]
[label text: text-[11px] font-medium text-muted]
```
Displayed inline in the top-right of the card. No pill background, no uppercase, no font-weight 900.

### Spacing

`p-6 rounded-2xl` — padding up from `p-5`.

### Hover State

`hover:ring-border-strong hover:shadow-lift transition-shadow duration-200` — elevation on hover, no scale transform.

### Entrance Animation

On Overview page: `motion.div` wrapper with stagger (see Section 4).

---

## Section 6 — Budget, Debt & Savings Pages

### Budget Page

**Summary band (top, open — no card):**
```
[eyebrow: "MONTHLY BUDGET"]
[€2,340 spent   of   €3,200 budgeted  (73%)]
```
`text-muted` for labels, `text-foreground font-semibold` for values. `mb-8` below.

**Category list — no per-row card:**
- Items separated by `border-b border-border/50` dividers
- Row layout: `flex items-center gap-4 py-4`
- Left: category label `text-sm font-medium text-foreground` + over-budget `AlertCircle` icon in `text-danger` if `spent > allocated`
- Center: progress bar `h-3 rounded-full` — `bg-danger` if over-budget, `bg-primary` otherwise. Framer Motion animate-on-mount: 0% → actual width over 600ms.
- Right: `spent / allocated` in `text-xs text-muted`, percentage in `text-sm font-semibold text-foreground` (or `text-danger` if over)

### Debt Page

**Summary band:** Same pattern as Budget — open, no card.

**Debt item rows:**
- `border-b border-border/50` dividers, `py-5`
- Left: label `text-sm font-medium` + APR rate `text-xs text-muted` below
- Right: balance `text-base font-semibold text-foreground`
- If `interestRate > 0`: interest cost line `~€{principal × rate / 12}/mo in interest` at `text-xs text-warning` — quiet urgency signal
- No progress bar (no meaningful 0–100% without a goal)
- Sorted by balance descending (highest first) in the page component: `.sort((a, b) => b.principal - a.principal)` before rendering. No service changes.

### Savings Page

**Card layout** (goals deserve individual weight — aspirational):
- `p-6 rounded-2xl bg-surface-elevated ring-1 ring-border/50`
- Label: `text-base font-semibold`
- Progress bar: `h-3 bg-primary rounded-full`, animate-on-mount 0% → actual width
- Flanking values: percentage left, `current / target` right, both `text-xs text-muted`
- Milestone label above bar: if `pct >= 25` → `"Quarter of the way there"`, `>= 50` → `"Halfway there"`, `>= 75` → `"Almost there"`. Rendered as `text-[10px] font-medium text-primary` — only appears at milestones.
- Completion state (`pct === 100`): bar `bg-accent`, label gets `CheckCircle` icon in `text-accent`, card gets `border-l-2 border-accent`

---

## Section 7 — Learn Page & Empty States

### Learn Page

**Progress summary band (top, open):**
```
[eyebrow: "FINANCIAL LITERACY"]
[3 of 12 lessons complete — progress bar h-2 full-width bg-primary]
["Keep going — each lesson builds on the last." — text-xs text-muted]
```
`mb-8` below.

**Lesson rows — `border-b border-border/40` dividers, `py-4`:**

*Incomplete:*
- Left: `w-8 h-8 rounded-full ring-1 ring-border` empty circle
- Center: title `text-sm font-medium text-foreground`
- Right: `+{lesson.xpReward ?? 50} XP` — `text-xs font-medium text-primary`

*Completed:*
- Left: `w-8 h-8 rounded-full bg-primary/15` with `CheckCircle` icon `text-primary` — earned, not erased
- Center: title `text-sm text-muted font-normal` — no strikethrough
- Right: `✓ {lesson.xpReward ?? 50} XP` — `text-xs text-primary/60` — subdued, already claimed

**Lesson groups:** If `lesson.category` exists, group by category with `text-[10px] uppercase tracking-[0.1em] text-soft font-medium` section labels. Otherwise render flat.

### EmptyState Component

Replace current single-string component with:

```tsx
interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  body: string;
  cta?: { label: string; href: string };
}
```

Rendered as open layout (no card border), centered, `py-16`:
```
[icon — 32px text-muted]
[heading — text-base font-semibold text-foreground mt-4]
[body — text-sm text-muted mt-2 max-w-xs text-center]
[CTA button — mt-6, if provided]
```

**Page-specific defaults:**

| Page | Icon | Heading | Body |
|---|---|---|---|
| Budget | `Wallet` | "No budget categories yet" | "Import a bank statement to get started automatically." |
| Debt | `TrendingDown` | "No debts tracked" | "Add your first debt to build a payoff plan." |
| Savings | `PiggyBank` | "No savings goals yet" | "Set your first goal — even a small one builds momentum." |
| Learn | `GraduationCap` | "No lessons yet" | "Check back soon — lessons are being added." |
| Overview | `LayoutDashboard` | "Your financial picture starts here" | "Import a bank statement to populate your dashboard automatically." |

---

## Section 8 — Motion & Interaction

### Principles

- All animation has a functional purpose — it is never decorative
- `prefers-reduced-motion` is already handled in `globals.css` — leave it unchanged
- No page-transition animations between routes
- No spring physics — easing curves only
- No skeleton-to-content crossfades

### Progress Bars

All progress fill elements (`ProgressBar`, `XPBar` in sidebar, budget rows, savings cards):

```tsx
// Replace <div style={{ width: `${value}%` }} /> with:
<motion.div
  initial={{ width: "0%" }}
  animate={{ width: `${value}%` }}
  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
/>
```

### Page Entrance

Wrap `PageShell` children in:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25, ease: "easeOut" }}
>
```

### Metric Card Stagger (Overview only)

Each card on the Overview grid:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.05 }}
>
```

### Card Hover Elevation

```tsx
// On MetricCard and savings goal cards:
className="... hover:ring-border-strong hover:shadow-lift transition-shadow duration-200"
```
No scale transform. Elevation only.

### Sidebar Nav Hover

```tsx
// Icon wrapper:
className="transition-transform duration-150 group-hover:translate-x-[1px]"
```

### Hero Stat Number Counter (Overview only)

```tsx
// useEffect + requestAnimationFrame counter
// 0 → actual value over 800ms
// Applied only to the hero stat, nowhere else
```

### XP Bar in Sidebar

Animate fill from 0% to actual XP on mount using the same `600ms ease-out` Framer Motion config as progress bars.

---

## Files Changed

### New dependencies
- `lucide-react` (install)

### Modified files
- `app/globals.css` — color token value updates
- `app/layout.tsx` — Geist font setup
- `components/dashboard/app-shell.tsx` — Lucide icons, active state, sign-out menu, mobile bottom tab bar, XP system, sidebar dimensions
- `components/dashboard/xp-bar.tsx` — arc ring system, Framer Motion animate
- `components/dashboard/progress-bar.tsx` — Framer Motion animate-on-mount
- `components/dashboard/metric-card.tsx` — variants, insight text, trend indicator, hover state
- `components/dashboard/page-shell.tsx` — new props (eyebrow), spacing, typography
- `components/dashboard/empty-state.tsx` — icon + heading + body + cta props
- `app/(dashboard)/dashboard/page.tsx` — hero layout, HeroPageShell, number counter
- `app/(dashboard)/dashboard/budget/page.tsx` — summary band, list layout, animated bars
- `app/(dashboard)/dashboard/debt/page.tsx` — summary band, list layout, interest cost line
- `app/(dashboard)/dashboard/savings/page.tsx` — card layout, milestones, animated bars, completion state
- `app/(dashboard)/dashboard/learn/page.tsx` — progress band, lesson row states, XP display

### New files
- `components/dashboard/hero-page-shell.tsx` — Overview-only shell with no header

---

## Out of Scope

- No changes to server actions, data services, or database schema
- No changes to auth flows, onboarding, plan, guidance, settings, admin, or marketing pages
- No new product features
- No changes to pricing or LemonSqueezy integration
