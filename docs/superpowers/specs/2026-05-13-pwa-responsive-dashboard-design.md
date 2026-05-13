---
name: pwa-responsive-dashboard
description: Design spec for making SolveYourMoney dashboard a production-grade PWA with mobile/tablet/desktop responsive layouts — Approach A (surgical CSS + minimal shell)
metadata:
  type: project
---

# PWA + Responsive Dashboard — Design Spec

**Date:** 2026-05-13  
**Approach:** A — Surgical CSS + Minimal Shell  
**Scope:** PWA foundation, mobile app shell, responsive CSS, page-specific fixes, production safety verification  
**Out of scope:** Native app, separate mobile codebase, redesign of data/business logic, Workbox, shadcn migration

---

## 1. Audit Summary

### What exists
- `app/manifest.ts` — minimal manifest with only `favicon.ico` icon, missing `scope`, no 192/512/maskable/Apple icons
- `public/` — only 5 decorative SVGs, no PNG icons
- No iOS PWA meta tags (`apple-mobile-web-app-capable`, etc.)
- No `viewport-fit=cover`
- No service worker
- `AppShell`: sidebar is `hidden lg:flex` — **zero navigation on mobile**
- Main content gets `padding: 0` on mobile (desktop gets `28px 40px 56px`)
- `.metrics` → fixed 4-col grid, `.g-2` → fixed 2-col, `.g-3` → fixed 3-col — all overflow on mobile
- Budget page has a 4-col `<table>` that will overflow on narrow viewports
- No safe-area support anywhere

### What is solid
- All 5 dashboard pages fetch real data via server components
- Mock-data guards (`assertMockDataAllowed`, `validate:env`, ESLint mock-import rule) are in place
- All visible buttons are functional (dead buttons removed in recent commits)
- Design system uses CSS custom properties consistently — easy to extend
- Charts use `width: "100%"` SVGs — already width-responsive

---

## 2. PWA Foundation

### 2a. Icon generation

New route handler: `app/icons/[size]/route.ts`

- Uses `next/og` (`ImageResponse`) — no external dependency
- Serves sizes: `192`, `512`, `180` (Apple touch)
- Design: conic-gradient sphere mark (ring frame + dark void + white dot) on `--bg-0` background (`oklch(0.135 0.012 282)` ≈ `#1a1520`)
- Icon is pure geometry — zero user data, safe to cache
- `Cache-Control: public, max-age=31536000, immutable`
- Route handler validates `size` param is one of `[180, 192, 512]`; returns 404 for any other value

### 2b. Manifest (`app/manifest.ts`)

Additions to existing manifest:
```
scope: "/"
icons: [
  { src: "/icons/192",  sizes: "192x192",  type: "image/png" },
  { src: "/icons/512",  sizes: "512x512",  type: "image/png" },
  { src: "/icons/512",  sizes: "512x512",  type: "image/png", purpose: "maskable" },
  { src: "/icons/180",  sizes: "180x180",  type: "image/png" },
]
```
(Replaces the single `favicon.ico` entry.)

### 2c. `app/layout.tsx` additions

Uses Next.js App Router APIs (not raw `<meta>` tags):

**New `viewport` export** (separate from `metadata`, as required by Next.js 14+):
```ts
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',        // enables env(safe-area-inset-*)
  themeColor: '#3142a9',
};
```

**`metadata` additions:**
```ts
appleWebApp: {
  capable: true,
  title: 'SolveYourMoney',
  statusBarStyle: 'black-translucent',
},
icons: {
  apple: '/icons/180',
},
```

**SW registration:** Use `next/script` with `strategy="afterInteractive"` (not a raw `<script>` tag). Production-only guard: `process.env.NODE_ENV === 'production'`.

### 2d. Service worker (`public/sw.js`)

Minimal (~60 lines), no Workbox.

**Cache strategy:**
- Static asset cache (name: `sym-static-v1`): caches `/_next/static/`, `/fonts/`, `/icons/`, `/manifest.webmanifest`
- All other requests: network-only (never cached)

**Fetch handler rules:**
- Block list (always network-only, never cached): any URL containing `/api/`, `/dashboard`, `/settings`, `/onboarding`, `/plan`, `/guidance`, or carrying an `Authorization` header
- Navigation requests that fail offline → serve `/offline.html` fallback

**`public/offline.html`:** Minimal static page matching design system (dark background, brand mark, message: "You're offline — your financial data requires a connection. Please reconnect and refresh.")

**Registration:** `next/script` component in `app/layout.tsx` with `strategy="afterInteractive"`, production-only. Inline script body: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`.

---

## 3. App Shell — Mobile Nav + Safe Areas

### 3a. `components/dashboard/app-shell.tsx` changes

**Existing sidebar:** unchanged. Stays `hidden lg:flex`, `position: fixed`, `width: 264px`.

**New: Mobile top bar** (`flex lg:hidden`, `position: fixed`, top: 0)
- Height: 52px + `env(safe-area-inset-top)`
- Left: brand mark (conic-gradient sphere + "solveyourmoney" wordmark)
- Right: level badge (Level N · LevelName) + streak (🔥 N day)
- Style: `backdrop-filter: blur(12px)`, same background as sidebar (`oklch(0.16 0.014 282 / 0.6)`)
- Border bottom: `1px solid var(--line)`
- `role="banner"`, `aria-label="SolveYourMoney"`

**New: Mobile bottom nav** (`flex lg:hidden`, `position: fixed`, bottom: 0)
- 5 tabs: Overview, Debt, Budget, Savings, Learn
- Each tab: icon (16px) + label (10px), stacked vertically
- Min height: 56px + `env(safe-area-inset-bottom)`
- Active tab: `color: var(--primary-glow)`, icon opacity 1
- Inactive: `color: var(--fg-mute)`, icon opacity 0.6
- Background: same as mobile top bar (blur + semi-transparent)
- Border top: `1px solid var(--line)`
- `aria-label="Main navigation"`, active tab gets `aria-current="page"`
- `z-index: 30`

**Gamification data:** `AppShell` (server component) calls `getGamificationData` once and passes `{ xp, level, streak, levelName, xpPct }` to both the sidebar XP card (desktop) and the mobile top bar. Avoids a duplicate fetch.

### 3b. Main content area padding

```
mobile:  padding-top: calc(52px + env(safe-area-inset-top))
         padding-inline: 16px
         padding-bottom: calc(56px + env(safe-area-inset-bottom) + 16px)
desktop: unchanged — padding: 28px 40px 56px, with lg:pl-66
```

Implemented via inline styles with a responsive class or conditional based on breakpoint (via `className="lg:hidden"` / `className="hidden lg:block"` wrapper divs or CSS custom properties).

---

## 4. Responsive CSS (`globals.css`)

All changes are **additive** `@media` query blocks at the bottom of the file. Zero existing rules modified.

### 4a. Grid breakpoints

```css
@media (max-width: 1023px) {
  .metrics { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 639px) {
  .metrics { grid-template-columns: 1fr; }
  .g-2     { grid-template-columns: 1fr; }
  .g-3     { grid-template-columns: 1fr; }
  .g-12    { grid-template-columns: 1fr; }
}
@media (min-width: 640px) and (max-width: 1023px) {
  .g-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .g-2 { grid-template-columns: repeat(2, 1fr); }
}
```

### 4b. Metric value font size

```css
@media (max-width: 639px) {
  .metric .val { font-size: 22px; }
}
```

### 4c. Page header stacking

```css
@media (max-width: 639px) {
  .page-hd  { flex-direction: column; align-items: flex-start; gap: 12px; }
  .greeting { flex-direction: column; gap: 12px; }
}
```

### 4d. Budget table — hide progress column on mobile

```css
@media (max-width: 640px) {
  .tbl th:last-child,
  .tbl td:last-child { display: none; }
}
```

The table card wrapper also gets `overflow-x: auto` (inline style on the card div in the budget page).

### 4e. Lesson rows — hide time column on mobile

```css
@media (max-width: 640px) {
  .lesson { grid-template-columns: 36px 1fr auto; }
  .lesson .time { display: none; }
}
```

### 4f. Segmented control — horizontal scroll on mobile

```css
@media (max-width: 640px) {
  .seg { overflow-x: auto; max-width: 100%; }
}
```

### 4g. Safe-area body guard

```css
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  body { padding-bottom: env(safe-area-inset-bottom); }
}
```

### 4h. Body font size on mobile

```css
@media (max-width: 639px) {
  body { font-size: 15px; }
}
```

---

## 5. Page-specific Fixes

### Overview (`app/(dashboard)/dashboard/page.tsx`)
- Remove hardcoded `gridColumn: "span 12"` inline style from the hero chart card (the `.g-12` grid collapses to 1-col on mobile; the span override is unnecessary and harmless on desktop since the grid itself spans 12 cols, but removing it is cleaner).

### Budget (`app/(dashboard)/dashboard/budget/page.tsx`)
- Add `style={{ overflowX: "auto" }}` to the table card wrapper `<div>`.
- The arc SVG already uses `width: "100%"` — no change needed.

### Debt (`app/(dashboard)/dashboard/debt/page.tsx`)
- Read `DebtSimulator` component before implementation to verify no fixed pixel widths causing overflow. Add `min-width: 0` or `overflow-x: hidden` guards if found.

### Savings (`app/(dashboard)/dashboard/savings/page.tsx`)
- `.g-3` stacking handled by Section 4. No page-level changes needed.

### Learn (`app/(dashboard)/dashboard/learn/page.tsx`)
- Read `LearnContent` client component before implementation to verify no overflow issues with category filters. Add `overflow-x: auto` to filter container if needed.

---

## 6. Production Safety Verification

**Mock-data guards (verify, no changes):**
- `assertMockDataAllowed()` is called in each `*Service.ts` before delegating to mock
- `npm run validate:env` fails build if `NEXT_PUBLIC_USE_MOCK_DATA=true` in production
- `npm run ci:prevent-mock-imports` ESLint rule blocks direct mock imports
- All dashboard PWA/mobile paths use the same server action data flow — no separate mobile data path

**Service worker private-data protection (enforced in `public/sw.js`):**
- Explicit URL blocklist covers all authenticated routes
- Static cache allowlist covers only `/_next/static/`, `/fonts/`, `/icons/`, manifest
- No `Cache-Control` header manipulation
- No cookie/auth token storage in SW

**Interaction audit (all MVP interactions must work or be removed):**
- Overview: Import link, debt/savings "See all →" links — functional
- Debt: DebtSimulator sliders + optimizer — functional (client-side computation)
- Budget: Category table — display only, no dead actions
- Savings: AddMoneyForm, SavingsGoalForm — real server actions, functional
- Learn: LessonCompleteButton — real server action, functional
- Bottom nav: all 5 tabs navigate to real routes
- Sign-out: stays in desktop sidebar only; mobile users access via `/settings`

---

## 7. Accessibility

- Mobile bottom nav: `aria-label="Main navigation"`, `aria-current="page"` on active tab
- Mobile top bar: `role="banner"`, `aria-label="SolveYourMoney"`
- All bottom nav touch targets: min 56px height (exceeds 44px minimum)
- Existing `@media (prefers-reduced-motion: reduce)` block in globals.css covers all transitions
- Color contrast: design system OKLCH values already pass WCAG AA for text

---

## 8. Files Changed

| File | Change |
|------|--------|
| `app/manifest.ts` | Add scope, replace icons array |
| `app/layout.tsx` | Add Apple meta tags, theme-color, viewport-fit, SW registration, apple-touch-icon link |
| `app/icons/[size]/route.ts` | New — programmatic PNG icon generator |
| `public/sw.js` | New — minimal service worker |
| `public/offline.html` | New — offline fallback page |
| `components/dashboard/app-shell.tsx` | Add mobile top bar, bottom nav, refactor gamification fetch, fix content padding |
| `app/globals.css` | Add responsive media queries (additive only) |
| `app/(dashboard)/dashboard/page.tsx` | Remove hardcoded gridColumn span |
| `app/(dashboard)/dashboard/budget/page.tsx` | Add overflow-x: auto to table wrapper |
| `components/dashboard/debt-simulator.tsx` | Audit + min-width fix if needed |
| `components/dashboard/learn-content.tsx` | Audit + overflow-x fix on filter container if needed |

---

## 9. Verification Commands

After implementation, all must pass:

```
npm run typecheck
npm run lint
npm run build
npm run test:local
```

Manual QA checklist:
- [ ] iPhone SE viewport (375px) — no horizontal overflow
- [ ] iPhone 14 Pro viewport (393px) — safe areas clear nav bars
- [ ] Android mobile (360px) — bottom nav renders, installability prompt
- [ ] Tablet portrait (768px) — 2-col grids, no bottom nav
- [ ] Tablet landscape (1024px) — sidebar appears, bottom nav hidden
- [ ] Desktop (1280px+) — unchanged from current
- [ ] PWA install flow iOS Safari — "Add to Home Screen" works
- [ ] PWA install flow Android Chrome — install banner appears
- [ ] Offline mode — `/offline.html` shown for dashboard routes
- [ ] Offline mode — static assets load from cache

---

## 10. Out of Scope / Future

- Converting budget table to full card-list layout (hiding the column is the MVP fix)
- Push notifications
- Background sync
- Workbox / advanced caching strategies
- Dark/light theme toggle
- Tablet-specific two-column page layouts (tablet inherits mobile-first improvements)
