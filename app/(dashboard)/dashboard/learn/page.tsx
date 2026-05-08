import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { getLearnData } from "@/features/learn/services/learnService";
import { requireSession } from "@/server/dal/session";

export default async function LearnPage() {
  const session = await requireSession();
  const { lessons } = await getLearnData({ userId: session.userId });
  const completedCount = lessons.filter((l) => l.completed).length;

  if (lessons.length === 0) {
    return (
      <PageShell active="learn" title="Learn & Earn XP" subtitle="Read tips and answer quizzes to level up your money skills.">
        <EmptyState message="No lessons available yet." />
      </PageShell>
    );
  }

  return (
    <PageShell active="learn" title="Learn & Earn XP" subtitle={`${completedCount} of ${lessons.length} lesson${lessons.length === 1 ? "" : "s"} completed`}>
      <div className="grid gap-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center gap-4 rounded-2xl border border-border bg-panel p-5">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${lesson.completed ? "bg-success" : "bg-track"}`}>
              {lesson.completed && (
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className={`text-base font-black ${lesson.completed ? "text-muted line-through" : "text-foreground"}`}>
              {lesson.title}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
