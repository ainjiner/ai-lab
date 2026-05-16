import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/lib/api";

export default component$(() => {
  const state = useStore<any>({ summary: null, projection: null, budgets: [], loading: true });

  useVisibleTask$(async () => {
    try {
      const [a, c, b] = await Promise.all([
        api.get("/analytics/summary?period=monthly"),
        api.get("/analytics/projection?days=30"),
        api.get("/budgets"),
      ]);
      state.summary = a;
      state.projection = c;
      state.budgets = b.budgets;
      state.loading = false;
    } catch { state.loading = false; }
  });

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Cost</h1>
        <p class="text-text-muted">Spending analysis and budget tracking</p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        {state.summary && [
          { label: "Monthly Spend", value: `$${state.summary.summary.totalCost.toFixed(4)}`, color: "text-amber-400" },
          { label: "Request Count", value: state.summary.summary.requestCount, color: "text-primary" },
          { label: "Avg Latency", value: `${state.summary.summary.avgLatency}ms`, color: "text-info" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent class="pt-6">
              <div class="text-sm text-text-muted">{s.label}</div>
              <div class={`text-2xl font-bold tabular-nums ${s.color}`}>{state.loading ? "..." : s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Projection</CardTitle></CardHeader>
        <CardContent>
          {state.projection ? (
            <div class="space-y-3">
              <div class="flex justify-between"><span>Current monthly</span><span>${state.projection.projection.currentTotal.toFixed(4)}</span></div>
              <div class="flex justify-between"><span>Projected 30 days</span><span className="font-bold">${state.projection.projection.projected.toFixed(4)}</span></div>
            </div>
          ) : <p class="text-text-muted">Loading...</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Budgets</CardTitle></CardHeader>
        <CardContent>
          {state.budgets.length === 0 ? (
            <p class="text-text-muted">No budgets configured</p>
          ) : state.budgets.map((b: any) => (
            <div key={b.id} class="flex items-center justify-between py-2 border-b border-surface-light last:border-0">
              <div>
                <span class="font-medium">{b.name}</span>
                <span class="text-xs text-text-muted ml-2">/{b.period}</span>
              </div>
              <div class="flex items-center gap-3">
                <span>${b.limit.toFixed(2)}</span>
                <Badge variant={b.enabled ? "success" : "secondary"}>{b.enabled ? "active" : "disabled"}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = { title: "ML Engine - Cost" };
