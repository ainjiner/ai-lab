import { component$, Slot } from "@builder.io/qwik";

interface ListItemProps {
  class?: string;
}

export const ListItem = component$(({ class: className }: ListItemProps) => {
  return (
    <div class={`flex items-center justify-between p-4 rounded-lg border border-surface-light bg-surface/50 hover:bg-surface transition-colors ${className || ""}`}>
      <Slot />
    </div>
  );
});

interface ListItemHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export const ListItemHeader = component$(({ title, subtitle, icon }: ListItemHeaderProps) => {
  return (
    <div class="flex items-center gap-4">
      {icon && (
        <div class="p-2 rounded-lg bg-surface-light">
          <svg class="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icon} />
          </svg>
        </div>
      )}
      <div>
        <h3 class="font-medium">{title}</h3>
        {subtitle && <p class="text-sm text-text-muted">{subtitle}</p>}
      </div>
    </div>
  );
});

export const ListItemActions = component$(() => {
  return (
    <div class="flex items-center gap-2">
      <Slot />
    </div>
  );
});
