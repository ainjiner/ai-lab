import { component$, useSignal, $, Slot, useContext, createContextId, useContextProvider, QRL } from "@builder.io/qwik";

interface TabsContext {
  activeTab: string;
  onChange$: QRL<(value: string) => void>;
}

export const TabsContext = createContextId<TabsContext>("tabs-context");

interface TabsProps {
  defaultValue?: string;
  value?: string;
  class?: string;
  onChange$?: QRL<(value: string) => void>;
}

export const Tabs = component$<TabsProps>(({
  defaultValue = "",
  value,
  class: className = "",
  onChange$
}) => {
  const activeTab = useSignal(value || defaultValue);

  const handleChange = $((newValue: string) => {
    activeTab.value = newValue;
    if (onChange$) {
      onChange$(newValue);
    }
  });

  const context: TabsContext = {
    activeTab: activeTab.value,
    onChange$: handleChange
  };

  useContextProvider(TabsContext, context);

  return (
    <div class={className}>
      <Slot />
    </div>
  );
});

interface TabsListProps {
  class?: string;
}

export const TabsList = component$<TabsListProps>(({ class: className = "" }) => {
  return (
    <div class={`inline-flex h-10 items-center justify-center rounded-lg bg-surface-light p-1 ${className}`}>
      <Slot />
    </div>
  );
});

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  class?: string;
}

export const TabsTrigger = component$<TabsTriggerProps>(({
  value,
  disabled = false,
  class: className = ""
}) => {
  const context = useContext(TabsContext);
  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick$={() => context.onChange$(value)}
      class={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-surface text-text shadow-sm"
          : "text-text-muted hover:text-text"
      } ${className}`}
    >
      <Slot />
    </button>
  );
});

interface TabsContentProps {
  value: string;
  class?: string;
}

export const TabsContent = component$<TabsContentProps>(({
  value,
  class: className = ""
}) => {
  const context = useContext(TabsContext);
  
  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      class={`mt-2 focus-visible:outline-none ${className}`}
    >
      <Slot />
    </div>
  );
});
