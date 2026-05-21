import { component$, Slot } from "@builder.io/qwik";

type AlertVariant = "info" | "warning" | "success" | "error";

interface AlertCardProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  class?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: string; title: string }> = {
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    title: "text-blue-400",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: "text-yellow-400",
    title: "text-yellow-400",
  },
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: "text-green-400",
    title: "text-green-400",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "text-red-400",
    title: "text-red-400",
  },
};

const variantIcons: Record<AlertVariant, string> = {
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
};

export const AlertCard = component$(({ variant = "info", title, description, class: className }: AlertCardProps) => {
  const styles = variantStyles[variant];
  const iconPath = variantIcons[variant];

  return (
    <div class={`flex items-center gap-3 p-3 rounded-lg ${styles.bg} border ${styles.border} ${className || ""}`}>
      <svg class={`w-5 h-5 ${styles.icon} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath} />
      </svg>
      <div class="flex-1">
        {title && <p class={`text-sm font-medium ${styles.title}`}>{title}</p>}
        {description && <p class="text-xs text-text-muted">{description}</p>}
        <Slot />
      </div>
    </div>
  );
});
