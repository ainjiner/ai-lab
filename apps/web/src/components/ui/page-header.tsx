import { component$, Slot } from "@builder.io/qwik";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader = component$(({ title, description }: PageHeaderProps) => {
  return (
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p class="text-text-muted">{description}</p>}
      </div>
      <Slot />
    </div>
  );
});
