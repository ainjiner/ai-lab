import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export default component$(() => {
  const integrations = [
    {
      id: "baseten",
      name: "Baseten",
      description: "Model inference platform for production ML",
      status: "connected",
      icon: "🚀",
      features: ["Auto-scaling", "Low latency", "Model caching"],
    },
    {
      id: "pinecone",
      name: "Pinecone",
      description: "Vector database for RAG applications",
      status: "available",
      icon: "🌲",
      features: ["Vector search", "Real-time indexing", "Hybrid search"],
    },
    {
      id: "helicone",
      name: "Helicone",
      description: "LLM observability and monitoring",
      status: "available",
      icon: "📊",
      features: ["Request logging", "Cost tracking", "Rate limiting"],
    },
    {
      id: "langfuse",
      name: "Langfuse",
      description: "LLM tracing and evaluation platform",
      status: "available",
      icon: "🔍",
      features: ["Trace visualization", "Prompt management", "Dataset versioning"],
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "GPT models and embeddings API",
      status: "available",
      icon: "🤖",
      features: ["GPT-4", "Embeddings", "Fine-tuning"],
    },
    {
      id: "anthropic",
      name: "Anthropic",
      description: "Claude models for complex reasoning",
      status: "available",
      icon: "🧠",
      features: ["Claude 3", "Long context", "Vision"],
    },
  ];

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Integrations</h1>
        <p class="text-text-muted">Connect with ML/LLM services</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">{integration.icon}</span>
                  <div class="flex flex-col">
                    <CardTitle>{integration.name}</CardTitle>
                    <Badge variant={integration.status === "connected" ? "success" : "secondary"} class="mt-1 w-fit">
                      {integration.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-text-muted mb-4">{integration.description}</p>
              <div class="flex flex-wrap gap-1 mb-4">
                {integration.features.map((feature) => (
                  <span
                    key={feature}
                    class="inline-flex items-center rounded-md bg-surface-light px-2 py-1 text-xs text-text-muted"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <Button
                variant={integration.status === "connected" ? "secondary" : "default"}
                class="w-full"
              >
                {integration.status === "connected" ? "Configure" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Integrations",
};
