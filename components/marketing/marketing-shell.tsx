import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="premium-grid min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="rounded-full bg-primary px-4 py-2 text-lg font-black tracking-tight text-white shadow-[var(--shadow-glow)]"
        >
          SolveYourMoney
        </Link>
        <nav className="marketing-soft-panel hidden items-center gap-6 rounded-full px-5 py-3 text-sm font-black text-muted md:flex">
          <Link className="transition hover:text-primary" href="/how-it-works">
            Method
          </Link>
          <Link className="transition hover:text-primary" href="/pricing">
            Pricing
          </Link>
          <Link className="transition hover:text-primary" href="/about">
            Trust
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/sign-in" variant="ghost">
            Sign in
          </ButtonLink>
          <ButtonLink href="/sign-up" className="hidden sm:inline-flex">
            Start free
          </ButtonLink>
        </div>
      </header>
      {children}
      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm font-semibold text-muted md:flex-row md:items-center md:justify-between">
        <p>Financial clarity without the money shame.</p>
        <div className="flex gap-5">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
