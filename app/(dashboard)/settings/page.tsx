import { AppShell } from "@/components/dashboard/app-shell";
import { SettingsContent } from "./settings-content";
import { requireSession } from "@/server/dal/session";

export default async function SettingsPage() {
  const session = await requireSession();
  return (
    <AppShell active="settings">
      <div className="page-hd">
        <div>
          <h1>Settings</h1>
          <div className="sub">Manage your account.</div>
        </div>
      </div>
      <SettingsContent initialDisplayName={session.displayName ?? ""} />
    </AppShell>
  );
}
