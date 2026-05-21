import { component$, type QRL, Slot } from "@builder.io/qwik";

interface SelectableCardProps {
  selected?: boolean;
  class?: string;
  onClick$?: QRL<() => void>;
}

export const SelectableCard = component$(({ selected, class: className, onClick$ }: SelectableCardProps) => {
  return (
    <div
      class={`cursor-pointer transition-colors rounded-xl border p-3 ${
        selected
          ? "border-primary bg-primary/5"
          : "border-surface-light bg-surface/50 hover:border-surface-light/80"
      } ${className || ""}`}
      onClick$={onClick$}
    >
      <Slot />
    </div>
  );
});

interface SelectableCardHeaderProps {
  title: string;
  badge?: string;
  badgeColor?: string;
}

export const SelectableCardHeader = component$(({ title, badge, badgeColor }: SelectableCardHeaderProps) => {
  return (
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-medium">{title}</h3>
      {badge && (
        <span class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${badgeColor || "bg-surface-light text-text-muted"}`}>
          {badge}
        </span>
      )}
    </div>
  );
});
