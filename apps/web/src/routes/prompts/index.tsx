import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { PageHeader } from "~/components/ui/page-header";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";

interface PromptState {
  input: string;
  output: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isLoading: boolean;
  models: Array<{ id: string; name: string; provider?: string }>;
  history: Array<{
    id: number;
    input: string;
    output: string;
    model: string;
    tokens: number;
    latency: number;
    timestamp: Date;
  }>;
}

export default component$(() => {
  const state = useStore<PromptState>({
    input: "",
    output: "",
    model: "",
    temperature: 0.7,
    maxTokens: 1024,
    isLoading: false,
    models: [],
    history: [],
  });

  const toast = useToast();

  useTask$(async () => {
    try {
      const res: any = await api.get("/models");
      const modelList = Array.isArray(res) ? res : res.models || [];
      state.models = modelList.slice(0, 20).map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        provider: m.provider,
      }));
      if (state.models.length > 0) {
        state.model = state.models[0].id;
      }
    } catch (e) {
      toast.error("Failed to load models");
      state.models = [];
    }
  });

  const runPrompt = $(async () => {
    if (!state.input.trim() || state.isLoading) return;
    state.isLoading = true;
    try {
      const res: any = await api.post("/playground/chat", {
        messages: [{ role: "user", content: state.input }],
        model: state.model,
        provider: "baseten",
        temperature: state.temperature,
        maxTokens: state.maxTokens,
      });
      state.output = res.response || "No response";
      state.history.unshift({
        id: Date.now(),
        input: state.input,
        output: state.output,
        model: state.model,
        tokens: (res.tokens?.prompt || 0) + (res.tokens?.completion || 0),
        latency: res.latency || 0,
        timestamp: new Date(),
      });
    } catch (e) {
      toast.error("Failed to run prompt");
      state.output = "Error: Failed to run prompt";
    } finally {
      state.isLoading = false;
    }
  });

  const templates = [
    { name: "Summarize", prompt: "Summarize the following text:\n\n{text}" },
    { name: "Translate", prompt: "Translate the following to Indonesian:\n\n{text}" },
    { name: "Code Review", prompt: "Review this code and suggest improvements:\n\n{code}" },
    { name: "Explain", prompt: "Explain this concept in simple terms:\n\n{topic}" },
  ];

  return (
    <div class="space-y-6">
      <PageHeader title="Prompt Engineering" description="Test and optimize your prompts" />

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Playground</CardTitle>
                <div class="flex items-center gap-2">
                  <Select
                    value={state.model}
                    onChange$={(e) => { state.model = (e.target as HTMLSelectElement).value; }}
                  >
                    {state.models.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Input</label>
                  <Textarea
                    class="min-h-[120px]"
                    placeholder="Enter your prompt here..."
                    value={state.input}
                    onInput$={(e) => { state.input = (e.target as HTMLTextAreaElement).value; }}
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-sm font-medium">Temperature: {state.temperature}</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={state.temperature}
                      class="w-full"
                      onInput$={(e) => { state.temperature = parseFloat((e.target as HTMLInputElement).value); }}
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-medium">Max Tokens</label>
                    <Input
                      type="number"
                      value={state.maxTokens}
                      onInput$={(e) => { state.maxTokens = parseInt((e.target as HTMLInputElement).value); }}
                    />
                  </div>
                </div>

                <div class="flex gap-2">
                  <Button class="flex-1" onClick$={runPrompt}>
                    {state.isLoading ? "Generating..." : "Generate"}
                  </Button>
                  <Button variant="outline">Clear</Button>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium">Output</label>
                  <div class="min-h-[120px] rounded-lg border border-surface-light bg-surface/50 p-3 text-sm">
                    {state.output || <span class="text-text-muted">Output will appear here...</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    class="w-full rounded-lg border border-surface-light bg-surface p-3 text-left text-sm transition-colors hover:bg-surface-light"
                    onClick$={() => { state.input = t.prompt; }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-text-muted">Total Requests</span>
                  <span class="font-medium">{state.history.length}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-muted">Total Tokens</span>
                  <span class="font-medium">{state.history.reduce((a, b) => a + b.tokens, 0)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-muted">Avg Latency</span>
                  <span class="font-medium">
                    {(state.history.reduce((a, b) => a + b.latency, 0) / state.history.length || 0).toFixed(2)}s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {state.history.length === 0 ? (
            <EmptyState title="No history yet" description="Run a prompt to see it here" />
          ) : (
          <div class="space-y-3">
            {state.history.map((item) => (
              <div
                key={item.id}
                class="rounded-lg border border-surface-light bg-surface/50 p-4"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-sm font-medium">{item.input}</p>
                    <p class="mt-2 text-sm text-text-muted line-clamp-2">{item.output}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge variant="outline">{item.model}</Badge>
                    <span class="text-xs text-text-muted">{item.tokens} tokens</span>
                    <span class="text-xs text-text-muted">{item.latency}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Prompt Engineering",
};
