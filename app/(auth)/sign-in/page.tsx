import Link from "next/link";
import { SignInForm } from "@/components/forms/auth-forms";

export default function SignInPage() {
  return (
    <div className="mt-2">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary/72">
        Sign in
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
        Welcome back.
      </h1>
      <p className="mt-3 leading-7 text-muted">
        Pick up where you left off and turn today&apos;s money question into a clearer next step.
      </p>
      <div className="mt-8">
        <SignInForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        Need an account?{" "}
        <Link className="font-bold text-primary" href="/sign-up">
          Create one
        </Link>
      </p>
    </div>
  );
}
