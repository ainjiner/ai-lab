import { component$, Slot } from "@builder.io/qwik";

interface StatCardProps {
  value: string | number;
  label: string;
  valueColor?: string;
  class?: string;
}

export const StatCard = component$(({ value, label, valueColor, class: className }: StatCardProps) => {
  return (
    <div class={`rounded-2xl border border-surface-light bg-surface p-6 ${className || ""}`}>
      <div class={`text-2xl font-bold ${valueColor || ""}`}>{value}</div>
      <p class="text-xs text-text-muted mt-1">{label}</p>
      <Slot />
    </div>
  );
});

interface StatGridProps {
  cols?: 2 | 3 | 4 | 5 | 6;
}

export const StatGrid = component$(({ cols = 4 }: StatGridProps) => {
  const colClasses: Record<number, string> = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  };
  return (
    <div class={`grid gap-4 ${colClasses[cols]}`}>
      <Slot />
    </div>
  );
});
