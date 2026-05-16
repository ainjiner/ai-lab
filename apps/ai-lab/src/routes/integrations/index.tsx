import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const integrations = [
    {
      id: "baseten",
      name: "Baseten",
      description: "Model inference platform",
      status: "connected",
      icon: "🚀",
    },
    {
      id: "pinecone",
      name: "Pinecone",
      description: "Vector database for RAG",
      status: "available",
      icon: "🌲",
    },
    {
      id: "helicone",
      name: "Helicone",
      description: "LLM observability platform",
      status: "available",
      icon: "📊",
    },
    {
      id: "langfuse",
      name: "Langfuse",
      description: "LLM tracing and evaluation",
      status: "available",
      icon: "🔍",
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "GPT models and embeddings",
      status: "available",
      icon: "🤖",
    },
    {
      id: "anthropic",
      name: "Anthropic",
      description: "Claude models",
      status: "available",
      icon: "🧠",
    },
  ];

  return (
    <div>
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Integrations</h1>
        <p class="mt-2 text-text-muted">Connect with ML/LLM services</p>
      </header>

      <div class="grid grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            class="rounded-xl border border-surface-light bg-surface p-6"
          >
            <div class="mb-4 flex items-center gap-3">
              <span class="text-3xl">{integration.icon}</span>
              <div>
                <h3 class="font-semibold">{integration.name}</h3>
                <span
                  class={`inline-block rounded px-2 py-1 text-xs ${
                    integration.status === "connected"
                      ? "bg-success/20 text-success"
                      : "bg-surface-light text-text-muted"
                  }`}
                >
                  {integration.status}
                </span>
              </div>
            </div>
            <p class="mb-4 text-sm text-text-muted">{integration.description}</p>
            <button
              class={`w-full rounded-lg px-4 py-2 transition-colors ${
                integration.status === "connected"
                  ? "bg-surface-light text-text hover:bg-surface"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {integration.status === "connected" ? "Configure" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Integrations",
};
