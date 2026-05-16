import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { api, PROVIDER_FEATURES } from "~/lib/api";

interface Model {
  id: string; name: string; provider: string; contextWindow: number; maxOutput: number;
  capabilities: Record<string, boolean>;
  pricing?: { prompt: number; completion: number };
}

export default component$(() => {
  const state = useStore<{ models: Model[]; loading: boolean; search: string }>({
    models: [], loading: true, search: "",
  });

  useVisibleTask$(async () => {
    try {
      const data = await api.get<{ models: Model[] }>("/models");
      state.models = data.models;
      state.loading = false;
    } catch { state.loading = false; }
  });

  const filtered = state.search
    ? state.models.filter(m => m.id.toLowerCase().includes(state.search.toLowerCase()) || m.name.toLowerCase().includes(state.search.toLowerCase()))
    : state.models;

  const fmtCtx = (n: number) => `${(n / 1000).toFixed(0)}K`;
  const fmtPrice = (n: number) => n === 0 ? "Free" : `$${n.toFixed(6)}`;

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Models</h1>
          <p class="text-text-muted">Discover and manage LLM models</p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline">Compare</Button>
          <Button onClick$={async () => {
            const instances = await api.get<{ instances: { id: string }[] }>("/providers/instances");
            for (const inst of instances.instances) {
              await api.post(`/providers/instances/${inst.id}/scan`);
            }
            const data = await api.get<{ models: Model[] }>("/models");
            state.models = data.models;
          }}>Scan All</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Model Catalog ({state.models.length})</CardTitle>
            <Input placeholder="Search models..." class="max-w-xs" 
              onInput$={(e) => state.search = (e.target as HTMLInputElement).value} />
          </div>
        </CardHeader>
        <CardContent>
          {state.loading ? <p class="text-text-muted text-center py-8">Loading models...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Pricing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div class="font-medium">{m.name}</div>
                      <div class="text-xs text-text-muted">{m.id}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{m.provider}</Badge></TableCell>
                    <TableCell class="text-sm">{fmtCtx(m.contextWindow)}</TableCell>
                    <TableCell>
                      <div class="flex gap-1 flex-wrap">
                        {PROVIDER_FEATURES.filter(f => m.capabilities[f.field]).map(f => (
                          <Badge key={f.label} variant="secondary" class="text-xs">{f.label}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell class="text-xs">
                      {m.pricing ? `${fmtPrice(m.pricing.prompt)} / ${fmtPrice(m.pricing.completion)}` : "—"}
                    </TableCell>
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

export const head: DocumentHead = { title: "ML Engine - Models" };
