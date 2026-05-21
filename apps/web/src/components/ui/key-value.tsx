import { component$ } from "@builder.io/qwik";

interface KeyValueItemProps {
  label: string;
  value: string | number;
  valueClass?: string;
  mono?: boolean;
}

export const KeyValueItem = component$(({ label, value, valueClass, mono }: KeyValueItemProps) => {
  return (
    <div class="flex justify-between text-sm">
      <span class="text-text-muted">{label}</span>
      <span class={`font-medium text-text ${mono ? "font-mono text-xs" : ""} ${valueClass || ""}`}>
        {value}
      </span>
    </div>
  );
});

interface KeyValueGridProps {
  items: Array<{ label: string; value: string | number; valueClass?: string; mono?: boolean }>;
  class?: string;
}

export const KeyValueGrid = component$(({ items, class: className }: KeyValueGridProps) => {
  return (
    <div class={`text-sm text-text-muted space-y-1 bg-surface-light rounded-lg p-3 ${className || ""}`}>
      {items.map((item, idx) => (
        <KeyValueItem
          key={idx}
          label={item.label}
          value={item.value}
          valueClass={item.valueClass}
          mono={item.mono}
        />
      ))}
    </div>
  );
});
