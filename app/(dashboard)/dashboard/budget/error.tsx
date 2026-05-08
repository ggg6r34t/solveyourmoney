"use client";

export default function BudgetError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-sm font-bold text-muted">
        Something went wrong loading your budget data.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
