# Auth Pages Redesign

**Date:** 2026-05-14  
**Status:** Approved

## Overview

Replace the current Tailwind-based auth layout (rounded pill cards, `font-black` typography, `auth-shell` CSS class) with a layout that matches the app's established design token system: OKLCH colors, CSS design tokens, no Tailwind utility classes in markup.

## Scope

Files changed:
- `components/auth/auth-shell.tsx` — new component (create)
- `app/(auth)/layout.tsx` — replace body with `<AuthShell>`
- `app/(auth)/sign-in/page.tsx` — token-based typography, no Tailwind font classes
- `app/(auth)/sign-up/page.tsx` — token-based typography, no Tailwind font classes
- `components/forms/auth-forms.tsx` — new `Field`, `FormMessage`, `SubmitButton` using design tokens
- `app/(auth)/forgot-password/page.tsx` — stub page (create, minimal)

No changes to server actions (`signInAction`, `signUpAction`) or auth logic.

## Shell & Layout

`AuthShell` (`components/auth/auth-shell.tsx`) is a full-viewport two-column CSS grid.

- **Outer container:** `minHeight: 100vh`, `display: grid`, `gridTemplateColumns: "45fr 55fr"`, `background: var(--bg-0)`
- **Left panel:** `background: var(--bg-1)`, `borderRight: 1px solid var(--line)`. Hidden below 768px — since inline styles cannot target media queries, a `.auth-left-panel` class is added to `globals.css` with `@media (max-width: 767px) { .auth-left-panel { display: none; } }`
- **Right panel:** `display: flex`, `alignItems: center`, `justifyContent: center`, `padding: 40px 24px`; inner column `width: 100%`, `maxWidth: 400px`
- `app/(auth)/layout.tsx` becomes a thin server component that wraps `{children}` in `<AuthShell>` only

## Left Panel Content

Three vertically stacked pieces, centered in the panel with `padding: 48px`:

1. **Brand mark** — `SolveYourMoney` in 10px uppercase, `fontFamily: monospace`, `color: var(--primary-glow)`, `letterSpacing: 0.2em`

2. **Headline + subline**
   - Headline: `fontSize: 38px`, `fontWeight: 560`, `color: var(--fg)`, `letterSpacing: -0.03em`, `lineHeight: 1.1`, max 2 lines — "Calm financial clarity for the next real-life decision."
   - Subline: `fontSize: 14px`, `color: var(--fg-soft)`, `lineHeight: 1.6`, `maxWidth: 340px` — "Sign in to continue your money journey and keep your progress in one place."

3. **Decorative mini-preview** — a `.card` rendered at `opacity: 0.8`, `transform: translateY(-4px)`, containing:
   - XP row: level badge (`pill primary` style, hardcoded "Lv 7") + label "XP this week" + progress bar (`background: var(--primary-soft)`, fill `var(--primary-glow)`, `height: 6px`, `borderRadius: 4px`) + `+225 XP` in `mono f-xs` with `color: var(--xp)`
   - Two metric tiles side by side using `.metric` class: "Net worth · $4,240" (accent) and "Streak · 12 days" (no accent)
   - All values are hardcoded — this is pure decoration, no state or interactivity

## Form Card (Right Panel)

The right panel renders a single `.card` at `padding: 28px`. Structure inside the card:

### Heading
- Small label: `f-xs mono` style, `color: var(--fg-dim)`, `textTransform: uppercase`, `letterSpacing: 0.1em` — "Sign in" or "Create account"
- `h2`: `fontSize: 22px`, `fontWeight: 560`, `color: var(--fg)`, `margin: 6px 0 4px` — "Welcome back." / "Start with a calmer money picture."
- Subline: `fontSize: 13px`, `color: var(--fg-soft)`, `marginBottom: 20px`

### Fields
Each `<label>` has:
- `f-xs muted` span for the label text
- Input styled identically to `settings-content.tsx`:
  ```
  height: 36px
  background: oklch(1 0 0 / 0.04)
  border: 0
  color: var(--fg)
  font: inherit
  padding: 0 12px
  borderRadius: 8px
  boxShadow: 0 0 0 1px var(--line)
  outline: none
  fontSize: 13px
  width: 100%
  ```

Sign-up form has three fields in order: Name, Email, Password.  
Sign-in form has two: Email, Password.

### Forgot Password
Below the password field, right-aligned (`textAlign: right`):
- `<Link href="/forgot-password">` with `fontSize: 12px`, `color: var(--primary-glow)`, text "Forgot password?"
- `marginTop: 6px`, `marginBottom: 16px`

### Submit Button
`<button className="btn primary" style={{ width: "100%" }}>`  
Text: "Sign in" / "Create account"  
Uses `useFormStatus` for pending state — shows "Signing in…" / "Creating account…" while pending, disabled during transition.

### Error Message
Appears below the submit button when `state.message` is non-empty:
- `background: var(--danger-soft)`, `color: var(--danger)`, `borderRadius: 8px`, `padding: 10px 12px`, `fontSize: 13px`, `marginTop: 10px`

### Switch Link
Outside the `.card`, centered, `marginTop: 16px`:
- `f-xs`, `color: var(--fg-soft)` — "Need an account?" / "Already have an account?"
- `<Link>` with `color: var(--primary-glow)`, `fontWeight: 520` — "Create one" / "Sign in"

## Forgot Password Stub

`app/(auth)/forgot-password/page.tsx` — a minimal page rendered inside `AuthShell`:
- Heading: "Reset your password"
- Body: 13px muted — "Enter your email and we'll send a reset link."
- Single email field (same `Field` component)
- Submit button: "Send reset link" (no action wired — `onSubmit={e => e.preventDefault()}` for now)
- Back link: "← Back to sign in" linking to `/sign-in`

## Constraints

- No OAuth, no social sign-in buttons
- No Tailwind classes in any modified or created file (existing Tailwind classes in untouched files are fine)
- All typography via inline styles or existing CSS token classes (`f-xs`, `f-sm`, `muted`, `mono`, `soft`)
- `SubmitButton` in `auth-forms.tsx` uses `useFormStatus` directly — does not import from `@/components/ui/button`
