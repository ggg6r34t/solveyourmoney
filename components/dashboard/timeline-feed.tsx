import { formatRelativeDate } from "@/lib/format";

export function TimelineFeed({
  items,
}: {
  items: Array<{
    id: string;
    kind: string;
    title: string;
    description: string;
    occurredAt: string;
  }>;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="relative flex w-6 justify-center">
            {index < items.length - 1 ? (
              <div className="absolute top-4 h-[calc(100%+1rem)] w-px bg-primary/14" />
            ) : null}
            <div className="relative mt-2 h-3.5 w-3.5 rounded-full bg-chart-2 shadow-[0_0_0_6px_rgb(73_186_121_/_10%)]" />
          </div>
          <div className="dashboard-card-soft flex-1 rounded-[1.35rem] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-foreground">{item.title}</p>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-soft">
                {formatRelativeDate(item.occurredAt)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
