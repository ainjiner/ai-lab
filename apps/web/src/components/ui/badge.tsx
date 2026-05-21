import { component$, Slot } from "@builder.io/qwik";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  class?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary",
  secondary: "bg-surface-light text-text-muted",
  destructive: "bg-error/15 text-error",
  outline: "border border-surface-light text-text-muted",
  success: "bg-success/15 text-success",
  warning: "bg-amber-500/15 text-amber-400",
};

export const Badge = component$(({ variant = "default", class: className }: BadgeProps) => {
  return (
    <span class={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${variantStyles[variant]} ${className || ""}`}>
      <Slot />
    </span>
  );
});
