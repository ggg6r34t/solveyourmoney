import Link from "next/link";
import { SignUpForm } from "@/components/forms/auth-forms";

export default function SignUpPage() {
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
          Create account
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 560, color: "var(--fg)", margin: "6px 0 4px" }}>
          Start with a calmer money picture.
        </h2>
        <p style={{ fontSize: 13, color: "var(--fg-soft)", marginBottom: 20 }}>
          No shame. No lecture. Just a free check-in that turns the mess into one useful next step.
        </p>
        <SignUpForm />
      </div>
      <p
        className="f-xs"
        style={{ color: "var(--fg-soft)", textAlign: "center", marginTop: 16 }}
      >
        Already have an account?{" "}
        <Link href="/sign-in" style={{ color: "var(--primary-glow)", fontWeight: 520 }}>
          Sign in
        </Link>
      </p>
    </>
  );
}
