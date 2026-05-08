"use client";

import { useActionState } from "react";
import {
  signInAction,
  signUpAction,
  type AuthFormState,
} from "@/server/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: AuthFormState = {
  status: "idle",
  message: "",
};

export function SignInForm() {
  const [state, action] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <Field label="Email" name="email" type="email" />
      <Field label="Password" name="password" type="password" />
      <SubmitButton>Sign in</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <Field label="Name" name="displayName" />
      <Field label="Email" name="email" type="email" />
      <Field label="Password" name="password" type="password" />
      <SubmitButton>Create account</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      <span>{label}</span>
      <input
        required
        name={name}
        type={type}
        className="soft-focus-ring mt-2 h-13 w-full rounded-[1.35rem] border border-border bg-white/86 px-4 outline-none transition focus:border-primary"
      />
    </label>
  );
}

function FormMessage({ state }: { state: AuthFormState }) {
  if (!state.message) return null;

  return (
    <p className="rounded-[1.35rem] border border-danger/20 bg-danger-soft p-3 text-sm text-danger">
      {state.message}
    </p>
  );
}
