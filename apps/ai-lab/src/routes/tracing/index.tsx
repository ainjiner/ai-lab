import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { api } from "~/lib/api";

export default component$(() => {
  const state = useStore<{ data: string; loading: boolean }>({ data: "", loading: true });

  useVisibleTask$(async () => {
    try {
      const res = await api.get<any>("/analytics/export?format=json");
      state.data = res.data;
      state.loading = false;
    } catch { state.loading = false; }
  });

  const records = (() => {
    try { return JSON.parse(state.data); } catch { return []; }
  })();

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Tracing</h1>
        <p class="text-text-muted">Request and response logs</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Request Logs ({records.length})</CardTitle></CardHeader>
        <CardContent>
          {state.loading ? <p class="text-text-muted">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow><TableCell colSpan={6} class="text-center text-text-muted">No usage data yet</TableCell></TableRow>
                ) : records.slice(0, 50).map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell class="text-xs">{r.timestamp ? new Date(r.timestamp + "Z").toLocaleString() : "—"}</TableCell>
                    <TableCell>{r.provider}</TableCell>
                    <TableCell class="text-xs">{r.model?.split("/").pop()}</TableCell>
                    <TableCell class="text-xs">{(r.tokens_prompt + r.tokens_completion)?.toLocaleString()}</TableCell>
                    <TableCell class="text-xs">${r.cost_total?.toFixed(6)}</TableCell>
                    <TableCell class="text-xs">{r.latency_ms}ms</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = { title: "ML Engine - Tracing" };
