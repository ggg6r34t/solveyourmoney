import Link from "next/link";
import { SignUpForm } from "@/components/forms/auth-forms";

export default function SignUpPage() {
  return (
    <div className="mt-2">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary/72">
        Create account
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
        Start with a calmer money picture.
      </h1>
      <p className="mt-3 leading-7 text-muted">
        No shame. No lecture. Just a free check-in that turns the mess into
        one useful next step.
      </p>
      <div className="mt-8">
        <SignUpForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-bold text-primary" href="/sign-in">
          Sign in
        </Link>
      </p>
    </div>
  );
}
