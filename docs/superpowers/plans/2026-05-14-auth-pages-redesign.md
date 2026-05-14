# Auth Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Tailwind-based auth layout with the app's design-token system: OKLCH tokens, CSS design classes, two-column shell with a decorative left panel.

**Architecture:** A new `AuthShell` server component provides the two-column grid and left panel decoration. `layout.tsx` becomes a thin wrapper around `AuthShell`. Pages and forms are rewritten to use the same inline-style + CSS-class pattern established in the rest of the dashboard.

**Tech Stack:** Next.js 16 App Router, React 19, CSS design tokens (globals.css), `useActionState` + `useFormStatus` for form state.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/globals.css` | Modify | Add `.auth-left-panel` media query (hide below 768px) |
| `components/auth/auth-shell.tsx` | Create | Two-column grid layout + left panel brand/decoration |
| `app/(auth)/layout.tsx` | Modify | Thin wrapper — `<AuthShell>{children}</AuthShell>` only |
| `components/forms/auth-forms.tsx` | Modify | New `Field`, inline `SubmitButton`, `FormMessage` using design tokens |
| `app/(auth)/sign-in/page.tsx` | Modify | Token-based heading block, remove Tailwind font classes |
| `app/(auth)/sign-up/page.tsx` | Modify | Token-based heading block, remove Tailwind font classes |
| `app/(auth)/forgot-password/page.tsx` | Create | Stub reset-password page (no server action wired) |

---

## Task 1: Add `.auth-left-panel` responsive class

**Files:**
- Modify: `app/globals.css`

The left panel in `AuthShell` uses `className="auth-left-panel"`. Inline styles cannot target media queries, so responsive hiding lives in globals.css.

Find the `/* ─── App shell backgrounds ─── */` block (around line 145) and add the media rule directly after it.

- [ ] **Step 1: Add media query to globals.css**

Open `app/globals.css`. After the `.premium-grid, .dashboard-shell, .auth-shell, .app-bg { … }` block (ends around line 154), add:

```css
@media (max-width: 767px) {
  .auth-left-panel { display: none; }
}
```

- [ ] **Step 2: Verify TypeScript still compiles**

```powershell
npx tsc --noEmit
```

Expected: zero errors. (CSS changes don't affect TypeScript but running tsc confirms no prior breakage before next task.)

- [ ] **Step 3: Commit**

```powershell
git add app/globals.css
git commit -m "feat(auth): add auth-left-panel responsive utility"
```

---

## Task 2: Create `AuthShell` component

**Files:**
- Create: `components/auth/auth-shell.tsx`

This is a server component (no `"use client"`). It renders the full-viewport two-column grid, the decorated left panel, and passes `children` through to the right column.

- [ ] **Step 1: Create the file**

Create `components/auth/auth-shell.tsx` with this exact content:

```tsx
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="app-bg"
      style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "45fr 55fr" }}
    >
      {/* Left panel */}
      <div
        className="auth-left-panel"
        style={{
          background: "var(--bg-1)",
          borderRight: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          padding: 48,
        }}
      >
        <div style={{ maxWidth: 380 }}>
          {/* Brand mark */}
          <p
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono), monospace",
              color: "var(--primary-glow)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            SolveYourMoney
          </p>

          {/* Headline */}
          <h1
            style={{
              fontSize: 38,
              fontWeight: 560,
              color: "var(--fg)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "16px 0 12px",
            }}
          >
            Calm financial clarity for the next real-life decision.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--fg-soft)",
              lineHeight: 1.6,
              maxWidth: 340,
              margin: "0 0 32px",
            }}
          >
            Sign in to continue your money journey and keep your progress in one place.
          </p>

          {/* Decorative mini-preview */}
          <div className="card" style={{ opacity: 0.8, transform: "translateY(-4px)", padding: 16 }}>
            {/* XP row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span className="pill primary" style={{ flexShrink: 0 }}>Lv 7</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--fg-dim)" }}>XP this week</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--xp)" }}>+225 XP</span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 4,
                    background: "var(--primary-soft)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "62%",
                      height: "100%",
                      background: "var(--primary-glow)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Metric tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="metric accent" style={{ padding: "10px 12px" }}>
                <div className="lbl" style={{ fontSize: 10 }}>Net worth</div>
                <div className="val" style={{ fontSize: 16 }}>$4,240</div>
              </div>
              <div className="metric" style={{ padding: "10px 12px" }}>
                <div className="lbl" style={{ fontSize: 10 }}>Streak</div>
                <div className="val" style={{ fontSize: 16 }}>12 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```powershell
git add components/auth/auth-shell.tsx
git commit -m "feat(auth): create AuthShell two-column layout component"
```

---

## Task 3: Wire `AuthShell` into `layout.tsx`

**Files:**
- Modify: `app/(auth)/layout.tsx`

- [ ] **Step 1: Replace layout.tsx content**

Overwrite `app/(auth)/layout.tsx` entirely:

```tsx
import { AuthShell } from "@/components/auth/auth-shell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```powershell
git add app/(auth)/layout.tsx
git commit -m "feat(auth): wire AuthShell into auth layout"
```

---

## Task 4: Rewrite `auth-forms.tsx`

**Files:**
- Modify: `components/forms/auth-forms.tsx`

Replace the Tailwind-based `Field`, `FormMessage`, and `SubmitButton` (which currently delegates to `@/components/ui/button`) with token-based equivalents. Add a `ForgotPasswordLink` used by `SignInForm`.

- [ ] **Step 1: Replace auth-forms.tsx content**

Overwrite `components/forms/auth-forms.tsx` entirely:

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  signInAction,
  signUpAction,
  type AuthFormState,
} from "@/server/actions/auth";

const initialState: AuthFormState = { status: "idle", message: "" };

export function SignInForm() {
  const [state, action] = useActionState(signInAction, initialState);
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Email" name="email" type="email" />
      <div>
        <Field label="Password" name="password" type="password" />
        <div style={{ textAlign: "right", marginTop: 6 }}>
          <Link
            href="/forgot-password"
            style={{ fontSize: 12, color: "var(--primary-glow)", textDecoration: "none" }}
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initialState);
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Name" name="displayName" />
      <Field label="Email" name="email" type="email" />
      <Field label="Password" name="password" type="password" />
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="f-xs muted">{label}</span>
      <input
        required
        name={name}
        type={type}
        style={{
          height: 36,
          background: "oklch(1 0 0 / 0.04)",
          border: 0,
          color: "var(--fg)",
          font: "inherit",
          padding: "0 12px",
          borderRadius: 8,
          boxShadow: "0 0 0 1px var(--line)",
          outline: "none",
          fontSize: 13,
          width: "100%",
        }}
      />
    </label>
  );
}

function SubmitButton({
  children,
  pendingText,
}: {
  children: React.ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn primary"
      type="submit"
      disabled={pending}
      style={{ width: "100%", marginTop: 4 }}
    >
      {pending ? pendingText : children}
    </button>
  );
}

function FormMessage({ state }: { state: AuthFormState }) {
  if (!state.message) return null;
  return (
    <div
      style={{
        background: "var(--danger-soft)",
        color: "var(--danger)",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 13,
      }}
    >
      {state.message}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```powershell
git add components/forms/auth-forms.tsx
git commit -m "feat(auth): rewrite auth-forms with design token styles"
```

---

## Task 5: Update sign-in page

**Files:**
- Modify: `app/(auth)/sign-in/page.tsx`

Remove Tailwind font classes. Move all heading content into the `.card` so the right panel renders a single card block.

- [ ] **Step 1: Replace sign-in page content**

Overwrite `app/(auth)/sign-in/page.tsx` entirely:

```tsx
import Link from "next/link";
import { SignInForm } from "@/components/forms/auth-forms";

export default function SignInPage() {
  return (
    <>
      <div className="card" style={{ padding: 28 }}>
        <p
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono), monospace",
            color: "var(--fg-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          Sign in
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 560, color: "var(--fg)", margin: "6px 0 4px" }}>
          Welcome back.
        </h2>
        <p style={{ fontSize: 13, color: "var(--fg-soft)", marginBottom: 20 }}>
          Pick up where you left off and turn today&apos;s money question into a clearer next step.
        </p>
        <SignInForm />
      </div>
      <p
        className="f-xs"
        style={{ color: "var(--fg-soft)", textAlign: "center", marginTop: 16 }}
      >
        Need an account?{" "}
        <Link href="/sign-up" style={{ color: "var(--primary-glow)", fontWeight: 520 }}>
          Create one
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```powershell
git add "app/(auth)/sign-in/page.tsx"
git commit -m "feat(auth): update sign-in page to design token styles"
```

---

## Task 6: Update sign-up page

**Files:**
- Modify: `app/(auth)/sign-up/page.tsx`

- [ ] **Step 1: Replace sign-up page content**

Overwrite `app/(auth)/sign-up/page.tsx` entirely:

```tsx
import Link from "next/link";
import { SignUpForm } from "@/components/forms/auth-forms";

export default function SignUpPage() {
  return (
    <>
      <div className="card" style={{ padding: 28 }}>
        <p
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono), monospace",
            color: "var(--fg-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          Create account
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 560, color: "var(--fg)", margin: "6px 0 4px" }}>
          Start with a calmer money picture.
        </h2>
        <p style={{ fontSize: 13, color: "var(--fg-soft)", marginBottom: 20 }}>
          No shame. No lecture. Just a free check-in that turns the mess into one useful next step.
        </p>
        <SignUpForm />
      </div>
      <p
        className="f-xs"
        style={{ color: "var(--fg-soft)", textAlign: "center", marginTop: 16 }}
      >
        Already have an account?{" "}
        <Link href="/sign-in" style={{ color: "var(--primary-glow)", fontWeight: 520 }}>
          Sign in
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```powershell
git add "app/(auth)/sign-up/page.tsx"
git commit -m "feat(auth): update sign-up page to design token styles"
```

---

## Task 7: Create forgot-password stub page

**Files:**
- Create: `app/(auth)/forgot-password/page.tsx`

This is a server component with no action wired. The form submits as a GET to the same URL — benign for a stub. No `"use client"` needed. The `Field` component from `auth-forms.tsx` cannot be used here (it lives inside a `"use client"` boundary), so the input is inlined.

- [ ] **Step 1: Create the file**

Create `app/(auth)/forgot-password/page.tsx`:

```tsx
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="card" style={{ padding: 28 }}>
        <p
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono), monospace",
            color: "var(--fg-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          Reset password
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 560, color: "var(--fg)", margin: "6px 0 4px" }}>
          Reset your password.
        </h2>
        <p style={{ fontSize: 13, color: "var(--fg-soft)", marginBottom: 20 }}>
          Enter your email and we&apos;ll send a reset link.
        </p>
        <form style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="f-xs muted">Email</span>
            <input
              required
              name="email"
              type="email"
              style={{
                height: 36,
                background: "oklch(1 0 0 / 0.04)",
                border: 0,
                color: "var(--fg)",
                font: "inherit",
                padding: "0 12px",
                borderRadius: 8,
                boxShadow: "0 0 0 1px var(--line)",
                outline: "none",
                fontSize: 13,
                width: "100%",
              }}
            />
          </label>
          <button className="btn primary" type="submit" style={{ width: "100%", marginTop: 4 }}>
            Send reset link
          </button>
        </form>
      </div>
      <p
        className="f-xs"
        style={{ color: "var(--fg-soft)", textAlign: "center", marginTop: 16 }}
      >
        <Link href="/sign-in" style={{ color: "var(--primary-glow)", fontWeight: 520 }}>
          ← Back to sign in
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Final commit**

```powershell
git add "app/(auth)/forgot-password/page.tsx"
git commit -m "feat(auth): add forgot-password stub page"
```

- [ ] **Step 4: Push**

```powershell
git push
```
