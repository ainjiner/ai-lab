import { component$, useSignal, $, Slot, QRL } from "@builder.io/qwik";

interface SwitchProps {
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  class?: string;
  onChange$?: QRL<(checked: boolean) => void>;
}

export const Switch = component$<SwitchProps>(({
  checked = false,
  disabled = false,
  id,
  name,
  class: className = "",
  onChange$
}) => {
  const isChecked = useSignal(checked);

  const handleClick = $(() => {
    if (disabled) return;
    isChecked.value = !isChecked.value;
    if (onChange$) {
      onChange$(isChecked.value);
    }
  });

  return (
    <label class={`inline-flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked.value}
        aria-labelledby={id ? `${id}-label` : undefined}
        disabled={disabled}
        onClick$={handleClick}
        class={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isChecked.value ? "bg-primary" : "bg-surface-light"
        } ${disabled ? "cursor-not-allowed" : ""}`}
      >
        <span
          class={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            isChecked.value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={isChecked.value}
        disabled={disabled}
        class="sr-only"
      />
      <Slot />
    </label>
  );
});
