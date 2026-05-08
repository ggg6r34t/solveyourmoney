"use client";

import { useActionState } from "react";
import {
  submitMoneyRealityCheck,
  type OnboardingState,
} from "@/server/actions/onboarding";
import { SubmitButton } from "./submit-button";

const initialState: OnboardingState = {
  status: "idle",
  message: "",
};

const groups = [
  {
    title: "What comes in?",
    helper: "Use your usual monthly take-home income. A close estimate is fine.",
    fields: [["Monthly income", "monthlyIncome"]],
  },
  {
    title: "What has to go out?",
    helper: "Separate fixed bills from flexible spending so the plan can find real choices.",
    fields: [
      ["Fixed monthly expenses", "monthlyFixedExpenses"],
      ["Flexible monthly expenses", "monthlyFlexibleExpenses"],
    ],
  },
  {
    title: "What is pressing?",
    helper: "Debt pressure is about minimum payments first, not judgment.",
    fields: [
      ["Total debt", "totalDebt"],
      ["Minimum debt payments", "minimumDebtPayments"],
    ],
  },
  {
    title: "What are you building toward?",
    helper: "A small honest goal beats a perfect goal you never revisit.",
    fields: [
      ["Savings balance", "savingsBalance"],
      ["Goal monthly target", "goalMonthlyTarget"],
    ],
  },
] as const;

export function OnboardingForm() {
  const [state, action] = useActionState(submitMoneyRealityCheck, initialState);

  return (
    <form action={action} className="grid gap-4">
      <div className="rounded-2xl border border-border bg-panel-soft p-4 text-sm font-bold text-muted">
        This is a reality check, not a test. Estimates are allowed.
      </div>
      <label className="block text-sm font-extrabold text-white">
        What do you want money to make easier?
        <input
          required
          name="goalName"
          placeholder="Move out, clear credit card debt, build a buffer..."
          className="soft-focus-ring mt-2 h-12 w-full rounded-xl border border-border bg-panel px-4 text-white outline-none transition placeholder:text-soft focus:border-primary"
        />
      </label>
      {groups.map((group) => (
        <section
          className="rounded-2xl border border-border bg-panel p-5"
          key={group.title}
        >
          <div className="mb-4">
            <h2 className="text-base font-black text-white">
              {group.title}
            </h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-muted">{group.helper}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {group.fields.map(([label, name]) => (
              <label className="block text-sm font-extrabold text-white" key={name}>
                {label}
                <input
                  required
                  min="0"
                  step="0.01"
                  name={name}
                  type="number"
                  inputMode="decimal"
                  className="soft-focus-ring mt-2 h-11 w-full rounded-xl border border-border bg-panel-soft px-4 text-white outline-none transition focus:border-primary"
                />
              </label>
            ))}
          </div>
        </section>
      ))}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-lg text-sm font-semibold leading-6 text-muted">
          We will show the assumptions behind the snapshot before asking you to
          trust any insight or scenario.
        </p>
        <SubmitButton>Show my scenarios</SubmitButton>
      </div>
      {state.message ? (
        <p className="rounded-[1.35rem] border border-danger/20 bg-danger-soft p-3 text-sm text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
