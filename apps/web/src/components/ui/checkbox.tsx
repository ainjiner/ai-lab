import { component$, useSignal, $, Slot, QRL } from "@builder.io/qwik";

interface CheckboxProps {
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  class?: string;
  onChange$?: QRL<(checked: boolean) => void>;
}

export const Checkbox = component$<CheckboxProps>(({
  checked = false,
  disabled = false,
  id,
  name,
  class: className = "",
  onChange$
}) => {
  const isChecked = useSignal(checked);

  const toggle = $(() => {
    if (disabled) return;
    isChecked.value = !isChecked.value;
    if (onChange$) {
      onChange$(isChecked.value);
    }
  });

  return (
    <label class={`inline-flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={isChecked.value}
        disabled={disabled}
        onChange$={toggle}
        class="sr-only"
      />
      <div
        class={`h-4 w-4 shrink-0 rounded border border-surface-light flex items-center justify-center transition-colors ${
          isChecked.value
            ? "bg-primary border-primary"
            : "bg-surface"
        } ${disabled ? "" : "hover:border-primary/50"}`}
        onClick$={toggle}
      >
        {isChecked.value && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="3"
            stroke="currentColor"
            class="w-3 h-3 text-primary-foreground"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
      <Slot />
    </label>
  );
});
