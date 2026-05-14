"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  signInAction,
  signUpAction,
  type AuthFormState,
} from "@/server/actions/auth";

const initialState: AuthFormState = { status: "idle", message: "" };

export function SignInForm() {
  const [state, action] = useActionState(signInAction, initialState);
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Email" name="email" type="email" />
      <div>
        <Field label="Password" name="password" type="password" />
        <div style={{ textAlign: "right", marginTop: 6 }}>
          <Link
            href="/forgot-password"
            style={{ fontSize: 12, color: "var(--primary-glow)", textDecoration: "none" }}
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initialState);
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Name" name="displayName" />
      <Field label="Email" name="email" type="email" />
      <Field label="Password" name="password" type="password" />
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
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
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="f-xs muted">{label}</span>
      <input
        required
        name={name}
        type={type}
        style={{
          height: 36,
          background: "oklch(1 0 0 / 0.04)",
          border: 0,
          color: "var(--fg)",
          font: "inherit",
          padding: "0 12px",
          borderRadius: 8,
          boxShadow: "0 0 0 1px var(--line)",
          outline: "none",
          fontSize: 13,
          width: "100%",
        }}
      />
    </label>
  );
}

function SubmitButton({
  children,
  pendingText,
}: {
  children: React.ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn primary"
      type="submit"
      disabled={pending}
      style={{ width: "100%", marginTop: 4 }}
    >
      {pending ? pendingText : children}
    </button>
  );
}

function FormMessage({ state }: { state: AuthFormState }) {
  if (!state.message) return null;
  return (
    <div
      style={{
        background: "var(--danger-soft)",
        color: "var(--danger)",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 13,
      }}
    >
      {state.message}
    </div>
  );
}
