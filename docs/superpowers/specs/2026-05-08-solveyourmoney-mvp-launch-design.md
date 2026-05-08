# SolveYourMoney MVP Launch — Implementation Design

**Date:** 2026-05-08  
**Author:** Claude Code (staff-level audit pass)  
**Status:** Approved — ready for implementation planning  
**Launch:** Tomorrow (2026-05-09)

---

## Context

SolveYourMoney is a fintech MVP launching tomorrow with a real Supabase project and LemonSqueezy billing. The app has a full Next.js App Router structure (30 routes, 39 components), a dual mock/live data service pattern, complete database migrations, and server actions — but all five live database services are unimplemented stubs, billing is unwired, and bank statement import does not exist.

This design follows **Approach B — Layered Launch Readiness**: implement in priority order so Tier 1 is done even if time runs short.

---

## Approach: Tier Structure

### Tier 1 — Launch Blockers (must ship)
1. Implement all 5 live Supabase service queries
2. Wire LemonSqueezy checkout + webhook so payments process
3. Bank statement import: PDF upload → extraction → review → save

### Tier 2 — Launch Quality (should ship)
4. Empty states verified on all dashboard pages
5. Loading skeletons verified end-to-end
6. Error boundaries on all dashboard pages
7. Onboarding → dashboard data flow verified

### Tier 3 — Polish (if time allows)
8. UI/UX refinements (spacing, hierarchy, card consistency)
9. Analytics event completeness audit
10. Admin dashboard real metrics

---

## Section 1: Live Data Layer

### Problem
All five feature live services (`debtLiveService`, `budgetLiveService`, `savingsLiveService`, `learnLiveService`, `overviewLiveService`) return empty arrays unconditionally. In production with `NEXT_PUBLIC_USE_MOCK_DATA=false`, every dashboard page is blank for every user.

### Column Mappings

**Debt** (`debts` table → `DebtItem` schema):
- `id` → `id`
- `balance` → `principal`
- `apr` → `interestRate` (nullable, default 0)
- `name` → `label`

**Budget** (`expenses` table → `BudgetCategory` schema):
- `id` → `id`
- `category` → `label`
- `planned_amount` → `allocated`
- `actual_amount` → `spent`
- Filter: `period_start` within current calendar month

**Savings** (`savings_goals` table → `SavingsGoal` schema):
- `id` → `id`
- `name` → `label`
- `target_amount` → `target`
- `saved_amount` → `current`

**Learn** (`learning_progress` table + lesson catalog → `Lesson` schema):
- Query completed slugs for the user from `learning_progress`
- Cross-reference with `lessonCatalog` to build full lesson list
- Catalog entries with a matching completed slug → `completed: true`
- All other catalog entries → `completed: false`
- `id`: use catalog slug as id

**Overview** (aggregate across tables → `OverviewItem[]`):
- `financial_profiles.monthly_income` → `{ id: "income", type: "metric", label: "Monthly Income", value: monthly_income }`
- `SUM(debts.balance)` → `{ id: "total_debt", type: "metric", label: "Total Debt", value: sum }`
- `SUM(savings_goals.saved_amount)` → `{ id: "total_saved", type: "metric", label: "Total Saved", value: sum }`
- `SUM(expenses.actual_amount)` for current month → `{ id: "spent_month", type: "metric", label: "Spent This Month", value: sum }`

### Three Required Fixes Beyond TODOs

**Fix 1 — `supabaseClient` typing:**  
All five live services type `supabaseClient` as `unknown`. Change to `SupabaseClient` from `@supabase/supabase-js`. Import: `import type { SupabaseClient } from '@supabase/supabase-js'`.

**Fix 2 — Missing `financial_profiles` row:**  
A new user who completes onboarding may have no `financial_profiles` row. The overview and learn live services must handle `null` from `.maybeSingle()` gracefully — return zero-valued defaults (`monthly_income: 0`, `level_xp: 0`, `streak_days: 0`) rather than throwing. Use `upsert` with default values on first read if the row is missing.

**Fix 3 — `learning_progress` column name mismatch:**  
`server/actions/dashboard.ts:markLessonComplete` inserts `xp_reward: 80` but the migration defines the column as `xp`. Supabase silently ignores unknown columns, so every lesson completion writes `xp: 0`. Fix:
- In `markLessonComplete`: change `xp_reward: 80` → `xp: 80`
- In `learnLiveService`: read `xp` column (not `xp_reward`)

### Supabase Client Passing Pattern
The `resolveDataSource` router already passes `supabaseClient` through. The callers (page server components) must create a Supabase client via `createSupabaseServerClient()` and pass it into the service call. No structural change to the resolver — only fill the TODOs and type the parameter.

---

## Section 2: LemonSqueezy Billing

### Problem
The webhook route returns `{ received: true }` and ignores all events. The billing config only reads env vars. No checkout flow exists. Payments cannot process.

### Database Change
**Migration 003** — add to `financial_profiles`:
```sql
alter table public.financial_profiles
  add column if not exists subscription_status text not null default 'free',
  add column if not exists subscription_id text;
```
Valid values: `free`, `active`, `cancelled`, `past_due`.

### Checkout Flow
New server action `createCheckoutSession()` in `server/actions/billing.ts`:
1. Validate LemonSqueezy config is complete (all 4 env vars present) — return `{ ok: false, message: "Checkout is not available right now" }` if not
2. Call LemonSqueezy API: `POST https://api.lemonsqueezy.com/v1/checkouts`
3. Pass `custom_data: { user_id }` and `checkout_options: { success_url, cancel_url }`
4. Return `{ ok: true, data: { checkoutUrl } }`

The pricing page "Get Started" button calls this action and `window.location.href = checkoutUrl`.

### Webhook Handler (critical details)

**Raw body requirement:**  
Must call `request.text()` first (not `request.json()`). Parse JSON from the raw string after signature verification. Signature check will always fail if body is pre-parsed.

**HMAC verification:**
```
expectedSig = HMAC-SHA256(LEMONSQUEEZY_WEBHOOK_SECRET, rawBody)
actualSig = X-Signature header
reject with 400 if mismatch
```

**Event handling (idempotent upserts):**
- `order_created` / `subscription_created` → `subscription_status = 'active'`, write `subscription_id`
- `subscription_cancelled` → `subscription_status = 'cancelled'`
- `subscription_payment_failed` → `subscription_status = 'past_due'`
- All handled events return `200`
- Signature failures return `400`
- Use `upsert` on `financial_profiles` (not `update`) for idempotency on webhook retries

**Config guard:**  
`createCheckoutSession()` must check all four vars (`LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_PLAN_VARIANT_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`) before making any API call.

### Free Beta Treatment
Since this is a free beta, `subscription_status` is written but not enforced on any route. The pricing page shows a "Currently in free beta — all features unlocked" banner. No feature gating at launch.

---

## Section 3: Bank Statement Import

### Problem
Does not exist. Users need to import PDF bank statements to populate their debt, budget, and savings data.

### New Files

| File | Purpose |
|------|---------|
| `app/(dashboard)/dashboard/import/page.tsx` | Import page — file upload UI + review table |
| `app/api/import/bank-statement/route.ts` | POST — receives PDF, extracts transactions, returns JSON |
| `server/actions/import.ts` | `saveImportedTransactions()` — writes confirmed assignments to Supabase |
| `lib/import/parseBankStatement.ts` | Pure function: raw PDF text → structured transaction rows |

### User Flow
1. User navigates to `/dashboard/import` (linked from sidebar and from empty states on debt/budget/savings pages)
2. Uploads PDF bank statement (max 10MB, `application/pdf` only)
3. Server calls `pdf-parse`, extracts text, runs `parseBankStatement()` to identify rows
4. Client receives extracted transactions: `{ date, description, amount, type: 'credit' | 'debit' }`
5. Review table shows each transaction; user assigns: `debt_payment | expense | savings` + selects which account/category/goal
6. User clicks Confirm — `saveImportedTransactions()` writes to appropriate tables
7. Success: redirect to `/dashboard` with revalidation

### `parseBankStatement()` Contract
- Input: raw string from `pdf-parse`
- Output: `Array<{ date: string; description: string; amount: number; type: 'credit' | 'debit' }>`
- Regex pattern: lines matching `[date] [description] [amount]` where amount is numeric (handles both `1,234.56` and `1.234,56` European formats)
- Filters out non-numeric amounts before returning
- Returns empty array if no rows match (caller handles empty state)

### Security Requirements
- **Auth check on API route**: call `requireSession()` before processing any file — unauthenticated requests rejected with `401`
- **MIME type validation**: reject non-`application/pdf` content types with `415`
- **Image-PDF guard**: if `pdf-parse` returns empty or near-empty text (< 50 chars), return specific error: `"This looks like a scanned PDF. Please download your statement as a digital export from your bank's website."`
- **File size**: reject files > 10MB with `413`

### Empty State Messaging
- Zero transactions extracted → `"We couldn't read transactions from this file. Try a different export format."`
- Scanned PDF detected → `"This looks like a scanned PDF. Please download your statement as a digital export from your bank's website."`
- Upload error → `"Something went wrong uploading your file. Please try again."`

### Scope Boundaries (not in this launch)
- No automatic categorisation — user assigns manually
- No CSV support (can be added post-launch in under an hour)
- No bank-specific parsers — generic text extraction only

---

## Tier 2: Launch Quality Requirements

### Empty States
All four dashboard pages (debt, budget, savings, learn) must show a proper empty state when their live service returns an empty array. Empty state must include:
- An icon or illustration
- A clear message ("No debts added yet")
- A primary CTA ("Add your first debt" or "Import from bank statement")

Verify the existing `components/dashboard/empty-state.tsx` is actually rendered — not just defined.

### Loading Skeletons
`components/dashboard/dashboard-loading.tsx` exists. Verify it is used as the `loading.tsx` export for each dashboard sub-route. The `app/(dashboard)/dashboard/loading.tsx` already exists — verify debt/budget/savings/learn sub-routes each have their own `loading.tsx`.

### Error Boundaries
`app/(dashboard)/dashboard/error.tsx` exists. Verify debt/budget/savings/learn sub-routes each have their own `error.tsx` with a user-friendly message and retry button.

### Onboarding → Dashboard Flow
Verify end-to-end:
1. `submitMoneyRealityCheck()` completes → `profiles.onboarding_status` set
2. User redirected to `/dashboard`
3. Dashboard loads with empty states (not errors) for a new user with no data
4. `financial_profiles` row exists (or is created on first overview load)

---

## Out of Scope for Launch

- Admin dashboard real metrics (shows "pending" placeholders — acceptable for beta)
- Email notifications
- CSV bank statement import
- Feature gating by subscription status
- Sentry DSN wiring (optional in env schema)

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| `pdf-parse` fails on certain bank PDFs | Image-PDF guard + clear error message |
| LemonSqueezy webhook signature fails due to body parsing | Raw body (`request.text()`) required |
| New user has no `financial_profiles` row | Overview service upserts default row on first read |
| `learning_progress.xp` column mismatch | Fix both action and live service |
| Empty live service returns break dashboard layout | Verified empty states on all pages |
