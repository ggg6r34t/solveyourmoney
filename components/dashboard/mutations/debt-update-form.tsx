"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDebtDetails } from "@/server/actions/dashboard";
import { Button } from "@/components/ui/button";

export function DebtUpdateForm({
  debt,
}: {
  debt: {
    id: string;
    balance: number;
    apr: number | null;
    monthlyPayment: number;
  };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [balance, setBalance] = useState(String(debt.balance));
  const [apr, setApr] = useState(debt.apr === null ? "" : String(debt.apr));
  const [payment, setPayment] = useState(String(debt.monthlyPayment));
  const mutation = useMutation({
    mutationFn: updateDebtDetails,
    onSuccess: () => {
      queryClient.invalidateQueries();
      startTransition(() => router.refresh());
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({
          id: debt.id,
          balance: Number(balance),
          apr: apr ? Number(apr) : null,
          monthlyPayment: Number(payment),
        });
      }}
    >
      <Field label="Balance" value={balance} setValue={setBalance} />
      <Field label="APR" value={apr} setValue={setApr} />
      <Field label="Monthly payment" value={payment} setValue={setPayment} />
      <div className="flex items-end">
        <Button className="w-full md:w-auto" disabled={mutation.isPending || isPending}>
          Save debt
        </Button>
      </div>
      {mutation.data?.message ? (
        <p className="text-sm font-semibold text-muted md:col-span-4">{mutation.data.message}</p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-soft">{label}</span>
      <input
        className="soft-focus-ring h-11 rounded-[1rem] border border-border bg-white px-4 text-sm font-semibold text-foreground"
        inputMode="decimal"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </label>
  );
}
