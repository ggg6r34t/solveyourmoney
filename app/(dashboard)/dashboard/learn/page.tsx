import { AppShell } from "@/components/dashboard/app-shell";
import { LearnContent } from "@/components/dashboard/learn-content";
import { getLearnData } from "@/features/learn/services/learnService";
import { requireSession } from "@/server/dal/session";

export default async function LearnPage() {
  const session = await requireSession();
  await getLearnData({ userId: session.userId }); // prefetch for future real data integration

  return (
    <AppShell active="learn">
      <div className="page-hd">
        <div>
          <h1>Learn</h1>
          <div className="sub">Bite-sized lessons. Earn XP. Level up your financial literacy.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn ghost" type="button">Library</button>
          <button className="btn primary" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Continue lesson 4
          </button>
        </div>
      </div>

      <LearnContent />
    </AppShell>
  );
}
