import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "dashboard-card rounded-2xl p-5",
        className,
      )}
      {...props}
    />
  );
}

export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-black uppercase tracking-[0.12em] text-muted",
        className,
      )}
      {...props}
    />
  );
}
