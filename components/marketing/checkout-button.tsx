"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/server/actions/billing";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await createCheckoutSession();
    if (result.ok) {
      window.location.href = result.checkoutUrl;
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm font-semibold text-danger">{error}</p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Opening checkout…" : "Get started"}
      </button>
    </div>
  );
}
