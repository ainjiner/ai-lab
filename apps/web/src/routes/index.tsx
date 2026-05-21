import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { Spinner } from "~/components/ui/spinner";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";

interface RecentExperiment {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "archived";
  model: { provider: string; model: string };
  results?: {
    cost?: number;
    latency?: number;
  };
}

interface HealthAPIResponse {
  status: "ok" | "error";
}

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
  recentExperiments: RecentExperiment[];
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
      const health = await api.get<HealthAPIResponse>("/health");
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
        api.get<{ experiments: RecentExperiment[] }>("/experiments"),
      ]);

      state.providers = providers.providers.length;
      state.models = models.total;
      state.instances = instances.instances.length;
      state.targets = config.targets.length;
      state.experiments = experiments.total;
      state.usage = analytics.summary;
      state.recentExperiments = (experimentsList.experiments || []).slice(0, 5);
      state.loading = false;
    } catch {
      state.loading = false;
      toast.error("Failed to load dashboard");
    }
  });

  return (
    <div class="space-y-8">
      <PageHeader title="Dashboard" description="ML/LLM Engineering Platform">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-light bg-surface/50 text-xs font-semibold self-start sm:self-auto">
          <span class="relative flex h-2 w-2">
            <span class={[
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              state.apiHealth === "online" && "bg-success",
              state.apiHealth === "offline" && "bg-red-400",
              state.apiHealth === "loading" && "bg-warning"
            ]}></span>
            <span class={[
              "relative inline-flex rounded-full h-2 w-2",
              state.apiHealth === "online" && "bg-success",
              state.apiHealth === "offline" && "bg-red-500",
              state.apiHealth === "loading" && "bg-warning"
            ]}></span>
          </span>
          <span class={[
            state.apiHealth === "online" && "text-success",
            state.apiHealth === "offline" && "text-red-400",
            state.apiHealth === "loading" && "text-warning"
          ]}>
            API {state.apiHealth === "online" ? "Online" : state.apiHealth === "offline" ? "Offline" : "Checking..."}
          </span>
        </div>
      </PageHeader>

      <StatGrid cols={4}>
        {state.loading ? (
          <>
            <div class="p-4 rounded-xl border border-surface-light bg-surface/40">
              <Skeleton class="h-8 w-16 mb-2" />
              <Skeleton class="h-4 w-32" />
            </div>
            <div class="p-4 rounded-xl border border-surface-light bg-surface/40">
              <Skeleton class="h-8 w-16 mb-2" />
              <Skeleton class="h-4 w-32" />
            </div>
            <div class="p-4 rounded-xl border border-surface-light bg-surface/40">
              <Skeleton class="h-8 w-16 mb-2" />
              <Skeleton class="h-4 w-32" />
            </div>
            <div class="p-4 rounded-xl border border-surface-light bg-surface/40">
              <Skeleton class="h-8 w-20 mb-2" />
              <Skeleton class="h-4 w-24" />
            </div>
          </>
        ) : (
          <>
            <StatCard
              value={state.instances}
              label="Configured Instances"
              valueColor="text-success tabular-nums"
            />
            <StatCard
              value={state.models}
              label="Discovered Models"
              valueColor="text-warning tabular-nums"
            />
            <StatCard
              value={state.experiments}
              label="Experiments Executed"
              valueColor="text-info tabular-nums"
            />
            <StatCard
              value={`$${(state.usage.totalCost || 0).toFixed(4)}`}
              label="Monthly Spend"
              valueColor="text-amber-400 tabular-nums"
            />
          </>
        )}
      </StatGrid>

      <div class="grid gap-6 md:grid-cols-3">
        <div class="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="pt-2">
                {state.loading ? (
                  <div class="flex items-center justify-center py-4"><Spinner size="sm" /></div>
                ) : state.recentExperiments.length === 0 ? (
                  <EmptyState title="No recent activity" description="Create a new experiment to begin tracking!" />
                ) : (
                  <div class="divide-y divide-surface-light">
                    {state.recentExperiments.map((item: RecentExperiment) => {
                      let badgeVariant: "secondary" | "success" | "warning" | "destructive" = "secondary";
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
                            <div class="text-xs font-bold text-warning tabular-nums">
                              {item.results?.cost ? `$${item.results.cost.toFixed(6)}` : "—"}
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
                      <Spinner size="sm" />
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
