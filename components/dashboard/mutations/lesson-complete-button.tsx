"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markLessonComplete } from "@/server/actions/dashboard";
import { Button } from "@/components/ui/button";

export function LessonCompleteButton({
  slug,
  completed,
}: {
  slug: string;
  completed: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const mutation = useMutation({
    mutationFn: markLessonComplete,
    onSuccess: () => {
      queryClient.invalidateQueries();
      startTransition(() => router.refresh());
    },
  });

  return (
    <Button
      variant={completed ? "secondary" : "primary"}
      disabled={completed || mutation.isPending || isPending}
      onClick={() => mutation.mutate({ slug })}
    >
      {completed ? "Completed" : "Mark complete"}
    </Button>
  );
}
