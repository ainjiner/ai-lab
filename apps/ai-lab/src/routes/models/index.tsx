import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const models = [
    { id: "meta-llama-3.1-8b", name: "Llama 3.1 8B", provider: "Baseten", status: "active" },
    { id: "meta-llama-3.1-70b", name: "Llama 3.1 70B", provider: "Baseten", status: "active" },
    { id: "qwen-2.5-72b", name: "Qwen 2.5 72B", provider: "Baseten", status: "active" },
    { id: "deepseek-r1", name: "DeepSeek R1", provider: "Baseten", status: "inactive" },
  ];

  return (
    <div>
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Models</h1>
          <p class="mt-2 text-text-muted">Manage and configure LLM models</p>
        </div>
        <button class="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark">
          Scan Models
        </button>
      </header>

      <div class="rounded-xl border border-surface-light bg-surface p-6">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-light">
              <th class="px-4 py-3 text-left">Model</th>
              <th class="px-4 py-3 text-left">Provider</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id} class="border-b border-surface-light">
                <td class="px-4 py-3">
                  <div>
                    <p class="font-medium">{model.name}</p>
                    <p class="text-sm text-text-muted">{model.id}</p>
                  </div>
                </td>
                <td class="px-4 py-3">{model.provider}</td>
                <td class="px-4 py-3">
                  <span
                    class={`inline-block rounded px-2 py-1 text-xs ${
                      model.status === "active"
                        ? "bg-success/20 text-success"
                        : "bg-surface-light text-text-muted"
                    }`}
                  >
                    {model.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button class="rounded-lg bg-surface-light px-4 py-2 text-sm text-text transition-colors hover:bg-surface">
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Models",
};
