import { cn } from "@/lib/utils";

export function RightPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("rounded-2xl border border-border bg-panel p-5", className)}>
      <h2 className="text-sm font-black uppercase tracking-[0.08em] text-muted">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </aside>
  );
}
