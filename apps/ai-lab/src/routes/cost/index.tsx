import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";

export default component$(() => {
  const costData = {
    total: 124.50,
    thisMonth: 45.20,
    lastMonth: 38.60,
    projected: 52.00,
    byModel: [
      { model: "Llama 3.1 8B", cost: 18.50, tokens: 62000, percentage: 41 },
      { model: "Qwen 2.5 72B", cost: 15.20, tokens: 25000, percentage: 34 },
      { model: "Llama 3.1 70B", cost: 8.40, tokens: 10500, percentage: 19 },
      { model: "DeepSeek R1", cost: 3.10, tokens: 15500, percentage: 7 },
    ],
    byUseCase: [
      { useCase: "Chat Completions", cost: 22.50, percentage: 50 },
      { useCase: "Embeddings", cost: 8.20, percentage: 18 },
      { useCase: "Code Generation", cost: 7.80, percentage: 17 },
      { useCase: "Summarization", cost: 6.70, percentage: 15 },
    ],
    daily: [
      { day: "May 10", cost: 3.20 },
      { day: "May 11", cost: 4.50 },
      { day: "May 12", cost: 2.80 },
      { day: "May 13", cost: 5.20 },
      { day: "May 14", cost: 3.90 },
      { day: "May 15", cost: 4.10 },
      { day: "May 16", cost: 2.50 },
    ],
    recommendations: [
      { title: "Switch to DeepSeek R1 for simple tasks", savings: 12.50 },
      { title: "Use Llama 8B instead of 70B for chat", savings: 8.20 },
      { title: "Enable caching for repeated prompts", savings: 5.80 },
    ],
  };

  const maxDailyCost = Math.max(...costData.daily.map((d) => d.cost));

  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Cost Analysis</h1>
        <p class="text-text-muted">Track and optimize your LLM spending</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Total Spent</span>
              <span class="text-3xl font-bold tabular-nums text-primary">${costData.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">This Month</span>
              <span class="text-3xl font-bold tabular-nums">${costData.thisMonth.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Projected</span>
              <span class="text-3xl font-bold tabular-nums text-warning">${costData.projected.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">vs Last Month</span>
              <span class="text-3xl font-bold tabular-nums text-success">+17%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              {costData.byModel.map((item) => (
                <div key={item.model} class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{item.model}</span>
                    <div class="flex items-center gap-4">
                      <span class="text-sm text-text-muted">{(item.tokens / 1000).toFixed(0)}K tokens</span>
                      <span class="font-medium">${item.cost.toFixed(2)}</span>
                    </div>
                  </div>
                  <Progress value={item.percentage} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost by Use Case</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              {costData.byUseCase.map((item) => (
                <div key={item.useCase} class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{item.useCase}</span>
                    <span class="font-medium">${item.cost.toFixed(2)}</span>
                  </div>
                  <Progress value={item.percentage} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-end justify-between gap-2 h-40">
              {costData.daily.map((item) => (
                <div key={item.day} class="flex flex-col items-center gap-2">
                  <div
                    class="w-8 rounded bg-primary transition-all"
                    style={`height: ${(item.cost / maxDailyCost) * 100}%`}
                  />
                  <span class="text-xs text-text-muted">{item.day.split(" ")[1]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              {costData.recommendations.map((rec, i) => (
                <div
                  key={i}
                  class="flex items-center justify-between rounded-lg border border-surface-light bg-surface/50 p-3"
                >
                  <span class="text-sm">{rec.title}</span>
                  <Badge variant="success">Save ${rec.savings.toFixed(2)}/mo</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Cost Analysis",
};
