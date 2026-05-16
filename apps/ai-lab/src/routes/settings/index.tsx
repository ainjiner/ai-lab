import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/api";

interface Target { id: string; name: string; configPath: string; authPath?: string; enabled: boolean; }
interface Settings { minChunkSize: number; timeout: number; retries: number; defaultProvider?: string; defaultModel?: string; }

export default component$(() => {
  const state = useStore<{ targets: Target[]; settings: Settings; loading: boolean }>({
    targets: [], settings: { minChunkSize: 80, timeout: 60000, retries: 3 }, loading: true,
  });

  useVisibleTask$(async () => {
    try {
      const data = await api.get<{ targets: Target[]; settings: Settings }>("/config");
      state.targets = data.targets;
      state.settings = data.settings;
      state.loading = false;
    } catch { state.loading = false; }
  });

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
          <p class="text-text-muted">Configure ML Engine and sync targets</p>
        </div>
        <Button onClick$={async () => {
          await api.post("/config/sync-all");
          alert("Synced to all enabled targets");
        }}>Sync All</Button>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Config Targets</CardTitle></CardHeader>
          <CardContent>
            {state.loading ? <p class="text-text-muted">Loading...</p> : (
              <div class="space-y-3">
                {state.targets.map(t => (
                  <div key={t.id} class="flex items-center justify-between rounded-lg border border-surface-light bg-surface/50 p-3">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{t.name}</span>
                        <Badge variant={t.enabled ? "success" : "secondary"}>{t.enabled ? "enabled" : "disabled"}</Badge>
                      </div>
                      <span class="text-xs text-text-muted">{t.configPath}</span>
                    </div>
                    <div class="flex gap-2">
                      <Button variant="outline" size="sm" onClick$={async () => {
                        await api.post(`/config/targets/${t.id}/toggle?enabled=${!t.enabled}`);
                        state.targets = state.targets.map(tt => tt.id === t.id ? { ...tt, enabled: !t.enabled } : tt);
                      }}>
                        {t.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="outline" size="sm" disabled={!t.enabled}
                        onClick$={async () => { await api.post(`/config/targets/${t.id}/sync`); }}>
                        Sync
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Default Settings</CardTitle></CardHeader>
          <CardContent>
            <div class="space-y-4">
              {(["minChunkSize", "timeout", "retries"] as const).map(key => (
                <div key={key} class="space-y-2">
                  <label class="text-sm font-medium">{key}</label>
                  <Input type="number" value={state.settings[key] as number}
                    onChange$={(e) => { (state.settings as any)[key] = parseInt((e.target as HTMLInputElement).value); }} />
                </div>
              ))}
              <Button onClick$={async () => {
                await api.post("/config/settings", {
                  minChunkSize: String(state.settings.minChunkSize),
                  timeout: String(state.settings.timeout),
                  retries: String(state.settings.retries),
                });
              }}>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = { title: "ML Engine - Settings" };
