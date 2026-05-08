import React from "react";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="py-12 text-center">
      <div className="spinner mb-4" aria-hidden />
      <p className="text-muted">{message}</p>
    </div>
  );
}

export function EmptyState({ message = "No data yet" }: { message?: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}

export function PartialState({
  message = "Partial data available",
}: {
  message?: string;
}) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong",
}: {
  message?: string;
}) {
  return (
    <div className="py-12 text-center text-red-600">
      <p className="font-medium">{message}</p>
    </div>
  );
}

const dataStates = { LoadingState, EmptyState, PartialState, ErrorState };

export default dataStates;
