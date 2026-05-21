import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Tooltip } from "~/components/ui";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { PeriodSelector } from "~/components/ui/search-filter";
import { EmptyState } from "~/components/ui/empty-state";
import { Spinner } from "~/components/ui/spinner";
import { api } from "~/lib/api";

interface TokenSummary {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  avgLatency: number;
}

interface SummaryAPIResponse {
  summary: TokenSummary;
}

interface TokenBreakdownItem {
  name: string;
  tokens: number;
  requests: number;
  avgLatency?: number;
}

interface BreakdownAPIResponse {
  breakdown: {
    byProvider: TokenBreakdownItem[];
    byModel: TokenBreakdownItem[];
  };
}

interface TokensState {
  summary: SummaryAPIResponse | null;
  breakdown: BreakdownAPIResponse["breakdown"] | null;
  loading: boolean;
  period: "daily" | "weekly" | "monthly";
}

export default component$(() => {
  const state = useStore<TokensState>({
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
        api.get<SummaryAPIResponse>(`/analytics/summary?period=${state.period}`),
        api.get<BreakdownAPIResponse>(`/analytics/breakdown?period=${state.period}`),
      ]);
      state.summary = summary;
      state.breakdown = breakdown.breakdown;
    } catch (err) {
      console.error("Failed to load token usage stats:", err);
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
  const maxProviderTokens = Math.max(...providers.map((p: TokenBreakdownItem) => p.tokens), 0);
  
  const models = state.breakdown?.byModel || [];
  const maxModelTokens = Math.max(...models.map((m: TokenBreakdownItem) => m.tokens), 0);

  return (
    <div class="space-y-8">
      <PageHeader title="Token Usage" description="Token consumption across providers and models">
        <PeriodSelector
          periods={["daily", "weekly", "monthly"]}
          selected={state.period}
          onChange={$((p: string) => { state.period = p as "daily" | "weekly" | "monthly"; })}
        />
      </PageHeader>

      {totalTokens > 10000000 ? (
        <div class="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/20 px-5 py-4">
          <svg class="h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="text-sm font-semibold text-red-400">Critical Token Usage</p>
            <p class="text-xs text-red-300/70">You've used {(totalTokens / 1000000).toFixed(1)}M tokens this period. Consider optimizing your prompts or setting budget limits.</p>
          </div>
        </div>
      ) : totalTokens > 1000000 ? (
        <div class="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 px-5 py-4">
          <svg class="h-5 w-5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="text-sm font-semibold text-amber-400">High Token Usage</p>
            <p class="text-xs text-amber-300/70">You've used {(totalTokens / 1000000).toFixed(1)}M tokens this period. Monitor your usage to avoid unexpected costs.</p>
          </div>
        </div>
      ) : null}

      <StatGrid cols={3}>
        <StatCard
          value={state.loading ? "..." : (state.summary?.summary?.totalTokens || 0).toLocaleString()}
          label={`${state.period} Tokens`}
          valueColor="text-primary tabular-nums"
        >
          <p class="text-xs text-text-muted mt-1">Prompt + completion aggregate</p>
        </StatCard>

        <StatCard
          value={state.loading ? "..." : (state.summary?.summary?.promptTokens || 0).toLocaleString()}
          label="Prompt Volume"
          valueColor="text-indigo-400 tabular-nums"
        >
          <p class="text-xs text-text-muted mt-1">Input tokens transmitted</p>
        </StatCard>

        <StatCard
          value={state.loading ? "..." : (state.summary?.summary?.completionTokens || 0).toLocaleString()}
          label="Completion Volume"
          valueColor="text-purple-400 tabular-nums"
        >
          <p class="text-xs text-text-muted mt-1">Output tokens generated</p>
        </StatCard>
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Prompt vs Completion Split</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="pt-2 space-y-4">
            <div class="w-full h-4 rounded-lg overflow-hidden bg-surface-light flex">
              <div
                class="bg-primary h-full transition-all duration-500"
                style={{ width: `${promptPct}%` }}
              />
              <div
                class="bg-primary/40 h-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm pt-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-primary" />
                <span class="text-text-muted">Prompt Tokens:</span>
                <span class="font-medium text-text">
                  {state.loading ? "..." : `${promptTokens.toLocaleString()} (${promptPct.toFixed(1)}%)`}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-primary/40" />
                <span class="text-text-muted">Completion Tokens:</span>
                <span class="font-medium text-text">
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
                <div class="flex items-center justify-center py-4"><Spinner size="sm" /></div>
              ) : providers.length === 0 ? (
                <EmptyState title="No provider token usage" description="No provider token usage in this period" />
              ) : (
                providers.map((item: TokenBreakdownItem) => {
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
                          class="h-full bg-primary rounded transition-all duration-300"
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
                <div class="flex items-center justify-center py-4"><Spinner size="sm" /></div>
              ) : models.length === 0 ? (
                <EmptyState title="No model token usage" description="No model token usage in this period" />
              ) : (
                models.map((item: TokenBreakdownItem) => {
                  const pct = maxModelTokens > 0 ? (item.tokens / maxModelTokens) * 100 : 0;
                  return (
                    <div key={item.name} class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <Tooltip content={item.name} position="top" class="max-w-[240px] truncate block"><span class="font-medium block truncate">{item.name}</span></Tooltip>
                        <div class="flex items-center gap-2 text-xs">
                          <span class="text-text-muted">{item.requests} reqs</span>
                          <span class="font-bold text-text">{item.tokens.toLocaleString()} tokens</span>
                        </div>
                      </div>
                      <div class="w-full h-2 rounded bg-surface-light overflow-hidden">
                        <div
                          class="h-full bg-primary/60 rounded transition-all duration-300"
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
              <div class="flex items-center justify-center py-4"><Spinner size="sm" /></div>
            ) : providers.length === 0 ? (
              <EmptyState title="No latency data available" description="No provider latency data in this period" />
            ) : (
              <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {providers.map((p: TokenBreakdownItem) => (
                  <div key={p.name} class="p-4 rounded-lg border border-surface-light bg-surface/40 flex flex-col justify-between space-y-2">
                    <div class="text-xs font-semibold text-text-muted uppercase tracking-wider capitalize">{p.name}</div>
                    <div class="flex items-baseline gap-1">
                      <span class="text-2xl font-bold tabular-nums text-text">{p.avgLatency}</span>
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
