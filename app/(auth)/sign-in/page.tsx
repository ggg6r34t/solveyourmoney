import Link from "next/link";
import { SignInForm } from "@/components/forms/auth-forms";

export default function SignInPage() {
  return (
    <>
      <div className="card" style={{ padding: 28 }}>
        <p
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono), monospace",
            color: "var(--fg-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          Sign in
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 560, color: "var(--fg)", margin: "6px 0 4px" }}>
          Welcome back.
        </h2>
        <p style={{ fontSize: 13, color: "var(--fg-soft)", marginBottom: 20 }}>
          Pick up where you left off and turn today&apos;s money question into a clearer next step.
        </p>
        <SignInForm />
      </div>
      <p
        className="f-xs"
        style={{ color: "var(--fg-soft)", textAlign: "center", marginTop: 16 }}
      >
        Need an account?{" "}
        <Link href="/sign-up" style={{ color: "var(--primary-glow)", fontWeight: 520 }}>
          Create one
        </Link>
      </p>
    </>
  );
}
