import { component$, $, QRL, Slot } from "@builder.io/qwik";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: string;
  onAction?: QRL<() => void>;
  class?: string;
}

export const EmptyState = component$(({ icon, title, description, action, onAction, class: className }: EmptyStateProps) => {
  const handleClick = $(() => {
    if (onAction) {
      onAction();
    }
  });

  return (
    <div class={`flex flex-col items-center justify-center py-16 text-center bg-surface/20 rounded-xl border-dashed border-surface-light ${className || ""}`}>
      {icon && (
        <div class="text-text-muted mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
            <path d={icon} />
          </svg>
        </div>
      )}
      <Slot name="icon" />
      <h3 class="text-lg font-bold text-text">{title}</h3>
      {description && <p class="text-sm text-text-muted mt-2 max-w-sm">{description}</p>}
      {action && onAction && (
        <button
          onClick$={handleClick}
          class="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {action}
        </button>
      )}
      <Slot />
    </div>
  );
});
