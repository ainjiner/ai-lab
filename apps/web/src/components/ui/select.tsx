import { component$, PropsOf } from "@builder.io/qwik";

type SelectProps = PropsOf<"select">;

export const Select = component$(({ class: className, children, ...props }: SelectProps) => {
  return (
    <select
      class={`flex h-10 w-full rounded-lg border border-surface-light bg-surface-elevated px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    >
      {children}
    </select>
  );
});
