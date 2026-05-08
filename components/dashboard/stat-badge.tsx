import type { Tone } from "@/features/dashboard/mockData";

export function StatBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className="status-pill" data-tone={tone}>
      {children}
    </span>
  );
}
