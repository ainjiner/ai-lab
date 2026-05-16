import { component$, PropsOf } from "@builder.io/qwik";

type InputProps = PropsOf<"input">;

export const Input = component$(({ class: className, ...props }: InputProps) => {
  return (
    <input
      class={`flex h-10 w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    />
  );
});
