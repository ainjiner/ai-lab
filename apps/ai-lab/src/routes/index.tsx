import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const stats = [
    { label: "Available Models", value: 12, color: "text-primary" },
    { label: "Active Experiments", value: 8, color: "text-success" },
    { label: "Evaluations", value: 24, color: "text-warning" },
    { label: "Tokens Used", value: "1.2M", color: "text-error" },
  ];

  return (
    <div>
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="mt-2 text-text-muted">
          ML/LLM Engineering Research Dashboard
        </p>
      </header>

      <div class="mb-8 grid grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            class="rounded-xl border border-surface-light bg-surface p-6"
          >
            <p class="text-sm text-text-muted">{stat.label}</p>
            <p class={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="rounded-xl border border-surface-light bg-surface p-6">
          <h2 class="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div class="space-y-3">
            <button class="w-full rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark">
              Scan Models
            </button>
            <button class="w-full rounded-lg bg-surface-light px-4 py-2 text-text transition-colors hover:bg-surface">
              New Experiment
            </button>
          </div>
        </div>

        <div class="rounded-xl border border-surface-light bg-surface p-6">
          <h2 class="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span>Model scan completed</span>
              <span class="text-text-muted">2m ago</span>
            </div>
            <div class="flex justify-between">
              <span>Experiment #42 finished</span>
              <span class="text-text-muted">15m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Dashboard",
  meta: [
    {
      name: "description",
      content: "ML/LLM Engineering Research Dashboard",
    },
  ],
};
