# PWA + Responsive Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the SolveYourMoney dashboard installable as a PWA and fully usable on mobile/tablet/desktop without forking any business logic.

**Architecture:** Approach A — surgical additions only. New PWA metadata/icons/service-worker files are additive. The app shell gains a mobile top bar and bottom nav rendered server-side. Responsive layout is achieved via `@media` additions to `globals.css` — zero existing rules are modified. Page-level fixes are one-liners.

**Tech Stack:** Next.js 16 App Router, Tailwind v4, `next/og` ImageResponse (icon generation), vanilla service worker (no Workbox), CSS custom properties + OKLCH design system.

**Spec:** `docs/superpowers/specs/2026-05-13-pwa-responsive-dashboard-design.md`

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `app/icons/[size]/route.ts` | CREATE | Programmatic PNG icon generator (180, 192, 512) |
| `app/manifest.ts` | MODIFY | Add scope + full icons array |
| `app/layout.tsx` | MODIFY | viewport export, PWA metadata, SW registration script |
| `public/sw.js` | CREATE | Minimal service worker — static cache only, never caches auth data |
| `public/offline.html` | CREATE | Offline fallback page |
| `components/dashboard/app-shell.tsx` | MODIFY | Mobile top bar + bottom nav + `.main-content` wrapper |
| `app/globals.css` | MODIFY | Responsive media queries (additive only) |
| `app/(dashboard)/dashboard/page.tsx` | MODIFY | Remove hardcoded `gridColumn: "span 12"` |
| `app/(dashboard)/dashboard/budget/page.tsx` | MODIFY | `overflowX: "auto"` on table wrapper |
| `components/dashboard/debt-simulator.tsx` | MODIFY | `overflowX: "auto"` on payments table wrapper |

---

## Task 1: Icon Route Handler

**Files:**
- Create: `app/icons/[size]/route.ts`

- [ ] **Step 1: Create the route handler**

```ts
// app/icons/[size]/route.ts
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const ALLOWED = new Set([180, 192, 512]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = parseInt(sizeStr, 10);
  if (!ALLOWED.has(size)) {
    return new Response("Not found", { status: 404 });
  }

  const ring = Math.round(size * 0.65);
  const void_ = Math.round(size * 0.45);
  const dot = Math.round(size * 0.12);
  const ringR = Math.round(size * 0.325);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#1c1826",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.22,
        }}
      >
        <div
          style={{
            width: ring,
            height: ring,
            borderRadius: "50%",
            background: "linear-gradient(220deg, #5248d0, #7a78e8, #5248d0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: void_,
              height: void_,
              borderRadius: "50%",
              background: "#1c1826",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: dot,
                height: dot,
                borderRadius: "50%",
                background: "#f8f8ff",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/png",
      },
    }
  );
}
```

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: no errors related to the new file.

- [ ] **Step 3: Verify icon endpoints respond**

Start dev server (`npm run dev`) and open:
- `http://localhost:3000/icons/192` — should show a dark square icon with the SYM mark
- `http://localhost:3000/icons/512` — same, larger
- `http://localhost:3000/icons/180` — same, 180px
- `http://localhost:3000/icons/999` — should return 404

- [ ] **Step 4: Commit**

```
git add app/icons
git commit -m "feat(pwa): add programmatic icon route handler (180/192/512)"
```

---

## Task 2: Manifest + Layout Metadata

**Files:**
- Modify: `app/manifest.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update the manifest**

Replace `app/manifest.ts` entirely:

```ts
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SolveYourMoney",
    short_name: "SYM",
    description: "Turn financial chaos into a clear plan.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#1c1826",
    theme_color: "#3142a9",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/180",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
```

- [ ] **Step 2: Add viewport export and PWA metadata to layout.tsx**

Read `app/layout.tsx` first (it's 62 lines). Then apply these changes:

Add `Viewport` to the import:
```ts
import type { Metadata, Viewport } from "next";
```

Add the `viewport` export after the font declarations and before `metadata`:
```ts
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3142a9",
};
```

Update `metadata` to add `appleWebApp` and `icons.apple`:
```ts
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
  appleWebApp: {
    capable: true,
    title: "SolveYourMoney",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/180",
  },
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
```

- [ ] **Step 3: Add service worker registration script to layout.tsx**

Add `Script` import at the top:
```ts
import Script from "next/script";
```

Inside `RootLayout`, add the script just before `</body>`:
```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${geist.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === "production" && (
          <Script
            id="sw-registration"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js')`,
            }}
          />
        )}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run typecheck**

```
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Verify manifest in browser**

Open `http://localhost:3000/manifest.webmanifest` — confirm `scope`, `icons` array with 4 entries, `display: "standalone"`.

Open Chrome DevTools → Application → Manifest — confirm icons load correctly.

- [ ] **Step 6: Commit**

```
git add app/manifest.ts app/layout.tsx
git commit -m "feat(pwa): add manifest icons, viewport-fit, iOS metadata, SW registration"
```

---

## Task 3: Service Worker + Offline Page

**Files:**
- Create: `public/sw.js`
- Create: `public/offline.html`

- [ ] **Step 1: Create the service worker**

```js
// public/sw.js
const CACHE = 'sym-static-v1';
const STATIC_PREFIXES = ['/_next/static/', '/fonts/', '/icons/'];
const STATIC_EXACT = ['/manifest.webmanifest', '/offline.html'];
const PRIVATE_SEGMENTS = ['/api/', '/dashboard', '/settings', '/onboarding', '/plan', '/guidance'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add('/offline.html'))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const path = url.pathname;

  // Never cache private/authenticated routes
  if (PRIVATE_SEGMENTS.some((s) => path.startsWith(s))) return;
  if (req.headers.get('Authorization')) return;

  const isStatic =
    STATIC_PREFIXES.some((p) => path.startsWith(p)) ||
    STATIC_EXACT.includes(path);

  if (isStatic) {
    // Cache-first for static assets
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Navigation: network-first, offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match('/offline.html').then((r) => r ?? new Response('Offline', { status: 503 }))
      )
    );
  }
});
```

- [ ] **Step 2: Create the offline page**

```html
<!-- public/offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Offline — SolveYourMoney</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { background: #1c1826; color: #f5f4fa; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
    body { min-height: 100svh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card {
      background: #21202e;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 18px;
      padding: 40px 32px;
      max-width: 380px;
      width: 100%;
      text-align: center;
    }
    .mark {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(220deg, #5248d0, #7a78e8);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
    }
    .mark-inner {
      width: 36px; height: 36px; border-radius: 50%;
      background: #21202e;
      display: flex; align-items: center; justify-content: center;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #f8f8ff; }
    h1 { font-size: 20px; font-weight: 580; letter-spacing: -0.02em; margin-bottom: 10px; }
    p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 24px; }
    button {
      background: linear-gradient(180deg, #6258e0, #4a40c8);
      border: none; border-radius: 8px;
      color: #fff; cursor: pointer;
      font-size: 13px; font-weight: 500;
      padding: 10px 22px;
      transition: filter 120ms ease;
    }
    button:hover { filter: brightness(1.08); }
  </style>
</head>
<body>
  <div class="card">
    <div class="mark"><div class="mark-inner"><div class="dot"></div></div></div>
    <h1>You&rsquo;re offline</h1>
    <p>Your financial data requires a connection. Please reconnect and refresh to continue.</p>
    <button onclick="location.reload()">Try again</button>
  </div>
</body>
</html>
```

- [ ] **Step 3: Verify offline.html renders correctly**

Open `http://localhost:3000/offline.html` directly — confirm dark card with brand mark, heading, message, and "Try again" button.

- [ ] **Step 4: Commit**

```
git add public/sw.js public/offline.html
git commit -m "feat(pwa): add minimal service worker and offline fallback page"
```

---

## Task 4: Mobile App Shell

**Files:**
- Modify: `components/dashboard/app-shell.tsx`
- Modify: `app/globals.css` (`.main-content` class only — the full media query block comes in Task 5)

- [ ] **Step 1: Add `.main-content` class to globals.css**

Append to the end of `app/globals.css`:

```css
/* ─── Main content responsive wrapper ─── */
.main-content {
  padding-top: calc(52px + env(safe-area-inset-top));
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
}

@media (min-width: 1024px) {
  .main-content {
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: 28px 40px 56px;
  }
}
```

- [ ] **Step 2: Rewrite `components/dashboard/app-shell.tsx`**

Replace the entire file with the following. The existing logic is preserved exactly — only `SidebarContents` and `AppShell` internals are extended:

```tsx
// components/dashboard/app-shell.tsx
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
  { id: "notifications", label: "Notifications", href: "/dashboard/notifications", Icon: Bell },
  { id: "settings",      label: "Settings",      href: "/settings",                Icon: Settings },
];

const mobileBottomTabs: NavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard",         Icon: LayoutDashboard },
  { id: "debt",     label: "Debt",     href: "/dashboard/debt",    Icon: CreditCard },
  { id: "budget",   label: "Budget",   href: "/dashboard/budget",  Icon: PieChart },
  { id: "savings",  label: "Savings",  href: "/dashboard/savings", Icon: Target },
  { id: "learn",    label: "Learn",    href: "/dashboard/learn",   Icon: BookOpen },
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

async function MobileTopBar({ active }: { active: AppNavKey }) {
  let session: Awaited<ReturnType<typeof requireSession>> | null = null;
  try { session = await requireSession(); } catch {}

  const userId = session?.userId;
  let level = 1, streak = 0, levelName = "Starter";

  if (userId) {
    try {
      const gam = await getGamificationData({ userId });
      level = gam.level;
      streak = gam.streak;
      levelName = gam.levelName;
    } catch {}
  }

  return (
    <header
      role="banner"
      aria-label="SolveYourMoney"
      className="flex lg:hidden"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
        paddingTop: "env(safe-area-inset-top)",
        background: "linear-gradient(180deg, oklch(0.16 0.014 282 / 0.85), oklch(0.135 0.012 282 / 0.85))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div style={{
        height: 52, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px", width: "100%",
      }}>
        {/* Brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7, flexShrink: 0,
            background: "conic-gradient(from 220deg at 50% 50%, oklch(0.66 0.18 282), oklch(0.78 0.14 250), oklch(0.66 0.18 282))",
            position: "relative",
            boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08)",
          }}>
            <span style={{ position: "absolute", inset: 4, borderRadius: 4, background: "var(--bg-0)" }} />
            <span style={{
              position: "absolute", left: "50%", top: "50%",
              width: 6, height: 6, borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--fg)", zIndex: 1,
            }} />
          </div>
          <span style={{ fontWeight: 560, letterSpacing: "-0.02em", fontSize: 13, color: "var(--fg)" }}>
            solve<span style={{ color: "var(--fg-mute)", fontWeight: 440 }}>your</span>money
          </span>
        </div>

        {/* Level + streak */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 8px 3px 6px", borderRadius: 999,
            background: "oklch(0.66 0.18 282 / 0.18)",
            fontSize: 11, fontWeight: 540, color: "oklch(0.85 0.10 282)",
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "var(--primary-glow)",
              boxShadow: "0 0 6px var(--primary-glow)",
            }} />
            Lv {level} · {levelName}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--streak)",
          }}>
            <Flame size={11} />
            {streak}d
          </span>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav({ active }: { active: AppNavKey }) {
  return (
    <nav
      aria-label="Main navigation"
      className="flex lg:hidden"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "linear-gradient(180deg, oklch(0.16 0.014 282 / 0.85), oklch(0.135 0.012 282 / 0.85))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid var(--line)",
      }}
    >
      {mobileBottomTabs.map(({ id, label, href, Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={href as Route}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              gap: 4,
              textDecoration: "none",
              color: isActive ? "var(--primary-glow)" : "var(--fg-mute)",
              transition: "color 120ms ease",
            }}
          >
            <Icon size={20} style={{ opacity: isActive ? 1 : 0.6 }} />
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.01em" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
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
      {/* Mobile top bar */}
      <MobileTopBar active={active} />

      {/* Desktop sidebar */}
      <aside
        style={{
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
        <div className="main-content">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav active={active} />
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

```
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Verify mobile shell at 390px viewport**

In Chrome DevTools, set viewport to 390×844 (iPhone 14 Pro). Navigate to `/dashboard`.

Verify:
- Mobile top bar appears at top with brand mark + level/streak
- Bottom nav appears with 5 tabs, active tab highlighted
- Sidebar is hidden
- Content starts below the top bar (not obscured)
- Content bottom is not obscured by the bottom nav

- [ ] **Step 5: Verify desktop shell at 1280px viewport**

Set viewport to 1280px.

Verify:
- Sidebar appears
- Mobile top bar is hidden
- Bottom nav is hidden
- Content layout unchanged from before

- [ ] **Step 6: Commit**

```
git add components/dashboard/app-shell.tsx app/globals.css
git commit -m "feat(pwa): add mobile top bar, bottom nav, safe-area content padding"
```

---

## Task 5: Responsive CSS

**Files:**
- Modify: `app/globals.css` (additive only — append to end of file)

- [ ] **Step 1: Append all responsive media query blocks to globals.css**

Append the following to the end of `app/globals.css` (after the `.main-content` block added in Task 4):

```css
/* ─── Responsive breakpoints ─── */

/* Metrics grid: 4-col → 2-col at tablet, 1-col at mobile */
@media (max-width: 1023px) {
  .metrics { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 639px) {
  .metrics { grid-template-columns: 1fr; }
}

/* Two-column grid: stack on mobile */
@media (max-width: 767px) {
  .g-2 { grid-template-columns: 1fr; }
}

/* Three-column grid: 2-col at tablet, 1-col at mobile */
@media (min-width: 640px) and (max-width: 1023px) {
  .g-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 639px) {
  .g-3 { grid-template-columns: 1fr; }
}

/* 12-column grid: collapse to 1-col on tablet/mobile.
   !important needed to override inline gridColumn span styles
   on child elements (e.g. DebtSimulator, LearnContent). */
@media (max-width: 1023px) {
  .g-12 { grid-template-columns: 1fr; }
  .g-12 > * { grid-column: 1 / -1 !important; }
}

/* Metric value: smaller font on mobile */
@media (max-width: 639px) {
  .metric .val { font-size: 22px; }
}

/* Page header + greeting: stack on mobile */
@media (max-width: 639px) {
  .page-hd  { flex-direction: column; align-items: flex-start; gap: 12px; }
  .greeting { flex-direction: column; gap: 12px; }
}

/* Budget/categories table: hide progress column on mobile */
@media (max-width: 640px) {
  .tbl th:last-child,
  .tbl td:last-child { display: none; }
}

/* Lesson rows: collapse to 3-col, hide time on mobile */
@media (max-width: 640px) {
  .lesson { grid-template-columns: 36px 1fr auto; }
  .lesson .time { display: none; }
}

/* Segmented control: scrollable on mobile */
@media (max-width: 640px) {
  .seg { overflow-x: auto; -webkit-overflow-scrolling: touch; }
}

/* Body: slightly larger font on mobile for readability */
@media (max-width: 639px) {
  body { font-size: 15px; }
}

/* Safe-area body guard (fallback for edge cases outside the app shell) */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  body { padding-bottom: env(safe-area-inset-bottom); }
}
```

- [ ] **Step 2: Verify metrics grid on mobile**

Open Chrome DevTools, set viewport to 390px. Navigate to `/dashboard`.

Verify:
- The 4 metric cards (Monthly income, Total debt, Total saved, Spent this month) render in 1 column
- No horizontal overflow
- Each card is full-width and readable

- [ ] **Step 3: Verify metrics grid on tablet**

Set viewport to 768px. Verify metrics show as 2 columns.

- [ ] **Step 4: Verify g-12 collapse (debt/learn pages)**

Set viewport to 390px. Navigate to `/dashboard/debt`.

Verify:
- "Your accounts" and "Payoff simulator" are stacked vertically (not side-by-side)
- No horizontal overflow

Navigate to `/dashboard/learn`.

Verify:
- Level hero card and "Your path" card are stacked vertically
- No horizontal overflow

- [ ] **Step 5: Verify budget table on mobile**

Set viewport to 390px. Navigate to `/dashboard/budget`.

Verify:
- The progress bar column is hidden (3 columns visible: Category, Spent, Budget)
- No horizontal overflow on the table

- [ ] **Step 6: Commit**

```
git add app/globals.css
git commit -m "feat(pwa): add responsive CSS breakpoints for mobile/tablet layouts"
```

---

## Task 6: DebtSimulator Overflow Fix

**Files:**
- Modify: `components/dashboard/debt-simulator.tsx`

- [ ] **Step 1: Fix the upcoming payments table overflow**

The "Upcoming payments" table is in a `<div className="card flat" style={{ padding: 0, overflow: "hidden" }}>`.

Change `overflow: "hidden"` to `overflowX: "auto"`:

```tsx
// In DebtSimulator, find this div (around line 160):
<div className="card flat" style={{ padding: 0, overflow: "hidden" }}>
```

Change it to:

```tsx
<div className="card flat" style={{ padding: 0, overflowX: "auto" }}>
```

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Verify on mobile**

Set viewport to 390px. Navigate to `/dashboard/debt`.

Verify:
- The 6-column "Upcoming payments" table is horizontally scrollable rather than cut off
- Cards (Visa, Student Loan, Care Credit) stack vertically and are readable
- Payoff simulator stacks below the accounts list

- [ ] **Step 4: Commit**

```
git add components/dashboard/debt-simulator.tsx
git commit -m "fix(debt): allow upcoming payments table to scroll horizontally on mobile"
```

---

## Task 7: Overview + Budget Page Fixes

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`
- Modify: `app/(dashboard)/dashboard/budget/page.tsx`

- [ ] **Step 1: Remove hardcoded gridColumn from overview hero chart**

In `app/(dashboard)/dashboard/page.tsx`, find the hero chart card div (around line 156):

```tsx
<div className="card hero-chart-card" style={{ gridColumn: "span 12" }}>
```

Remove `gridColumn: "span 12"` from the inline style:

```tsx
<div className="card hero-chart-card">
```

- [ ] **Step 2: Add overflow guard to budget table wrapper**

In `app/(dashboard)/dashboard/budget/page.tsx`, find the categories table card (around line 155):

```tsx
<div className="card flat" style={{ padding: "4px 4px", overflow: "hidden" }}>
```

Change to:

```tsx
<div className="card flat" style={{ padding: "4px 4px", overflowX: "auto" }}>
```

- [ ] **Step 3: Run typecheck**

```
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Verify overview on mobile**

Set viewport to 390px. Navigate to `/dashboard`.

Verify:
- Savings trajectory chart is full-width and not overflowing
- Debt overview and Savings progress cards are stacked (1 column)

- [ ] **Step 5: Verify budget on mobile**

Set viewport to 390px. Navigate to `/dashboard/budget`.

Verify:
- Pace arc (SVG) and Summary cards are stacked
- Categories table shows 3 columns (Category, Spent, Budget) — no progress column
- No horizontal overflow

- [ ] **Step 6: Commit**

```
git add "app/(dashboard)/dashboard/page.tsx" "app/(dashboard)/dashboard/budget/page.tsx"
git commit -m "fix(responsive): remove hardcoded grid spans and add table overflow guards"
```

---

## Task 8: Final Verification

**Files:** None modified.

- [ ] **Step 1: Run typecheck**

```
npm run typecheck
```

Expected: exit 0, no errors.

- [ ] **Step 2: Run lint**

```
npm run lint
```

Expected: exit 0. If warnings only, verify no new `no-unused-vars` or import errors.

- [ ] **Step 3: Run mock audit**

```
npm run ci:mock-audit
```

Expected: passes. No mock imports in non-dev code.

- [ ] **Step 4: Run tests**

```
npm run test:local
```

Expected: all tests pass (debt calculations, budget calculations, gamification calculations).

- [ ] **Step 5: Run build**

```
npm run build
```

Expected: build succeeds. Watch for any TypeScript errors or missing module errors that only surface at build time.

- [ ] **Step 6: Manual QA checklist**

Start the production build locally (`npm run start`) and verify each viewport in Chrome DevTools:

| Viewport | Check |
|----------|-------|
| 375px (iPhone SE) | No horizontal overflow on any dashboard page; bottom nav visible; top bar visible |
| 393px (iPhone 14 Pro) | Safe areas clear nav bars; XP/streak in top bar; 5 tabs in bottom nav |
| 768px (tablet portrait) | 2-col metric grid; g-2/g-3 grids correct; no bottom/top nav |
| 1024px (tablet landscape) | Sidebar appears; desktop layout intact |
| 1280px (desktop) | Desktop layout exactly as before; no regressions |

PWA-specific checks (in Chrome DevTools → Application):
- [ ] Manifest loads with 4 icons
- [ ] Icons render (check Network tab → `/icons/192`, `/icons/512`, `/icons/180`)
- [ ] Service worker registers (Application → Service Workers shows `sw.js` active)
- [ ] Manifest passes installability checks (no red errors in Application → Manifest)
- [ ] `apple-mobile-web-app-capable` meta present (Elements → head)
- [ ] `viewport-fit=cover` in viewport meta (Elements → head)

- [ ] **Step 7: Final commit**

```
git add -A
git commit -m "chore: final PWA responsive dashboard — all checks pass"
```
