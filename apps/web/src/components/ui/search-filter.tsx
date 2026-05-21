import { component$, $, QRL, type QRL } from "@builder.io/qwik";
import { Select } from "./select";

export { Select } from "./select";

export const SearchInput = component$(({ 
  value, 
  placeholder = "Search...", 
  class: className,
  onInput$
}: { 
  value: string; 
  placeholder?: string; 
  class?: string;
  onInput$?: QRL<(value: string) => void>;
}) => {
  return (
    <div class={`relative ${className || ""}`}>
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onInput$={onInput$ ? $((e: Event) => onInput$((e.target as HTMLInputElement).value)) : undefined}
        class="w-full rounded-lg border border-surface-light bg-surface pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );
});

interface FilterSelectProps {
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  class?: string;
}

export const FilterSelect = component$(({ value, options, placeholder = "All", class: className }: FilterSelectProps) => {
  return (
    <select
      value={value}
      class={`rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${className || ""}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
});

interface PeriodSelectorProps {
  periods: string[];
  selected: string;
  onChange: QRL<(period: string) => void>;
}

export const PeriodSelector = component$(({ periods, selected, onChange }: PeriodSelectorProps) => {
  const handleClick = $((period: string) => {
    onChange(period);
  });

  return (
    <div class="inline-flex rounded-lg border border-surface-light bg-surface p-1">
      {periods.map((period) => (
        <button
          key={period}
          onClick$={() => handleClick(period)}
          class={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize cursor-pointer ${
            selected === period
              ? "bg-primary text-white shadow-sm"
              : "text-text-muted hover:text-text"
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
});
