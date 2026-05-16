import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default component$(() => {
  const stats = [
    { label: "Available Models", value: 12, color: "text-primary" },
    { label: "Active Experiments", value: 8, color: "text-success" },
    { label: "Evaluations", value: 24, color: "text-warning" },
    { label: "Tokens Used", value: "1.2M", color: "text-error" },
  ];

  const activities = [
    { text: "Model scan completed", time: "2m ago" },
    { text: "Experiment #42 finished", time: "15m ago" },
    { text: "New model added", time: "1h ago" },
    { text: "Evaluation passed", time: "2h ago" },
  ];

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-text-muted">
          ML/LLM Engineering Research Dashboard
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div class="flex flex-col space-y-1">
                <span class="text-sm font-medium text-text-muted">{stat.label}</span>
                <span class={`text-3xl font-bold tabular-nums ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col space-y-2">
              <Button class="w-full">Scan Models</Button>
              <Button variant="secondary" class="w-full">New Experiment</Button>
              <Button variant="outline" class="w-full">Run Evaluation</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              {activities.map((activity) => (
                <div key={activity.text} class="flex items-center justify-between">
                  <span class="text-sm">{activity.text}</span>
                  <span class="text-xs text-text-muted">{activity.time}</span>
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
  title: "AI Lab - Dashboard",
  meta: [
    {
      name: "description",
      content: "ML/LLM Engineering Research Dashboard",
    },
  ],
};
