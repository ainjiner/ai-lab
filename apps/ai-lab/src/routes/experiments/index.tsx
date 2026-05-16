import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export default component$(() => {
  const experiments = [
    { id: 1, name: "Prompt Engineering v1", model: "Llama 3.1 8B", status: "completed", score: 0.92, runs: 45 },
    { id: 2, name: "RAG Pipeline Test", model: "Qwen 2.5 72B", status: "running", score: null, runs: 12 },
    { id: 3, name: "Code Generation Benchmark", model: "DeepSeek R1", status: "pending", score: null, runs: 0 },
    { id: 4, name: "Reasoning Chain Test", model: "Llama 3.1 70B", status: "completed", score: 0.87, runs: 38 },
    { id: 5, name: "Fine-tuning Evaluation", model: "Llama 3.1 8B", status: "failed", score: null, runs: 5 },
  ];

  const statusConfig: Record<string, { variant: "success" | "warning" | "secondary" | "destructive"; icon: string }> = {
    completed: { variant: "success", icon: "✓" },
    running: { variant: "warning", icon: "◐" },
    pending: { variant: "secondary", icon: "○" },
    failed: { variant: "destructive", icon: "✗" },
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Experiments</h1>
          <p class="text-text-muted">Track and manage ML experiments</p>
        </div>
        <Button>New Experiment</Button>
      </div>

      <div class="grid gap-4">
        {experiments.map((exp) => {
          const config = statusConfig[exp.status];
          return (
            <Card key={exp.id}>
              <CardContent>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-light text-lg">
                      {config.icon}
                    </div>
                    <div class="flex flex-col">
                      <span class="font-medium">{exp.name}</span>
                      <span class="text-sm text-text-muted">{exp.model}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex flex-col items-end">
                      <Badge variant={config.variant}>{exp.status}</Badge>
                      {exp.score !== null && (
                        <span class="text-sm text-text-muted mt-1">
                          Score: <span class="font-medium text-text">{exp.score}</span>
                        </span>
                      )}
                    </div>
                    <div class="flex flex-col items-end">
                      <span class="text-sm text-text-muted">{exp.runs} runs</span>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Experiments",
};
