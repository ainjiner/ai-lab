import { component$, Slot } from "@builder.io/qwik";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  class?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/20 text-primary",
  secondary: "bg-surface-light text-text-muted",
  destructive: "bg-error/20 text-error",
  outline: "border border-surface-light text-text",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
};

export const Badge = component$(({ variant = "default", class: className }: BadgeProps) => {
  return (
    <span class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${variantStyles[variant]} ${className || ""}`}>
      <Slot />
    </span>
  );
});
