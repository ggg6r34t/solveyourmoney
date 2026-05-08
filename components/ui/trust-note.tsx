import { cn } from "@/lib/utils";

export function TrustNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-primary/10 bg-surface-muted/80 p-4 text-sm leading-6 text-muted shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
