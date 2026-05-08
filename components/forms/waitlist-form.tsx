"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/server/actions/waitlist";
import { SubmitButton } from "./submit-button";

const initialState: WaitlistState = {
  status: "idle",
  message: "",
};

export function WaitlistForm() {
  const [state, action] = useActionState(joinWaitlist, initialState);

  return (
    <form
      action={action}
      className="marketing-soft-panel rounded-[2rem] p-2 backdrop-blur"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          required
          type="email"
          name="email"
          placeholder="you@example.com"
          className="soft-focus-ring min-h-12 flex-1 rounded-full border border-transparent bg-transparent px-4 text-sm outline-none placeholder:text-muted focus:border-primary/30"
        />
        <input type="hidden" name="intent" value="early_access" />
        <SubmitButton>Get early access</SubmitButton>
      </div>
      {state.message ? (
        <p
          className={`px-4 pb-2 pt-3 text-sm ${
            state.status === "success" ? "text-success" : "text-danger"
          }`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
