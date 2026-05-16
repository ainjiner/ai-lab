import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

export default component$(() => {
  const byModel = [
    { model: "Llama 3.1 8B", tokens: 450000, cost: "$8.50", percentage: 37 },
    { model: "Qwen 2.5 72B", tokens: 380000, cost: "$11.20", percentage: 32 },
    { model: "Llama 3.1 70B", tokens: 250000, cost: "$4.20", percentage: 21 },
    { model: "DeepSeek R1", tokens: 120000, cost: "$0.60", percentage: 10 },
  ];

  const dailyUsage = [
    { day: "Mon", tokens: 180 },
    { day: "Tue", tokens: 220 },
    { day: "Wed", tokens: 150 },
    { day: "Thu", tokens: 280 },
    { day: "Fri", tokens: 190 },
    { day: "Sat", tokens: 180 },
    { day: "Sun", tokens: 120 },
  ];

  const maxTokens = 280;

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Token Usage</h1>
        <p class="text-text-muted">Track token consumption and costs</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Total Tokens</span>
              <span class="text-3xl font-bold tabular-nums text-primary">1.2M</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Total Cost</span>
              <span class="text-3xl font-bold tabular-nums text-success">$24.50</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Avg per Day</span>
              <span class="text-3xl font-bold tabular-nums text-warning">171K</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Active Models</span>
              <span class="text-3xl font-bold tabular-nums">4</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              {byModel.map((item) => (
                <div key={item.model} class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{item.model}</span>
                    <div class="flex items-center gap-4">
                      <span class="text-sm text-text-muted">{(item.tokens / 1000).toFixed(0)}K</span>
                      <span class="text-sm font-medium">{item.cost}</span>
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
            <CardTitle>Daily Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-end justify-between gap-2 h-40">
              {dailyUsage.map((day) => (
                <div key={day.day} class="flex flex-col items-center gap-2">
                  <div
                    class="w-8 rounded bg-primary transition-all"
                    style={`height: ${(day.tokens / maxTokens) * 100}%`}
                  />
                  <span class="text-xs text-text-muted">{day.day}</span>
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
  title: "AI Lab - Tokens",
};
