import { component$, useSignal, $, Slot, useContext, createContextId, useContextProvider, QRL } from "@builder.io/qwik";

interface RadioGroupContext {
  name: string;
  value: string;
  onChange$: QRL<(value: string) => void>;
  disabled: boolean;
}

export const RadioGroupContext = createContextId<RadioGroupContext>("radio-group-context");

interface RadioGroupProps {
  name: string;
  value?: string;
  disabled?: boolean;
  class?: string;
  onChange$?: QRL<(value: string) => void>;
}

export const RadioGroup = component$<RadioGroupProps>(({
  name,
  value = "",
  disabled = false,
  class: className = "",
  onChange$
}) => {
  const selectedValue = useSignal(value);

  const handleChange = $((newValue: string) => {
    if (disabled) return;
    selectedValue.value = newValue;
    if (onChange$) {
      onChange$(newValue);
    }
  });

  const context: RadioGroupContext = {
    name,
    value: selectedValue.value,
    onChange$: handleChange,
    disabled
  };

  useContextProvider(RadioGroupContext, context);

  return (
    <div class={`space-y-2 ${className}`} role="radiogroup">
      <Slot />
    </div>
  );
});

interface RadioOptionProps {
  value: string;
  disabled?: boolean;
  class?: string;
}

export const RadioOption = component$<RadioOptionProps>(({
  value,
  disabled = false,
  class: className = ""
}) => {
  const context = useContext(RadioGroupContext);
  const isSelected = context.value === value;
  const isDisabled = disabled || context.disabled;

  const select = $(() => {
    if (isDisabled) return;
    context.onChange$(value);
  });

  return (
    <label class={`inline-flex items-center gap-2 cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      <input
        type="radio"
        name={context.name}
        value={value}
        checked={isSelected}
        disabled={isDisabled}
        onChange$={select}
        class="sr-only"
      />
      <div
        class={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
          isSelected
            ? "border-primary"
            : "border-surface-light"
        } ${isDisabled ? "" : "hover:border-primary/50"}`}
        onClick$={select}
      >
        {isSelected && (
          <div class="h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
      <Slot />
    </label>
  );
});
