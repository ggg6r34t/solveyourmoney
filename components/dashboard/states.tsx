import { Card, Eyebrow } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="dashboard-spotlight p-6">
      <Eyebrow>Nothing missing forever</Eyebrow>
      <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        {description}
      </p>
    </Card>
  );
}

export function RecoverableErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-danger/25 bg-danger-soft p-6">
      <Eyebrow className="text-danger">Something needs a calmer retry</Eyebrow>
      <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        {description}
      </p>
    </Card>
  );
}

export function OnboardingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="dashboard-spotlight p-6">
      <Eyebrow>Onboarding required</Eyebrow>
      <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        {description}
      </p>
    </Card>
  );
}

export function IncompleteDataNotice({ items }: { items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <Card className="dashboard-tint p-5">
      <Eyebrow>Still useful, not fully filled in</Eyebrow>
      <div className="mt-3 space-y-2">
        {items.slice(0, 3).map((item) => (
          <p key={item} className="text-sm leading-6 text-muted">
            {item}
          </p>
        ))}
      </div>
    </Card>
  );
}
