# Dashboard MVP Functionality Completion — Design Spec

**Date:** 2026-05-13
**Approach:** C — Extend existing service layer minimally
**Status:** Approved

---

## Context

SolveYourMoney has a well-structured service layer already in place: `resolveDataSource`, `assertMockDataAllowed`, Zod-validated schemas, mock + live services for overview/debt/budget/savings/learn, and real server actions for all four dashboard mutations. The MVP pass does not rebuild this architecture — it extends it to close four specific gaps:

1. Schemas return raw DB values; pages hardcode derived figures (payoff date, interest, income).
2. Sidebar shows hardcoded user identity and gamification data.
3. Pages fall back to `DEMO_*` arrays instead of proper empty states.
4. ~20 visible buttons/interactions have no behavior.

---

## Scope Classification

### MVP Core (must be fully functional)
- `/dashboard` — overview
- `/dashboard/debt`
- `/dashboard/budget`
- `/dashboard/savings`
- `/dashboard/learn`
- Dashboard layout / sidebar
- XP / level / streak system (real data)
- Typed financial calculations
- Mock data safety (local dev only)
- Loading / empty / error / partial states
- Auth/session protection
- All visible interactions either work or are removed

### MVP Support (keep if already working, minor fixes only)
- `/dashboard/import` — keep; remove 4 dead buttons
- `/dashboard/notifications` — keep as display-only; remove Preferences button; make channel matrix static
- `/settings` — keep Profile tab only with real save; remove other 5 tabs

### Post-MVP (remove from UI surface)
- Bank connection / open-banking
- Clipboard paste import
- Notification preferences persistence
- Auto-save infrastructure
- Drag-to-reorder goals
- Debt strategy switching UI
- Lesson content pages (individual lesson viewer)
- Budget month history navigation (Apr/Mar tabs)
- "Find anything" search
- "Quick add" flow
- Filter buttons (debt strategy dropdown, budget filter)
- Goal "···" menu

---

## Section 1 — Data Layer: Calculation Utilities + Schema Extensions

### New calculation files (pure functions, no side effects, fully testable)

```
features/debt/services/debtCalculations.ts
features/budget/services/budgetCalculations.ts
features/savings/services/savingsCalculations.ts
features/gamification/services/gamificationCalculations.ts
```

### `debtCalculations.ts` exports
```ts
calculateTotalDebt(items: DebtItem[]): number
calculateTotalMinimum(items: DebtItem[]): number
calculateTotalInterestEstimate(items: DebtItem[]): number
calculateDebtFreeDate(items: DebtItem[], extraPayment?: number): string   // "Feb 2028"
calculateMonthsSaved(items: DebtItem[], extraPayment: number): number
calculateInterestSaved(items: DebtItem[], extraPayment: number): number
calculateNewPayoffDate(items: DebtItem[], extraPayment: number): string
```

Debt-free date uses avalanche method: highest-APR debt paid first, minimum on others, extra payment rolled forward. Returns ISO month string formatted as "Mon YYYY".

### `budgetCalculations.ts` exports
```ts
calculateBudgetSplit(categories: BudgetCategory[]): Split503020
calculateLeftover(income: number, spent: number): number
calculatePaceMetrics(spent: number, budgeted: number, dayOfMonth: number, daysInMonth: number): PaceMetrics
calculateCategoryVariance(category: BudgetCategory): VarianceResult
```

### `savingsCalculations.ts` exports
```ts
calculateTotalSaved(goals: SavingsGoal[]): number
calculateTotalTarget(goals: SavingsGoal[]): number
calculateTotalRemaining(goals: SavingsGoal[]): number
calculateTotalMonthlyAuto(goals: SavingsGoal[]): number
calculateGoalETA(goal: SavingsGoal): string          // "Sep 2026" or "—"
simulateBoost(goals: SavingsGoal[], extraMonthly: number): BoostResult[]
```

### `gamificationCalculations.ts` exports
```ts
calculateLevel(xp: number): number
calculateLevelName(level: number): string            // "Steady", "Architect", etc.
calculateXpMax(level: number): number
calculateXpPct(xp: number, xpMax: number): number
calculateStreakState(streakDays: number): StreakState
```

### Schema extensions

Each feature schema gains a `computed` field populated by the service before returning, so pages never compute anything themselves.

**DebtResponseSchema gains:**
```ts
computed: {
  totalDebt: number
  totalMinimum: number
  totalInterestEstimate: number
  debtFreeDate: string
}
```

**BudgetResponseSchema gains:**
```ts
computed: {
  income: number
  totalSpent: number
  totalBudgeted: number
  leftover: number
  split: Split503020
  dayOfMonth: number
  daysInMonth: number
}
```

**SavingsResponseSchema gains:**
```ts
computed: {
  totalSaved: number
  totalTarget: number
  totalRemaining: number
  totalMonthlyAuto: number
}
// Each goal gains: eta: string
```

### New gamification feature

```
features/gamification/services/
  gamificationSchema.ts
  gamificationMockService.ts
  gamificationLiveService.ts
  gamificationService.ts
  gamificationCalculations.ts
```

`getGamificationData({ userId })` → `{ xp, xpMax, level, levelName, nextLevelName, streak, xpPct, xpToNext }`

Live service reads `financial_profiles.level_xp` and `financial_profiles.streak_days`. Falls back to zeroed state for new users (not demo data).

### Live service changes
Each live service calls its calculation module and merges computed fields into the validated response before returning.

### Mock service changes
Mock services return pre-calculated realistic values matching the enriched schema shape. Each mock service calls `assertMockDataAllowed`.

---

## Section 2 — Sidebar + Greeting: Real Session and Gamification Data

### `app-shell.tsx` changes
`SidebarContents` is already async. Add one parallel call:

```ts
const session = await requireSession()
const gamification = await getGamificationData({ userId: session.userId })
```

Replace:
- Hardcoded `"Maya Aroon"` → `session.displayName ?? session.email ?? "—"`
- Hardcoded `"maya@protonmail.com"` → `session.email ?? ""`
- Hardcoded `xp = 940`, `xpMax = 1200`, `level = 4`, `streak = 12` → from gamification response

### Greeting on overview page
```ts
const hour = new Date().getHours()
const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
const firstName = session.displayName?.split(" ")[0] ?? "there"
// "Good evening, Alex"
```

### Sidebar nav — no changes to nav items
Import, Notifications, and Settings remain in their current nav positions.

---

## Section 3 — Page-Level Wiring: Real Data + Empty/Partial/Error States

### Rule
Remove all `DEMO_*` constants and fallback ternaries (`live.length > 0 ? live : DEMO_*`) from all pages. Pages receive enriched view models from services and branch on a `hasData` boolean derived from the response.

### Overview (`/dashboard`)
- Metrics: wire to enriched overview computed fields
- "Where you're at" debt/savings mini-cards: call `getDebtData` + `getSavingsData` in parallel
- AreaChart: replace with `<EmptyChartPlaceholder>` component showing "Your net worth history will appear here once you've tracked a few months" with onboarding CTA
- DonutChart: wire to real budget split from `getBudgetData`; if no budget data, show empty donut with onboarding message
- "Recent wins" section: query `activity_logs` for the 4 most recent entries via overview live service; if none, show "Your wins will appear here as you make progress"
- Add `loading.tsx` and `error.tsx` for `/dashboard` route (currently missing)

### Debt (`/dashboard/debt`)
- Remove `DEMO_DEBTS` and fallback
- Metrics: all from `computed` fields on the debt response
- `DebtSimulator` receives real debt items; simulator results computed by `debtCalculations` pure functions via the `recalculateDebtStrategy` server action (already exists)
- Empty state: centered card — "No debts added yet. Add your first to start your payoff plan." with "Add a debt" button

### Budget (`/dashboard/budget`)
- Remove `DEMO_CATEGORIES` and `DEMO_SPLIT` and fallback
- Income, spent, budgeted, leftover: from `computed` fields
- Pace arc: `dayOfMonth` / `daysInMonth` from `computed`, never hardcoded
- Empty state: "No budget categories yet. Add your first category to start tracking." with "Add a category" button
- Partial state (has income but no categories): show income metric + empty categories table

### Savings (`/dashboard/savings`)
- Remove `DEMO_GOALS` and fallback
- All metrics from `computed` fields; each goal's `eta` from computed field on the goal
- Projection chart: replace with per-goal progress bars (no time-series data in MVP DB schema); remove hardcoded real/proj series arrays
- "If you saved a little more" panel: driven by `simulateBoost(goals, 50)` calculation
- Empty state: "No savings goals yet. Create your first goal to start building." with "New goal" button

### Learn (`/dashboard/learn`)
- `getLearnData` result used to hydrate lesson state: `learnLiveService` queries `learning_progress` for the user, returns completed slugs
- Static `LESSONS` catalog stays (content is static for MVP) but each lesson's `state` field overridden: if slug in completedSlugs → "done", else first incomplete → "active", rest → "next" or "lock" based on level gate
- Static `BADGES` catalog stays but earned/locked state derived from real XP and streak thresholds
- `LearnContent` receives `initialData: { completedSlugs: string[], xp: number, streak: number }` as prop from the server page; client component uses this instead of hardcoded values
- Empty state (no completions yet): lesson 01 shown as "active", rest as "next"/"lock" — no empty state needed since catalog is static

### UI state requirements — all MVP routes
| State | Requirement |
|---|---|
| Loading | `loading.tsx` present for all 5 routes (add overview) |
| Error | `error.tsx` present for all 5 routes (add overview) |
| Empty | Each route renders focused empty state, not demo data |
| Partial | Each section independent; partial data shows what exists |
| Auth | `requireSession()` redirects; server-side only |

---

## Section 4 — Dead Button Resolution

### Overview page
| Interaction | Resolution |
|---|---|
| Day/Week/Month/Year segment | Remove; show current period as static text label |
| "Find anything" button | Remove |
| "Quick add" button | Remove |

### Debt page
| Interaction | Resolution |
|---|---|
| "Strategy: Avalanche ⌄" dropdown button | Remove dropdown affordance; render "Strategy: Avalanche" as static pill |
| "Add a debt" button | Wire → opens `DebtUpdateForm` modal in create mode |
| DebtCard "Pay" button | Wire → opens `DebtUpdateForm` modal in update mode for that debt |
| Simulator "Set as my plan" button | Wire → calls `recalculateDebtStrategy`; shows inline success/error message |

### Budget page
| Interaction | Resolution |
|---|---|
| Month segment (May/Apr/Mar) | Remove Apr/Mar buttons; show current month as static label |
| "Adjust plan" button | Wire → opens `BudgetCategoryForm` modal |
| "Add category" button | Wire → opens `BudgetCategoryForm` in create mode |
| "Filter" button | Remove |

### Savings page
| Interaction | Resolution |
|---|---|
| "Adjust auto-save" button | Remove |
| "New goal" button | Wire → opens new `SavingsGoalForm` modal (name + target); new `createSavingsGoal` server action |
| Goal "Add money" button | Wire → opens `SavingsContributionForm` (component exists) |
| Goal "···" button | Remove |
| "Bump auto-save to $370/mo" button | Remove |
| "Drag to reorder priority" label | Remove |

### Learn page
| Interaction | Resolution |
|---|---|
| "Library" button | Remove |
| "Continue lesson 4" button | Scrolls to / highlights active lesson in the list |
| Lesson filter tabs | Already work ✓ |
| Active lesson row | `LessonCompleteButton` component wired to `markLessonComplete` server action ✓ |
| Locked lesson row | Disabled pointer-events, tooltip "Unlocks at Level N" |

### Import page
| Interaction | Resolution |
|---|---|
| File upload → parse → review → import | Already works ✓ |
| "Connect a bank instead" button | Remove |
| "Paste from clipboard" button | Remove |
| "Browse history" button | Convert to anchor scrolling to Recent Imports table |
| History row "Review"/"Open" buttons | Render as disabled; tooltip "Coming soon" |
| "Export log" button | Remove |

### Notifications page
| Interaction | Resolution |
|---|---|
| Filter tabs / Mark all read / Row toggle | Already work (client state) ✓ |
| "Preferences" button | Remove |
| Channel matrix checkboxes | Remove interactive state; render as static visual |
| Digest cadence selector | Keep as client-state only; add "Display only · coming soon" caption |

### Settings page
| Interaction | Resolution |
|---|---|
| Profile tab — display name + email | Show real session data ✓ |
| Profile tab — "Save changes" | New server action: `updateProfileDisplayName`; writes to `profiles.display_name`; revalidates session |
| Preferences / Accounts / Security / Plan / Danger tabs | Remove all 5 tabs; replace with single "More settings coming soon" message |

---

## Section 5 — Mock Safety, Observability, Testing

### Mock data safety
- All `DEMO_*` in-page fallbacks removed (Section 3) — closes the bypass gap
- `validate-env.ts` extended: logs a warning (non-blocking) when preview uses mock without `ALLOW_PREVIEW_MOCK_DATA=true`
- No changes to `assertMockDataAllowed` or `resolveDataSource` — already correct

### Observability — add to `observability/events.ts`
```ts
debt_dashboard_viewed
budget_dashboard_viewed
savings_dashboard_viewed
learn_dashboard_viewed
dashboard_empty_state_seen
dashboard_partial_data_seen
debt_simulation_changed
savings_goal_viewed
learning_item_completed
xp_earned
mock_data_enabled_local
live_data_unavailable
```

Each dashboard page fires its view event server-side via existing `captureServerEvent`. Empty/partial events fired client-side via `PageViewTracker` component (already exists).

### Testing — extend `tests/`
```
tests/calculations/debtCalculations.test.ts
tests/calculations/budgetCalculations.test.ts
tests/calculations/savingsCalculations.test.ts
tests/calculations/gamificationCalculations.test.ts
tests/env/mockGuards.test.ts
tests/services/contractParity.test.ts
```

Test coverage targets:
- Debt: total, minimum, interest estimate, payoff date, extra-payment simulation
- Budget: 50/30/20 split, leftover, pace metrics, category variance
- Savings: totals, ETA calculation, boost simulation
- Gamification: level calculation, XP percentage, streak state
- Mock guards: local allows, preview blocks by default, preview allows with flag, production always blocks
- Contract parity: mock and live service return objects matching the same Zod schema shape

---

## Files Changed

### New files
```
features/debt/services/debtCalculations.ts
features/budget/services/budgetCalculations.ts
features/savings/services/savingsCalculations.ts
features/gamification/services/gamificationSchema.ts
features/gamification/services/gamificationMockService.ts
features/gamification/services/gamificationLiveService.ts
features/gamification/services/gamificationService.ts
features/gamification/services/gamificationCalculations.ts
components/dashboard/mutations/savings-goal-form.tsx
app/(dashboard)/dashboard/loading.tsx
app/(dashboard)/dashboard/error.tsx
tests/calculations/debtCalculations.test.ts
tests/calculations/budgetCalculations.test.ts
tests/calculations/savingsCalculations.test.ts
tests/calculations/gamificationCalculations.test.ts
tests/env/mockGuards.test.ts
tests/services/contractParity.test.ts
```

### Modified files
```
features/debt/services/debtSchema.ts          (add computed fields)
features/debt/services/debtLiveService.ts     (call calculations, populate computed)
features/debt/services/debtMockService.ts     (match enriched schema)
features/budget/services/budgetSchema.ts
features/budget/services/budgetLiveService.ts
features/budget/services/budgetMockService.ts
features/savings/services/savingsSchema.ts
features/savings/services/savingsLiveService.ts
features/savings/services/savingsMockService.ts
features/learn/services/learnSchema.ts
features/learn/services/learnLiveService.ts
features/learn/services/learnMockService.ts
features/overview/services/overviewLiveService.ts  (add activity_logs query)
components/dashboard/app-shell.tsx            (real session + gamification)
components/dashboard/learn-content.tsx        (accept initialData prop)
components/dashboard/debt-simulator.tsx       (wire Set-as-plan button)
server/actions/dashboard.ts                   (add createSavingsGoal, updateProfileDisplayName)
observability/events.ts                       (add ~12 events)
scripts/validate-env.ts                       (add preview-mock warning)
app/(dashboard)/dashboard/page.tsx            (real data, empty states, remove dead buttons)
app/(dashboard)/dashboard/debt/page.tsx       (real computed data, wire buttons)
app/(dashboard)/dashboard/budget/page.tsx     (real computed data, wire buttons)
app/(dashboard)/dashboard/savings/page.tsx    (real computed data, wire buttons)
app/(dashboard)/dashboard/learn/page.tsx      (pass initialData to LearnContent)
app/(dashboard)/dashboard/import/import-content.tsx  (remove 4 dead buttons)
app/(dashboard)/dashboard/notifications/notifications-content.tsx  (remove Preferences, static channel matrix)
app/(dashboard)/settings/settings-content.tsx  (Profile tab only, real save)
```

---

## Production Safety Guarantees

- No `DEMO_*` arrays in any page component after implementation
- No mock service imported directly by any page
- `assertMockDataAllowed` called by every mock service before returning data
- `validate-env.ts` blocks build if `NEXT_PUBLIC_APP_ENV=production` and `NEXT_PUBLIC_USE_MOCK_DATA=true`
- Live service failures return typed empty/partial responses — no silent fallback to mock
- All user data queries scoped to `eq("user_id", session.userId)` (server-side userId only)
- No static caching of user financial data (dynamic rendering, `requireSession` makes routes dynamic)

---

## Acceptance Criteria

- [ ] All 5 MVP dashboard routes fully functional with real data or proper empty state
- [ ] Sidebar shows real user name, email, XP, level, streak
- [ ] All `DEMO_*` constants removed from page files
- [ ] Every listed dead button resolved (removed or wired)
- [ ] All calculations implemented as pure functions in `*Calculations.ts` files
- [ ] Mock data blocked at runtime in production; build fails if misconfigured
- [ ] Loading + error states exist for all 5 routes
- [ ] Tests pass for all calculation utilities and mock guard rules
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass
- [ ] No console errors or hydration errors

---

## Out of Scope

Time-series charts with real data, bank connection/open-banking, clipboard paste, notification preferences persistence, auto-save infrastructure, drag-to-reorder goals, debt strategy switching, individual lesson content pages, budget month history navigation, search, quick-add flow.
