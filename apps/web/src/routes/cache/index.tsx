import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { PeriodSelector } from "~/components/ui/search-filter";
import { AlertCard } from "~/components/ui/alert-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";

interface CacheStats {
  provider: string;
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  estimatedSavings: number;
  avgLatencyHit: number;
  avgLatencyMiss: number;
}

export default component$(() => {
  const state = useStore<{
    stats: CacheStats[];
    period: string;
    loading: boolean;
  }>({
    stats: [],
    period: "7d",
    loading: true,
  });

  const toast = useToast();

  useTask$(async () => {
    try {
      const res: any = await api.get("/cache/stats");
      const list = Array.isArray(res) ? res : res.stats || [];
      state.stats = list.map((s: any) => ({
        provider: s.provider || "unknown",
        hitRate: s.hitRate || 0,
        totalRequests: s.totalRequests || 0,
        cacheHits: s.cacheHits || 0,
        cacheMisses: s.cacheMisses || 0,
        estimatedSavings: s.estimatedSavings || 0,
        avgLatencyHit: s.avgLatencyHit || 0,
        avgLatencyMiss: s.avgLatencyMiss || 0,
      }));
    } catch (e) {
      state.stats = [];
      toast.error("Failed to load cache stats");
    } finally {
      state.loading = false;
    }
  });

  const totalStats = {
    requests: state.stats.reduce((acc, s) => acc + s.totalRequests, 0),
    hits: state.stats.reduce((acc, s) => acc + s.cacheHits, 0),
    misses: state.stats.reduce((acc, s) => acc + s.cacheMisses, 0),
    savings: state.stats.reduce((acc, s) => acc + s.estimatedSavings, 0),
    avgHitRate: state.stats.reduce((acc, s) => acc + s.hitRate, 0) / state.stats.length,
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <PageHeader
          title="Cache Analytics"
          description="Monitor prompt caching performance and cost savings"
        />
          <PeriodSelector
            periods={["daily", "weekly", "monthly"]}
            selected={state.period}
            onChange={$((p) => { state.period = p; })}
          />
      </div>

      <StatGrid cols={5}>
        {state.loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <StatCard key={i} value="" label="Loading...">
                <Skeleton class="h-4 w-20" />
              </StatCard>
            ))}
          </>
        ) : (
        <>
        <StatCard value={totalStats.requests.toLocaleString()} label="Total Requests" />
        <StatCard value={totalStats.hits.toLocaleString()} label="Cache Hits" valueColor="text-green-400" />
        <StatCard value={totalStats.misses.toLocaleString()} label="Cache Misses" valueColor="text-red-400" />
        <StatCard value={`${totalStats.avgHitRate.toFixed(1)}%`} label="Avg Hit Rate" />
        <StatCard value={`$${totalStats.savings.toFixed(2)}`} label="Est. Savings" valueColor="text-emerald-400" />
        </>
        )}
      </StatGrid>

      {state.stats.length === 0 && !state.loading && (
        <EmptyState
          title="No Cache Data"
          description="Cache statistics will appear here once data is available"
        />
      )}

      {state.stats.length > 0 && (
      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hit Rate by Provider</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            {state.stats.map((stat) => (
              <div key={stat.provider} class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium capitalize">{stat.provider}</span>
                  <span class={stat.hitRate >= 70 ? "text-green-400" : stat.hitRate >= 50 ? "text-yellow-400" : "text-red-400"}>
                    {stat.hitRate}%
                  </span>
                </div>
                <Progress value={stat.hitRate} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latency Comparison</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            {state.stats.map((stat) => (
              <div key={stat.provider} class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-surface-light">
                <span class="font-medium capitalize text-sm">{stat.provider}</span>
                <div class="flex items-center gap-4 text-sm">
                  <div class="text-right">
                    <p class="text-green-400">{stat.avgLatencyHit}ms</p>
                    <p class="text-xs text-text-muted">Cache Hit</p>
                  </div>
                  <div class="text-right">
                    <p class="text-red-400">{stat.avgLatencyMiss}ms</p>
                    <p class="text-xs text-text-muted">Cache Miss</p>
                  </div>
                  <div class="text-right">
                    <p class="text-emerald-400">-{Math.round((1 - stat.avgLatencyHit / stat.avgLatencyMiss) * 100)}%</p>
                    <p class="text-xs text-text-muted">Faster</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      )}

      {state.stats.length > 0 && (
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Provider Details</CardTitle>
            <Button variant="outline" size="sm">Export Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-surface-light">
                  <th class="text-left py-3 px-4 font-medium text-text-muted">Provider</th>
                  <th class="text-right py-3 px-4 font-medium text-text-muted">Total Requests</th>
                  <th class="text-right py-3 px-4 font-medium text-text-muted">Cache Hits</th>
                  <th class="text-right py-3 px-4 font-medium text-text-muted">Cache Misses</th>
                  <th class="text-right py-3 px-4 font-medium text-text-muted">Hit Rate</th>
                  <th class="text-right py-3 px-4 font-medium text-text-muted">Est. Savings</th>
                </tr>
              </thead>
              <tbody>
                {state.stats.map((stat) => (
                  <tr key={stat.provider} class="border-b border-surface-light/50 hover:bg-surface/50">
                    <td class="py-3 px-4 font-medium capitalize">{stat.provider}</td>
                    <td class="py-3 px-4 text-right">{stat.totalRequests.toLocaleString()}</td>
                    <td class="py-3 px-4 text-right text-green-400">{stat.cacheHits.toLocaleString()}</td>
                    <td class="py-3 px-4 text-right text-red-400">{stat.cacheMisses.toLocaleString()}</td>
                    <td class="py-3 px-4 text-right">
                      <span class={stat.hitRate >= 70 ? "text-green-400" : stat.hitRate >= 50 ? "text-yellow-400" : "text-red-400"}>
                        {stat.hitRate}%
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right text-emerald-400">${stat.estimatedSavings.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}

      {state.stats.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          {state.stats.filter((s) => s.hitRate < 50).map((stat) => (
            <AlertCard
              key={stat.provider}
              variant="warning"
              title={`${stat.provider} has low cache hit rate (${stat.hitRate}%)`}
              description="Consider increasing TTL or reviewing prompt patterns for caching opportunities."
            >
              <Button variant="outline" size="sm">Analyze</Button>
            </AlertCard>
          ))}
          {state.stats.filter((s) => s.hitRate >= 70).map((stat) => (
            <AlertCard
              key={stat.provider}
              variant="success"
              title={`${stat.provider} caching is well optimized (${stat.hitRate}% hit rate)`}
              description={`Estimated monthly savings: $${(stat.estimatedSavings * 4).toFixed(2)}`}
            />
          ))}
        </CardContent>
      </Card>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Cache Analytics",
};
