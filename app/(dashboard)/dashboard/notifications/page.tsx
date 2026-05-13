import { AppShell } from "@/components/dashboard/app-shell";
import { requireSession } from "@/server/dal/session";
import { NotificationsContent } from "./notifications-content";

export default async function NotificationsPage() {
  await requireSession();
  return (
    <AppShell active="notifications">
      <NotificationsContent />
    </AppShell>
  );
}
