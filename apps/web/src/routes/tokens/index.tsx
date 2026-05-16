import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { api } from "~/lib/api";

export default component$(() => {
  const state = useStore<{ summary: any; breakdown: any; loading: boolean }>({
    summary: null, breakdown: null, loading: true,
  });

  useVisibleTask$(async () => {
    try {
      const [summary, breakdown] = await Promise.all([
        api.get("/analytics/summary?period=monthly"),
        api.get("/analytics/breakdown?period=monthly"),
      ]);
      state.summary = summary;
      state.breakdown = breakdown;
      state.loading = false;
    } catch { state.loading = false; }
  });

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Token Usage</h1>
        <p class="text-text-muted">Token consumption across providers and models</p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        {state.summary && [
          { label: "Total Tokens", value: state.summary.summary.totalTokens.toLocaleString() },
          { label: "Prompt Tokens", value: state.summary.summary.promptTokens.toLocaleString() },
          { label: "Completion Tokens", value: state.summary.summary.completionTokens.toLocaleString() },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent class="pt-6">
              <div class="text-sm text-text-muted">{s.label}</div>
              <div class="text-2xl font-bold tabular-nums">{state.loading ? "..." : s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>By Provider</CardTitle></CardHeader>
        <CardContent>
          {state.breakdown?.breakdown?.byProvider?.length > 0 ? (
            <div class="space-y-3">
              {state.breakdown.breakdown.byProvider.map((p: any) => (
                <div key={p.name} class="flex items-center justify-between border-b border-surface-light pb-2">
                  <span class="font-medium">{p.name}</span>
                  <div class="flex gap-4 text-sm">
                    <span>{p.tokens.toLocaleString()} tokens</span>
                    <span>${p.cost.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p class="text-text-muted">No usage data yet</p>}
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = { title: "ML Engine - Token Usage" };
