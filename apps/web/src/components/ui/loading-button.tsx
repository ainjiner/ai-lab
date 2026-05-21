import { component$, Slot, QRL } from "@builder.io/qwik";
import { Spinner } from "./spinner";

interface LoadingButtonProps {
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  class?: string;
  onClick$?: QRL<() => void>;
}

export const LoadingButton = component$<LoadingButtonProps>(({
  loading = false,
  disabled = false,
  type = "button",
  variant = "default",
  size = "default",
  class: className = "",
  onClick$
}) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-surface-light bg-surface hover:bg-surface-light",
    secondary: "bg-surface-light text-text hover:bg-surface-light/80",
    ghost: "hover:bg-surface-light hover:text-text",
    link: "text-primary underline-offset-4 hover:underline"
  };

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick$={onClick$}
      class={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      <span class={loading ? "opacity-70" : ""}>
        <Slot />
      </span>
    </button>
  );
});
