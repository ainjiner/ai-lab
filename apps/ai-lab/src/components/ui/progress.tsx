import { component$ } from "@builder.io/qwik";

interface ProgressProps {
  value?: number;
  class?: string;
}

export const Progress = component$(({ value = 0, class: className }: ProgressProps) => {
  return (
    <div class={`relative h-2 w-full overflow-hidden rounded-full bg-surface-light ${className || ""}`}>
      <div
        class="h-full bg-primary transition-all duration-300 ease-in-out"
        style={`width: ${value}%`}
      />
    </div>
  );
});
