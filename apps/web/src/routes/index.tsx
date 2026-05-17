import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";

interface DashboardState {
  providers: number;
  models: number;
  instances: number;
  targets: number;
  experiments: number;
  usage: { totalCost: number; totalTokens: number };
  loading: boolean;
  apiHealth: "online" | "offline" | "loading";
  syncingOpenCode: boolean;
  recentExperiments: any[];
}

export default component$(() => {
  const toast = useToast();
  
  const state = useStore<DashboardState>({
    providers: 0,
    models: 0,
    instances: 0,
    targets: 0,
    experiments: 0,
    usage: { totalCost: 0, totalTokens: 0 },
    loading: true,
    apiHealth: "loading",
    syncingOpenCode: false,
    recentExperiments: [],
  });

  useTask$(async () => {
    try {
      const health = await api.get<any>("/health");
      if (health && health.status === "ok") {
        state.apiHealth = "online";
      } else {
        state.apiHealth = "offline";
      }
    } catch {
      state.apiHealth = "offline";
    }

    try {
      const [providers, models, instances, config, experiments, analytics, experimentsList] = await Promise.all([
        api.get<{ providers: unknown[] }>("/providers"),
        api.get<{ total: number }>("/models"),
        api.get<{ instances: unknown[] }>("/providers/instances"),
        api.get<{ targets: unknown[] }>("/config"),
        api.get<{ total: number }>("/experiments"),
        api.get<{ summary: { totalCost: number; totalTokens: number } }>("/analytics/summary"),
        api.get<{ experiments: unknown[] }>("/experiments"),
      ]);

      state.providers = providers.providers.length;
      state.models = models.total;
      state.instances = instances.instances.length;
      state.targets = config.targets.length;
      state.experiments = experiments.total;
      state.usage = analytics.summary;
      state.recentExperiments = (experimentsList.experiments || []).slice(0, 5);
      state.loading = false;
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
      state.loading = false;
    }
  });

  return (
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p class="text-text-muted">ML/LLM Engineering Platform</p>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-light bg-surface/50 text-xs font-semibold self-start sm:self-auto">
          <span class="relative flex h-2 w-2">
            <span class={[
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              state.apiHealth === "online" && "bg-emerald-400",
              state.apiHealth === "offline" && "bg-red-400",
              state.apiHealth === "loading" && "bg-amber-400"
            ]}></span>
            <span class={[
              "relative inline-flex rounded-full h-2 w-2",
              state.apiHealth === "online" && "bg-emerald-500",
              state.apiHealth === "offline" && "bg-red-500",
              state.apiHealth === "loading" && "bg-amber-500"
            ]}></span>
          </span>
          <span class={[
            state.apiHealth === "online" && "text-emerald-400",
            state.apiHealth === "offline" && "text-red-400",
            state.apiHealth === "loading" && "text-amber-400"
          ]}>
            API {state.apiHealth === "online" ? "Online" : state.apiHealth === "offline" ? "Offline" : "Checking..."}
          </span>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div class="pt-6 flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Configured Instances</span>
              <span class="text-3xl font-bold tabular-nums text-success">
                {state.loading ? "..." : state.instances}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div class="pt-6 flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Discovered Models</span>
              <span class="text-3xl font-bold tabular-nums text-warning">
                {state.loading ? "..." : state.models}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div class="pt-6 flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Experiments Executed</span>
              <span class="text-3xl font-bold tabular-nums text-info">
                {state.loading ? "..." : state.experiments}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div class="pt-6 flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Monthly Spend</span>
              <span class="text-3xl font-bold tabular-nums text-amber-400">
                {state.loading ? "..." : `$${(state.usage.totalCost || 0).toFixed(4)}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div class="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="pt-2">
                {state.loading ? (
                  <p class="text-text-muted text-sm py-4">Loading activity...</p>
                ) : state.recentExperiments.length === 0 ? (
                  <p class="text-text-muted text-sm py-8 text-center bg-surface/20 rounded-lg border border-dashed border-surface-light">
                    No recent activity. Create a new experiment to begin tracking!
                  </p>
                ) : (
                  <div class="divide-y divide-surface-light">
                    {state.recentExperiments.map((item: any) => {
                      let badgeVariant: any = "secondary";
                      if (item.status === "completed") badgeVariant = "success";
                      else if (item.status === "running" || item.status === "pending") badgeVariant = "warning";
                      else if (item.status === "failed") badgeVariant = "destructive";

                      return (
                        <div key={item.id} class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div class="space-y-1 pr-4">
                            <div class="flex items-center gap-2 flex-wrap">
                              <span class="font-semibold text-sm text-text">{item.name}</span>
                              <Badge variant={badgeVariant} class="capitalize text-[10px] py-0 px-1.5">{item.status}</Badge>
                            </div>
                            <div class="text-xs text-text-muted font-mono">{item.model.provider} / {item.model.model}</div>
                          </div>
                          <div class="text-right">
                            <div class="text-xs font-bold text-amber-400 tabular-nums">
                              {item.results?.cost ? `$${parseFloat(item.results.cost).toFixed(6)}` : "—"}
                            </div>
                            {item.results?.latency && (
                              <div class="text-[10px] text-text-muted tabular-nums">{item.results.latency}ms</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="pt-2 flex flex-col gap-3">
                <Link href="/integrations?add=true" class="contents">
                  <Button class="w-full justify-start cursor-pointer text-left" size="sm">
                    <span>➕ Add Provider</span>
                  </Button>
                </Link>
                <Link href="/experiments?new=true" class="contents">
                  <Button class="w-full justify-start cursor-pointer text-left" variant="outline" size="sm">
                    <span>🔬 New Experiment</span>
                  </Button>
                </Link>
                <Button
                  class="w-full justify-start cursor-pointer text-left"
                  variant="outline"
                  size="sm"
                  disabled={state.syncingOpenCode}
                  onClick$={async () => {
                    state.syncingOpenCode = true;
                    try {
                      await api.post("/config/targets/opencode/sync");
                      await toast.success("Synced to OpenCode! ✅");
                    } catch (err) {
                      await toast.error(`Failed to sync: ${String(err)}`);
                    } finally {
                      state.syncingOpenCode = false;
                    }
                  }}
                >
                  {state.syncingOpenCode ? (
                    <div class="flex items-center gap-1.5">
                      <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Syncing...</span>
                    </div>
                  ) : (
                    <span>🔄 Sync OpenCode</span>
                  )}
                </Button>
                <Link href="/models" class="contents">
                  <Button class="w-full justify-start cursor-pointer text-left" variant="outline" size="sm">
                    <span>🤖 View Models</span>
                  </Button>
                </Link>
                <Link href="/settings" class="contents">
                  <Button class="w-full justify-start cursor-pointer text-left" variant="outline" size="sm">
                    <span>⚙️ System Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Dashboard",
  meta: [{ name: "description", content: "ML/LLM Engineering Platform Dashboard" }],
};
