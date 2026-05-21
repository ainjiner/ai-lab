import { component$, Slot } from "@builder.io/qwik";

interface InfoRowProps {
  class?: string;
}

export const InfoRow = component$(({ class: className }: InfoRowProps) => {
  return (
    <div class={`flex items-center gap-4 text-sm text-text-muted ${className || ""}`}>
      <Slot />
    </div>
  );
});

interface InfoItemProps {
  label?: string;
  value: string | number;
}

export const InfoItem = component$(({ label, value }: InfoItemProps) => {
  return (
    <span>
      {label && <span class="text-text-muted">{label}: </span>}
      <span>{value}</span>
    </span>
  );
});

export const InfoSeparator = component$(() => {
  return <span class="text-text-muted/50">•</span>;
});
