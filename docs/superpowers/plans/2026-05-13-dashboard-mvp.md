# Dashboard MVP Functionality Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 5 MVP dashboard routes fully functional with real data, proper empty states, and every visible interaction either working or removed.

**Architecture:** Extend existing service layer — add `*Calculations.ts` pure function files per feature, enrich Zod schemas with `computed` fields populated by live services, wire pages to service outputs, replace DEMO_* fallbacks with typed empty states, add new gamification feature folder.

**Tech Stack:** Next.js 16.2.4, React 19, TypeScript 5, Supabase SSR, Zod v4, Node assert (tests), tsx (test runner)

---

## File Inventory

**New files:**
- `features/debt/debtCalculations.ts`
- `features/budget/budgetCalculations.ts`
- `features/savings/savingsCalculations.ts`
- `features/gamification/gamificationCalculations.ts`
- `features/gamification/services/gamificationSchema.ts`
- `features/gamification/services/gamificationMockService.ts`
- `features/gamification/services/gamificationLiveService.ts`
- `features/gamification/services/gamificationService.ts`
- `components/dashboard/savings-goal-form.tsx`
- `components/dashboard/add-money-form.tsx`
- `app/(dashboard)/dashboard/loading.tsx`
- `app/(dashboard)/dashboard/error.tsx`

**Modified files:**
- `features/debt/services/debtSchema.ts` — add `minPayment`, `DebtComputed`
- `features/debt/services/debtMockService.ts` — add computed
- `features/debt/services/debtLiveService.ts` — select `monthly_payment`, compute
- `features/budget/services/budgetSchema.ts` — add `income`, `BudgetComputed`
- `features/budget/services/budgetMockService.ts` — add income, computed
- `features/budget/services/budgetLiveService.ts` — query monthly_income, compute
- `features/savings/services/savingsSchema.ts` — enrich SavingsGoal, add SavingsComputed
- `features/savings/services/savingsMockService.ts` — add enriched fields
- `features/savings/services/savingsLiveService.ts` — enrich goals, computed
- `features/learn/services/learnSchema.ts` — add catalog fields, `completedCount`
- `features/learn/services/learnMockService.ts` — use catalog items
- `features/learn/services/learnLiveService.ts` — add catalog fields to output
- `components/dashboard/app-shell.tsx` — real gamification data
- `components/dashboard/debt-simulator.tsx` — remove "Pay", "Set as my plan" buttons
- `components/dashboard/learn-content.tsx` — accept `initialData` prop
- `app/(dashboard)/dashboard/page.tsx` — overview rewrite
- `app/(dashboard)/dashboard/debt/page.tsx` — remove DEMO_DEBTS
- `app/(dashboard)/dashboard/budget/page.tsx` — remove DEMO_*, real income
- `app/(dashboard)/dashboard/savings/page.tsx` — remove DEMO_GOALS
- `app/(dashboard)/dashboard/learn/page.tsx` — pass initialData to LearnContent
- `app/(dashboard)/dashboard/import/import-content.tsx` — remove dead buttons
- `app/(dashboard)/dashboard/notifications/notifications-content.tsx` — remove dead buttons
- `app/(dashboard)/settings/settings-content.tsx` — Profile tab only, real save
- `server/actions/dashboard.ts` — add `createSavingsGoal`, `updateProfileDisplayName`
- `lib/validation/forms.ts` — add `savingsGoalSchema`
- `observability/events.ts` — add 6 missing events
- `scripts/validate-env.ts` — add preview+mock warning
- `tests/run-tests.ts` — add calculation + gamification tests

---

### Task 1: Debt Calculations Utility

**Files:**
- Create: `features/debt/debtCalculations.ts`
- Test: `tests/run-tests.ts` (add in Task 28)

- [ ] **Step 1: Write the module**

```typescript
// features/debt/debtCalculations.ts

export type DebtCalcInput = {
  id: string;
  principal: number;
  interestRate: number; // decimal, e.g. 0.194 for 19.4% APR
  minPayment: number;
};

export type AvalancheResult = {
  totalInterest: number;
  monthsToPayoff: number;
  debtFreeDate: string;
  order: string[]; // ids sorted highest-rate first
};

export function avalanchePayoff(
  debts: DebtCalcInput[],
  extraPayment: number,
): AvalancheResult {
  if (debts.length === 0) {
    return { totalInterest: 0, monthsToPayoff: 0, debtFreeDate: "—", order: [] };
  }

  const sorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  const balances = sorted.map((d) => d.principal);
  let totalInterest = 0;
  let month = 0;
  const MAX_MONTHS = 600;

  while (balances.some((b) => b > 0.01) && month < MAX_MONTHS) {
    month++;
    let freed = 0;

    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] <= 0) continue;
      const interest = balances[i] * (sorted[i].interestRate / 12);
      totalInterest += interest;
      balances[i] += interest;
      const payment = Math.min(sorted[i].minPayment, balances[i]);
      balances[i] -= payment;
      if (balances[i] < 0.01) {
        freed += balances[i];
        balances[i] = 0;
      }
    }

    let extra = extraPayment + freed;
    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] <= 0 || extra <= 0) continue;
      const applied = Math.min(extra, balances[i]);
      balances[i] -= applied;
      extra -= applied;
      if (balances[i] < 0.01) balances[i] = 0;
    }
  }

  const debtFreeDate =
    month < MAX_MONTHS ? payoffMonthLabel(month) : "50+ years";

  return {
    totalInterest: Math.round(totalInterest),
    monthsToPayoff: month,
    debtFreeDate,
    order: sorted.map((d) => d.id),
  };
}

function payoffMonthLabel(monthsFromNow: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
```

- [ ] **Step 2: Commit**

```bash
git add features/debt/debtCalculations.ts
git commit -m "feat: add avalanchePayoff pure calculation utility"
```

---

### Task 2: Budget Calculations Utility

**Files:**
- Create: `features/budget/budgetCalculations.ts`

- [ ] **Step 1: Write the module**

```typescript
// features/budget/budgetCalculations.ts

export type BudgetCategoryInput = {
  allocated: number;
  spent: number;
};

export type BudgetComputed = {
  totalAllocated: number;
  totalSpent: number;
  surplusDeficit: number;
  percentSpent: number;
  savingsRate: number;
};

export function computeBudget(
  categories: BudgetCategoryInput[],
  income: number,
): BudgetComputed {
  const totalAllocated = categories.reduce((s, c) => s + c.allocated, 0);
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const surplusDeficit = income - totalSpent;
  const percentSpent =
    income > 0 ? Math.round((totalSpent / income) * 100) : 0;
  const savingsRate =
    income > 0 ? Math.round((Math.max(0, surplusDeficit) / income) * 100) : 0;
  return { totalAllocated, totalSpent, surplusDeficit, percentSpent, savingsRate };
}
```

- [ ] **Step 2: Commit**

```bash
git add features/budget/budgetCalculations.ts
git commit -m "feat: add computeBudget pure calculation utility"
```

---

### Task 3: Savings Calculations Utility

**Files:**
- Create: `features/savings/savingsCalculations.ts`

- [ ] **Step 1: Write the module**

```typescript
// features/savings/savingsCalculations.ts

export type SavingsGoalInput = {
  target: number;
  current: number;
};

export type GoalEta = {
  monthsRemaining: number; // -1 means unknown (no contribution)
  etaDate: string;
  pctComplete: number;
  remaining: number;
};

export function goalEta(
  goal: SavingsGoalInput,
  monthlyContribution: number,
): GoalEta {
  const remaining = Math.max(0, goal.target - goal.current);
  const pctComplete =
    goal.target > 0
      ? Math.min(100, Math.round((goal.current / goal.target) * 100))
      : 0;

  if (remaining === 0) {
    return { monthsRemaining: 0, etaDate: "Reached", pctComplete: 100, remaining: 0 };
  }

  if (monthlyContribution <= 0) {
    return { monthsRemaining: -1, etaDate: "—", pctComplete, remaining };
  }

  const months = Math.ceil(remaining / monthlyContribution);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  const etaDate = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return { monthsRemaining: months, etaDate, pctComplete, remaining };
}
```

- [ ] **Step 2: Commit**

```bash
git add features/savings/savingsCalculations.ts
git commit -m "feat: add goalEta pure calculation utility"
```

---

### Task 4: Gamification Calculations Utility

**Files:**
- Create: `features/gamification/gamificationCalculations.ts`

- [ ] **Step 1: Write the module**

```typescript
// features/gamification/gamificationCalculations.ts

const THRESHOLDS = [0, 250, 600, 1200, 2000, 3500] as const;
const NAMES = ["Starter", "Explorer", "Steady", "Architect", "Master", "Legend"] as const;

export type GamificationLevel = {
  level: number;
  name: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpPct: number;
  nextLevelName: string | null;
};

export function deriveLevel(xp: number): GamificationLevel {
  let idx = 0;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= THRESHOLDS[i]) {
      idx = i;
      break;
    }
  }

  const level = idx + 1;
  const isMax = level === THRESHOLDS.length;
  const xpForCurrentLevel = THRESHOLDS[idx];
  const xpForNextLevel = isMax ? 0 : THRESHOLDS[idx + 1];
  const range = isMax ? 1 : xpForNextLevel - xpForCurrentLevel;
  const xpPct = isMax
    ? 100
    : Math.min(100, Math.round(((xp - xpForCurrentLevel) / range) * 100));
  const nextLevelName = isMax ? null : NAMES[idx + 1];

  return {
    level,
    name: NAMES[idx],
    xpForCurrentLevel,
    xpForNextLevel,
    xpPct,
    nextLevelName,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add features/gamification/gamificationCalculations.ts
git commit -m "feat: add deriveLevel pure gamification calculation"
```

---

### Task 5: Extend Debt Schema + Update Mock Service

**Files:**
- Modify: `features/debt/services/debtSchema.ts`
- Modify: `features/debt/services/debtMockService.ts`

- [ ] **Step 1: Rewrite `debtSchema.ts`**

```typescript
// features/debt/services/debtSchema.ts
import { z } from "zod";

export const DebtRequestSchema = z.object({ userId: z.string().min(1) });

export const DebtItem = z.object({
  id: z.string(),
  principal: z.number(),
  interestRate: z.number(), // decimal, e.g. 0.194
  label: z.string(),
  minPayment: z.number(),
});

export const DebtComputed = z.object({
  totalBalance: z.number(),
  totalMinPayment: z.number(),
  totalInterest: z.number(),
  debtFreeDate: z.string(),
  monthsToPayoff: z.number(),
  avalancheOrder: z.array(z.string()),
});

export const DebtResponseSchema = z.object({
  userId: z.string(),
  items: z.array(DebtItem),
  computed: DebtComputed,
  timestamp: z.string(),
});

export type DebtResponse = z.infer<typeof DebtResponseSchema>;
```

- [ ] **Step 2: Rewrite `debtMockService.ts`**

```typescript
// features/debt/services/debtMockService.ts
import { DebtResponseSchema, DebtResponse } from "./debtSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { avalanchePayoff } from "../debtCalculations";

export function getDebtData({ userId }: { userId: string }): DebtResponse {
  assertMockDataAllowed("debt");
  const now = new Date().toISOString();
  const items = [
    { id: "d-1", principal: 12000, interestRate: 0.05, label: "Student Loan", minPayment: 240 },
    { id: "d-2", principal: 3000, interestRate: 0.18, label: "Credit Card", minPayment: 60 },
  ];
  const calc = avalanchePayoff(items, 0);
  return DebtResponseSchema.parse({
    userId,
    timestamp: now,
    items,
    computed: {
      totalBalance: items.reduce((s, d) => s + d.principal, 0),
      totalMinPayment: items.reduce((s, d) => s + d.minPayment, 0),
      totalInterest: calc.totalInterest,
      debtFreeDate: calc.debtFreeDate,
      monthsToPayoff: calc.monthsToPayoff,
      avalancheOrder: calc.order,
    },
  });
}
```

- [ ] **Step 3: Run tests to verify schema + mock still pass**

Run: `npx tsx tests/run-tests.ts`
Expected: `All tests passed (lightweight)`

- [ ] **Step 4: Commit**

```bash
git add features/debt/services/debtSchema.ts features/debt/services/debtMockService.ts
git commit -m "feat: extend debt schema with minPayment and computed fields"
```

---

### Task 6: Extend Budget Schema + Update Mock Service

**Files:**
- Modify: `features/budget/services/budgetSchema.ts`
- Modify: `features/budget/services/budgetMockService.ts`

- [ ] **Step 1: Rewrite `budgetSchema.ts`**

```typescript
// features/budget/services/budgetSchema.ts
import { z } from "zod";

export const BudgetRequestSchema = z.object({ userId: z.string().min(1) });

export const BudgetCategory = z.object({
  id: z.string(),
  label: z.string(),
  allocated: z.number(),
  spent: z.number(),
});

export const BudgetComputedSchema = z.object({
  totalAllocated: z.number(),
  totalSpent: z.number(),
  surplusDeficit: z.number(),
  percentSpent: z.number(),
  savingsRate: z.number(),
});

export const BudgetResponseSchema = z.object({
  userId: z.string(),
  income: z.number(),
  categories: z.array(BudgetCategory),
  computed: BudgetComputedSchema,
  timestamp: z.string(),
});

export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;
```

- [ ] **Step 2: Rewrite `budgetMockService.ts`**

```typescript
// features/budget/services/budgetMockService.ts
import { BudgetResponseSchema, BudgetResponse } from "./budgetSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { computeBudget } from "../budgetCalculations";

export function getBudgetData({ userId }: { userId: string }): BudgetResponse {
  assertMockDataAllowed("budget");
  const now = new Date().toISOString();
  const income = 4250;
  const categories = [
    { id: "b-1", label: "Housing", allocated: 1200, spent: 1100 },
    { id: "b-2", label: "Groceries", allocated: 400, spent: 220 },
  ];
  const computed = computeBudget(categories, income);
  return BudgetResponseSchema.parse({ userId, timestamp: now, income, categories, computed });
}
```

- [ ] **Step 3: Run tests**

Run: `npx tsx tests/run-tests.ts`
Expected: `All tests passed (lightweight)`

- [ ] **Step 4: Commit**

```bash
git add features/budget/services/budgetSchema.ts features/budget/services/budgetMockService.ts
git commit -m "feat: extend budget schema with income and computed fields"
```

---

### Task 7: Extend Savings Schema + Update Mock Service

**Files:**
- Modify: `features/savings/services/savingsSchema.ts`
- Modify: `features/savings/services/savingsMockService.ts`

- [ ] **Step 1: Rewrite `savingsSchema.ts`**

```typescript
// features/savings/services/savingsSchema.ts
import { z } from "zod";

export const SavingsRequestSchema = z.object({ userId: z.string().min(1) });

export const SavingsGoal = z.object({
  id: z.string(),
  label: z.string(),
  target: z.number(),
  current: z.number(),
  monthlyContribution: z.number(),
  pctComplete: z.number(),
  remaining: z.number(),
  etaDate: z.string(),
});

export const SavingsComputedSchema = z.object({
  totalSaved: z.number(),
  totalTarget: z.number(),
  totalRemaining: z.number(),
  monthlyTotal: z.number(),
});

export const SavingsResponseSchema = z.object({
  userId: z.string(),
  goals: z.array(SavingsGoal),
  computed: SavingsComputedSchema,
  timestamp: z.string(),
});

export type SavingsResponse = z.infer<typeof SavingsResponseSchema>;
```

- [ ] **Step 2: Rewrite `savingsMockService.ts`**

```typescript
// features/savings/services/savingsMockService.ts
import { SavingsResponseSchema, SavingsResponse } from "./savingsSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { goalEta } from "../savingsCalculations";

export function getSavingsData({ userId }: { userId: string }): SavingsResponse {
  assertMockDataAllowed("savings");
  const now = new Date().toISOString();
  const rawGoals = [
    { id: "g-1", label: "Emergency Fund", target: 6000, current: 3500, monthlyContribution: 180 },
    { id: "g-2", label: "Holiday", target: 1500, current: 300, monthlyContribution: 60 },
  ];
  const goals = rawGoals.map((g) => {
    const eta = goalEta(g, g.monthlyContribution);
    return { ...g, pctComplete: eta.pctComplete, remaining: eta.remaining, etaDate: eta.etaDate };
  });
  const computed = {
    totalSaved: goals.reduce((s, g) => s + g.current, 0),
    totalTarget: goals.reduce((s, g) => s + g.target, 0),
    totalRemaining: goals.reduce((s, g) => s + g.remaining, 0),
    monthlyTotal: goals.reduce((s, g) => s + g.monthlyContribution, 0),
  };
  return SavingsResponseSchema.parse({ userId, timestamp: now, goals, computed });
}
```

- [ ] **Step 3: Run tests**

Run: `npx tsx tests/run-tests.ts`
Expected: `All tests passed (lightweight)`

- [ ] **Step 4: Commit**

```bash
git add features/savings/services/savingsSchema.ts features/savings/services/savingsMockService.ts
git commit -m "feat: extend savings schema with enriched goals and computed fields"
```

---

### Task 8: Extend Learn Schema + Update Mock Service

**Files:**
- Modify: `features/learn/services/learnSchema.ts`
- Modify: `features/learn/services/learnMockService.ts`

- [ ] **Step 1: Rewrite `learnSchema.ts`**

```typescript
// features/learn/services/learnSchema.ts
import { z } from "zod";

export const LearnRequestSchema = z.object({ userId: z.string().min(1) });

export const Lesson = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  category: z.enum(["debt", "savings", "budget", "credit", "bnpl"]),
  readingMinutes: z.number(),
  xpReward: z.number(),
});

export const LearnResponseSchema = z.object({
  userId: z.string(),
  lessons: z.array(Lesson),
  completedCount: z.number(),
  timestamp: z.string(),
});

export type LearnResponse = z.infer<typeof LearnResponseSchema>;
```

- [ ] **Step 2: Rewrite `learnMockService.ts`**

```typescript
// features/learn/services/learnMockService.ts
import { LearnResponseSchema, LearnResponse } from "./learnSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { lessonCatalog } from "../../dashboard/catalog";

export function getLearnData({ userId }: { userId: string }): LearnResponse {
  assertMockDataAllowed("learn");
  const now = new Date().toISOString();
  const lessons = lessonCatalog.map((item) => ({
    id: item.slug,
    title: item.title,
    completed: false,
    category: item.category,
    readingMinutes: item.readingMinutes,
    xpReward: item.xpReward,
  }));
  return LearnResponseSchema.parse({ userId, timestamp: now, lessons, completedCount: 0 });
}
```

- [ ] **Step 3: Run tests**

Run: `npx tsx tests/run-tests.ts`
Expected: `All tests passed (lightweight)`

- [ ] **Step 4: Commit**

```bash
git add features/learn/services/learnSchema.ts features/learn/services/learnMockService.ts
git commit -m "feat: extend learn schema with catalog metadata and completedCount"
```

---

### Task 9: New Gamification Feature — Schema + Mock

**Files:**
- Create: `features/gamification/services/gamificationSchema.ts`
- Create: `features/gamification/services/gamificationMockService.ts`

- [ ] **Step 1: Create `gamificationSchema.ts`**

```typescript
// features/gamification/services/gamificationSchema.ts
import { z } from "zod";

export const GamificationRequestSchema = z.object({ userId: z.string().min(1) });

export const GamificationResponseSchema = z.object({
  userId: z.string(),
  xp: z.number(),
  streak: z.number(),
  level: z.number(),
  levelName: z.string(),
  xpForCurrentLevel: z.number(),
  xpForNextLevel: z.number(),
  xpPct: z.number(),
  nextLevelName: z.string().nullable(),
  timestamp: z.string(),
});

export type GamificationResponse = z.infer<typeof GamificationResponseSchema>;
```

- [ ] **Step 2: Create `gamificationMockService.ts`**

```typescript
// features/gamification/services/gamificationMockService.ts
import { GamificationResponseSchema, GamificationResponse } from "./gamificationSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { deriveLevel } from "../gamificationCalculations";

export function getGamificationData({ userId }: { userId: string }): GamificationResponse {
  assertMockDataAllowed("gamification");
  const now = new Date().toISOString();
  const xp = 940;
  const streak = 12;
  const lvl = deriveLevel(xp);
  return GamificationResponseSchema.parse({
    userId,
    xp,
    streak,
    timestamp: now,
    level: lvl.level,
    levelName: lvl.name,
    xpForCurrentLevel: lvl.xpForCurrentLevel,
    xpForNextLevel: lvl.xpForNextLevel,
    xpPct: lvl.xpPct,
    nextLevelName: lvl.nextLevelName,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add features/gamification/services/gamificationSchema.ts features/gamification/services/gamificationMockService.ts
git commit -m "feat: add gamification schema and mock service"
```

---

### Task 10: Update Debt Live Service

**Files:**
- Modify: `features/debt/services/debtLiveService.ts`

- [ ] **Step 1: Rewrite `debtLiveService.ts`**

```typescript
// features/debt/services/debtLiveService.ts
import { DebtRequestSchema, DebtResponseSchema, DebtResponse } from "./debtSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { avalanchePayoff } from "../debtCalculations";

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

  const emptyComputed = {
    totalBalance: 0, totalMinPayment: 0, totalInterest: 0,
    debtFreeDate: "—", monthsToPayoff: 0, avalancheOrder: [],
  };

  if (!supabase) {
    return DebtResponseSchema.parse({ userId, timestamp: now, items: [], computed: emptyComputed });
  }

  const { data, error } = await supabase
    .from("debts")
    .select("id, name, balance, apr, monthly_payment")
    .eq("user_id", userId)
    .order("balance", { ascending: false });

  if (error || !data) {
    return DebtResponseSchema.parse({ userId, timestamp: now, items: [], computed: emptyComputed });
  }

  const items = data.map((row) => {
    const principal = Number(row.balance);
    const interestRate = Number(row.apr ?? 0) / 100; // DB stores as percent (19.4 → 0.194)
    const minPayment = Number(row.monthly_payment ?? Math.round(principal * 0.02));
    return { id: row.id as string, label: row.name as string, principal, interestRate, minPayment };
  });

  const calc = avalanchePayoff(items, 0);
  const computed = {
    totalBalance: items.reduce((s, d) => s + d.principal, 0),
    totalMinPayment: items.reduce((s, d) => s + d.minPayment, 0),
    totalInterest: calc.totalInterest,
    debtFreeDate: calc.debtFreeDate,
    monthsToPayoff: calc.monthsToPayoff,
    avalancheOrder: calc.order,
  };

  return DebtResponseSchema.parse({ userId, timestamp: now, items, computed });
}
```

- [ ] **Step 2: Commit**

```bash
git add features/debt/services/debtLiveService.ts
git commit -m "feat: update debt live service — select monthly_payment, populate computed"
```

---

### Task 11: Update Budget Live Service

**Files:**
- Modify: `features/budget/services/budgetLiveService.ts`

- [ ] **Step 1: Rewrite `budgetLiveService.ts`**

```typescript
// features/budget/services/budgetLiveService.ts
import { BudgetRequestSchema, BudgetResponseSchema, BudgetResponse } from "./budgetSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeBudget } from "../budgetCalculations";

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

  const emptyComputed = { totalAllocated: 0, totalSpent: 0, surplusDeficit: 0, percentSpent: 0, savingsRate: 0 };

  if (!supabase) {
    return BudgetResponseSchema.parse({ userId, timestamp: now, income: 0, categories: [], computed: emptyComputed });
  }

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split("T")[0];

  const [profileResult, expensesResult] = await Promise.all([
    supabase.from("financial_profiles").select("monthly_income").eq("user_id", userId).maybeSingle(),
    supabase
      .from("expenses")
      .select("id, category, planned_amount, actual_amount")
      .eq("user_id", userId)
      .gte("period_start", monthStart)
      .lt("period_start", monthEnd)
      .order("created_at", { ascending: true }),
  ]);

  const income = Number(profileResult.data?.monthly_income ?? 0);

  if (expensesResult.error || !expensesResult.data) {
    return BudgetResponseSchema.parse({ userId, timestamp: now, income, categories: [], computed: emptyComputed });
  }

  const categories = expensesResult.data.map((row) => ({
    id: row.id as string,
    label: row.category as string,
    allocated: Number(row.planned_amount),
    spent: Number(row.actual_amount),
  }));

  const computed = computeBudget(categories, income);
  return BudgetResponseSchema.parse({ userId, timestamp: now, income, categories, computed });
}
```

- [ ] **Step 2: Commit**

```bash
git add features/budget/services/budgetLiveService.ts
git commit -m "feat: update budget live service — query monthly_income, populate computed"
```

---

### Task 12: Update Savings Live Service

**Files:**
- Modify: `features/savings/services/savingsLiveService.ts`

- [ ] **Step 1: Rewrite `savingsLiveService.ts`**

```typescript
// features/savings/services/savingsLiveService.ts
import { SavingsRequestSchema, SavingsResponseSchema, SavingsResponse } from "./savingsSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { goalEta } from "../savingsCalculations";

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

  const emptyComputed = { totalSaved: 0, totalTarget: 0, totalRemaining: 0, monthlyTotal: 0 };

  if (!supabase) {
    return SavingsResponseSchema.parse({ userId, timestamp: now, goals: [], computed: emptyComputed });
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, saved_amount, monthly_contribution")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return SavingsResponseSchema.parse({ userId, timestamp: now, goals: [], computed: emptyComputed });
  }

  const goals = data.map((row) => {
    const target = Number(row.target_amount);
    const current = Number(row.saved_amount);
    const monthlyContribution = Number(
      row.monthly_contribution ?? Math.round(target * 0.05),
    );
    const eta = goalEta({ target, current }, monthlyContribution);
    return {
      id: row.id as string,
      label: row.name as string,
      target,
      current,
      monthlyContribution,
      pctComplete: eta.pctComplete,
      remaining: eta.remaining,
      etaDate: eta.etaDate,
    };
  });

  const computed = {
    totalSaved: goals.reduce((s, g) => s + g.current, 0),
    totalTarget: goals.reduce((s, g) => s + g.target, 0),
    totalRemaining: goals.reduce((s, g) => s + g.remaining, 0),
    monthlyTotal: goals.reduce((s, g) => s + g.monthlyContribution, 0),
  };

  return SavingsResponseSchema.parse({ userId, timestamp: now, goals, computed });
}
```

- [ ] **Step 2: Commit**

```bash
git add features/savings/services/savingsLiveService.ts
git commit -m "feat: update savings live service — enrich goals with ETA and computed totals"
```

---

### Task 13: Update Learn Live Service

**Files:**
- Modify: `features/learn/services/learnLiveService.ts`

- [ ] **Step 1: Rewrite `learnLiveService.ts`**

```typescript
// features/learn/services/learnLiveService.ts
import { LearnRequestSchema, LearnResponseSchema, LearnResponse } from "./learnSchema";
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
      for (const row of data) completedSlugs.add(row.slug as string);
    }
  }

  const lessons = lessonCatalog.map((item) => ({
    id: item.slug,
    title: item.title,
    completed: completedSlugs.has(item.slug),
    category: item.category,
    readingMinutes: item.readingMinutes,
    xpReward: item.xpReward,
  }));

  return LearnResponseSchema.parse({
    userId,
    timestamp: now,
    lessons,
    completedCount: completedSlugs.size,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add features/learn/services/learnLiveService.ts
git commit -m "feat: update learn live service — add catalog metadata to lesson output"
```

---

### Task 14: Gamification Live Service + Service Resolver

**Files:**
- Create: `features/gamification/services/gamificationLiveService.ts`
- Create: `features/gamification/services/gamificationService.ts`

- [ ] **Step 1: Create `gamificationLiveService.ts`**

```typescript
// features/gamification/services/gamificationLiveService.ts
import { GamificationRequestSchema, GamificationResponseSchema, GamificationResponse } from "./gamificationSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deriveLevel } from "../gamificationCalculations";

export async function getGamificationData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<GamificationResponse> {
  GamificationRequestSchema.parse({ userId });
  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const lvl = deriveLevel(0);
    return GamificationResponseSchema.parse({
      userId, xp: 0, streak: 0, timestamp: now,
      level: lvl.level, levelName: lvl.name,
      xpForCurrentLevel: lvl.xpForCurrentLevel, xpForNextLevel: lvl.xpForNextLevel,
      xpPct: lvl.xpPct, nextLevelName: lvl.nextLevelName,
    });
  }

  const { data } = await supabase
    .from("financial_profiles")
    .select("level_xp, streak_days")
    .eq("user_id", userId)
    .maybeSingle();

  const xp = Number(data?.level_xp ?? 0);
  const streak = Number(data?.streak_days ?? 0);
  const lvl = deriveLevel(xp);

  return GamificationResponseSchema.parse({
    userId, xp, streak, timestamp: now,
    level: lvl.level, levelName: lvl.name,
    xpForCurrentLevel: lvl.xpForCurrentLevel, xpForNextLevel: lvl.xpForNextLevel,
    xpPct: lvl.xpPct, nextLevelName: lvl.nextLevelName,
  });
}
```

- [ ] **Step 2: Create `gamificationService.ts`**

```typescript
// features/gamification/services/gamificationService.ts
import { resolveDataSource } from "../../../lib/data-source/resolveDataSource";
import * as mockService from "./gamificationMockService";
import * as liveService from "./gamificationLiveService";
import type { GamificationResponse } from "./gamificationSchema";

type GamificationDataOptions = Parameters<typeof mockService.getGamificationData>[0];
type GamificationDataService = {
  getGamificationData: (opts: GamificationDataOptions) => GamificationResponse | Promise<GamificationResponse>;
};

export function getGamificationData(opts: GamificationDataOptions) {
  const service = resolveDataSource<GamificationDataService>({
    featureName: "gamification",
    mockService,
    liveService,
  });
  return service.getGamificationData(opts);
}
```

- [ ] **Step 3: Commit**

```bash
git add features/gamification/services/gamificationLiveService.ts features/gamification/services/gamificationService.ts
git commit -m "feat: add gamification live service and resolver"
```

---

### Task 15: AppShell — Real Gamification Data

**Files:**
- Modify: `components/dashboard/app-shell.tsx`

- [ ] **Step 1: Replace hardcoded values in `SidebarContents`**

In `components/dashboard/app-shell.tsx`, replace the hardcoded identity and gamification section of `SidebarContents`:

```typescript
// Add this import at the top of the file
import { getGamificationData } from "@/features/gamification/services/gamificationService";
```

Replace the `SidebarContents` function body (lines 54–67):

```typescript
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
      xpMax = gam.xpForNextLevel || gam.xpForCurrentLevel + 1;
      level = gam.level;
      streak = gam.streak;
      xpPct = gam.xpPct;
      levelName = gam.levelName;
      nextLevelName = gam.nextLevelName;
    } catch {}
  }
```

Replace the XP Card section's hardcoded values to use the variables above:

```tsx
{/* XP Card */}
<div style={{ ... }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
    <span style={{ ... }}>
      <span style={{ ... }} />
      Level {level} · {levelName}
    </span>
    <span style={{ ... }}>
      <Flame size={11} />
      {streak} day
    </span>
  </div>

  <div style={{ ... }}>
    <span style={{ color: "var(--fg)" }}>{xp.toLocaleString()}</span>
    <span style={{ color: "var(--fg-dim)" }}>/ {xpMax.toLocaleString()} XP</span>
    <span style={{ marginLeft: "auto", color: "var(--fg-dim)" }}>{xpPct}%</span>
  </div>

  <div style={{ height: 6, borderRadius: 999, background: "oklch(1 0 0 / 0.06)", overflow: "hidden", marginTop: 8 }}>
    <div style={{ width: `${xpPct}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--primary), var(--xp-2))", boxShadow: "0 0 12px oklch(0.72 0.17 270 / 0.6)" }} />
  </div>

  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--fg-mute)" }}>
    <span>Next: <span style={{ color: "var(--fg-soft)" }}>{nextLevelName ?? "Max level"}</span></span>
    <span style={{ fontFamily: "var(--font-mono)" }}>
      {xpMax > 0 ? `+${xpMax - xp} to go` : "Legend"}
    </span>
  </div>
</div>
```

Replace the Profile section's hardcoded `userName`, `userEmail`, `initials` with the real variables (they're already computed correctly above).

- [ ] **Step 2: TypeCheck**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -30`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/app-shell.tsx
git commit -m "feat: AppShell sidebar uses real session identity and gamification data"
```

---

### Task 16: Overview Page Rewrite

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace page with real-data version**

Replace the full content of `app/(dashboard)/dashboard/page.tsx`:

```typescript
import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/dashboard/app-shell";
import { getOverviewData } from "@/features/overview/services/overviewService";
import { getDebtData } from "@/features/debt/services/debtService";
import { getSavingsData } from "@/features/savings/services/savingsService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* ── Static SVG charts (decorative, no user data) ── */
function AreaChart() {
  const series = [3.2, 3.0, 3.4, 3.9, 4.6, 5.1, 5.4, 6.0, 6.4, 6.9, 7.3, 7.8];
  const months = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
  const W = 760, H = 200, pad = { l: 0, r: 0, t: 16, b: 26 };
  const max = Math.max(...series) * 1.1;
  const xs = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / (series.length - 1);
  const ys = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const path = series.map((v, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(" ");
  const area = path + ` L ${xs(series.length - 1)} ${H - pad.b} L ${xs(0)} ${H - pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 240, display: "block" }}>
      <defs>
        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.66 0.18 282 / 0.45)" />
          <stop offset="100%" stopColor="oklch(0.66 0.18 282 / 0)" />
        </linearGradient>
        <linearGradient id="lineStroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="oklch(0.78 0.16 282)" />
          <stop offset="100%" stopColor="oklch(0.78 0.14 250)" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => {
        const y = pad.t + (H - pad.t - pad.b) * t;
        return <line key={i} x1="0" x2={W} y1={y} y2={y} stroke="oklch(1 0 0 / 0.05)" />;
      })}
      <path d={area} fill="url(#areaFill)" />
      <path d={path} fill="none" stroke="url(#lineStroke)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {months.map((m, i) => (
        <text key={m} x={xs(i)} y={H - 6} fontSize="10.5" textAnchor="middle"
          fontFamily="var(--font-geist-mono, monospace)" fill="oklch(0.48 0.014 280)">{m}</text>
      ))}
    </svg>
  );
}

function DebtMiniRow({ name, apr, balance, tone }: {
  name: string; apr: string; balance: string;
  tone: "danger" | "primary" | "warn";
}) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 480 }}>{name}</span>
          <span className="pill">{apr} APR</span>
        </div>
        <span className="mono f-sm muted">{balance}</span>
      </div>
    </div>
  );
}

function GoalMiniRow({ name, cur, target, pct }: {
  name: string; cur: string; target: string; pct: number;
}) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 480 }}>{name}</span>
        <span className="mono f-sm">
          <span style={{ color: "var(--fg)" }}>{cur}</span>
          <span className="muted"> / {target}</span>
        </span>
      </div>
      <div className="pb success"><i style={{ width: pct + "%" }} /></div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();

  const [overview, debtData, savingsData] = await Promise.all([
    getOverviewData({ userId: session.userId }),
    getDebtData({ userId: session.userId }),
    getSavingsData({ userId: session.userId }),
  ]);

  // Activity log (most recent 4 entries)
  let wins: { title: string; meta: string; xp: string }[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from("activity_logs")
        .select("title, description, occurred_at")
        .eq("user_id", session.userId)
        .order("occurred_at", { ascending: false })
        .limit(4);
      if (data) {
        wins = data.map((row) => ({
          title: row.title as string,
          meta: new Date(row.occurred_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          xp: "+XP",
        }));
      }
    }
  } catch {}

  // Map overview items by id
  const byId = Object.fromEntries(overview.items.map((item) => [item.id, item.value ?? 0]));
  const income = byId["income"] ?? 0;
  const totalDebt = byId["total_debt"] ?? 0;
  const totalSaved = byId["total_saved"] ?? 0;
  const spentMonth = byId["spent_month"] ?? 0;

  const greeting = session.displayName ?? session.email?.split("@")[0] ?? "there";
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  type MetricItem = { label: string; val: string; delta: string; accent: boolean };
  const primaryMetrics: MetricItem[] = [
    { label: "Monthly income",   val: formatCurrency(income),     delta: income > 0 ? "From your profile" : "Set in onboarding",           accent: true  },
    { label: "Total debt",       val: formatCurrency(totalDebt),  delta: totalDebt > 0 ? `${debtData.items.length} accounts` : "No debt tracked", accent: false },
    { label: "Total saved",      val: formatCurrency(totalSaved), delta: totalSaved > 0 ? `${savingsData.goals.length} goals` : "Start a savings goal", accent: false },
    { label: "Spent this month", val: formatCurrency(spentMonth), delta: income > 0 ? `${Math.round((spentMonth / income) * 100)}% of income` : "—", accent: false },
  ];

  return (
    <AppShell active="overview">
      {/* Greeting */}
      <div className="greeting">
        <div>
          <h1>Good {timeOfDay}, {greeting} <span className="wave">✦</span></h1>
          <div className="meta" style={{ marginTop: 6 }}>
            <Link href={"/dashboard/import" as Route} style={{ color: "var(--primary-glow)", textDecoration: "none" }}>
              Import transactions
            </Link>
          </div>
        </div>
      </div>

      {/* Primary metrics */}
      <div className="metrics">
        {primaryMetrics.map(({ label, val, delta, accent }) => (
          <div key={label} className={`metric${accent ? " accent" : ""}`}>
            <div className="lbl">{label}</div>
            <div className="val">{val}</div>
            <span className="delta neut">{delta}</span>
          </div>
        ))}
      </div>

      {/* Hero chart */}
      <div className="g-12" style={{ marginTop: 16 }}>
        <div className="card hero-chart-card" style={{ gridColumn: "span 12" }}>
          <div className="card-head">
            <div>
              <div className="card-title">Savings trajectory</div>
              <div className="card-sub" style={{ marginTop: 2 }}>Illustrative — import data to personalize</div>
            </div>
          </div>
          <AreaChart />
        </div>
      </div>

      {/* Where you're at */}
      <div className="section-hd">
        <h2>Where you&apos;re at</h2>
      </div>

      <div className="g-2">
        {/* Debt overview */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Debt overview</div>
            <Link href="/dashboard/debt" className="card-sub" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>
              See all →
            </Link>
          </div>
          {debtData.items.length === 0 ? (
            <div className="muted f-sm" style={{ padding: "24px 0", textAlign: "center" }}>
              No debts tracked. <Link href="/dashboard/debt" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>Add one →</Link>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div className="muted f-xs">Total balance</div>
                  <div className="mono" style={{ fontSize: 24, letterSpacing: "-0.025em" }}>
                    {formatCurrency(debtData.computed.totalBalance)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="muted f-xs">Debt-free est.</div>
                  <div className="mono" style={{ fontSize: 14, color: "var(--success)" }}>
                    {debtData.computed.debtFreeDate}
                  </div>
                </div>
              </div>
              {debtData.items.slice(0, 3).map((d) => (
                <DebtMiniRow
                  key={d.id}
                  name={d.label}
                  apr={`${(d.interestRate * 100).toFixed(1)}%`}
                  balance={formatCurrency(d.principal)}
                  tone={d.interestRate > 0.15 ? "danger" : d.interestRate > 0.08 ? "warn" : "primary"}
                />
              ))}
            </>
          )}
        </div>

        {/* Savings progress */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Savings progress</div>
            <Link href="/dashboard/savings" className="card-sub" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>
              See all →
            </Link>
          </div>
          {savingsData.goals.length === 0 ? (
            <div className="muted f-sm" style={{ padding: "24px 0", textAlign: "center" }}>
              No savings goals yet. <Link href="/dashboard/savings" style={{ color: "var(--primary-glow)", textDecoration: "none" }}>Start one →</Link>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div className="muted f-xs">Total saved</div>
                  <div className="mono" style={{ fontSize: 24, letterSpacing: "-0.025em" }}>
                    {formatCurrency(savingsData.computed.totalSaved)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="muted f-xs">Monthly total</div>
                  <div className="mono" style={{ fontSize: 14 }}>
                    {formatCurrency(savingsData.computed.monthlyTotal)}
                  </div>
                </div>
              </div>
              {savingsData.goals.slice(0, 3).map((g) => (
                <GoalMiniRow
                  key={g.id}
                  name={g.label}
                  cur={formatCurrency(g.current)}
                  target={formatCurrency(g.target)}
                  pct={g.pctComplete}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Recent wins */}
      {wins.length > 0 && (
        <>
          <div className="section-hd">
            <h2>Recent activity</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {wins.map((w, i) => (
              <div key={i} className="win">
                <div className="ico">✦</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="win-title">{w.title}</div>
                  <div className="win-meta">{w.meta}</div>
                </div>
                <span className="xp">{w.xp}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
```

- [ ] **Step 2: TypeCheck**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -30`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/dashboard/page.tsx
git commit -m "feat: overview page — real data, real greeting, remove DEMO fallback"
```

---

### Task 17: Overview Loading + Error States

**Files:**
- Create: `app/(dashboard)/dashboard/loading.tsx`
- Create: `app/(dashboard)/dashboard/error.tsx`

- [ ] **Step 1: Create `loading.tsx`**

```typescript
// app/(dashboard)/dashboard/loading.tsx
import { AppShell } from "@/components/dashboard/app-shell";

export default function DashboardLoading() {
  return (
    <AppShell active="overview">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ height: 80, background: "oklch(1 0 0 / 0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Create `error.tsx`**

```typescript
// app/(dashboard)/dashboard/error.tsx
"use client";

import { AppShell } from "@/components/dashboard/app-shell";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <AppShell active="overview">
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Something went wrong</div>
        <div className="muted f-sm" style={{ marginBottom: 16 }}>{error.message}</div>
        <button className="btn primary" onClick={reset}>Try again</button>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/loading.tsx" "app/(dashboard)/dashboard/error.tsx"
git commit -m "feat: add loading and error states for dashboard overview"
```

---

### Task 18: Debt Page Rewrite

**Files:**
- Modify: `app/(dashboard)/dashboard/debt/page.tsx`
- Modify: `components/dashboard/debt-simulator.tsx`

- [ ] **Step 1: Remove DEMO_DEBTS from debt page and use computed data**

Replace the full content of `app/(dashboard)/dashboard/debt/page.tsx`:

```typescript
import { AppShell } from "@/components/dashboard/app-shell";
import { DebtSimulator } from "@/components/dashboard/debt-simulator";
import { getDebtData } from "@/features/debt/services/debtService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";

export default async function DebtPage() {
  const session = await requireSession();
  const { items, computed } = await getDebtData({ userId: session.userId });

  const debts = items.map((d, i) => ({
    name: d.label,
    apr: parseFloat((d.interestRate * 100).toFixed(2)),
    balance: d.principal,
    min: d.minPayment,
    paid: 50,
    payoff: computed.debtFreeDate,
    issuer: "—",
    bg: ["oklch(0.68 0.15 24 / 0.18)", "oklch(0.66 0.18 282 / 0.18)", "oklch(0.80 0.13 82 / 0.18)"][i % 3],
  }));

  return (
    <AppShell active="debt">
      <div className="page-hd">
        <div>
          <h1>Debt</h1>
          <div className="sub">A clear picture of what you owe — and the fastest way out.</div>
        </div>
        <div className="row gap-8">
          <span className="pill">Strategy: <b style={{ marginLeft: 6, color: "var(--fg)" }}>Avalanche</b></span>
        </div>
      </div>

      <div className="metrics">
        <div className="metric accent">
          <div className="lbl">Total debt</div>
          <div className="val">{formatCurrency(computed.totalBalance)}</div>
          <span className="delta neut">{items.length} account{items.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="metric">
          <div className="lbl">Monthly minimum</div>
          <div className="val">{formatCurrency(computed.totalMinPayment)}</div>
          <span className="delta neut">Required payments</span>
        </div>
        <div className="metric">
          <div className="lbl">Debt-free estimate</div>
          <div className="val" style={{ fontSize: 22 }}>{computed.debtFreeDate}</div>
          <span className="delta up">Avalanche method</span>
        </div>
        <div className="metric">
          <div className="lbl">Total interest</div>
          <div className="val">{formatCurrency(computed.totalInterest)}</div>
          <span className="delta neut">Projected to payoff</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", marginTop: 16 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>No debts tracked</div>
          <div className="muted f-sm">Import a bank statement or add debts manually to get started.</div>
        </div>
      ) : (
        <DebtSimulator demoDebts={debts} />
      )}
    </AppShell>
  );
}
```

- [ ] **Step 2: Remove "Pay" and "Set as my plan" buttons from `debt-simulator.tsx`**

In `components/dashboard/debt-simulator.tsx`, find and remove the `<button className="btn sm ghost" type="button">Pay</button>` from the `DebtCard` component header row.

Find and remove (or comment with `{/* Post-MVP */}`) the "Set as my plan" button at the bottom of the `DebtSimulator` component.

- [ ] **Step 3: TypeCheck**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -30`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/dashboard/debt/page.tsx" components/dashboard/debt-simulator.tsx
git commit -m "feat: debt page — remove DEMO_DEBTS, use computed data, remove dead buttons"
```

---

### Task 19: Budget Page Rewrite

**Files:**
- Modify: `app/(dashboard)/dashboard/budget/page.tsx`

- [ ] **Step 1: Rewrite `budget/page.tsx`**

Replace full content:

```typescript
import { AppShell } from "@/components/dashboard/app-shell";
import { getBudgetData } from "@/features/budget/services/budgetService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";

function CategoryRow({ c }: { c: { label: string; allocated: number; spent: number } }) {
  const pct = c.allocated > 0 ? Math.round((c.spent / c.allocated) * 100) : 0;
  const pbTone = pct > 100 ? "danger" : pct > 90 ? "warn" : "success";
  return (
    <tr>
      <td><span style={{ fontSize: 13.5, fontWeight: 480 }}>{c.label}</span></td>
      <td className="num" style={{ textAlign: "right", fontSize: 13.5 }}>{formatCurrency(c.spent)}</td>
      <td className="num muted" style={{ textAlign: "right", fontSize: 13 }}>{formatCurrency(c.allocated)}</td>
      <td style={{ width: 200 }}>
        <div className="row between" style={{ marginBottom: 4 }}>
          <span className="mono f-xs muted">{pct}%</span>
          <span className="mono f-xs muted">{formatCurrency(c.allocated - c.spent)} left</span>
        </div>
        <div className={`pb ${pbTone}`}>
          <i style={{ width: Math.min(pct, 100) + "%" }} />
        </div>
      </td>
    </tr>
  );
}

export default async function BudgetPage() {
  const session = await requireSession();
  const { income, categories, computed } = await getBudgetData({ userId: session.userId });

  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayPct = dayOfMonth / daysInMonth;
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Pace arc geometry
  const W = 220, H = 120, cx = W / 2, cy = H - 8, r = 90;
  const pctSpent = computed.totalAllocated > 0
    ? Math.min(computed.totalSpent / computed.totalAllocated, 1)
    : 0;
  function arcPt(p: number) {
    const a = Math.PI - p * Math.PI;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  }
  function arcPath(p: number) {
    const start = arcPt(0); const end = arcPt(p);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  }
  const valPt = arcPt(pctSpent);

  return (
    <AppShell active="budget">
      <div className="page-hd">
        <div>
          <h1>Budget</h1>
          <div className="sub">{monthLabel}</div>
        </div>
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="lbl">Income</div>
          <div className="val">{formatCurrency(income)}</div>
          <span className="delta neut">{income > 0 ? "From your profile" : "Set in onboarding"}</span>
        </div>
        <div className="metric">
          <div className="lbl">Spent</div>
          <div className="val">{formatCurrency(computed.totalSpent)}</div>
          <span className="delta neut">{computed.percentSpent}% of income · day {dayOfMonth}</span>
        </div>
        <div className="metric">
          <div className="lbl">Budgeted</div>
          <div className="val">{formatCurrency(computed.totalAllocated)}</div>
          <span className="delta neut">{income > 0 ? `${Math.round((computed.totalAllocated / income) * 100)}% of income` : "—"}</span>
        </div>
        <div className="metric accent">
          <div className="lbl">Surplus / Deficit</div>
          <div className="val">{formatCurrency(Math.abs(computed.surplusDeficit))}</div>
          <span className={`delta ${computed.surplusDeficit >= 0 ? "up" : "down"}`}>
            {computed.surplusDeficit >= 0 ? "↑ Surplus" : "↓ Deficit"}
          </span>
        </div>
      </div>

      {/* Pace arc */}
      <div className="g-12" style={{ marginTop: 16 }}>
        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="card-head">
            <div className="card-title">Pace this month</div>
            <span className="muted f-xs">Day {dayOfMonth} / {daysInMonth}</span>
          </div>
          <div style={{ display: "grid", placeItems: "center", padding: "4px 0 0" }}>
            <svg viewBox={`0 0 ${W} ${H + 8}`} style={{ width: "100%" }}>
              <defs>
                <linearGradient id="gauge" x1="0" x2="1">
                  <stop offset="0%" stopColor="oklch(0.66 0.18 282)" />
                  <stop offset="100%" stopColor="oklch(0.80 0.13 82)" />
                </linearGradient>
              </defs>
              <path d={arcPath(1)} fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="10" strokeLinecap="round" />
              <path d={arcPath(pctSpent)} fill="none" stroke="url(#gauge)" strokeWidth="10" strokeLinecap="round" />
              <line
                x1={cx + (r - 12) * Math.cos(Math.PI - dayPct * Math.PI)}
                y1={cy - (r - 12) * Math.sin(Math.PI - dayPct * Math.PI)}
                x2={cx + (r + 12) * Math.cos(Math.PI - dayPct * Math.PI)}
                y2={cy - (r + 12) * Math.sin(Math.PI - dayPct * Math.PI)}
                stroke="oklch(0.95 0 0 / 0.5)" strokeWidth="1.5"
              />
              <circle cx={valPt.x} cy={valPt.y} r="5" fill="oklch(0.97 0 0)" />
              <text x={cx} y={cy - 28} textAnchor="middle" fontSize="11" fill="oklch(0.62 0.012 280)">Spent / Budgeted</text>
              <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="18" letterSpacing="-0.03em" fill="oklch(0.97 0 0)">
                {Math.round(computed.totalSpent).toLocaleString()} / {computed.totalAllocated.toLocaleString()}
              </text>
            </svg>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 8" }}>
          <div className="card-head">
            <div className="card-title">Summary</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Savings rate", value: `${computed.savingsRate}%`, sub: "of income unspent" },
              { label: "Categories tracked", value: String(categories.length), sub: "this month" },
              { label: "Days remaining", value: String(daysInMonth - dayOfMonth), sub: "in this month" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="row between">
                <div>
                  <div className="f-xs muted">{label}</div>
                  <div className="f-sm" style={{ fontWeight: 500 }}>{value}</div>
                </div>
                <div className="f-xs muted" style={{ textAlign: "right" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories table */}
      <div className="section-hd">
        <h2>Categories</h2>
        <span className="muted f-xs">This month</span>
      </div>

      {categories.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div className="card-title" style={{ marginBottom: 8 }}>No categories this month</div>
          <div className="muted f-sm">Import transactions to populate your budget automatically.</div>
        </div>
      ) : (
        <div className="card flat" style={{ padding: "4px 4px", overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Spent</th>
                <th style={{ textAlign: "right" }}>Budget</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => <CategoryRow key={c.id} c={c} />)}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
```

- [ ] **Step 2: TypeCheck**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -30`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/budget/page.tsx"
git commit -m "feat: budget page — remove DEMO fallbacks, real income and computed metrics"
```

---

### Task 20: Savings Page Rewrite

**Files:**
- Modify: `app/(dashboard)/dashboard/savings/page.tsx`

- [ ] **Step 1: Rewrite `savings/page.tsx`**

Replace the full content:

```typescript
import { AppShell } from "@/components/dashboard/app-shell";
import { getSavingsData } from "@/features/savings/services/savingsService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";
import { AddMoneyForm } from "@/components/dashboard/add-money-form";
import { SavingsGoalForm } from "@/components/dashboard/savings-goal-form";
import type { SavingsResponse } from "@/features/savings/services/savingsSchema";

type SavingsGoal = SavingsResponse["goals"][number];

const GOAL_COLORS = [
  { g1: "oklch(0.45 0.13 152)", g2: "oklch(0.30 0.08 200)" },
  { g1: "oklch(0.42 0.11 282)", g2: "oklch(0.30 0.10 240)" },
  { g1: "oklch(0.48 0.12 50)",  g2: "oklch(0.35 0.10 28)"  },
];

function GoalCard({ g, idx }: { g: SavingsGoal; idx: number }) {
  const colors = GOAL_COLORS[idx % GOAL_COLORS.length];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="goal-art" style={{ background: `linear-gradient(135deg, ${colors.g1}, ${colors.g2})` }}>
        <div className="ribbon">
          <span className="dot" style={{ background: "oklch(0.95 0.005 280)" }} />
          ETA {g.etaDate}
        </div>
        <div style={{ position: "absolute", left: 14, bottom: 12, fontSize: 16, fontWeight: 520, letterSpacing: "-0.02em" }}>
          {g.label}
        </div>
        <div style={{ position: "absolute", right: 14, bottom: 14, fontFamily: "var(--font-mono)", fontSize: 12, color: "oklch(0.95 0 0 / 0.85)" }}>
          {g.pctComplete}%
        </div>
      </div>

      <div className="row between mt-8" style={{ alignItems: "baseline" }}>
        <span className="mono" style={{ fontSize: 22, letterSpacing: "-0.025em" }}>
          {formatCurrency(g.current)}
        </span>
        <span className="mono f-xs muted">of {formatCurrency(g.target)}</span>
      </div>
      <div className="pb success" style={{ marginTop: 6 }}>
        <i style={{ width: g.pctComplete + "%" }} />
      </div>

      <div className="row between mt-16">
        <div>
          <div className="muted f-xs">Monthly</div>
          <div className="mono f-sm">{formatCurrency(g.monthlyContribution)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="muted f-xs">Remaining</div>
          <div className="mono f-sm">{formatCurrency(g.remaining)}</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <AddMoneyForm goalId={g.id} goalLabel={g.label} />
      </div>
    </div>
  );
}

export default async function SavingsPage() {
  const session = await requireSession();
  const { goals, computed } = await getSavingsData({ userId: session.userId });

  return (
    <AppShell active="savings">
      <div className="page-hd">
        <div>
          <h1>Savings</h1>
          <div className="sub">{goals.length > 0 ? `${goals.length} active goal${goals.length !== 1 ? "s" : ""}` : "Start your first goal"}</div>
        </div>
        <SavingsGoalForm />
      </div>

      <div className="metrics">
        <div className="metric accent">
          <div className="lbl">Total saved</div>
          <div className="val">{formatCurrency(computed.totalSaved)}</div>
          <span className="delta up">{goals.length} goal{goals.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="metric">
          <div className="lbl">Target</div>
          <div className="val">{formatCurrency(computed.totalTarget)}</div>
          <span className="delta neut">Across all goals</span>
        </div>
        <div className="metric">
          <div className="lbl">Remaining</div>
          <div className="val">{formatCurrency(computed.totalRemaining)}</div>
          <span className="delta neut">To reach all targets</span>
        </div>
        <div className="metric">
          <div className="lbl">Monthly contribution</div>
          <div className="val">{formatCurrency(computed.monthlyTotal)}</div>
          <span className="delta neut">Estimated total</span>
        </div>
      </div>

      <div className="section-hd">
        <h2>Your goals</h2>
      </div>

      {goals.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div className="card-title" style={{ marginBottom: 8 }}>No savings goals yet</div>
          <div className="muted f-sm" style={{ marginBottom: 16 }}>Create your first goal to start tracking progress.</div>
          <SavingsGoalForm />
        </div>
      ) : (
        <div className="g-3">
          {goals.map((g, i) => <GoalCard key={g.id} g={g} idx={i} />)}
        </div>
      )}
    </AppShell>
  );
}
```

- [ ] **Step 2: TypeCheck**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -30`
Expected: no errors on this file (AddMoneyForm and SavingsGoalForm don't exist yet — that's OK, next task)

- [ ] **Step 3: Commit (after Task 21)**

Hold off until AddMoneyForm and SavingsGoalForm are created (Task 21), then commit both together.

---

### Task 21: createSavingsGoal Action + Form Components

**Files:**
- Modify: `lib/validation/forms.ts`
- Modify: `server/actions/dashboard.ts`
- Create: `components/dashboard/savings-goal-form.tsx`
- Create: `components/dashboard/add-money-form.tsx`

- [ ] **Step 1: Add `savingsGoalSchema` to `lib/validation/forms.ts`**

Append to the end of `lib/validation/forms.ts` (before the last line):

```typescript
export const savingsGoalSchema = z.object({
  name: z.string().min(2).max(120),
  targetAmount: money.min(1),
});
```

- [ ] **Step 2: Add `createSavingsGoal` to `server/actions/dashboard.ts`**

Append to the end of `server/actions/dashboard.ts` (before the closing `}`):

```typescript
export async function createSavingsGoal(input: {
  name: string;
  targetAmount: number;
}): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = savingsGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Goal details need a second look before saving." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Data storage is not configured yet." };
  }

  const { error } = await supabase.from("savings_goals").insert({
    user_id: session.userId,
    name: parsed.data.name,
    target_amount: parsed.data.targetAmount,
    saved_amount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, message: "We could not create this goal." };
  }

  await captureServerEvent({
    distinctId: session.userId,
    event: events.goalCreated,
    properties: { name: parsed.data.name, target: parsed.data.targetAmount },
  });

  revalidateDashboard();
  return { ok: true, message: "Goal created." };
}
```

Also add `savingsGoalSchema` to the import at the top of `server/actions/dashboard.ts`:

```typescript
import {
  debtScenarioSchema,
  debtUpdateSchema,
  expenseUpdateSchema,
  learningCompletionSchema,
  savingsContributionSchema,
  savingsGoalSchema,   // <-- add this
} from "@/lib/validation/forms";
```

- [ ] **Step 3: Create `components/dashboard/savings-goal-form.tsx`**

```typescript
// components/dashboard/savings-goal-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSavingsGoal } from "@/server/actions/dashboard";

export function SavingsGoalForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const targetAmount = parseFloat(target);
    if (!name.trim() || isNaN(targetAmount) || targetAmount <= 0) {
      setError("Enter a valid name and target amount.");
      return;
    }
    startTransition(async () => {
      const result = await createSavingsGoal({ name: name.trim(), targetAmount });
      if (result.ok) {
        setOpen(false);
        setName("");
        setTarget("");
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  if (!open) {
    return (
      <button className="btn primary" type="button" onClick={() => setOpen(true)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New goal
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
      <input
        className="input"
        placeholder="Goal name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ height: 36, padding: "0 12px", borderRadius: 8, boxShadow: "0 0 0 1px var(--line)", background: "oklch(1 0 0 / 0.04)", border: 0, color: "var(--fg)", font: "inherit", fontSize: 13 }}
        autoFocus
        required
      />
      <input
        type="number"
        className="input mono"
        placeholder="Target $"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        min="1"
        step="1"
        style={{ height: 36, padding: "0 12px", borderRadius: 8, boxShadow: "0 0 0 1px var(--line)", background: "oklch(1 0 0 / 0.04)", border: 0, color: "var(--fg)", font: "inherit", fontSize: 13, width: 120 }}
        required
      />
      {error && <span className="f-xs" style={{ color: "var(--danger)", alignSelf: "center" }}>{error}</span>}
      <button className="btn primary" type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Create"}
      </button>
      <button className="btn ghost" type="button" onClick={() => { setOpen(false); setError(null); }}>
        Cancel
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Create `components/dashboard/add-money-form.tsx`**

```typescript
// components/dashboard/add-money-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMoneyToSavingsGoal } from "@/server/actions/dashboard";

export function AddMoneyForm({ goalId, goalLabel }: { goalId: string; goalLabel: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    startTransition(async () => {
      const result = await addMoneyToSavingsGoal({ goalId, amount: parsed });
      if (result.ok) {
        setOpen(false);
        setAmount("");
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  if (!open) {
    return (
      <button
        className="btn primary"
        type="button"
        style={{ flex: 1 }}
        onClick={() => setOpen(true)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add money
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        type="number"
        className="input mono"
        placeholder="Amount $"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0.01"
        step="0.01"
        style={{ flex: 1, height: 34, padding: "0 10px", borderRadius: 8, boxShadow: "0 0 0 1px var(--line)", background: "oklch(1 0 0 / 0.04)", border: 0, color: "var(--fg)", font: "inherit", fontSize: 12 }}
        autoFocus
        required
        aria-label={`Amount to add to ${goalLabel}`}
      />
      {error && <span className="f-xs" style={{ color: "var(--danger)", alignSelf: "center" }}>{error}</span>}
      <button className="btn primary" type="submit" disabled={isPending} style={{ height: 34, padding: "0 12px" }}>
        {isPending ? "…" : "Add"}
      </button>
      <button className="btn ghost" type="button" style={{ height: 34 }} onClick={() => { setOpen(false); setError(null); }}>
        ✕
      </button>
    </form>
  );
}
```

- [ ] **Step 5: TypeCheck**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -30`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add lib/validation/forms.ts server/actions/dashboard.ts components/dashboard/savings-goal-form.tsx components/dashboard/add-money-form.tsx "app/(dashboard)/dashboard/savings/page.tsx"
git commit -m "feat: savings page — remove DEMO_GOALS, add createSavingsGoal action and forms"
```

---

### Task 22: Learn Page + LearnContent Update

**Files:**
- Modify: `app/(dashboard)/dashboard/learn/page.tsx`
- Modify: `components/dashboard/learn-content.tsx`

- [ ] **Step 1: Update `learn/page.tsx` to pass data to `LearnContent`**

Replace content of `app/(dashboard)/dashboard/learn/page.tsx`:

```typescript
import { AppShell } from "@/components/dashboard/app-shell";
import { LearnContent } from "@/components/dashboard/learn-content";
import { getLearnData } from "@/features/learn/services/learnService";
import { requireSession } from "@/server/dal/session";

export default async function LearnPage() {
  const session = await requireSession();
  const learnData = await getLearnData({ userId: session.userId });

  return (
    <AppShell active="learn">
      <div className="page-hd">
        <div>
          <h1>Learn</h1>
          <div className="sub">
            Bite-sized lessons. Earn XP. Level up your financial literacy.
            {learnData.completedCount > 0 && ` · ${learnData.completedCount} completed`}
          </div>
        </div>
      </div>

      <LearnContent initialLessons={learnData.lessons} />
    </AppShell>
  );
}
```

- [ ] **Step 2: Update `learn-content.tsx` — accept `initialLessons` prop**

At the top of `components/dashboard/learn-content.tsx`, replace the `type Lesson` definition and `LESSONS` constant with:

```typescript
import type { LearnResponse } from "@/features/learn/services/learnSchema";
import { markLessonComplete } from "@/server/actions/dashboard";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type CatalogLesson = LearnResponse["lessons"][number];
```

Change the component signature from `export function LearnContent()` to:

```typescript
export function LearnContent({ initialLessons }: { initialLessons: CatalogLesson[] }) {
  const [lessons, setLessons] = useState(initialLessons);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
```

Replace the hardcoded `CATS` with categories derived from lessons:

```typescript
const CATS = ["All", ...Array.from(new Set(initialLessons.map((l) =>
  l.category.charAt(0).toUpperCase() + l.category.slice(1)
)))];
```

Replace the filtered lessons logic (previously using `LESSONS`):

```typescript
const filtered = activeCategory === "All"
  ? lessons
  : lessons.filter((l) => l.category.toLowerCase() === activeCategory.toLowerCase());
```

Replace the lesson card render. Each lesson now has `id` (slug), `title`, `completed`, `category`, `readingMinutes`, `xpReward`. Map these to the existing visual states:
- `completed: true` → `state: "done"`
- First non-completed → `state: "active"`
- All others → `state: "next"`

Replace the existing lesson map in the render section:

```typescript
const firstIncomplete = filtered.findIndex((l) => !l.completed);
```

In the lesson card click handler, wire to `markLessonComplete`:

```typescript
function handleComplete(slug: string) {
  startTransition(async () => {
    await markLessonComplete({ slug });
    setLessons((prev) =>
      prev.map((l) => (l.id === slug ? { ...l, completed: true } : l))
    );
    router.refresh();
  });
}
```

Replace the lesson card rendering to map `CatalogLesson` fields to the existing JSX. The lesson card currently uses `n`, `state`, `title`, `desc`, `xp`, `min`. Map:
- `n` → lesson index + 1, padded: `String(idx + 1).padStart(2, "0")`
- `state` → derive from `completed` and position
- `title` → `l.title`
- `desc` → `l.category` (short category label, since catalog has no separate desc)
- `xp` → `l.xpReward`
- `min` → `l.readingMinutes`

Remove the hardcoded `BADGES` array and the badges section (Post-MVP, no real badge data source).

- [ ] **Step 3: TypeCheck**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -30`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/dashboard/learn/page.tsx" components/dashboard/learn-content.tsx
git commit -m "feat: learn page — pass real catalog data to LearnContent, wire markLessonComplete"
```

---

### Task 23: Import Page Cleanup

**Files:**
- Modify: `app/(dashboard)/dashboard/import/import-content.tsx`

- [ ] **Step 1: Remove dead buttons**

In `app/(dashboard)/dashboard/import/import-content.tsx`, find and remove:
1. The "Connect a bank instead" button/link
2. The "Paste from clipboard" button
3. In the import history section: "Review" and "Open" buttons on each row
4. The "Export log" button

Keep: the file upload `<input>`, the upload submit button, and the "Clear" button if it's functional.

Each removal: find the JSX element, delete it entirely (do not replace with a comment).

- [ ] **Step 2: Commit**

```bash
git add "app/(dashboard)/dashboard/import/import-content.tsx"
git commit -m "feat: import page — remove dead buttons (connect bank, paste, review, export)"
```

---

### Task 24: Notifications Page Cleanup

**Files:**
- Modify: `app/(dashboard)/dashboard/notifications/notifications-content.tsx`

- [ ] **Step 1: Remove dead interactions**

In `notifications-content.tsx`, find and remove:
1. The "Preferences" button (top-right header area)
2. The channel matrix section (the grid of checkboxes for Push/Email/SMS channels) — the entire section block

Keep: filter tabs (All/Unread/etc.), mark-all-read button, individual notification row toggle (if functional).

- [ ] **Step 2: Commit**

```bash
git add "app/(dashboard)/dashboard/notifications/notifications-content.tsx"
git commit -m "feat: notifications — remove dead Preferences button and channel matrix"
```

---

### Task 25: Settings Profile Tab Only + updateProfileDisplayName

**Files:**
- Modify: `server/actions/dashboard.ts` (add action)
- Modify: `app/(dashboard)/settings/settings-content.tsx`

- [ ] **Step 1: Add `updateProfileDisplayName` to `server/actions/dashboard.ts`**

Append to `server/actions/dashboard.ts`:

```typescript
export async function updateProfileDisplayName(input: {
  displayName: string;
}): Promise<ActionResult> {
  const session = await requireSession();

  if (!input.displayName || input.displayName.trim().length < 2 || input.displayName.trim().length > 80) {
    return { ok: false, message: "Display name must be 2–80 characters." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Data storage is not configured yet." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: input.displayName.trim(), updated_at: new Date().toISOString() })
    .eq("id", session.userId);

  if (error) {
    return { ok: false, message: "Profile could not be saved right now." };
  }

  await captureServerEvent({
    distinctId: session.userId,
    event: events.profileUpdated,
    properties: {},
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated." };
}
```

- [ ] **Step 2: Rewrite `settings-content.tsx` — Profile tab only**

Replace the full content of `app/(dashboard)/settings/settings-content.tsx`:

```typescript
"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { updateProfileDisplayName } from "@/server/actions/dashboard";

export function SettingsContent({ initialDisplayName }: { initialDisplayName: string }) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await updateProfileDisplayName({ displayName });
      if (result.ok) {
        setSaved(true);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Sparkles size={18} style={{ color: "var(--primary-glow)" }} />
        <h2 style={{ fontSize: 16, fontWeight: 520, margin: 0 }}>Profile</h2>
      </div>

      <form onSubmit={handleSave}>
        <div className="card" style={{ padding: 20 }}>
          <div className="card-head" style={{ marginBottom: 16 }}>
            <div>
              <div className="card-title">Display name</div>
              <div className="card-sub">Shown in your dashboard greeting and sidebar</div>
            </div>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="f-xs muted">Name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              required
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

          {error && (
            <div className="f-xs" style={{ color: "var(--danger)", marginTop: 8 }}>{error}</div>
          )}
          {saved && (
            <div className="f-xs" style={{ color: "var(--success)", marginTop: 8 }}>Profile saved.</div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn primary" type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Update settings page to pass `initialDisplayName`**

Find `app/(dashboard)/settings/page.tsx`. Update it to:
1. Call `requireSession()` (it likely already does)
2. Pass `session.displayName ?? ""` as `initialDisplayName` prop to `SettingsContent`

The import and render should look like:

```typescript
import { AppShell } from "@/components/dashboard/app-shell";
import { SettingsContent } from "./settings-content";
import { requireSession } from "@/server/dal/session";

export default async function SettingsPage() {
  const session = await requireSession();
  return (
    <AppShell active="settings">
      <div className="page-hd">
        <div>
          <h1>Settings</h1>
          <div className="sub">Manage your account.</div>
        </div>
      </div>
      <SettingsContent initialDisplayName={session.displayName ?? ""} />
    </AppShell>
  );
}
```

- [ ] **Step 4: TypeCheck**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -30`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add server/actions/dashboard.ts "app/(dashboard)/settings/settings-content.tsx" "app/(dashboard)/settings/page.tsx"
git commit -m "feat: settings — Profile tab only with real updateProfileDisplayName action"
```

---

### Task 26: Observability Events

**Files:**
- Modify: `observability/events.ts`

- [ ] **Step 1: Add missing events**

Replace the content of `observability/events.ts`:

```typescript
export const events = {
  signupStarted: "signup_started",
  onboardingCompleted: "onboarding_completed",
  planPurchased: "plan_purchased",
  subscriptionStarted: "subscription_started",
  weeklyCheckinCompleted: "weekly_checkin_completed",
  paymentSucceeded: "payment_succeeded",
  paymentFailed: "payment_failed",
  criticalError: "critical_error",
  dashboardViewed: "dashboard_viewed",
  debtUpdated: "debt_updated",
  savingsUpdated: "savings_updated",
  planEngaged: "plan_engaged",
  learningCompleted: "learning_completed",
  upgradeIntentClicked: "upgrade_intent_clicked",
  // Added for MVP completeness
  goalCreated: "goal_created",
  profileUpdated: "profile_updated",
  debtPageViewed: "debt_page_viewed",
  budgetPageViewed: "budget_page_viewed",
  savingsPageViewed: "savings_page_viewed",
  learnPageViewed: "learn_page_viewed",
} as const;

export type AnalyticsEventName = (typeof events)[keyof typeof events];
```

- [ ] **Step 2: Fire page-view events on debt, budget, savings, learn pages**

In each page file, add a `captureServerEvent` call after `requireSession()`. Example for debt page:

```typescript
// At the top of DebtPage function, after const session = await requireSession();
await captureServerEvent({ distinctId: session.userId, event: events.debtPageViewed, properties: {} });
```

Add the import to each page:
```typescript
import { captureServerEvent, events } from "@/observability/posthog";
```

Repeat for `budget/page.tsx` (`events.budgetPageViewed`), `savings/page.tsx` (`events.savingsPageViewed`), `learn/page.tsx` (`events.learnPageViewed`).

- [ ] **Step 3: Commit**

```bash
git add observability/events.ts "app/(dashboard)/dashboard/debt/page.tsx" "app/(dashboard)/dashboard/budget/page.tsx" "app/(dashboard)/dashboard/savings/page.tsx" "app/(dashboard)/dashboard/learn/page.tsx"
git commit -m "feat: add missing observability events and page-view tracking"
```

---

### Task 27: Env Validation Improvement

**Files:**
- Modify: `scripts/validate-env.ts`

- [ ] **Step 1: Add preview+mock warning**

Replace content of `scripts/validate-env.ts`:

```typescript
import { loadEnv } from "../lib/config/env";

try {
  const env = loadEnv(process.env as NodeJS.ProcessEnv);

  if (env.NEXT_PUBLIC_APP_ENV === "production" && env.USE_MOCK) {
    console.error(
      "validate-env: Mock data flag is enabled in production — failing build",
    );
    process.exitCode = 2;
    throw new Error("Mock data is not allowed in production");
  }

  if (
    env.NEXT_PUBLIC_APP_ENV === "preview" &&
    env.USE_MOCK &&
    !env.ALLOW_PREVIEW_MOCK
  ) {
    console.warn(
      "validate-env: WARN — Mock data is enabled in preview but ALLOW_PREVIEW_MOCK_DATA is not set. " +
        "Set ALLOW_PREVIEW_MOCK_DATA=true to allow, or set NEXT_PUBLIC_USE_MOCK_DATA=false.",
    );
  }

  console.log("validate-env: OK", {
    env: env.NEXT_PUBLIC_APP_ENV,
    useMock: env.USE_MOCK,
  });
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("validate-env: Configuration invalid", message);
  process.exitCode = 1;
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/validate-env.ts
git commit -m "feat: validate-env warns when preview+mock without ALLOW_PREVIEW_MOCK_DATA"
```

---

### Task 28: Update run-tests.ts

**Files:**
- Modify: `tests/run-tests.ts`

- [ ] **Step 1: Add calculation unit tests**

In `tests/run-tests.ts`, add the following test blocks before the final `console.log("All tests passed")` line:

```typescript
  // Test: avalanchePayoff — empty debts
  {
    const calc = requireFresh(
      path.join(__dirname, "..", "features", "debt", "debtCalculations.ts"),
    );
    const empty = calc.avalanchePayoff([], 0);
    assert(empty.totalInterest === 0, "avalanchePayoff: empty → 0 interest");
    assert(empty.debtFreeDate === "—", "avalanchePayoff: empty → '—' date");
    assert(empty.order.length === 0, "avalanchePayoff: empty → empty order");
  }

  // Test: avalanchePayoff — single debt pays off
  {
    const calc = requireFresh(
      path.join(__dirname, "..", "features", "debt", "debtCalculations.ts"),
    );
    const debts = [{ id: "d1", principal: 1200, interestRate: 0.12, minPayment: 100 }];
    const result = calc.avalanchePayoff(debts, 0);
    assert(result.monthsToPayoff > 0, "avalanchePayoff: single debt payoff > 0 months");
    assert(result.totalInterest > 0, "avalanchePayoff: single debt total interest > 0");
    assert(result.order[0] === "d1", "avalanchePayoff: single debt order correct");
  }

  // Test: avalanchePayoff — high-rate debt paid first
  {
    const calc = requireFresh(
      path.join(__dirname, "..", "features", "debt", "debtCalculations.ts"),
    );
    const debts = [
      { id: "low", principal: 500, interestRate: 0.05, minPayment: 25 },
      { id: "high", principal: 500, interestRate: 0.20, minPayment: 25 },
    ];
    const result = calc.avalanchePayoff(debts, 0);
    assert(result.order[0] === "high", "avalanchePayoff: highest rate paid first");
  }

  // Test: computeBudget
  {
    const calc = requireFresh(
      path.join(__dirname, "..", "features", "budget", "budgetCalculations.ts"),
    );
    const result = calc.computeBudget([{ allocated: 500, spent: 300 }], 1000);
    assert(result.totalSpent === 300, "computeBudget: totalSpent correct");
    assert(result.surplusDeficit === 700, "computeBudget: surplus correct");
    assert(result.percentSpent === 30, "computeBudget: percentSpent correct");

    const zero = calc.computeBudget([], 0);
    assert(zero.percentSpent === 0, "computeBudget: zero income = 0 percentSpent");
  }

  // Test: goalEta
  {
    const calc = requireFresh(
      path.join(__dirname, "..", "features", "savings", "savingsCalculations.ts"),
    );
    const reached = calc.goalEta({ target: 1000, current: 1000 }, 100);
    assert(reached.pctComplete === 100, "goalEta: reached → 100%");
    assert(reached.etaDate === "Reached", "goalEta: reached → 'Reached'");

    const noContrib = calc.goalEta({ target: 1000, current: 500 }, 0);
    assert(noContrib.monthsRemaining === -1, "goalEta: no contribution → -1 months");

    const active = calc.goalEta({ target: 1200, current: 0 }, 100);
    assert(active.monthsRemaining === 12, "goalEta: 1200 / 100 = 12 months");
  }

  // Test: deriveLevel
  {
    const calc = requireFresh(
      path.join(__dirname, "..", "features", "gamification", "gamificationCalculations.ts"),
    );
    const starter = calc.deriveLevel(0);
    assert(starter.level === 1, "deriveLevel: 0 XP = level 1");
    assert(starter.name === "Starter", "deriveLevel: 0 XP = Starter");

    const steady = calc.deriveLevel(940);
    assert(steady.level === 3, "deriveLevel: 940 XP = level 3");
    assert(steady.name === "Steady", "deriveLevel: 940 XP = Steady");

    const legend = calc.deriveLevel(3500);
    assert(legend.level === 6, "deriveLevel: 3500 XP = level 6");
    assert(legend.name === "Legend", "deriveLevel: max level");
    assert(legend.nextLevelName === null, "deriveLevel: max level nextLevelName = null");
    assert(legend.xpPct === 100, "deriveLevel: max level xpPct = 100");
  }

  // Test: gamification mock service schema validation
  resetEnv();
  process.env.NEXT_PUBLIC_APP_ENV = "local";
  process.env.NEXT_PUBLIC_USE_MOCK_DATA = "true";
  {
    const mock = requireFresh(
      path.join(__dirname, "..", "features", "gamification", "services", "gamificationMockService.ts"),
    );
    const schema = requireFresh(
      path.join(__dirname, "..", "features", "gamification", "services", "gamificationSchema.ts"),
    );
    const mockRes = mock.getGamificationData({ userId: "user-1" });
    schema.GamificationResponseSchema.parse(mockRes);
    assert(mockRes.level >= 1 && mockRes.level <= 6, "gamification mock: level in range 1-6");
    assert(mockRes.xpPct >= 0 && mockRes.xpPct <= 100, "gamification mock: xpPct in range 0-100");
  }
```

- [ ] **Step 2: Run the full test suite**

Run: `npx tsx tests/run-tests.ts`
Expected: `All tests passed (lightweight)`

If any test fails, fix the underlying calculation or test assertion before proceeding.

- [ ] **Step 3: Commit**

```bash
git add tests/run-tests.ts
git commit -m "test: add calculation and gamification unit tests to run-tests"
```

---

### Task 29: Final Build + TypeCheck Pass

**Files:** (none — verification only)

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit --skipLibCheck 2>&1 | head -60`
Expected: no errors. If errors appear, fix them before proceeding — do not `--skipLibCheck` to bypass real errors.

- [ ] **Step 2: Run full test suite one more time**

Run: `npx tsx tests/run-tests.ts`
Expected: `All tests passed (lightweight)`

- [ ] **Step 3: Production build**

Run: `npx next build 2>&1 | tail -30`
Expected: build completes without errors. Route output should show all dashboard routes as server-rendered (no static).

If the build fails due to missing `formatCurrency` on pages that didn't previously import it: add `import { formatCurrency } from "@/lib/format";` to those page files.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final build and typecheck pass — dashboard MVP complete"
```

---

## Acceptance Checklist

- [ ] `npx tsx tests/run-tests.ts` passes
- [ ] `npx tsc --noEmit --skipLibCheck` passes
- [ ] `npx next build` completes without error
- [ ] `/dashboard` shows real greeting (user's display name), real metrics, real debt/savings mini-rows with empty states
- [ ] `/dashboard/debt` shows real debts (empty state for new users), computed debt-free date, no DEMO_DEBTS
- [ ] `/dashboard/budget` shows real income from profile, real categories, empty state for no categories
- [ ] `/dashboard/savings` — "Add money" form works, "New goal" form creates a real goal
- [ ] `/dashboard/learn` shows catalog lessons, completed lessons reflect DB state, clicking a lesson calls `markLessonComplete`
- [ ] Sidebar shows real display name, real XP/level/streak from `financial_profiles`
- [ ] Settings profile save calls `updateProfileDisplayName` and updates DB
- [ ] No DEMO_* arrays remain in any dashboard page
- [ ] Mock data is blocked in production (existing `validate-env.ts` test)
- [ ] Preview+mock without flag logs a warning (not a failure)
