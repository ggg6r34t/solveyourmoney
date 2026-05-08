"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant={variant}>
      {pending ? "Working..." : children}
    </Button>
  );
}
