import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { api } from "~/lib/api";

interface Experiment {
  id: string; name: string; description?: string; status: string;
  model: { provider: string; model: string };
  results?: { tokens: { total: number }; cost: number; latency: number };
  metadata: { createdAt: string; tags: string[]; rating?: number };
}

export default component$(() => {
  const state = useStore<{ experiments: Experiment[]; loading: boolean }>({ experiments: [], loading: true });

  useVisibleTask$(async () => {
    try {
      const data = await api.get<{ experiments: Experiment[] }>("/experiments");
      state.experiments = data.experiments;
      state.loading = false;
    } catch { state.loading = false; }
  });

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Experiments</h1>
          <p class="text-text-muted">Track and compare LLM experiments</p>
        </div>
        <Button>New Experiment</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Run History ({state.experiments.length})</CardTitle></CardHeader>
        <CardContent>
          {state.loading ? <p class="text-text-muted text-center py-8">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.experiments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell class="font-medium">{e.name}</TableCell>
                    <TableCell><span class="text-xs">{e.model.model.split("/").pop()}</span></TableCell>
                    <TableCell>
                      <Badge variant={e.status === "completed" ? "success" : e.status === "running" ? "warning" : "secondary"}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell class="text-xs">{e.results?.tokens.total.toLocaleString() || "—"}</TableCell>
                    <TableCell class="text-xs">${e.results?.cost?.toFixed(6) || "—"}</TableCell>
                    <TableCell class="text-xs">{e.results?.latency ? `${e.results.latency}ms` : "—"}</TableCell>
                    <TableCell class="text-xs">{new Date(e.metadata.createdAt).toLocaleDateString()}</TableCell>
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

export const head: DocumentHead = { title: "ML Engine - Experiments" };
