import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { api, PROVIDER_FEATURES } from "~/lib/api";

interface Provider { id: string; name: string; type: string; baseUrl: string; features: Record<string, boolean>; description?: string; }
interface Instance { id: string; providerId: string; name: string; enabled: boolean; modelsCount: number; lastScan?: string; apiKey?: string; }

interface PageState {
  providers: Provider[];
  instances: Instance[];
  loading: boolean;
  modal: "add" | "configure" | null;
  form: { providerId: string; name: string; apiKey: string; baseUrl: string; saving: boolean };
  active: Instance | null;
  actionLoading: string | null;
}

export default component$(() => {
  const loc = useLocation();
  const state = useStore<PageState>({
    providers: [], instances: [], loading: true,
    modal: null,
    form: { providerId: "", name: "", apiKey: "", baseUrl: "", saving: false },
    active: null,
    actionLoading: null,
  });

  const reload = $(async () => {
    const [p, i] = await Promise.all([
      api.get<{ providers: Provider[] }>("/providers"),
      api.get<{ instances: Instance[] }>("/providers/instances"),
    ]);
    state.providers = p.providers;
    state.instances = i.instances;
  });

  useTask$(async () => {
    try {
      await reload();
      state.loading = false;
      if (loc.url.searchParams.get("add") === "true") {
        state.modal = "add";
      }
    } catch {
      state.loading = false;
    }
  });

  const toast = useToast();

  const getInstance = (pid: string) => state.instances.find(i => i.providerId === pid);
  const maskKey = (key?: string) => key ? `${key.slice(0, 8)}...${key.slice(-4)}` : "—";

  return (
    <div class="space-y-8">

      {state.modal === "add" && (
        <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick$={(e) => { if ((e.target as HTMLElement).classList.contains("fixed")) state.modal = null; }}>
          <div class="bg-surface border border-surface-light rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Add Provider</h2>
              <button class="text-text-muted hover:text-foreground text-xl leading-none" onClick$={() => { state.modal = null; }}>×</button>
            </div>

            <div class="space-y-3">
              <div class="space-y-1">
                <label class="text-sm font-medium">Provider</label>
                <select
                  class="w-full rounded-md border border-surface-light bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange$={(e) => { state.form.providerId = (e.target as HTMLSelectElement).value; }}
                >
                  <option value="">Select a provider…</option>
                  {state.providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium">Instance name</label>
                <Input
                  placeholder="e.g. production"
                  value={state.form.name}
                  onInput$={(e) => { state.form.name = (e.target as HTMLInputElement).value; }}
                />
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium">API Key</label>
                <Input
                  type="password"
                  placeholder="sk-…"
                  value={state.form.apiKey}
                  onInput$={(e) => { state.form.apiKey = (e.target as HTMLInputElement).value; }}
                />
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium">Base URL <span class="text-text-muted font-normal">(optional)</span></label>
                <Input
                  placeholder="https://…"
                  value={state.form.baseUrl}
                  onInput$={(e) => { state.form.baseUrl = (e.target as HTMLInputElement).value; }}
                />
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <Button variant="outline" class="flex-1" onClick$={() => { state.modal = null; }}>Cancel</Button>
              <Button
                class="flex-1"
                disabled={state.form.saving || !state.form.providerId || !state.form.name || !state.form.apiKey}
                onClick$={async () => {
                  state.form.saving = true;
                  try {
                    await api.post("/providers/instances", {
                      providerId: state.form.providerId,
                      name: state.form.name,
                      apiKey: state.form.apiKey,
                      baseUrl: state.form.baseUrl || undefined,
                    });
                    state.modal = null;
                    state.form = { providerId: "", name: "", apiKey: "", baseUrl: "", saving: false };
                    await reload();
                    toast.success("Provider added successfully");
                  } catch (err) {
                    toast.error(String(err));
                  } finally {
                    state.form.saving = false;
                  }
                }}
              >
                {state.form.saving ? "Adding…" : "Add Provider"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {state.modal === "configure" && state.active && (
        <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick$={(e) => { if ((e.target as HTMLElement).classList.contains("fixed")) state.modal = null; }}>
          <div class="bg-surface border border-surface-light rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Configure — {state.active.id}</h2>
              <button class="text-text-muted hover:text-foreground text-xl leading-none" onClick$={() => { state.modal = null; }}>×</button>
            </div>

            <div class="text-sm text-text-muted space-y-1 bg-surface-light rounded-lg p-3">
              <div class="flex justify-between"><span>Instance ID</span><span class="text-foreground font-mono text-xs">{state.active.id}</span></div>
              <div class="flex justify-between"><span>Provider</span><span class="text-foreground">{state.active.providerId}</span></div>
              <div class="flex justify-between"><span>Name</span><span class="text-foreground">{state.active.name}</span></div>
              <div class="flex justify-between"><span>API Key</span><span class="text-foreground font-mono text-xs">{maskKey(state.active.apiKey)}</span></div>
              <div class="flex justify-between"><span>Models</span><span class="text-foreground">{state.active.modelsCount}</span></div>
              <div class="flex justify-between"><span>Status</span><Badge variant={state.active.enabled ? "success" : "secondary"}>{state.active.enabled ? "enabled" : "disabled"}</Badge></div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                disabled={!!state.actionLoading}
                onClick$={async () => {
                  if (!state.active) return;
                  state.actionLoading = "test";
                  try {
                    const res = await api.post<{ result: { success: boolean; latency?: number; error?: string } }>(`/providers/instances/${state.active.id}/test`);
                    if (res.result.success) {
                      toast.success(`Connected — ${res.result.latency}ms latency`);
                    } else {
                      toast.error(res.result.error || "Connection failed");
                    }
                  } catch (err) {
                    toast.error(String(err));
                  } finally {
                    state.actionLoading = null;
                  }
                }}
              >
                {state.actionLoading === "test" ? "Testing…" : "Test Connection"}
              </Button>

              <Button
                variant="outline"
                disabled={!!state.actionLoading}
                onClick$={async () => {
                  if (!state.active) return;
                  state.actionLoading = "scan";
                  try {
                    const res = await api.post<{ result: { models: unknown[]; error?: string } }>(`/providers/instances/${state.active.id}/scan`);
                    if (res.result.error) {
                      toast.error(res.result.error);
                    } else {
                      await reload();
                      const updated = state.instances.find(i => i.id === state.active?.id);
                      if (updated) state.active = updated;
                      toast.success(`Scan complete — ${res.result.models.length} models found`);
                    }
                  } catch (err) {
                    toast.error(String(err));
                  } finally {
                    state.actionLoading = null;
                  }
                }}
              >
                {state.actionLoading === "scan" ? "Scanning…" : "Scan Models"}
              </Button>

              <Button
                variant="outline"
                disabled={!!state.actionLoading}
                onClick$={async () => {
                  if (!state.active) return;
                  state.actionLoading = "toggle";
                  try {
                    await api.patch(`/providers/instances/${state.active.id}`, { enabled: !state.active.enabled });
                    await reload();
                    const updated = state.instances.find(i => i.id === state.active?.id);
                    if (updated) state.active = updated;
                    toast.success(`Instance ${updated?.enabled ? "enabled" : "disabled"}`);
                  } catch (err) {
                    toast.error(String(err));
                  } finally {
                    state.actionLoading = null;
                  }
                }}
              >
                {state.actionLoading === "toggle" ? "Saving…" : state.active.enabled ? "Disable" : "Enable"}
              </Button>

              <Button
                variant="outline"
                class="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/60"
                disabled={!!state.actionLoading}
                onClick$={async () => {
                  if (!state.active) return;
                  if (!confirm(`Remove instance "${state.active.id}"? This cannot be undone.`)) return;
                  state.actionLoading = "remove";
                  try {
                    await api.delete(`/providers/instances/${state.active.id}`);
                    state.modal = null;
                    state.active = null;
                    await reload();
                    toast.success("Instance removed");
                  } catch (err) {
                    toast.error(String(err));
                  } finally {
                    state.actionLoading = null;
                  }
                }}
              >
                {state.actionLoading === "remove" ? "Removing…" : "Remove"}
              </Button>
            </div>

            <Button variant="outline" class="w-full" onClick$={() => { state.modal = null; }}>Close</Button>
          </div>
        </div>
      )}

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Providers</h1>
          <p class="text-text-muted">Manage LLM providers and API keys</p>
        </div>
        <Button onClick$={() => {
          state.form = { providerId: "", name: "", apiKey: "", baseUrl: "", saving: false };
          state.modal = "add";
        }}>Add Provider</Button>
      </div>

      {state.loading ? (
        <p class="text-text-muted text-center py-8">Loading providers...</p>
      ) : state.providers.length === 0 ? (
        <EmptyState
          icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10.5v.5a1 1 0 001 1h3a1 1 0 001-1v-.5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10.5v-.5"
          title="No Providers Configured"
          description="Add your first LLM provider to get started with AI Lab."
        >
          <Button onClick$={() => { state.modal = "add"; }}>Add Provider</Button>
        </EmptyState>
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
                      <div class="flex justify-between"><span>Instance:</span><span class="text-foreground font-mono">{inst.id}</span></div>
                      <div class="flex justify-between"><span>Key:</span><span class="text-foreground">{maskKey(inst.apiKey)}</span></div>
                      <div class="flex justify-between"><span>Models:</span><span class="text-foreground">{inst.modelsCount}</span></div>
                      {inst.lastScan && <div class="flex justify-between"><span>Scanned:</span><span class="text-foreground">{new Date(inst.lastScan).toLocaleDateString()}</span></div>}
                    </div>
                  )}

                  <Button
                    variant={inst ? "secondary" : "default"}
                    class="w-full"
                    onClick$={() => {
                      if (inst) {
                        state.active = inst;
                        state.modal = "configure";
                      } else {
                        state.form = { providerId: p.id, name: "", apiKey: "", baseUrl: "", saving: false };
                        state.modal = "add";
                      }
                    }}
                  >
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

export const head: DocumentHead = { title: "AI Lab - Providers" };
