import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/api";

interface DashboardState {
  providers: number; models: number; instances: number; targets: number;
  experiments: number; usage: { totalCost: number; totalTokens: number };
  loading: boolean;
}

export default component$(() => {
  const state = useStore<DashboardState>({
    providers: 0, models: 0, instances: 0, targets: 0, experiments: 0,
    usage: { totalCost: 0, totalTokens: 0 }, loading: true,
  });

  useVisibleTask$(async () => {
    try {
      const [providers, models, instances, config, experiments, analytics] = await Promise.all([
        api.get<{ providers: unknown[] }>("/providers"),
        api.get<{ total: number }>("/models"),
        api.get<{ instances: unknown[] }>("/providers/instances"),
        api.get<{ targets: unknown[] }>("/config"),
        api.get<{ total: number }>("/experiments"),
        api.get<{ summary: { totalCost: number; totalTokens: number } }>("/analytics/summary"),
      ]);
      state.providers = providers.providers.length;
      state.models = models.total;
      state.instances = instances.instances.length;
      state.targets = config.targets.length;
      state.experiments = experiments.total;
      state.usage = analytics.summary;
      state.loading = false;
    } catch {
      state.loading = false;
    }
  });

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-text-muted">ML/LLM Engineering Platform</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Providers", value: state.providers, color: "text-primary" },
          { label: "Instances", value: state.instances, color: "text-success" },
          { label: "Models", value: state.models, color: "text-warning" },
          { label: "Experiments", value: state.experiments, color: "text-info" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div class="flex flex-col space-y-1">
                <span class="text-sm font-medium text-text-muted">{stat.label}</span>
                <span class={`text-3xl font-bold tabular-nums ${stat.color}`}>
                  {state.loading ? "..." : stat.value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent class="pt-6">
            <h3 class="font-medium mb-2">Spending</h3>
            <div class="text-2xl font-bold text-amber-400">
              {state.loading ? "..." : `$${state.usage.totalCost.toFixed(4)}`}
            </div>
            <p class="text-sm text-text-muted">
              {state.loading ? "" : `${state.usage.totalTokens.toLocaleString()} tokens`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <h3 class="font-medium mb-2">Quick Actions</h3>
            <div class="flex flex-wrap gap-2">
              <a href="/integrations"><Button size="sm">Add Provider</Button></a>
              <a href="/models"><Button size="sm" variant="outline">View Models</Button></a>
              <a href="/settings"><Button size="sm" variant="outline">Settings</Button></a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "ML Engine - Dashboard",
  meta: [{ name: "description", content: "ML/LLM Engineering Platform Dashboard" }],
};
