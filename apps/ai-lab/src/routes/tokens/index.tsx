import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const byModel = [
    { model: "Llama 3.1 8B", tokens: "450K", cost: "$8.50" },
    { model: "Qwen 2.5 72B", tokens: "380K", cost: "$11.20" },
    { model: "Llama 3.1 70B", tokens: "250K", cost: "$4.20" },
    { model: "DeepSeek R1", tokens: "120K", cost: "$0.60" },
  ];

  return (
    <div>
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Token Usage</h1>
        <p class="mt-2 text-text-muted">Track token consumption and costs</p>
      </header>

      <div class="mb-8 grid grid-cols-2 gap-6">
        <div class="rounded-xl border border-surface-light bg-surface p-6 text-center">
          <p class="text-text-muted">Total Tokens</p>
          <p class="text-4xl font-bold text-primary">1.2M</p>
        </div>
        <div class="rounded-xl border border-surface-light bg-surface p-6 text-center">
          <p class="text-text-muted">Total Cost</p>
          <p class="text-4xl font-bold text-success">$24.50</p>
        </div>
      </div>

      <div class="rounded-xl border border-surface-light bg-surface p-6">
        <h2 class="mb-4 text-xl font-semibold">Usage by Model</h2>
        <div class="space-y-4">
          {byModel.map((item) => (
            <div key={item.model} class="flex items-center justify-between">
              <span>{item.model}</span>
              <div class="flex gap-8">
                <span class="text-text-muted">{item.tokens}</span>
                <span class="font-medium">{item.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Tokens",
};
