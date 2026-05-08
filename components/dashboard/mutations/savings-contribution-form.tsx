"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMoneyToSavingsGoal } from "@/server/actions/dashboard";
import { Button } from "@/components/ui/button";

export function SavingsContributionForm({ goalId }: { goalId: string }) {
  const [amount, setAmount] = useState("50");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const mutation = useMutation({
    mutationFn: addMoneyToSavingsGoal,
    onSuccess: () => {
      queryClient.invalidateQueries();
      startTransition(() => router.refresh());
    },
  });

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ goalId, amount: Number(amount) });
      }}
    >
      <label className="grid flex-1 gap-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-soft">Add money</span>
        <input
          className="soft-focus-ring h-11 rounded-[1rem] border border-border bg-white px-4 text-sm font-semibold text-foreground"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <Button className="sm:min-w-36" disabled={mutation.isPending || isPending}>
        Add money
      </Button>
      {mutation.data?.message ? (
        <p className="text-sm font-semibold text-muted sm:basis-full">{mutation.data.message}</p>
      ) : null}
    </form>
  );
}
