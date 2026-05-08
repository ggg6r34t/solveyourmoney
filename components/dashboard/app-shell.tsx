import Link from "next/link";
import type { Route } from "next";
import { signOutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { XPBar } from "./xp-bar";

export type AppNavKey =
  | "overview"
  | "debt"
  | "budget"
  | "savings"
  | "learn"
  | "import"
  | "onboarding"
  | "plan"
  | "guidance"
  | "settings"
  | "admin";

const navSections = [
  {
    label: "Core",
    items: [
      ["▣", "Overview", "/dashboard", "overview"],
      ["↓", "Debt", "/dashboard/debt", "debt"],
      ["◆", "Budget", "/dashboard/budget", "budget"],
      ["◎", "Savings", "/dashboard/savings", "savings"],
      ["✦", "Learn", "/dashboard/learn", "learn"],
      ["↑", "Import", "/dashboard/import", "import"],
    ],
  },
  {
    label: "Product",
    items: [
      ["✓", "Reality Check", "/onboarding", "onboarding"],
      ["▤", "Plan", "/plan", "plan"],
      ["↻", "Guidance", "/guidance", "guidance"],
      ["⚙", "Settings", "/settings", "settings"],
      ["◇", "Admin", "/admin", "admin"],
    ],
  },
] as const;

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: AppNavKey;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[230px] border-r border-border bg-sidebar px-3 py-5 lg:flex lg:flex-col">
        <Link href="/dashboard" className="px-2 text-lg font-black tracking-[-0.04em]">
          <span className="text-primary">solve</span>
          <span className="text-white">your</span>
          <span className="text-danger">money</span>
        </Link>
        <div className="mt-5 px-2">
          <XPBar level={7} xp={1240} max={1600} compact />
        </div>
        <div className="my-5 h-px bg-border" />
        <nav className="grid gap-5">
          {navSections.map((section) => (
            <div className="grid gap-1.5" key={section.label}>
              <p className="px-4 text-[0.65rem] font-black uppercase tracking-[0.12em] text-soft">
                {section.label}
              </p>
              {section.items.map(([icon, label, href, key]) => {
                const isActive = active === key;

                return (
                  <Link
                    href={href as Route}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
                      isActive
                        ? "bg-primary-soft text-primary"
                        : "text-muted hover:bg-panel-soft hover:text-foreground"
                    }`}
                    key={href}
                  >
                    <span className="w-4 text-center text-xs">{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
              J
            </div>
            <div>
              <p className="text-sm font-black text-white">Jordan</p>
              <p className="text-xs font-semibold text-muted">Level 7 · 1240 XP</p>
            </div>
          </div>
          <form action={signOutAction} className="mt-3 px-2">
            <Button className="h-9 w-full" variant="ghost">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 lg:pl-[230px]">
        <div className="mx-auto min-h-screen w-full max-w-[1280px] px-5 py-7 md:px-7">
          {children}
        </div>
      </main>
    </div>
  );
}
