export function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="soft-skeleton h-56 rounded-[2.3rem]" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="soft-skeleton h-48 rounded-[2rem]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="soft-skeleton h-96 rounded-[2rem]" />
        <div className="space-y-6">
          <div className="soft-skeleton h-44 rounded-[2rem]" />
          <div className="soft-skeleton h-44 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
