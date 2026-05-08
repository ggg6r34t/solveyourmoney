"use client";

import { Button } from "@/components/ui/button";
import { RecoverableErrorState } from "@/components/dashboard/states";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4 sm:p-6">
      <RecoverableErrorState
        title="The dashboard could not load cleanly"
        description="Your financial data stays protected. This is a rendering problem, not a leak. Try reloading the dashboard state."
      />
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
