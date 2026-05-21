import { component$ } from "@builder.io/qwik";

type StatusVariant = "default" | "success" | "warning" | "error" | "info" | "pending";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  class?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  default: "bg-surface-light text-text-muted",
  success: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  error: "bg-red-500/20 text-red-400",
  info: "bg-blue-500/20 text-blue-400",
  pending: "bg-gray-500/20 text-gray-400",
};

export const StatusBadge = component$(({ status, variant = "default", class: className }: StatusBadgeProps) => {
  return (
    <span class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${variantStyles[variant]} ${className || ""}`}>
      {status}
    </span>
  );
});

interface TypeBadgeProps {
  type: string;
  colorMap?: Record<string, string>;
  class?: string;
}

export const TypeBadge = component$(({ type, colorMap, class: className }: TypeBadgeProps) => {
  const defaultColorMap: Record<string, string> = {
    qa: "bg-blue-500/20 text-blue-400",
    code: "bg-green-500/20 text-green-400",
    reasoning: "bg-purple-500/20 text-purple-400",
    safety: "bg-red-500/20 text-red-400",
    custom: "bg-yellow-500/20 text-yellow-400",
    benchmark: "bg-purple-500/20 text-purple-400",
    evaluation: "bg-blue-500/20 text-blue-400",
    comparison: "bg-green-500/20 text-green-400",
  };
  const colors = colorMap || defaultColorMap;
  const colorClass = colors[type] || "bg-surface-light text-text-muted";
  
  return (
    <span class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colorClass} ${className || ""}`}>
      {type}
    </span>
  );
});
