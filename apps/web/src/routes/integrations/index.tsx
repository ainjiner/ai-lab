import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api, PROVIDER_FEATURES } from "~/lib/api";

interface Provider { id: string; name: string; type: string; baseUrl: string; features: Record<string, boolean>; description?: string; }
interface Instance { id: string; providerId: string; name: string; enabled: boolean; modelsCount: number; lastScan?: string; apiKey?: string; }

export default component$(() => {
  const state = useStore<{ providers: Provider[]; instances: Instance[]; loading: boolean }>({
    providers: [], instances: [], loading: true,
  });

  useVisibleTask$(async () => {
    try {
      const [p, i] = await Promise.all([
        api.get<{ providers: Provider[] }>("/providers"),
        api.get<{ instances: Instance[] }>("/providers/instances"),
      ]);
      state.providers = p.providers;
      state.instances = i.instances;
      state.loading = false;
    } catch { state.loading = false; }
  });

  const getInstance = (pid: string) => state.instances.find(i => i.providerId === pid);
  const maskKey = (key?: string) => key ? `${key.slice(0, 8)}...${key.slice(-4)}` : "—";

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Providers</h1>
          <p class="text-text-muted">Manage LLM providers and API keys</p>
        </div>
        <Button>Add Provider</Button>
      </div>

      {state.loading ? (
        <p class="text-text-muted text-center py-8">Loading providers...</p>
      ) : (
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.providers.map((p) => {
            const inst = getInstance(p.id);
            return (
              <Card key={p.id}>
                <CardHeader>
                  <div class="flex items-start justify-between">
                    <div>
                      <CardTitle>{p.name}</CardTitle>
                      <Badge variant={inst ? "success" : "secondary"} class="mt-1">
                        {inst ? "connected" : "available"}
                      </Badge>
                    </div>
                    <span class="text-xs text-text-muted bg-surface-light px-2 py-1 rounded">{p.type}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p class="text-xs text-text-muted mb-2 truncate">{p.baseUrl}</p>
                  {p.description && <p class="text-xs text-text-muted mb-3">{p.description}</p>}

                  <div class="flex flex-wrap gap-1 mb-3">
                    {PROVIDER_FEATURES.filter(f => p.features[f.field]).map(f => (
                      <span key={f.label} class={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${f.color}`}>{f.label}</span>
                    ))}
                  </div>

                  {inst && (
                    <div class="text-xs text-text-muted mb-3 space-y-0.5 border-t border-surface-light pt-2">
                      <div class="flex justify-between"><span>Instance:</span><span class="text-foreground">{inst.id}</span></div>
                      <div class="flex justify-between"><span>Key:</span><span class="text-foreground">{maskKey(inst.apiKey)}</span></div>
                      <div class="flex justify-between"><span>Models:</span><span class="text-foreground">{inst.modelsCount}</span></div>
                      {inst.lastScan && <div class="flex justify-between"><span>Scanned:</span><span class="text-foreground">{new Date(inst.lastScan).toLocaleDateString()}</span></div>}
                    </div>
                  )}

                  <Button variant={inst ? "secondary" : "default"} class="w-full">
                    {inst ? "Configure" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = { title: "ML Engine - Providers" };
