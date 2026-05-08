import { Card } from "@/components/ui/card";
import { LessonCompleteButton } from "./mutations/lesson-complete-button";

export function LessonCard({
  lesson,
}: {
  lesson: {
    slug: string;
    title: string;
    category: string;
    readingMinutes: number;
    xpReward: number;
    completed: boolean;
    behaviorLink: string;
  };
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="status-pill" data-tone="primary">
              {lesson.category}
            </span>
            <span
              className="status-pill"
              data-tone={lesson.completed ? "success" : "xp"}
            >
              {lesson.completed ? "Completed" : `${lesson.xpReward} XP`}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-black tracking-[-0.03em] text-foreground">
            {lesson.title}
          </h3>
        </div>
        <div className="rounded-[1.2rem] bg-primary/7 px-3 py-2 text-right text-sm font-semibold text-muted">
          {lesson.readingMinutes} min read
        </div>
      </div>

      <div className="dashboard-card-soft mt-5 rounded-[1.45rem] p-4">
        <p className="text-sm font-black text-foreground">Why it connects</p>
        <p className="mt-2 text-sm leading-6 text-muted">{lesson.behaviorLink}</p>
      </div>

      <div className="mt-5">
        <LessonCompleteButton slug={lesson.slug} completed={lesson.completed} />
      </div>
    </Card>
  );
}
