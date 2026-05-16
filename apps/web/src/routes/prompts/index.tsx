import { component$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";

interface PromptState {
  input: string;
  output: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isLoading: boolean;
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
    model: "llama-3.1-8b",
    temperature: 0.7,
    maxTokens: 1024,
    isLoading: false,
    history: [
      { id: 1, input: "Explain quantum computing", output: "Quantum computing uses...", model: "llama-3.1-8b", tokens: 245, latency: 1.2, timestamp: new Date() },
      { id: 2, input: "Write a haiku about AI", output: "Silicon dreams flow\nNeural paths light up the dark\nMind without a soul", model: "qwen-2.5-72b", tokens: 32, latency: 0.8, timestamp: new Date() },
    ],
  });

  const models = [
    { id: "llama-3.1-8b", name: "Llama 3.1 8B", type: "chat" },
    { id: "llama-3.1-70b", name: "Llama 3.1 70B", type: "chat" },
    { id: "qwen-2.5-72b", name: "Qwen 2.5 72B", type: "chat" },
    { id: "deepseek-r1", name: "DeepSeek R1", type: "reasoning" },
  ];

  const templates = [
    { name: "Summarize", prompt: "Summarize the following text:\n\n{text}" },
    { name: "Translate", prompt: "Translate the following to Indonesian:\n\n{text}" },
    { name: "Code Review", prompt: "Review this code and suggest improvements:\n\n{code}" },
    { name: "Explain", prompt: "Explain this concept in simple terms:\n\n{topic}" },
  ];

  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Prompt Engineering</h1>
        <p class="text-text-muted">Test and optimize your prompts</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Playground</CardTitle>
                <div class="flex items-center gap-2">
                  <select
                    class="rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm"
                    value={state.model}
                    onChange$={(e) => { state.model = (e.target as HTMLSelectElement).value; }}
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Input</label>
                  <textarea
                    class="flex min-h-[120px] w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                  <Button class="flex-1">
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
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Prompt Engineering",
};
