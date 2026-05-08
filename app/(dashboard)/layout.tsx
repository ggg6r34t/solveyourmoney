import { requireSession } from "@/server/dal/session";

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  return children;
}
