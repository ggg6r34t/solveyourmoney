import { AppShell } from "@/components/dashboard/app-shell";
import { requireSession } from "@/server/dal/session";
import { SettingsContent } from "./settings-content";

export default async function SettingsPage() {
  const session = await requireSession();
  return (
    <AppShell active="settings">
      <SettingsContent email={session.email ?? undefined} />
    </AppShell>
  );
}
