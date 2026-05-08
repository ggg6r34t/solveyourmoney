import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RightPanel } from "@/components/dashboard/right-panel";
import { XPBar } from "@/components/dashboard/xp-bar";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { requireSession } from "@/server/dal/session";

export default async function OnboardingPage() {
  await requireSession();

  const metrics = [
    { label: "Steps", value: "5", helper: "Reality check inputs", tone: "primary" as const },
    { label: "Est. Time", value: "4m", helper: "No bank connection", tone: "success" as const },
    { label: "XP Reward", value: "+80", helper: "Complete check-in", tone: "warning" as const },
    { label: "Data Mode", value: "Manual", helper: "You control inputs", tone: "info" as const },
  ];

  return (
    <DashboardShell
      active="onboarding"
      title="Money Reality Check"
      description="Enter what is true today. Estimates count."
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="rounded-2xl border border-border bg-panel p-6">
          <h2 className="mb-5 text-lg font-black text-white">Check-in Inputs</h2>
          <OnboardingForm />
        </section>
        <div className="grid content-start gap-5">
          <RightPanel title="Completion Reward">
            <XPBar level={7} xp={1240} max={1600} />
            <div className="mt-4 rounded-xl bg-primary-soft p-3 text-sm font-black text-primary">
              +80 XP after saving your snapshot
            </div>
          </RightPanel>
          <RightPanel title="Trust Rules">
            <div className="grid gap-3 text-sm font-semibold text-muted">
              <p>No bank sync in development.</p>
              <p>Assumptions are shown before insight.</p>
              <p>Production will not use mock data.</p>
            </div>
          </RightPanel>
        </div>
      </div>
    </DashboardShell>
  );
}
