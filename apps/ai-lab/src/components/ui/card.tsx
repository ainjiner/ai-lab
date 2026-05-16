import { component$, Slot } from "@builder.io/qwik";

export const Card = component$(() => {
  return (
    <div class="rounded-xl border border-surface-light bg-surface p-6">
      <Slot />
    </div>
  );
});

export const CardHeader = component$(() => {
  return (
    <div class="mb-4 flex flex-col space-y-1.5">
      <Slot />
    </div>
  );
});

export const CardTitle = component$(() => {
  return (
    <h3 class="text-xl font-semibold leading-none tracking-tight">
      <Slot />
    </h3>
  );
});

export const CardDescription = component$(() => {
  return (
    <p class="text-sm text-text-muted">
      <Slot />
    </p>
  );
});

export const CardContent = component$(() => {
  return (
    <div class="pt-0">
      <Slot />
    </div>
  );
});

export const CardFooter = component$(() => {
  return (
    <div class="flex items-center pt-4">
      <Slot />
    </div>
  );
});
