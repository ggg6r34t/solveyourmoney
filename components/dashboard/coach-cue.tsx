"use client";

import { Button } from "@/components/ui/button";
import { useDashboardUIStore } from "@/features/dashboard/ui-store";

export function CoachCue({
  title,
  cue,
}: {
  title: string;
  cue: string;
}) {
  const dismissed = useDashboardUIStore((state) => state.dismissedCoachCue);
  const setDismissed = useDashboardUIStore((state) => state.setDismissedCoachCue);

  if (dismissed) {
    return (
      <Button
        variant="ghost"
        className="h-auto rounded-2xl px-0 text-sm font-bold text-white/76 hover:bg-transparent hover:text-white"
        onClick={() => setDismissed(false)}
      >
        Show this insight again
      </Button>
    );
  }

  return (
    <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/64">
            {title}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/86">{cue}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-auto rounded-full px-2 py-1 text-white/70 hover:text-white"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
