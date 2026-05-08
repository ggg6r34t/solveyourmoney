import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary:
    "bg-primary text-white shadow-[var(--shadow-glow)] hover:bg-primary-strong",
  secondary:
    "border border-border bg-panel-soft text-foreground hover:border-primary/60 hover:bg-primary-soft",
  ghost: "text-muted hover:bg-primary-soft hover:text-foreground",
  danger: "bg-danger text-white hover:bg-danger/90",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "soft-focus-ring inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-extrabold transition disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonProps["variant"];
  className?: string;
};

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "soft-focus-ring inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-extrabold transition",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
