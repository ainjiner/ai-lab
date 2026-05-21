import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Select, Textarea } from "~/components/ui";
import { Progress } from "~/components/ui/progress";
import { PageHeader } from "~/components/ui/page-header";
import { StatusBadge } from "~/components/ui/status-badge";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";



interface CompareState {
  modelA: string;
  modelB: string;
  prompt: string;
  loading: boolean;
  models: Array<{ id: string; name: string; provider: string }>;
  results: Array<{
    model: string;
    output: string;
    tokens: number;
    latency: number;
    cost: number;
  }>;
}

export default component$(() => {
  const toast = useToast();
  
  const state = useStore<CompareState>({
    modelA: "llama-3.1-8b",
    modelB: "qwen-2.5-72b",
    prompt: "",
    loading: false,
    models: [],
    results: [],
  });

  const models: Array<{ id: string; name: string; provider: string }> = [
    { id: "llama-3.1-8b", name: "Llama 3.1 8B", provider: "Baseten" },
    { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Baseten" },
    { id: "qwen-2.5-72b", name: "Qwen 2.5 72B", provider: "Baseten" },
    { id: "deepseek-r1", name: "DeepSeek R1", provider: "Baseten" },
  ];

  const benchmarks = [
    { name: "MMLU", llama8b: 68.1, qwen72b: 85.2, llama70b: 82.1, deepseek: 79.3 },
    { name: "HumanEval", llama8b: 48.1, qwen72b: 72.4, llama70b: 67.8, deepseek: 65.2 },
    { name: "GSM8K", llama8b: 50.5, qwen72b: 89.3, llama70b: 83.1, deepseek: 78.4 },
    { name: "TruthfulQA", llama8b: 42.8, qwen72b: 58.1, llama70b: 52.3, deepseek: 55.7 },
  ];

  const displayModels = models;

  const getModelBench = (modelId: string, bench: typeof benchmarks[0]) => {
    const map: Record<string, keyof typeof bench> = {
      "llama-3.1-8b": "llama8b",
      "llama-3.1-70b": "llama70b",
      "qwen-2.5-72b": "qwen72b",
      "deepseek-r1": "deepseek",
    };
    return bench[map[modelId]] as number;
  };

  const modelAData = displayModels.find((m) => m.id === state.modelA) || displayModels[0];
  const modelBData = displayModels.find((m) => m.id === state.modelB) || displayModels[1];

  return (
    <div class="space-y-6">
      <PageHeader title="Model Comparison" description="Compare models side-by-side" />

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Model A</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={state.modelA}
              onChange$={(e) => { state.modelA = (e.target as HTMLSelectElement).value; }}
            >
              {displayModels.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
            <div class="mt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-text-muted">Provider</span>
                <span>{modelAData?.provider || "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model B</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={state.modelB}
              onChange$={(e) => { state.modelB = (e.target as HTMLSelectElement).value; }}
            >
              {displayModels.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
            <div class="mt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-text-muted">Provider</span>
                <span>{modelBData?.provider || "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Benchmark Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            {benchmarks.map((bench) => {
              const aScore = getModelBench(state.modelA, bench);
              const bScore = getModelBench(state.modelB, bench);

              return (
                <div key={bench.name} class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{bench.name}</span>
                    <div class="flex gap-4 text-xs text-text-muted">
                      <span>{modelAData.name}: <span class="text-text font-medium">{aScore}%</span></span>
                      <span>{modelBData.name}: <span class="text-text font-medium">{bScore}%</span></span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <Progress value={(aScore / 100) * 100} />
                    <Progress value={(bScore / 100) * 100} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-text-muted">Prompt</label>
              <Textarea
                class="min-h-[100px]"
                placeholder="Enter a prompt to compare both models..."
                value={state.prompt}
                onInput$={(e) => { state.prompt = (e.target as HTMLTextAreaElement).value; }}
              />
            </div>
            <Button>Run Comparison</Button>

            <div class="grid gap-4 md:grid-cols-2 pt-2">
              <div class="rounded-lg border border-surface-light bg-surface-elevated p-4">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium">{modelAData.name}</span>
                  <StatusBadge status="Model A" />
                </div>
                <div class="min-h-[80px] text-sm text-text-muted">
                  Output will appear here...
                </div>
              </div>
              <div class="rounded-lg border border-surface-light bg-surface-elevated p-4">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium">{modelBData.name}</span>
                  <StatusBadge status="Model B" />
                </div>
                <div class="min-h-[80px] text-sm text-text-muted">
                  Output will appear here...
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Model Comparison",
};
