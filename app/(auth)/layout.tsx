export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell min-h-screen px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="hidden lg:block">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/72">
            SolveYourMoney
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-black leading-[0.94] tracking-[-0.06em] text-foreground">
            Calm financial clarity for the next real-life decision.
          </h1>
          <p className="mt-5 max-w-lg text-lg font-semibold leading-8 text-muted">
            Sign in to continue your money journey, compare scenarios, and keep
            your progress, streak, and learning momentum in one place.
          </p>
        </div>
        <div className="dashboard-card mx-auto w-full max-w-xl rounded-[2.5rem] p-8 sm:p-10">
          {children}
        </div>
      </div>
    </main>
  );
}
