import { EmptyState } from "@/components/dashboard/empty-state";
import { LearnItem } from "@/components/dashboard/learn-item";
import { PageShell } from "@/components/dashboard/page-shell";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RightPanel } from "@/components/dashboard/right-panel";
import { XPBar } from "@/components/dashboard/xp-bar";
import { getDevelopmentDashboardData } from "@/features/dashboard/mockData";
import { requireSession } from "@/server/dal/session";

const filters = ["All", "Debt", "Savings", "Budget", "Credit", "BNPL"];

export default async function LearnPage() {
  await requireSession();
  const data = getDevelopmentDashboardData();

  if (!data) {
    return (
      <PageShell active="learn" title="Learn & Earn XP" subtitle="Production learning content is not configured yet.">
        <EmptyState message="No learning content is available." />
      </PageShell>
    );
  }

  return (
    <PageShell active="learn" title="Learn & Earn XP" subtitle="Read tips and answer quizzes to level up your money skills">
      <div className="rounded-2xl border border-border bg-panel p-5">
        <XPBar level={7} xp={1240} max={1600} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {filters.map((filter, index) => (
          <span
            className={`rounded-full border border-border px-5 py-3 text-sm font-black ${
              index === 0 ? "bg-primary text-white" : "bg-panel text-muted"
            }`}
            key={filter}
          >
            {filter}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_260px]">
        <section className="grid gap-3">
          {data.learnItems.map((item) => (
            <LearnItem item={item} key={item.title} />
          ))}
        </section>
        <div className="grid content-start gap-5">
          <RightPanel title="Your Progress">
            <div className="grid gap-4">
              {filters.slice(1).map((filter, index) => (
                <div key={filter}>
                  <div className="mb-1 flex justify-between text-xs font-bold text-muted">
                    <span>{filter}</span>
                    <span>{[78, 64, 58, 42, 24][index]}%</span>
                  </div>
                  <ProgressBar value={[78, 64, 58, 42, 24][index]} tone="primary" />
                </div>
              ))}
            </div>
          </RightPanel>
          <RightPanel title="Badges">
            <div className="grid gap-3">
              <div className="rounded-xl border border-primary bg-primary-soft p-4 text-sm font-black text-primary">
                🏆 First Plan
              </div>
              <div className="rounded-xl border border-primary bg-primary-soft p-4 text-sm font-black text-primary">
                📚 First Read
              </div>
            </div>
          </RightPanel>
        </div>
      </div>
    </PageShell>
  );
}
