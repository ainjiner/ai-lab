import { component$, PropsOf } from "@builder.io/qwik";

type TextareaProps = PropsOf<"textarea">;

export const Textarea = component$(({ class: className, ...props }: TextareaProps) => {
  return (
    <textarea
      class={`flex min-h-[80px] w-full rounded-lg border border-surface-light bg-surface-elevated px-3 py-2 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    />
  );
});
