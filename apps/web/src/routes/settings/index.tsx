import { component$, useStore, useVisibleTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";
import { Skeleton } from "~/components/ui/skeleton";

interface Target {
  id: string;
  name: string;
  configPath: string;
  authPath?: string;
  enabled: boolean;
  lastSynced?: string | null;
}

interface Settings {
  minChunkSize: number;
  timeout: number;
  retries: number;
  defaultProvider?: string;
  defaultModel?: string;
}

export default component$(() => {
  const toast = useToast();
  
  const state = useStore<any>({
    targets: [],
    settings: { minChunkSize: 80, timeout: 60000, retries: 3 },
    loading: true,
    syncingAll: false,
    syncingTargetId: null,
    validatingTargetId: null,
    previewTarget: null,
  });

  const loadData = $(async () => {
    try {
      const data = await api.get<{ targets: Target[]; settings: Settings }>("/config");
      state.targets = data.targets;
      state.settings = data.settings;
    } catch (e) {
      console.error("Failed to load settings data:", e);
    }
  });

  useVisibleTask$(async () => {
    state.loading = true;
    try {
      await loadData();
    } catch {
      state.loading = false;
    } finally {
      state.loading = false;
    }
  });

  const formatLastSynced = (lastSynced?: string | null) => {
    if (!lastSynced) return "Never synced";
    try {
      const date = new Date(lastSynced);
      if (isNaN(date.getTime())) return "Never synced";
      
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (seconds < 5) return "Synced: Just now";
      if (seconds < 60) return `Synced: ${seconds} secs ago`;
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `Synced: ${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `Synced: ${hours} ${hours === 1 ? "hr" : "hrs"} ago`;
      
      return `Synced: ${date.toLocaleString()}`;
    } catch {
      return "Never synced";
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
          <p class="text-text-muted">Configure ML Engine and sync targets</p>
        </div>
        
        <Button
          disabled={state.syncingAll}
          onClick$={async () => {
            state.syncingAll = true;
            try {
              await api.post("/config/sync-all");
              await loadData();
              await toast.success("Successfully synced all enabled targets! ✅");
            } catch {
              await toast.error("Failed to sync all targets");
            } finally {
              state.syncingAll = false;
            }
          }}
        >
          {state.syncingAll ? (
            <div class="flex items-center gap-1.5">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Syncing...</span>
            </div>
          ) : (
            <span>Sync All</span>
          )}
        </Button>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Config Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="pt-2">
              {state.loading ? (
                <div class="space-y-4">
                  <div class="flex flex-col gap-3 rounded-lg border border-surface-light bg-surface/50 p-4">
                    <div class="flex items-start justify-between">
                      <div class="space-y-2">
                        <Skeleton class="h-5 w-24" />
                        <Skeleton class="h-3 w-48" />
                      </div>
                      <div class="flex gap-2">
                        <Skeleton class="h-8 w-16" />
                        <Skeleton class="h-8 w-16" />
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-3 rounded-lg border border-surface-light bg-surface/50 p-4">
                    <div class="flex items-start justify-between">
                      <div class="space-y-2">
                        <Skeleton class="h-5 w-32" />
                        <Skeleton class="h-3 w-36" />
                      </div>
                      <div class="flex gap-2">
                        <Skeleton class="h-8 w-16" />
                        <Skeleton class="h-8 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div class="space-y-4">
                  {state.targets.map((t: Target) => (
                    <div key={t.id} class="flex flex-col gap-3 rounded-lg border border-surface-light bg-surface/50 p-4">
                      <div class="flex items-start justify-between">
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="font-medium text-text">{t.name}</span>
                            <Badge variant={t.enabled ? "success" : "secondary"}>
                              {t.enabled ? "enabled" : "disabled"}
                            </Badge>
                          </div>
                          <div class="text-xs text-text-muted mt-1 select-all truncate max-w-[280px]" title={t.configPath}>
                            {t.configPath}
                          </div>
                        </div>
                        <span class="text-[10px] font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/30">
                          {formatLastSynced(t.lastSynced)}
                        </span>
                      </div>

                      <div class="flex gap-2 flex-wrap items-center justify-end border-t border-surface-light/40 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick$={async () => {
                            try {
                              const res = await api.get<any>(`/config/preview/${t.id}`);
                              state.previewTarget = res.preview;
                            } catch (err) {
                              await toast.error(`Failed to load config preview: ${String(err)}`);
                            }
                          }}
                        >
                          Preview
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={state.validatingTargetId === t.id}
                          onClick$={async () => {
                            state.validatingTargetId = t.id;
                            try {
                              const res = await api.post<any>(`/config/targets/${t.id}/validate`);
                              if (res.valid) {
                                await toast.success("Configuration is 100% clean and valid! ✅");
                              } else {
                                await toast.error(`Validation errors: ${res.errors.join(", ")}`);
                              }
                            } catch (err) {
                              await toast.error(`Validation failed: ${String(err)}`);
                            } finally {
                              state.validatingTargetId = null;
                            }
                          }}
                        >
                          {state.validatingTargetId === t.id ? "Validating..." : "Validate"}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick$={async () => {
                            try {
                              await api.post(`/config/targets/${t.id}/toggle?enabled=${!t.enabled}`);
                              state.targets = state.targets.map((tt: Target) =>
                                tt.id === t.id ? { ...tt, enabled: !t.enabled } : tt
                              );
                              await toast.success(`${t.name} has been ${!t.enabled ? "enabled" : "disabled"}!`);
                            } catch {
                              await toast.error(`Failed to update ${t.name} state`);
                            }
                          }}
                        >
                          {t.enabled ? "Disable" : "Enable"}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!t.enabled || state.syncingTargetId === t.id}
                          onClick$={async () => {
                            state.syncingTargetId = t.id;
                            try {
                              await api.post(`/config/targets/${t.id}/sync`);
                              await loadData();
                              await toast.success(`Synced successfully to ${t.name}! ✅`);
                            } catch {
                              await toast.error(`Failed to sync to ${t.name}`);
                            } finally {
                              state.syncingTargetId = null;
                            }
                          }}
                        >
                          {state.syncingTargetId === t.id ? (
                            <div class="flex items-center gap-1.5">
                              <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Syncing...</span>
                            </div>
                          ) : (
                            <span>Sync</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="pt-4 space-y-4">
              {(["minChunkSize", "timeout", "retries"] as const).map((key) => (
                <div key={key} class="space-y-2">
                  <label class="text-sm font-medium capitalize">{key}</label>
                  <Input
                    type="number"
                    value={state.settings[key] as number}
                    onChange$={(e) => {
                      state.settings[key] = parseInt((e.target as HTMLInputElement).value);
                    }}
                  />
                </div>
              ))}
              <Button
                onClick$={async () => {
                  try {
                    await api.post("/config/settings", {
                      minChunkSize: String(state.settings.minChunkSize),
                      timeout: String(state.settings.timeout),
                      retries: String(state.settings.retries),
                    });
                    await toast.success("Settings saved successfully! ✅");
                  } catch {
                    await toast.error("Failed to save settings");
                  }
                }}
              >
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {state.previewTarget && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="w-full max-w-2xl rounded-xl border border-surface-light bg-surface/90 shadow-2xl space-y-4 max-h-[85vh] flex flex-col p-6 backdrop-blur-md">
            <div class="flex items-center justify-between border-b border-surface-light pb-3">
              <div>
                <h3 class="text-lg font-bold text-text">Preview Configuration: {state.previewTarget.target.name}</h3>
                <p class="text-xs text-text-muted mt-0.5">Masked payloads generated for safety</p>
              </div>
              <button
                onClick$={() => { state.previewTarget = null; }}
                class="text-text-muted hover:text-text text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div class="flex-1 overflow-y-auto space-y-4 pr-1">
              <div class="space-y-1">
                <span class="text-xs font-semibold text-text-muted">Target Config Location</span>
                <div class="text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-300 break-all select-all">
                  {state.previewTarget.target.configPath}
                </div>
              </div>

              <div class="space-y-1">
                <span class="text-xs font-semibold text-text-muted">Generated Provider Config</span>
                <pre class="font-mono text-xs overflow-auto bg-slate-900 border border-slate-800 p-4 rounded-xl text-amber-200/80 max-h-64">
                  {JSON.stringify(state.previewTarget.provider, null, 2)}
                </pre>
              </div>

              {state.previewTarget.target.authPath && (
                <div class="space-y-2">
                  <div class="space-y-1">
                    <span class="text-xs font-semibold text-text-muted">Target Auth Location</span>
                    <div class="text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-300 break-all select-all">
                      {state.previewTarget.target.authPath}
                    </div>
                  </div>
                  <div class="space-y-1">
                    <span class="text-xs font-semibold text-text-muted">Generated Auth Config</span>
                    <pre class="font-mono text-xs overflow-auto bg-slate-900 border border-slate-800 p-4 rounded-xl text-amber-200/80 max-h-64">
                      {JSON.stringify(state.previewTarget.auth, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-surface-light">
              <Button variant="outline" onClick$={() => { state.previewTarget = null; }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Settings" };
