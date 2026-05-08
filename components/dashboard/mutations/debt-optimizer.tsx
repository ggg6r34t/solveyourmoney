"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { recalculateDebtStrategy } from "@/server/actions/dashboard";
import { useDashboardUIStore } from "@/features/dashboard/ui-store";
import { formatCurrency, formatMonthCount } from "@/lib/format";

export function DebtOptimizer({
  initialExtraPayment,
  initialInterestSaved,
  initialMonthsReduced,
}: {
  initialExtraPayment: number;
  initialInterestSaved: number;
  initialMonthsReduced: number;
}) {
  const extraPayment = useDashboardUIStore((state) => state.debtExtraPayment);
  const setExtraPayment = useDashboardUIStore((state) => state.setDebtExtraPayment);
  const mutation = useMutation({
    mutationFn: recalculateDebtStrategy,
  });

  useEffect(() => {
    setExtraPayment(initialExtraPayment);
  }, [initialExtraPayment, setExtraPayment]);

  const scenario = mutation.data?.ok ? mutation.data.data : null;
  const interestSaved = scenario?.interestSaved ?? initialInterestSaved;
  const monthsReduced = scenario?.monthsReduced ?? initialMonthsReduced;

  return (
    <div className="dashboard-card-soft rounded-[1.6rem] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-soft">
            If you choose this approach
          </span>
          <input
            className="soft-focus-ring h-12 rounded-[1rem] border border-border bg-white px-4 text-base font-bold text-foreground"
            inputMode="decimal"
            value={extraPayment}
            onChange={(event) => setExtraPayment(Number(event.target.value || "0"))}
            onBlur={() => mutation.mutate({ extraPayment })}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1rem] bg-accent/10 p-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-success">
              Cost difference
            </p>
            <p className="mt-2 text-lg font-black text-foreground">
              {formatCurrency(interestSaved)}
            </p>
          </div>
          <div className="rounded-[1rem] bg-primary/8 p-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
              Time difference
            </p>
            <p className="mt-2 text-lg font-black text-foreground">
              {formatMonthCount(monthsReduced || null)}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        Move the amount to explore how timeline and total cost could change.
        This is a simulation, not a recommendation.
      </p>
    </div>
  );
}
