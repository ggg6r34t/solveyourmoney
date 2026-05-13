import { AppShell } from "@/components/dashboard/app-shell";
import { LearnContent } from "@/components/dashboard/learn-content";
import { getLearnData } from "@/features/learn/services/learnService";
import { requireSession } from "@/server/dal/session";

export default async function LearnPage() {
  const session = await requireSession();
  const learnData = await getLearnData({ userId: session.userId });

  return (
    <AppShell active="learn">
      <div className="page-hd">
        <div>
          <h1>Learn</h1>
          <div className="sub">
            Bite-sized lessons. Earn XP. Level up your financial literacy.
            {learnData.completedCount > 0 && ` · ${learnData.completedCount} completed`}
          </div>
        </div>
      </div>

      <LearnContent initialLessons={learnData.lessons} />
    </AppShell>
  );
}
