import { AppShell } from "@/components/dashboard/app-shell";
import { ImportContent } from "./import-content";

export default function ImportPage() {
  return (
    <AppShell active="import">
      <ImportContent />
    </AppShell>
  );
}
