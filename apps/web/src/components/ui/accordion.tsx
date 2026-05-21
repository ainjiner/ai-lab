import { component$, useSignal, $, Slot, useContext, createContextId, useContextProvider, QRL } from "@builder.io/qwik";

interface AccordionContext {
  openItems: string[];
  type: "single" | "multiple";
  toggleItem$: QRL<(value: string) => void>;
}

export const AccordionContext = createContextId<AccordionContext>("accordion-context");

interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  class?: string;
  onChange$?: QRL<(value: string | string[]) => void>;
}

export const Accordion = component$<AccordionProps>(({
  type = "single",
  defaultValue,
  class: className = "",
  onChange$
}) => {
  const initialOpen = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  const openItems = useSignal<string[]>(initialOpen);

  const toggleItem = $((value: string) => {
    if (type === "single") {
      openItems.value = openItems.value.includes(value) ? [] : [value];
      if (onChange$) {
        onChange$(openItems.value[0] || "");
      }
    } else {
      if (openItems.value.includes(value)) {
        openItems.value = openItems.value.filter((v) => v !== value);
      } else {
        openItems.value = [...openItems.value, value];
      }
      if (onChange$) {
        onChange$(openItems.value);
      }
    }
  });

  const context: AccordionContext = {
    openItems: openItems.value,
    type,
    toggleItem$: toggleItem
  };

  useContextProvider(AccordionContext, context);

  return (
    <div class={className}>
      <Slot />
    </div>
  );
});

interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  class?: string;
}

export const AccordionItem = component$<AccordionItemProps>(({
  value,
  disabled = false,
  class: className = ""
}) => {
  const context = useContext(AccordionContext);
  const isOpen = context.openItems.includes(value);

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      data-disabled={disabled}
      class={`border-b border-surface-light ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <Slot name="trigger" />
      <Slot name="content" />
    </div>
  );
});

interface AccordionTriggerProps {
  value: string;
  disabled?: boolean;
  class?: string;
}

export const AccordionTrigger = component$<AccordionTriggerProps>(({
  value,
  disabled = false,
  class: className = ""
}) => {
  const context = useContext(AccordionContext);
  const isOpen = context.openItems.includes(value);

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      disabled={disabled}
      onClick$={() => !disabled && context.toggleItem$(value)}
      class={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline ${className}`}
    >
      <Slot />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
  );
});

interface AccordionContentProps {
  value: string;
  class?: string;
}

export const AccordionContent = component$<AccordionContentProps>(({
  value,
  class: className = ""
}) => {
  const context = useContext(AccordionContext);
  const isOpen = context.openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div class={`overflow-hidden text-sm ${className}`}>
      <div class="pb-4 pt-0">
        <Slot />
      </div>
    </div>
  );
});
