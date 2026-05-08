"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpenseBudget } from "@/server/actions/dashboard";
import { Button } from "@/components/ui/button";

export function BudgetCategoryForm({
  category,
}: {
  category: {
    id: string;
    planned: number;
    actual: number;
  };
}) {
  const [planned, setPlanned] = useState(String(category.planned));
  const [actual, setActual] = useState(String(category.actual));
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const mutation = useMutation({
    mutationFn: updateExpenseBudget,
    onSuccess: () => {
      queryClient.invalidateQueries();
      startTransition(() => router.refresh());
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({
          id: category.id,
          planned: Number(planned),
          actual: Number(actual),
        });
      }}
    >
      <Field label="Planned" value={planned} setValue={setPlanned} />
      <Field label="Actual" value={actual} setValue={setActual} />
      <div className="flex items-end">
        <Button
          className="w-full md:w-auto"
          variant="secondary"
          disabled={mutation.isPending || isPending}
        >
          Update
        </Button>
      </div>
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
