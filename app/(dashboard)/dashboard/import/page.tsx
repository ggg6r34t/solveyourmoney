import { PageShell } from "@/components/dashboard/page-shell";
import { ImportForm } from "./import-form";

export default function ImportPage() {
  return (
    <PageShell
      active="import"
      title="Import Bank Statement"
      subtitle="Upload a PDF exported from your bank to populate your debt, budget, or savings."
    >
      <ImportForm />
    </PageShell>
  );
}
