export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-6 text-sm font-semibold text-muted">
      {message}
    </div>
  );
}
