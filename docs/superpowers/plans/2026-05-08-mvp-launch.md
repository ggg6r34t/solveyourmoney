# SolveYourMoney MVP Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SolveYourMoney production-ready for launch by implementing all five live Supabase service queries, wiring LemonSqueezy billing end-to-end, and building the PDF bank statement import feature from scratch.

**Architecture:** Live services call `createSupabaseServerClient()` internally and own their Supabase dependency — no client threading through the resolver. Dashboard pages are rewritten from mock-data-direct calls to live service calls with proper empty states. Billing uses a server action for checkout and a HMAC-verified webhook handler for status updates. PDF import uses `pdf-parse` for server-side extraction, a client-side review table for assignment, and a server action for persistence.

**Tech Stack:** Next.js 16 App Router, Supabase (`@supabase/ssr` + `@supabase/supabase-js`), LemonSqueezy REST API, `pdf-parse`, Zod 4, TypeScript 5, `tsx` test runner (assert-based, see `tests/run-tests.ts`)

---

## File Map

### Modified Files
| File | Change |
|------|--------|
| `server/actions/dashboard.ts` | Fix `xp_reward` → `xp` column name |
| `features/debt/services/debtLiveService.ts` | Implement Supabase query |
| `features/budget/services/budgetLiveService.ts` | Implement Supabase query |
| `features/savings/services/savingsLiveService.ts` | Implement Supabase query |
| `features/learn/services/learnLiveService.ts` | Implement Supabase query + catalog cross-reference |
| `features/overview/services/overviewLiveService.ts` | Implement aggregate queries + upsert default row |
| `app/(dashboard)/dashboard/debt/page.tsx` | Use live service, show empty state, remove mock |
| `app/(dashboard)/dashboard/budget/page.tsx` | Use live service, show empty state, remove mock |
| `app/(dashboard)/dashboard/savings/page.tsx` | Use live service, show empty state, remove mock |
| `app/(dashboard)/dashboard/learn/page.tsx` | Use live service, show empty state, remove mock |
| `billing/lemonsqueezy.ts` | Add `isLemonSqueezyConfigured()` |
| `app/api/webhooks/lemonsqueezy/route.ts` | Full HMAC-verified webhook handler |
| `app/(marketing)/pricing/page.tsx` | Free beta banner + `<CheckoutButton />` |
| `tests/run-tests.ts` | Add parseBankStatement smoke test |

### New Files
| File | Purpose |
|------|---------|
| `database/migrations/003_billing.sql` | `subscription_status` + `subscription_id` columns |
| `server/actions/billing.ts` | `createCheckoutSession()` server action |
| `components/marketing/checkout-button.tsx` | Client component for checkout CTA |
| `lib/import/parseBankStatement.ts` | Pure PDF text → transaction row parser |
| `app/api/import/bank-statement/route.ts` | PDF upload, auth guard, extraction endpoint |
| `server/actions/import.ts` | `saveImportedTransactions()` server action |
| `app/(dashboard)/dashboard/import/page.tsx` | Import UI: upload → review → confirm |
| `app/(dashboard)/dashboard/debt/loading.tsx` | Debt page skeleton |
| `app/(dashboard)/dashboard/debt/error.tsx` | Debt page error boundary |
| `app/(dashboard)/dashboard/budget/loading.tsx` | Budget page skeleton |
| `app/(dashboard)/dashboard/budget/error.tsx` | Budget page error boundary |
| `app/(dashboard)/dashboard/savings/loading.tsx` | Savings page skeleton |
| `app/(dashboard)/dashboard/savings/error.tsx` | Savings page error boundary |
| `app/(dashboard)/dashboard/learn/loading.tsx` | Learn page skeleton |
| `app/(dashboard)/dashboard/learn/error.tsx` | Learn page error boundary |
| `tests/import/parseBankStatement.test.ts` | Parser unit tests (tsx/assert pattern) |

---

## Task 1: Fix `learning_progress.xp` Column Name Mismatch

**Files:**
- Modify: `server/actions/dashboard.ts`

**Context:** `markLessonComplete` inserts `xp_reward: 80` but the migration defines the column as `xp`. Supabase silently ignores unknown columns, so every lesson completion writes `xp: 0`. This is a silent production bug.

- [ ] **Step 1: Fix the column name**

In `server/actions/dashboard.ts`, find the `upsert` call inside `markLessonComplete` (search for `xp_reward`). The `upsert` object currently contains:

```typescript
    reading_minutes: 5,
    xp_reward: 80,
    completed_at: new Date().toISOString(),
```

Change it to:

```typescript
    xp: 80,
    completed_at: new Date().toISOString(),
```

Also remove `reading_minutes`, `category`, `title`, and `last_viewed_at` from the upsert if those columns do not exist in the `002_dashboard_foundation.sql` migration. The migration only defines: `id`, `user_id`, `slug`, `xp`, `completed_at`, `created_at`, `updated_at`. The final upsert object should be:

```typescript
    {
      user_id: session.userId,
      slug: parsed.data.slug,
      xp: 80,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,slug" },
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add server/actions/dashboard.ts
git commit -m "fix: correct learning_progress xp column name in markLessonComplete"
```

---

## Task 2: Implement Debt Live Service

**Files:**
- Modify: `features/debt/services/debtLiveService.ts`

**Context:** The stub checks for `supabaseClient` but never queries the database. The resolver (`resolveDataSource`) selects between mock and live based on `USE_MOCK`. The live service creates its own Supabase client internally — no threading required. The `supabaseClient?: unknown` parameter is kept to preserve type compatibility with the resolver's inferred type `T`.

- [ ] **Step 1: Replace the stub**

Replace the entire content of `features/debt/services/debtLiveService.ts`:

```typescript
import {
  DebtRequestSchema,
  DebtResponseSchema,
  DebtResponse,
} from "./debtSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getDebtData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<DebtResponse> {
  DebtRequestSchema.parse({ userId });

  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return DebtResponseSchema.parse({ userId, timestamp: now, items: [] });
  }

  const { data, error } = await supabase
    .from("debts")
    .select("id, name, balance, apr")
    .eq("user_id", userId)
    .order("balance", { ascending: false });

  if (error || !data) {
    return DebtResponseSchema.parse({ userId, timestamp: now, items: [] });
  }

  const items = data.map((row) => ({
    id: row.id as string,
    label: row.name as string,
    principal: Number(row.balance),
    interestRate: Number(row.apr ?? 0),
  }));

  return DebtResponseSchema.parse({ userId, timestamp: now, items });
}
```

- [ ] **Step 2: Run existing tests**

```bash
npm run test:local
```

Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Commit**

```bash
git add features/debt/services/debtLiveService.ts
git commit -m "feat: implement debt live service Supabase query"
```

---

## Task 3: Implement Budget Live Service

**Files:**
- Modify: `features/budget/services/budgetLiveService.ts`

**Context:** Queries the `expenses` table filtered to the current calendar month using `period_start`. Month boundaries are computed from `new Date()` at runtime.

- [ ] **Step 1: Replace the stub**

Replace the entire content of `features/budget/services/budgetLiveService.ts`:

```typescript
import {
  BudgetRequestSchema,
  BudgetResponseSchema,
  BudgetResponse,
} from "./budgetSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getBudgetData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<BudgetResponse> {
  BudgetRequestSchema.parse({ userId });

  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return BudgetResponseSchema.parse({ userId, timestamp: now, categories: [] });
  }

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("expenses")
    .select("id, category, planned_amount, actual_amount")
    .eq("user_id", userId)
    .gte("period_start", monthStart)
    .lt("period_start", monthEnd)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return BudgetResponseSchema.parse({ userId, timestamp: now, categories: [] });
  }

  const categories = data.map((row) => ({
    id: row.id as string,
    label: row.category as string,
    allocated: Number(row.planned_amount),
    spent: Number(row.actual_amount),
  }));

  return BudgetResponseSchema.parse({ userId, timestamp: now, categories });
}
```

- [ ] **Step 2: Run existing tests**

```bash
npm run test:local
```

Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Commit**

```bash
git add features/budget/services/budgetLiveService.ts
git commit -m "feat: implement budget live service Supabase query"
```

---

## Task 4: Implement Savings Live Service

**Files:**
- Modify: `features/savings/services/savingsLiveService.ts`

- [ ] **Step 1: Replace the stub**

Replace the entire content of `features/savings/services/savingsLiveService.ts`:

```typescript
import {
  SavingsRequestSchema,
  SavingsResponseSchema,
  SavingsResponse,
} from "./savingsSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSavingsData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<SavingsResponse> {
  SavingsRequestSchema.parse({ userId });

  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return SavingsResponseSchema.parse({ userId, timestamp: now, goals: [] });
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, saved_amount")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return SavingsResponseSchema.parse({ userId, timestamp: now, goals: [] });
  }

  const goals = data.map((row) => ({
    id: row.id as string,
    label: row.name as string,
    target: Number(row.target_amount),
    current: Number(row.saved_amount),
  }));

  return SavingsResponseSchema.parse({ userId, timestamp: now, goals });
}
```

- [ ] **Step 2: Run existing tests**

```bash
npm run test:local
```

Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Commit**

```bash
git add features/savings/services/savingsLiveService.ts
git commit -m "feat: implement savings live service Supabase query"
```

---

## Task 5: Implement Learn Live Service

**Files:**
- Modify: `features/learn/services/learnLiveService.ts`

**Context:** The catalog at `features/dashboard/catalog.ts` exports `lessonCatalog: LessonCatalogItem[]` with 6 lessons, each with a `slug` and `title`. The live service queries completed slugs from `learning_progress`, then cross-references the catalog to build the full lesson list with `completed` flags. Catalog items not in the DB are `completed: false`.

- [ ] **Step 1: Replace the stub**

Replace the entire content of `features/learn/services/learnLiveService.ts`:

```typescript
import {
  LearnRequestSchema,
  LearnResponseSchema,
  LearnResponse,
} from "./learnSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { lessonCatalog } from "../../dashboard/catalog";

export async function getLearnData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<LearnResponse> {
  LearnRequestSchema.parse({ userId });

  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  const completedSlugs = new Set<string>();

  if (supabase) {
    const { data } = await supabase
      .from("learning_progress")
      .select("slug")
      .eq("user_id", userId)
      .not("completed_at", "is", null);

    if (data) {
      for (const row of data) {
        completedSlugs.add(row.slug as string);
      }
    }
  }

  const lessons = lessonCatalog.map((item) => ({
    id: item.slug,
    title: item.title,
    completed: completedSlugs.has(item.slug),
  }));

  return LearnResponseSchema.parse({ userId, timestamp: now, lessons });
}
```

- [ ] **Step 2: Run existing tests**

```bash
npm run test:local
```

Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Commit**

```bash
git add features/learn/services/learnLiveService.ts
git commit -m "feat: implement learn live service with catalog cross-reference"
```

---

## Task 6: Implement Overview Live Service

**Files:**
- Modify: `features/overview/services/overviewLiveService.ts`

**Context:** Aggregates four metrics from multiple tables in parallel. Also upserts a default `financial_profiles` row for new users who completed onboarding but have no profile row yet — prevents null errors on first dashboard load.

- [ ] **Step 1: Replace the stub**

Replace the entire content of `features/overview/services/overviewLiveService.ts`:

```typescript
import {
  OverviewRequestSchema,
  OverviewResponseSchema,
  OverviewResponse,
} from "./overviewSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOverviewData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<OverviewResponse> {
  OverviewRequestSchema.parse({ userId });

  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return OverviewResponseSchema.parse({ userId, timestamp: now, items: [] });
  }

  // Ensure financial_profiles row exists for new users (ignoreDuplicates = no-op if already present)
  await supabase
    .from("financial_profiles")
    .upsert(
      { user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    .toISOString()
    .split("T")[0];

  const [profileResult, debtsResult, savingsResult, expensesResult] =
    await Promise.all([
      supabase
        .from("financial_profiles")
        .select("monthly_income")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("debts").select("balance").eq("user_id", userId),
      supabase.from("savings_goals").select("saved_amount").eq("user_id", userId),
      supabase
        .from("expenses")
        .select("actual_amount")
        .eq("user_id", userId)
        .gte("period_start", monthStart)
        .lt("period_start", monthEnd),
    ]);

  const monthlyIncome = Number(profileResult.data?.monthly_income ?? 0);
  const totalDebt = (debtsResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.balance),
    0,
  );
  const totalSaved = (savingsResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.saved_amount),
    0,
  );
  const spentMonth = (expensesResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.actual_amount),
    0,
  );

  const items = [
    { id: "income", type: "metric" as const, label: "Monthly Income", value: monthlyIncome },
    { id: "total_debt", type: "metric" as const, label: "Total Debt", value: totalDebt },
    { id: "total_saved", type: "metric" as const, label: "Total Saved", value: totalSaved },
    { id: "spent_month", type: "metric" as const, label: "Spent This Month", value: spentMonth },
  ];

  return OverviewResponseSchema.parse({ userId, timestamp: now, items });
}
```

- [ ] **Step 2: Run existing tests**

```bash
npm run test:local
```

Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Commit**

```bash
git add features/overview/services/overviewLiveService.ts
git commit -m "feat: implement overview live service with multi-table aggregation"
```

---

## Task 7: Rewrite Dashboard Pages to Use Live Services

**Files:**
- Modify: `app/(dashboard)/dashboard/debt/page.tsx`
- Modify: `app/(dashboard)/dashboard/budget/page.tsx`
- Modify: `app/(dashboard)/dashboard/savings/page.tsx`
- Modify: `app/(dashboard)/dashboard/learn/page.tsx`

**Context:** All four pages currently call `getDevelopmentDashboardData()` directly from `features/dashboard/mockData.ts`, bypassing the entire service layer. In production with `NEXT_PUBLIC_USE_MOCK_DATA=false`, this renders mock data regardless. They must be rewritten to call their respective live services and show proper empty states.

**Before writing:** Read `components/dashboard/empty-state.tsx` to confirm its prop shape. The code below passes `message` as a string — adjust if the component uses different prop names.

- [ ] **Step 1: Rewrite debt page**

Replace the entire content of `app/(dashboard)/dashboard/debt/page.tsx`:

```typescript
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { getDebtData } from "@/features/debt/services/debtService";
import { requireSession } from "@/server/dal/session";
import Link from "next/link";

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
      >
        <EmptyState message="No debts added yet." />
        <div className="mt-4">
          <Link
            href="/dashboard/import"
            className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Import from bank statement
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      active="debt"
      title="Debt Tracker"
      subtitle={`Total: ${fmt(totalDebt)} across ${items.length} account${items.length === 1 ? "" : "s"}`}
    >
      <div className="grid gap-4">
        {items.map((debt) => (
          <div
            key={debt.id}
            className="rounded-2xl border border-border bg-panel p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-black text-foreground">{debt.label}</p>
                <p className="mt-1 text-sm font-semibold text-muted">
                  {debt.interestRate > 0
                    ? `${(debt.interestRate * 100).toFixed(1)}% APR`
                    : "No interest"}
                </p>
              </div>
              <p className="text-xl font-black text-foreground">
                {fmt(debt.principal)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
```

- [ ] **Step 2: Rewrite budget page**

Replace the entire content of `app/(dashboard)/dashboard/budget/page.tsx`:

```typescript
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { getBudgetData } from "@/features/budget/services/budgetService";
import { requireSession } from "@/server/dal/session";
import Link from "next/link";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function BudgetPage() {
  const session = await requireSession();
  const today = new Date();
  const monthLabel = today.toLocaleString("en-IE", {
    month: "long",
    year: "numeric",
  });
  const { categories } = await getBudgetData({ userId: session.userId });

  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);

  if (categories.length === 0) {
    return (
      <PageShell
        active="budget"
        title={`Budget — ${monthLabel}`}
        subtitle="Track your spending categories."
      >
        <EmptyState message="No budget categories for this month." />
        <div className="mt-4">
          <Link
            href="/dashboard/import"
            className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Import from bank statement
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      active="budget"
      title={`Budget — ${monthLabel}`}
      subtitle={`Spent ${fmt(totalSpent)} of ${fmt(totalAllocated)} planned`}
    >
      <div className="grid gap-3">
        {categories.map((cat) => {
          const pct =
            cat.allocated > 0
              ? Math.round((cat.spent / cat.allocated) * 100)
              : 0;
          const over = pct > 100;
          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-border bg-panel p-5"
            >
              <div className="flex items-center justify-between">
                <p className="font-black text-foreground">{cat.label}</p>
                <p
                  className={`text-sm font-bold ${over ? "text-danger" : "text-muted"}`}
                >
                  {fmt(cat.spent)} / {fmt(cat.allocated)}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-track">
                <div
                  className={`h-full rounded-full ${over ? "bg-danger" : "bg-primary"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
```

- [ ] **Step 3: Rewrite savings page**

Read `app/(dashboard)/dashboard/savings/page.tsx` first to confirm it also uses mock data. Then replace its entire content:

```typescript
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { getSavingsData } from "@/features/savings/services/savingsService";
import { requireSession } from "@/server/dal/session";
import Link from "next/link";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function SavingsPage() {
  const session = await requireSession();
  const { goals } = await getSavingsData({ userId: session.userId });

  if (goals.length === 0) {
    return (
      <PageShell
        active="savings"
        title="Savings Goals"
        subtitle="Set targets and track your progress."
      >
        <EmptyState message="No savings goals yet." />
        <div className="mt-4">
          <Link
            href="/dashboard/import"
            className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Import from bank statement
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      active="savings"
      title="Savings Goals"
      subtitle={`${goals.length} active goal${goals.length === 1 ? "" : "s"}`}
    >
      <div className="grid gap-4">
        {goals.map((goal) => {
          const pct =
            goal.target > 0
              ? Math.round((goal.current / goal.target) * 100)
              : 0;
          return (
            <div
              key={goal.id}
              className="rounded-2xl border border-border bg-panel p-5"
            >
              <div className="flex items-start justify-between">
                <p className="font-black text-foreground">{goal.label}</p>
                <p className="text-sm font-bold text-muted">
                  {fmt(goal.current)} / {fmt(goal.target)}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-track">
                <div
                  className="h-full rounded-full bg-success"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-muted">
                {pct}% saved
              </p>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
```

- [ ] **Step 4: Rewrite learn page**

Read `app/(dashboard)/dashboard/learn/page.tsx` first. Then replace its entire content:

```typescript
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { getLearnData } from "@/features/learn/services/learnService";
import { requireSession } from "@/server/dal/session";

export default async function LearnPage() {
  const session = await requireSession();
  const { lessons } = await getLearnData({ userId: session.userId });
  const completedCount = lessons.filter((l) => l.completed).length;

  if (lessons.length === 0) {
    return (
      <PageShell
        active="learn"
        title="Learn"
        subtitle="Build your financial knowledge and earn XP."
      >
        <EmptyState message="No lessons available yet." />
      </PageShell>
    );
  }

  return (
    <PageShell
      active="learn"
      title="Learn"
      subtitle={`${completedCount} of ${lessons.length} completed`}
    >
      <div className="grid gap-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`rounded-2xl border border-border bg-panel p-5 ${
              lesson.completed ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-black text-foreground">{lesson.title}</p>
              {lesson.completed && (
                <span className="rounded-lg bg-surface-success px-2.5 py-1 text-xs font-bold text-success">
                  Done
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors — the most likely ones are `PageShell` prop names (check `components/dashboard/page-shell.tsx` for exact prop names) and `EmptyState` prop names (check `components/dashboard/empty-state.tsx`).

- [ ] **Step 6: Commit**

```bash
git add "app/(dashboard)/dashboard/debt/page.tsx" \
        "app/(dashboard)/dashboard/budget/page.tsx" \
        "app/(dashboard)/dashboard/savings/page.tsx" \
        "app/(dashboard)/dashboard/learn/page.tsx"
git commit -m "feat: rewrite dashboard pages to use live services with empty states"
```

---

## Task 8: Database Migration 003 — Billing Columns

**Files:**
- Create: `database/migrations/003_billing.sql`

- [ ] **Step 1: Create the migration file**

Create `database/migrations/003_billing.sql`:

```sql
-- Add subscription tracking to financial_profiles
-- Valid values for subscription_status: free, active, cancelled, past_due
alter table public.financial_profiles
  add column if not exists subscription_status text not null default 'free',
  add column if not exists subscription_id text;
```

- [ ] **Step 2: Apply in Supabase**

Open Supabase dashboard → SQL Editor → paste and run the migration. Verify with:

```sql
select column_name
from information_schema.columns
where table_name = 'financial_profiles'
  and column_name in ('subscription_status', 'subscription_id');
```

Expected: 2 rows returned.

- [ ] **Step 3: Commit**

```bash
git add database/migrations/003_billing.sql
git commit -m "feat: add subscription_status and subscription_id to financial_profiles"
```

---

## Task 9: LemonSqueezy Config Guard + Checkout Action + Pricing Page

**Files:**
- Modify: `billing/lemonsqueezy.ts`
- Create: `server/actions/billing.ts`
- Create: `components/marketing/checkout-button.tsx`
- Modify: `app/(marketing)/pricing/page.tsx`

**Context:** The pricing page stays a server component (it uses `MarketingShell` which is likely server-only). The checkout button is extracted into a `"use client"` component so it can hold loading/error state. Server actions can be called from client components.

- [ ] **Step 1: Add `isLemonSqueezyConfigured()` to billing config**

Replace the entire content of `billing/lemonsqueezy.ts`:

```typescript
export function getLemonSqueezyConfig() {
  return {
    storeId: process.env.LEMONSQUEEZY_STORE_ID ?? "",
    planVariantId: process.env.LEMONSQUEEZY_PLAN_VARIANT_ID ?? "",
    apiKey: process.env.LEMONSQUEEZY_API_KEY ?? "",
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
  };
}

export function isLemonSqueezyConfigured(): boolean {
  const { storeId, planVariantId, apiKey, webhookSecret } =
    getLemonSqueezyConfig();
  return Boolean(storeId && planVariantId && apiKey && webhookSecret);
}
```

- [ ] **Step 2: Create the checkout server action**

Create `server/actions/billing.ts`:

```typescript
"use server";

import {
  getLemonSqueezyConfig,
  isLemonSqueezyConfigured,
} from "@/billing/lemonsqueezy";
import { requireSession } from "@/server/dal/session";

type CheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; message: string };

export async function createCheckoutSession(): Promise<CheckoutResult> {
  const session = await requireSession();

  if (!isLemonSqueezyConfigured()) {
    return { ok: false, message: "Checkout is not available right now." };
  }

  const { apiKey, storeId, planVariantId } = getLemonSqueezyConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  let response: Response;
  try {
    response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_options: {
              success_url: `${appUrl}/dashboard?checkout=success`,
              cancel_url: `${appUrl}/pricing`,
            },
            checkout_data: {
              email: session.email ?? undefined,
              custom: { user_id: session.userId },
            },
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: planVariantId } },
          },
        },
      }),
    });
  } catch {
    return { ok: false, message: "Checkout is not available right now." };
  }

  if (!response.ok) {
    return { ok: false, message: "Checkout is not available right now." };
  }

  const json = (await response.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const checkoutUrl = json?.data?.attributes?.url;

  if (!checkoutUrl) {
    return { ok: false, message: "Checkout is not available right now." };
  }

  return { ok: true, checkoutUrl };
}
```

- [ ] **Step 3: Create the checkout button client component**

Create `components/marketing/checkout-button.tsx`:

```typescript
"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/server/actions/billing";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await createCheckoutSession();
    if (result.ok) {
      window.location.href = result.checkoutUrl;
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm font-semibold text-danger">{error}</p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Opening checkout…" : "Get started"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Update pricing page with free beta banner and checkout button**

Replace the entire content of `app/(marketing)/pricing/page.tsx`:

```typescript
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, Eyebrow } from "@/components/ui/card";
import { CheckoutButton } from "@/components/marketing/checkout-button";

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-6 rounded-2xl border border-border bg-surface-success px-5 py-3 text-sm font-bold text-success">
          Currently in free beta — all features are unlocked for early members.
        </div>
        <Card>
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-foreground sm:text-5xl">
            Start free, then unlock a personalized roadmap.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            The free experience gives clarity and structure. The paid plan turns
            your reality check into a more detailed roadmap you can revisit
            later.
          </p>
          <div className="mt-8">
            <CheckoutButton />
          </div>
        </Card>
      </section>
    </MarketingShell>
  );
}
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

If `Card` or `Eyebrow` are not named exports from `@/components/ui/card`, check that file and adjust the import accordingly.

- [ ] **Step 6: Commit**

```bash
git add billing/lemonsqueezy.ts \
        server/actions/billing.ts \
        "components/marketing/checkout-button.tsx" \
        "app/(marketing)/pricing/page.tsx"
git commit -m "feat: add LemonSqueezy checkout action, config guard, and pricing page CTA"
```

---

## Task 10: LemonSqueezy Webhook Handler

**Files:**
- Modify: `app/api/webhooks/lemonsqueezy/route.ts`

**Critical constraint:** The HMAC signature verification requires the raw request body as a string. `request.text()` must be called **before** `JSON.parse()`. If you call `request.json()` first, the raw bytes are consumed and the signature check will always fail.

- [ ] **Step 1: Replace the stub**

Replace the entire content of `app/api/webhooks/lemonsqueezy/route.ts`:

```typescript
import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type LemonSqueezyEvent = {
  meta?: {
    event_name?: string;
    custom_data?: { user_id?: string };
  };
  data?: { id?: string };
};

export async function POST(request: NextRequest) {
  // Read raw body FIRST — must happen before JSON.parse for HMAC to work
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const expectedSig = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSig !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as LemonSqueezyEvent;
  const eventName = event?.meta?.event_name;
  const userId = event?.meta?.custom_data?.user_id;
  const subscriptionId = event?.data?.id;

  if (!userId || !eventName) {
    return NextResponse.json({ received: true });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ received: true });
  }

  const base = { user_id: userId, updated_at: new Date().toISOString() };

  if (eventName === "order_created" || eventName === "subscription_created") {
    await supabase.from("financial_profiles").upsert(
      {
        ...base,
        subscription_status: "active",
        subscription_id: subscriptionId ?? null,
      },
      { onConflict: "user_id" },
    );
  } else if (eventName === "subscription_cancelled") {
    await supabase.from("financial_profiles").upsert(
      { ...base, subscription_status: "cancelled" },
      { onConflict: "user_id" },
    );
  } else if (eventName === "subscription_payment_failed") {
    await supabase.from("financial_profiles").upsert(
      { ...base, subscription_status: "past_due" },
      { onConflict: "user_id" },
    );
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add "app/api/webhooks/lemonsqueezy/route.ts"
git commit -m "feat: implement LemonSqueezy webhook handler with HMAC verification"
```

---

## Task 11: `parseBankStatement` Pure Function + Tests

**Files:**
- Create: `lib/import/parseBankStatement.ts`
- Create: `tests/import/parseBankStatement.test.ts`
- Modify: `tests/run-tests.ts`

**Context:** Handles both US (`1,234.56`) and European (`1.234,56`) number formats. The app targets European users so both formats appear in real statements. This is a pure function with no side effects — straightforward to unit test.

- [ ] **Step 1: Create the parser**

Create `lib/import/parseBankStatement.ts`:

```typescript
export type ParsedTransaction = {
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
};

// Matches: DD/MM/YYYY  DD-MM-YYYY  DD.MM.YYYY  YYYY-MM-DD
const DATE_RE =
  /\b(\d{4}[-\/\.]\d{2}[-\/\.]\d{2}|\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})\b/;

function parseAmount(raw: string): number | null {
  const s = raw.replace(/\s/g, "").replace(/^[+-]/, "");
  // European: 1.234,56 (dots as thousands, comma as decimal)
  if (/^\d{1,3}(\.\d{3})*(,\d{2})$/.test(s)) {
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  }
  // US: 1,234.56 (commas as thousands, dot as decimal)
  if (/^\d{1,3}(,\d{3})*(\.\d{2})$/.test(s)) {
    return parseFloat(s.replace(/,/g, ""));
  }
  // Simple: 12.50 or 12,50
  const simple = parseFloat(s.replace(",", "."));
  return isNaN(simple) ? null : simple;
}

export function parseBankStatement(text: string): ParsedTransaction[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const results: ParsedTransaction[] = [];

  for (const line of lines) {
    const dateMatch = line.match(DATE_RE);
    if (!dateMatch) continue;

    // Find the last number-like token on the line (most bank formats put amount at end)
    const tokens = line.split(/\s+/);
    const lastToken = tokens[tokens.length - 1];
    const secondLast = tokens[tokens.length - 2];

    // Check if trailing minus sign is separate (e.g. "45.20 -")
    const rawAmount =
      secondLast && /^[\d.,]+$/.test(secondLast) && lastToken === "-"
        ? secondLast
        : lastToken;

    const isTrailingMinus = lastToken === "-" && rawAmount !== lastToken;
    const hasLeadingMinus = rawAmount.startsWith("-");

    const absAmount = parseAmount(rawAmount);
    if (absAmount === null || absAmount === 0) continue;

    const isDebit = hasLeadingMinus || isTrailingMinus;

    const dateEnd = (dateMatch.index ?? 0) + dateMatch[0].length;
    const amountIdx = line.lastIndexOf(rawAmount);
    const descRaw = line.slice(dateEnd, amountIdx).trim();
    const description = descRaw.replace(/\s+/g, " ") || "Transaction";

    results.push({
      date: dateMatch[1],
      description,
      amount: absAmount,
      type: isDebit ? "debit" : "credit",
    });
  }

  return results;
}
```

- [ ] **Step 2: Create the standalone test file**

Create `tests/import/parseBankStatement.test.ts`:

```typescript
import assert from "assert";
import path from "path";

/* eslint-disable @typescript-eslint/no-require-imports */
function requireFresh(modulePath: string) {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
  return require(modulePath);
}

const { parseBankStatement } = requireFresh(
  path.join(__dirname, "..", "..", "lib", "import", "parseBankStatement.ts"),
);

// 1: empty text → empty array
{
  const r = parseBankStatement("");
  assert.deepStrictEqual(r, [], "empty text returns empty array");
}

// 2: single debit with US decimal
{
  const r = parseBankStatement("01/05/2026  Coffee Shop       -3.50");
  assert.strictEqual(r.length, 1, "one transaction");
  assert.strictEqual(r[0].amount, 3.5, "amount 3.50");
  assert.strictEqual(r[0].type, "debit", "negative is debit");
  assert.ok(r[0].description.length > 0, "description not empty");
}

// 3: European format 1.234,56
{
  const r = parseBankStatement("15.05.2026  Supermarkt        -1.234,56");
  assert.strictEqual(r.length, 1, "one transaction");
  assert.strictEqual(r[0].amount, 1234.56, "European amount parsed correctly");
}

// 4: credit transaction
{
  const r = parseBankStatement("2026-05-01  Salary            2200.00");
  assert.strictEqual(r.length, 1, "one transaction");
  assert.strictEqual(r[0].amount, 2200.0, "salary 2200");
  assert.strictEqual(r[0].type, "credit", "positive is credit");
}

// 5: zero amount filtered out
{
  const r = parseBankStatement("01/05/2026  Balance forward   0.00");
  assert.deepStrictEqual(r, [], "zero amount filtered");
}

// 6: no transaction lines
{
  const r = parseBankStatement(
    "Account Statement\nPage 1 of 3\nOpening Balance",
  );
  assert.deepStrictEqual(r, [], "header-only text returns empty");
}

// 7: multiple lines
{
  const text = [
    "01/05/2026  Grocery Store    -45.20",
    "02/05/2026  ATM Withdrawal   -100.00",
    "05/05/2026  Direct Deposit   1800.00",
  ].join("\n");
  const r = parseBankStatement(text);
  assert.strictEqual(r.length, 3, "three transactions");
  assert.strictEqual(r[2].type, "credit", "last is credit");
  assert.strictEqual(r[0].type, "debit", "first is debit");
}

console.log("All parseBankStatement tests passed");
```

- [ ] **Step 3: Add smoke test to run-tests.ts**

In `tests/run-tests.ts`, find the final `console.log("All tests passed (lightweight)");` line and insert before it:

```typescript
// parseBankStatement smoke test
{
  const parser = requireFresh(
    path.join(__dirname, "..", "lib", "import", "parseBankStatement.ts"),
  );
  const empty = parser.parseBankStatement("");
  assert.deepStrictEqual(empty, [], "parseBankStatement: empty returns []");

  const one = parser.parseBankStatement("01/05/2026  Shop  -3.50");
  assert(one.length === 1, "parseBankStatement: parses one transaction");
  assert(one[0].amount === 3.5, "parseBankStatement: correct amount");
}
```

- [ ] **Step 4: Run standalone parser tests**

```bash
npx tsx tests/import/parseBankStatement.test.ts
```

Expected: `All parseBankStatement tests passed`

- [ ] **Step 5: Run full test suite**

```bash
npm run test:local
```

Expected: `All tests passed (lightweight)`

- [ ] **Step 6: Commit**

```bash
git add lib/import/parseBankStatement.ts \
        tests/import/parseBankStatement.test.ts \
        tests/run-tests.ts
git commit -m "feat: add parseBankStatement pure function with unit tests"
```

---

## Task 12: Install pdf-parse and Bank Statement API Route

**Files:**
- Modify: `package.json` (via npm install)
- Create: `app/api/import/bank-statement/route.ts`

- [ ] **Step 1: Install pdf-parse**

```bash
npm install pdf-parse
npm install --save-dev @types/pdf-parse
```

Verify both appear in `package.json`.

- [ ] **Step 2: Create the API route**

Create `app/api/import/bank-statement/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { getOptionalSession } from "@/server/dal/session";
import { parseBankStatement } from "@/lib/import/parseBankStatement";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_TEXT_LENGTH = 50;

export async function POST(request: NextRequest) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 415 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed: { text: string };
  try {
    parsed = await pdfParse(buffer);
  } catch {
    return NextResponse.json(
      { error: "Could not read this PDF file." },
      { status: 422 },
    );
  }

  if (!parsed.text || parsed.text.trim().length < MIN_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error:
          "This looks like a scanned PDF. Please download your statement as a digital export from your bank's website.",
      },
      { status: 422 },
    );
  }

  const transactions = parseBankStatement(parsed.text);

  if (transactions.length === 0) {
    return NextResponse.json(
      {
        error:
          "We couldn't read transactions from this file. Try a different export format.",
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ transactions });
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/api/import/bank-statement/route.ts" package.json package-lock.json
git commit -m "feat: add PDF bank statement extraction API route with auth and validation"
```

---

## Task 13: `saveImportedTransactions` Server Action

**Files:**
- Create: `server/actions/import.ts`

- [ ] **Step 1: Create the server action**

Create `server/actions/import.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/server/dal/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const assignedTransactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number().positive(),
  type: z.enum(["credit", "debit"]),
  assignment: z.enum(["debt_payment", "expense", "savings", "ignore"]),
  targetId: z.string().optional(),
  targetLabel: z.string().optional(),
});

const saveImportSchema = z.object({
  transactions: z.array(assignedTransactionSchema),
});

type SaveResult = { ok: true; count: number } | { ok: false; message: string };

export async function saveImportedTransactions(
  input: unknown,
): Promise<SaveResult> {
  const session = await requireSession();

  const parsed = saveImportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Transaction data is not valid." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Data storage is not configured yet." };
  }

  const toSave = parsed.data.transactions.filter(
    (t) => t.assignment !== "ignore",
  );
  let savedCount = 0;

  for (const tx of toSave) {
    if (tx.assignment === "expense") {
      const today = new Date();
      const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];

      if (tx.targetId) {
        await supabase
          .from("expenses")
          .update({
            actual_amount: tx.amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tx.targetId)
          .eq("user_id", session.userId);
      } else {
        await supabase.from("expenses").insert({
          user_id: session.userId,
          category: tx.targetLabel ?? tx.description,
          period_start: periodStart,
          planned_amount: tx.amount,
          actual_amount: tx.amount,
        });
      }
      savedCount++;
    } else if (tx.assignment === "debt_payment" && tx.targetId) {
      const { data: debt } = await supabase
        .from("debts")
        .select("balance")
        .eq("id", tx.targetId)
        .eq("user_id", session.userId)
        .maybeSingle();

      if (debt) {
        await supabase
          .from("debts")
          .update({
            balance: Math.max(0, Number(debt.balance) - tx.amount),
            updated_at: new Date().toISOString(),
          })
          .eq("id", tx.targetId)
          .eq("user_id", session.userId);
        savedCount++;
      }
    } else if (tx.assignment === "savings" && tx.targetId) {
      const { data: goal } = await supabase
        .from("savings_goals")
        .select("saved_amount")
        .eq("id", tx.targetId)
        .eq("user_id", session.userId)
        .maybeSingle();

      if (goal) {
        await supabase
          .from("savings_goals")
          .update({
            saved_amount: Number(goal.saved_amount) + tx.amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tx.targetId)
          .eq("user_id", session.userId);
        savedCount++;
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/debt");
  revalidatePath("/dashboard/budget");
  revalidatePath("/dashboard/savings");

  return { ok: true, count: savedCount };
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add server/actions/import.ts
git commit -m "feat: add saveImportedTransactions server action"
```

---

## Task 14: Bank Statement Import Page UI

**Files:**
- Create: `app/(dashboard)/dashboard/import/page.tsx`

**Context:** This is a `"use client"` page — it holds state for extracted transactions, assignment dropdowns, upload progress, and save result. The import API route returns `{ transactions: ParsedTransaction[] }` on success, or `{ error: string }` on failure.

- [ ] **Step 1: Create the import page**

Create `app/(dashboard)/dashboard/import/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { saveImportedTransactions } from "@/server/actions/import";
import type { ParsedTransaction } from "@/lib/import/parseBankStatement";

type AssignedTransaction = ParsedTransaction & {
  assignment: "debt_payment" | "expense" | "savings" | "ignore";
  targetId?: string;
  targetLabel?: string;
};

function fmt(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function ImportPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<AssignedTransaction[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setTransactions([]);
    setSaveResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/import/bank-statement", {
      method: "POST",
      body: formData,
    });

    const json = (await res.json()) as {
      transactions?: ParsedTransaction[];
      error?: string;
    };

    setUploading(false);

    if (!res.ok || json.error) {
      setUploadError(json.error ?? "Upload failed. Please try again.");
      return;
    }

    const assigned: AssignedTransaction[] = (json.transactions ?? []).map(
      (t) => ({ ...t, assignment: "expense" as const }),
    );
    setTransactions(assigned);
  }

  function updateAssignment(
    index: number,
    value: AssignedTransaction["assignment"],
  ) {
    setTransactions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, assignment: value } : t)),
    );
  }

  async function handleConfirm() {
    setSaving(true);
    setSaveResult(null);
    const result = await saveImportedTransactions({ transactions });
    setSaving(false);
    if (result.ok) {
      setSaveResult({
        ok: true,
        message: `${result.count} transaction${result.count === 1 ? "" : "s"} saved to your dashboard.`,
      });
      setTransactions([]);
    } else {
      setSaveResult({ ok: false, message: result.message });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-black text-foreground">
        Import Bank Statement
      </h1>
      <p className="mt-2 text-sm font-semibold text-muted">
        Upload a PDF bank statement exported from your bank. We&apos;ll extract
        the transactions so you can assign them to your debt, budget, or savings
        accounts.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-panel p-6">
        <label className="block text-sm font-bold text-foreground">
          Select PDF file
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
        />
        {uploading && (
          <p className="mt-3 text-sm font-semibold text-muted">
            Reading statement…
          </p>
        )}
        {uploadError && (
          <p className="mt-3 text-sm font-semibold text-danger">{uploadError}</p>
        )}
      </div>

      {saveResult && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
            saveResult.ok
              ? "bg-surface-success text-success"
              : "bg-surface-danger text-danger"
          }`}
        >
          {saveResult.message}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-muted">
            {transactions.length} transaction
            {transactions.length === 1 ? "" : "s"} found. Assign each one or
            mark as ignore.
          </p>
          <div className="grid gap-3">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-panel p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-foreground">
                      {tx.description}
                    </p>
                    <p className="text-xs font-semibold text-muted">{tx.date}</p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-black ${
                      tx.type === "debit" ? "text-danger" : "text-success"
                    }`}
                  >
                    {tx.type === "debit" ? "-" : "+"}
                    {fmt(tx.amount)}
                  </p>
                </div>
                <select
                  value={tx.assignment}
                  onChange={(e) =>
                    updateAssignment(
                      i,
                      e.target.value as AssignedTransaction["assignment"],
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground"
                >
                  <option value="expense">Expense</option>
                  <option value="debt_payment">Debt payment</option>
                  <option value="savings">Savings contribution</option>
                  <option value="ignore">Ignore</option>
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="mt-6 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Confirm and save to dashboard"}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/import/page.tsx"
git commit -m "feat: add bank statement import page with PDF upload and review table"
```

---

## Task 15: Loading and Error States for Dashboard Sub-Routes

**Files:**
- Create: 8 files (loading + error for debt, budget, savings, learn)

**Context:** The main dashboard already has `app/(dashboard)/dashboard/loading.tsx` using `<DashboardLoading />`. Sub-routes need their own `loading.tsx` (Next.js shows this during server component data fetching) and `error.tsx` (React error boundary with retry).

- [ ] **Step 1: Create all loading.tsx files**

`app/(dashboard)/dashboard/debt/loading.tsx`:
```typescript
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
export default function Loading() {
  return <DashboardLoading />;
}
```

`app/(dashboard)/dashboard/budget/loading.tsx`:
```typescript
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
export default function Loading() {
  return <DashboardLoading />;
}
```

`app/(dashboard)/dashboard/savings/loading.tsx`:
```typescript
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
export default function Loading() {
  return <DashboardLoading />;
}
```

`app/(dashboard)/dashboard/learn/loading.tsx`:
```typescript
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
export default function Loading() {
  return <DashboardLoading />;
}
```

- [ ] **Step 2: Create all error.tsx files**

`app/(dashboard)/dashboard/debt/error.tsx`:
```typescript
"use client";

export default function DebtError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-sm font-bold text-muted">
        Something went wrong loading your debt data.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
```

`app/(dashboard)/dashboard/budget/error.tsx`:
```typescript
"use client";

export default function BudgetError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-sm font-bold text-muted">
        Something went wrong loading your budget data.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
```

`app/(dashboard)/dashboard/savings/error.tsx`:
```typescript
"use client";

export default function SavingsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-sm font-bold text-muted">
        Something went wrong loading your savings data.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
```

`app/(dashboard)/dashboard/learn/error.tsx`:
```typescript
"use client";

export default function LearnError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-sm font-bold text-muted">
        Something went wrong loading your learning content.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add \
  "app/(dashboard)/dashboard/debt/loading.tsx" \
  "app/(dashboard)/dashboard/debt/error.tsx" \
  "app/(dashboard)/dashboard/budget/loading.tsx" \
  "app/(dashboard)/dashboard/budget/error.tsx" \
  "app/(dashboard)/dashboard/savings/loading.tsx" \
  "app/(dashboard)/dashboard/savings/error.tsx" \
  "app/(dashboard)/dashboard/learn/loading.tsx" \
  "app/(dashboard)/dashboard/learn/error.tsx"
git commit -m "feat: add loading skeletons and error boundaries for all dashboard sub-routes"
```

---

## Task 16: Final Verification Pass

**Files:** Read-only verification — no new files unless a gap is found.

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors. If errors remain, fix them before continuing.

- [ ] **Step 2: Run full test suite**

```bash
npm run test:local
```

Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Run mock audit**

```bash
npm run ci:mock-audit
```

Expected: no mock imports detected in production paths. If violations are reported, locate and remove direct imports of mock data files from `app/`, `features/`, or `components/`.

- [ ] **Step 4: Verify onboarding action sets profile status**

Read `server/actions/onboarding.ts` (or search for `submitMoneyRealityCheck`). Confirm it:
1. Writes to the `profiles` table (or `money_intakes`) after completion
2. Redirects to `/dashboard`
3. Does NOT call `getDevelopmentDashboardData()` or import from mock files

If `profiles` does not have an `onboarding_status` column and the action attempts to set it, add:
```sql
alter table public.profiles
  add column if not exists onboarding_status text not null default 'pending';
```

Apply in Supabase SQL Editor.

- [ ] **Step 5: Verify migration 003 columns in Supabase**

In Supabase SQL Editor:
```sql
select column_name
from information_schema.columns
where table_name = 'financial_profiles'
  and column_name in ('subscription_status', 'subscription_id');
```

Expected: 2 rows returned. If 0 rows, re-apply `database/migrations/003_billing.sql`.

- [ ] **Step 6: Production build**

```bash
npm run build
```

Expected: build completes with no errors. If `validate:env` fails, ensure `NEXT_PUBLIC_APP_URL` is set in your deployment environment (it is the only required env var per `lib/env/server.ts`).

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: pre-launch verification pass complete"
```
