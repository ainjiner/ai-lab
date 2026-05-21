import { component$, useStore, useTask$, $, useOnDocument } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tooltip, CopyButton } from "~/components/ui";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { Spinner } from "~/components/ui/spinner";
import { Form, Field, Label, FieldError } from "~/components/ui/form";
import { updateSettingsSchema, validate } from "~/lib/validation";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";
import { Skeleton } from "~/components/ui/skeleton";
import { Modal } from "~/components/ui/modal";
import { EmptyState } from "~/components/ui/empty-state";

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

interface PreviewConfig {
  path: string;
  content: string;
}

interface PreviewAPIResponse {
  preview: {
    id: string;
    name: string;
    target: {
      name: string;
      configPath: string;
      authPath?: string;
    };
    provider: Record<string, unknown>;
    auth?: Record<string, unknown>;
    configs: PreviewConfig[];
  };
}

interface SettingsState {
  targets: Target[];
  settings: Settings;
  loading: boolean;
  syncingAll: boolean;
  syncingTargetId: string | null;
  validatingTargetId: string | null;
  previewTarget: PreviewAPIResponse["preview"] | null;
  saved: boolean;
  savedError: boolean;
}

export default component$(() => {
  const toast = useToast();
  
  const state = useStore<SettingsState>({
    targets: [],
    settings: { minChunkSize: 80, timeout: 60000, retries: 3 },
    loading: true,
    syncingAll: false,
    syncingTargetId: null,
    validatingTargetId: null,
    previewTarget: null,
    saved: false,
    savedError: false,
  });

  useOnDocument(
    "keydown",
    $((e: KeyboardEvent) => {
      if (e.key === "Escape" && (state.previewTarget)) {
        state.previewTarget = null;
      }
    })
  );
  

  const loadData = $(async () => {
    try {
      const data = await api.get<{ targets: Target[]; settings: Settings }>("/config");
      state.targets = data.targets;
      state.settings = data.settings;
    } catch (err) {
      console.error("Failed to load settings data:", err);
      toast.error("Failed to load settings");
    }
  });

  useTask$(async () => {
    state.loading = true;
    try {
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
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
      <PageHeader title="Settings" description="Configure ML Engine and sync targets">
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
              <Spinner size="sm" />
              <span>Syncing...</span>
            </div>
          ) : (
            <span>Sync All</span>
          )}
        </Button>
      </PageHeader>

      <StatGrid cols={3}>
        <StatCard
          value={state.targets.length}
          label="Config Targets"
          valueColor="text-primary tabular-nums"
        />
        <StatCard
          value={state.targets.filter((t: Target) => t.enabled).length}
          label="Enabled Targets"
          valueColor="text-success tabular-nums"
        />
        <StatCard
          value={state.settings.minChunkSize}
          label="Min Chunk Size"
          valueColor="text-warning tabular-nums"
        />
      </StatGrid>

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
                          <Tooltip content={t.configPath} position="bottom" class="block w-full"><div class="text-xs text-text-muted mt-1 select-all truncate max-w-[280px]">{t.configPath}</div></Tooltip>
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
                              const res = await api.get<PreviewAPIResponse>(`/config/preview/${t.id}`);
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
                              const res = await api.post<{ valid: boolean; errors?: string[] }>(`/config/targets/${t.id}/validate`);
                              if (res.valid) {
                                await toast.success("Configuration is 100% clean and valid! ✅");
                              } else {
                                await toast.error(`Validation errors: ${(res.errors || []).join(", ")}`);
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
                              <Spinner size="sm" class="h-3.5 w-3.5" />
                              <span>Syncing...</span>
                            </div>
              ) : state.targets.length === 0 ? (
                <EmptyState title="No config targets" description="No config targets have been configured yet" />
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
            <Form
              validate$={$((data: Record<string, unknown>) => validate(updateSettingsSchema, data))}
              onSubmit$={async (data) => {
                try {
                  await api.post("/config/settings", {
                    minChunkSize: data.minChunkSize,
                    timeout: data.timeout,
                    retries: data.retries,
                  });
                  state.settings.minChunkSize = parseInt(data.minChunkSize);
                  state.settings.timeout = parseInt(data.timeout);
                  state.settings.retries = parseInt(data.retries);
                  state.saved = true;
                  state.savedError = false;
                  await toast.success("Settings saved successfully! ✅");
                  setTimeout(() => { state.saved = false; }, 3000);
                } catch {
                  state.savedError = true;
                  state.saved = false;
                  await toast.error("Failed to save settings");
                  setTimeout(() => { state.savedError = false; }, 3000);
                }
              }}
            >
              <div class="pt-4 space-y-4">
                <Field name="minChunkSize">
                  <Label required>Min Chunk Size</Label>
                  <Input
                    name="minChunkSize"
                    type="number"
                    value={String(state.settings.minChunkSize)}
                  />
                  <FieldError name="minChunkSize" />
                </Field>

                <Field name="timeout">
                  <Label required>Timeout (ms)</Label>
                  <Input
                    name="timeout"
                    type="number"
                    value={String(state.settings.timeout)}
                  />
                  <FieldError name="timeout" />
                </Field>

                <Field name="retries">
                  <Label required>Retries</Label>
                  <Input
                    name="retries"
                    type="number"
                    value={String(state.settings.retries)}
                  />
                  <FieldError name="retries" />
                </Field>

                <Button type="submit">
                  {state.saved ? "Saved!" : "Save Settings"}
                </Button>
                {state.saved && (
                  <span class="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    Saved
                  </span>
                )}
                {state.savedError && (
                  <span class="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    Error
                  </span>
                )}
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={!!state.previewTarget}
        title={`Preview Configuration: ${state.previewTarget?.target.name || ""}`}
        size="2xl"
        onClose$={$(() => { state.previewTarget = null; })}
        class="max-h-[85vh] flex flex-col"
      >
        <div class="space-y-4">
          <p class="text-xs text-text-muted -mt-2">Masked payloads generated for safety</p>

          <div class="space-y-1.5">
            <span class="text-xs font-medium text-text-muted">Target Config Location</span>
            <div class="flex items-center gap-2">
              <div class="flex-1 text-xs font-mono bg-background border border-surface-light p-2.5 rounded-lg text-text-muted break-all select-all">
                {state.previewTarget?.target.configPath}
              </div>
              <CopyButton value={state.previewTarget?.target.configPath || ""} />
            </div>
          </div>

          <div class="space-y-1">
            <span class="text-xs font-semibold text-text-muted">Generated Provider Config</span>
            <pre class="font-mono text-xs overflow-auto bg-slate-900 border border-slate-800 p-4 rounded-xl text-amber-200/80 max-h-64">
              {JSON.stringify(state.previewTarget?.provider, null, 2)}
            </pre>
          </div>

          {state.previewTarget?.target.authPath && (
            <div class="space-y-2">
              <div class="space-y-1">
                <span class="text-xs font-semibold text-text-muted">Target Auth Location</span>
                <div class="text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-300 break-all select-all">
                  {state.previewTarget?.target.authPath}
                </div>
              </div>
              <div class="space-y-1">
                <span class="text-xs font-semibold text-text-muted">Generated Auth Config</span>
                <pre class="font-mono text-xs overflow-auto bg-slate-900 border border-slate-800 p-4 rounded-xl text-amber-200/80 max-h-64">
                  {JSON.stringify(state.previewTarget?.auth, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Settings" };
