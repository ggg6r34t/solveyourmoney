import { cn } from "@/lib/utils";

export function ComplianceNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-5 text-muted", className)}>
      SolveYourMoney provides educational insights and planning tools. It does
      not provide financial advice.
    </p>
  );
}
