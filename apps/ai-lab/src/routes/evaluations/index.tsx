import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";

export default component$(() => {
  const evaluations = [
    { id: 1, name: "MMLU Benchmark", type: "benchmark", passed: 85, total: 100, category: "Knowledge" },
    { id: 2, name: "HumanEval", type: "code", passed: 42, total: 50, category: "Coding" },
    { id: 3, name: "TruthfulQA", type: "safety", passed: 78, total: 100, category: "Safety" },
    { id: 4, name: "GSM8K", type: "math", passed: 92, total: 100, category: "Reasoning" },
    { id: 5, name: "HellaSwag", type: "benchmark", passed: 88, total: 100, category: "Reasoning" },
    { id: 6, name: "WinoGrande", type: "benchmark", passed: 75, total: 100, category: "Reasoning" },
  ];

  const typeColors: Record<string, string> = {
    benchmark: "bg-primary/20 text-primary",
    code: "bg-success/20 text-success",
    safety: "bg-warning/20 text-warning",
    math: "bg-error/20 text-error",
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Evaluations</h1>
          <p class="text-text-muted">Model evaluation results and benchmarks</p>
        </div>
        <Button>Run Evaluation</Button>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {evaluations.map((eval_) => {
          const percentage = Math.round((eval_.passed / eval_.total) * 100);
          return (
            <Card key={eval_.id}>
              <CardHeader>
                <div class="flex items-start justify-between">
                  <div class="flex flex-col gap-2">
                    <CardTitle>{eval_.name}</CardTitle>
                    <div class="flex items-center gap-2">
                      <Badge variant="outline">{eval_.category}</Badge>
                      <span class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${typeColors[eval_.type]}`}>
                        {eval_.type}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-2xl font-bold">{percentage}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <Progress value={percentage} />
                  <div class="flex justify-between text-sm text-text-muted">
                    <span>{eval_.passed} passed</span>
                    <span>{eval_.total} total</span>
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
  title: "AI Lab - Evaluations",
};
