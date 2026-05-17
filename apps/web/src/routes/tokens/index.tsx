import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { api } from "~/lib/api";

export default component$(() => {
  const state = useStore<any>({
    summary: null,
    breakdown: null,
    loading: true,
    period: "monthly",
  });

  useTask$(async ({ track }) => {
    track(() => state.period);
    state.loading = true;
    try {
      const [summary, breakdown] = await Promise.all([
        api.get<any>(`/analytics/summary?period=${state.period}`),
        api.get<any>(`/analytics/breakdown?period=${state.period}`),
      ]);
      state.summary = summary;
      state.breakdown = breakdown;
    } catch (e) {
      console.error("Failed to load token usage stats:", e);
    } finally {
      state.loading = false;
    }
  });

  const promptTokens = state.summary?.summary?.promptTokens || 0;
  const completionTokens = state.summary?.summary?.completionTokens || 0;
  const totalTokens = state.summary?.summary?.totalTokens || (promptTokens + completionTokens || 1);
  
  const promptPct = (promptTokens / totalTokens) * 100;
  const completionPct = (completionTokens / totalTokens) * 100;

  const providers = state.breakdown?.byProvider || [];
  const maxProviderTokens = Math.max(...providers.map((p: any) => p.tokens), 0);
  
  const models = state.breakdown?.byModel || [];
  const maxModelTokens = Math.max(...models.map((m: any) => m.tokens), 0);

  return (
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Token Usage</h1>
          <p class="text-text-muted">Token consumption across providers and models</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="inline-flex rounded-lg border border-surface-light bg-surface p-1">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick$={() => { state.period = p; }}
                class={[
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize cursor-pointer",
                  state.period === p
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-muted hover:text-text"
                ]}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div class="pt-6">
              <div class="text-sm text-text-muted capitalize">{state.period} Tokens</div>
              <div class="text-2xl font-bold tabular-nums mt-1 text-primary">
                {state.loading ? "..." : (state.summary?.summary?.totalTokens || 0).toLocaleString()}
              </div>
              <p class="text-xs text-text-muted mt-1">Prompt + completion aggregate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div class="pt-6">
              <div class="text-sm text-text-muted">Prompt Volume</div>
              <div class="text-2xl font-bold tabular-nums mt-1 text-indigo-400">
                {state.loading ? "..." : (state.summary?.summary?.promptTokens || 0).toLocaleString()}
              </div>
              <p class="text-xs text-text-muted mt-1">Input tokens transmitted</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div class="pt-6">
              <div class="text-sm text-text-muted">Completion Volume</div>
              <div class="text-2xl font-bold tabular-nums mt-1 text-purple-400">
                {state.loading ? "..." : (state.summary?.summary?.completionTokens || 0).toLocaleString()}
              </div>
              <p class="text-xs text-text-muted mt-1">Output tokens generated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prompt vs Completion Split</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="pt-2 space-y-4">
            <div class="w-full h-5 rounded-lg overflow-hidden bg-surface-light flex">
              <div
                class="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${promptPct}%` }}
              />
              <div
                class="bg-purple-500 h-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm pt-2">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-indigo-500" />
                <span class="text-text-muted">Prompt Tokens:</span>
                <span class="font-bold text-indigo-200">
                  {state.loading ? "..." : `${promptTokens.toLocaleString()} (${promptPct.toFixed(1)}%)`}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-purple-500" />
                <span class="text-text-muted">Completion Tokens:</span>
                <span class="font-bold text-purple-200">
                  {state.loading ? "..." : `${completionTokens.toLocaleString()} (${completionPct.toFixed(1)}%)`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Token Consumption by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="pt-2 space-y-4">
              {state.loading ? (
                <p class="text-text-muted text-sm">Loading breakdown...</p>
              ) : providers.length === 0 ? (
                <p class="text-text-muted text-sm py-4 text-center">No provider token usage in this period.</p>
              ) : (
                providers.map((item: any) => {
                  const pct = maxProviderTokens > 0 ? (item.tokens / maxProviderTokens) * 100 : 0;
                  return (
                    <div key={item.name} class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span class="font-medium capitalize">{item.name}</span>
                        <div class="flex items-center gap-2 text-xs">
                          <span class="text-text-muted">{item.requests} reqs</span>
                          <span class="font-bold text-text">{item.tokens.toLocaleString()} tokens</span>
                        </div>
                      </div>
                      <div class="w-full h-2 rounded bg-surface-light overflow-hidden">
                        <div
                          class="h-full bg-indigo-500 rounded transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Consumption by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="pt-2 space-y-4">
              {state.loading ? (
                <p class="text-text-muted text-sm">Loading breakdown...</p>
              ) : models.length === 0 ? (
                <p class="text-text-muted text-sm py-4 text-center">No model token usage in this period.</p>
              ) : (
                models.map((item: any) => {
                  const pct = maxModelTokens > 0 ? (item.tokens / maxModelTokens) * 100 : 0;
                  return (
                    <div key={item.name} class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span class="font-medium truncate max-w-[240px]" title={item.name}>{item.name}</span>
                        <div class="flex items-center gap-2 text-xs">
                          <span class="text-text-muted">{item.requests} reqs</span>
                          <span class="font-bold text-text">{item.tokens.toLocaleString()} tokens</span>
                        </div>
                      </div>
                      <div class="w-full h-2 rounded bg-surface-light overflow-hidden">
                        <div
                          class="h-full bg-purple-500 rounded transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Latency by Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="pt-2">
            {state.loading ? (
              <p class="text-text-muted text-sm py-4">Loading latency data...</p>
            ) : providers.length === 0 ? (
              <p class="text-text-muted text-sm py-6 text-center">No latency data available.</p>
            ) : (
              <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {providers.map((p: any) => (
                  <div key={p.name} class="p-4 rounded-lg border border-surface-light bg-surface/40 flex flex-col justify-between space-y-2">
                    <div class="text-xs font-semibold text-text-muted uppercase tracking-wider capitalize">{p.name}</div>
                    <div class="flex items-baseline gap-1">
                      <span class="text-2xl font-bold tabular-nums text-cyan-400">{p.avgLatency}</span>
                      <span class="text-xs text-text-muted">ms</span>
                    </div>
                    <div class="text-[10px] text-text-muted">Calculated across {p.requests} calls</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Token Usage" };
