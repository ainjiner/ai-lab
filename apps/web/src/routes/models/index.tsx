import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { api, PROVIDER_FEATURES } from "~/lib/api";

interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutput: number;
  capabilities: Record<string, boolean>;
  pricing?: { prompt: number; completion: number };
}

interface Instance {
  id: string;
  providerId: string;
  name: string;
  enabled: boolean;
  modelsCount: number;
  lastScan?: string;
  apiKey?: string;
}

interface Alias {
  alias: string;
  modelId: string;
  providerId: string;
}

export default component$(() => {
  const state = useStore<{
    models: Model[];
    instances: Instance[];
    aliases: Alias[];
    loading: boolean;
    searchInput: string;
    selectedProvider: string | null;
    selectedCapabilities: string[];

    // Compare Mode
    selectedModelIds: string[];
    compareModalOpen: boolean;
    comparisonData: any;
    compareLoading: boolean;

    // Alias Management
    aliasModalOpen: boolean;
    aliasForm: {
      alias: string;
      modelId: string;
      providerId: string;
      saving: boolean;
    };
    aliasLoading: boolean;

    // Toast
    toast: { msg: string; kind: "ok" | "err" } | null;
  }>({
    models: [],
    instances: [],
    aliases: [],
    loading: true,
    searchInput: "",
    selectedProvider: null,
    selectedCapabilities: [],

    selectedModelIds: [],
    compareModalOpen: false,
    comparisonData: null,
    compareLoading: false,

    aliasModalOpen: false,
    aliasForm: {
      alias: "",
      modelId: "",
      providerId: "",
      saving: false,
    },
    aliasLoading: false,

    toast: null,
  });

  const reloadAliases = $(async () => {
    state.aliasLoading = true;
    try {
      const data = await api.get<{ aliases: Alias[] }>("/models/aliases");
      state.aliases = data.aliases;
    } catch (err) {
      console.error(err);
    } finally {
      state.aliasLoading = false;
    }
  });

  const reloadInstances = $(async () => {
    try {
      const data = await api.get<{ instances: Instance[] }>("/providers/instances");
      state.instances = data.instances;
    } catch (err) {
      console.error(err);
    }
  });

  useTask$(async () => {
    await Promise.all([reloadInstances(), reloadAliases()]);
  });

  useTask$(({ track, cleanup }) => {
    const inputVal = track(() => state.searchInput);

    const timer = setTimeout(async () => {
      state.loading = true;
      try {
        const query = inputVal ? `?search=${encodeURIComponent(inputVal)}` : "";
        const data = await api.get<{ models: Model[] }>(`/models${query}`);
        state.models = data.models;
      } catch (err) {
        console.error(err);
      } finally {
        state.loading = false;
      }
    }, 300);

    cleanup(() => clearTimeout(timer));
  });

  const showToast = $((msg: string, kind: "ok" | "err" = "ok") => {
    state.toast = { msg, kind };
    setTimeout(() => {
      state.toast = null;
    }, 3500);
  });

  const fmtCtx = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
    return `${(n / 1000).toFixed(0)}K`;
  };

  const fmtPrice1M = (n?: number) => {
    if (n === undefined || n === null) return "—";
    if (n === 0) return "$0.00";
    return `$${(n * 1000000).toFixed(2)}`;
  };

  // Local client-side filtering for search-results
  const filteredModels = state.models.filter((m) => {
    if (state.selectedProvider && m.provider !== state.selectedProvider) {
      return false;
    }
    for (const cap of state.selectedCapabilities) {
      const field = cap === "json" ? "json_mode" : cap;
      if (!m.capabilities[field]) {
        return false;
      }
    }
    return true;
  });

  const toggleCapability = $((cap: string) => {
    if (state.selectedCapabilities.includes(cap)) {
      state.selectedCapabilities = state.selectedCapabilities.filter((c) => c !== cap);
    } else {
      state.selectedCapabilities = [...state.selectedCapabilities, cap];
    }
  });

  const toggleModelSelection = $((modelId: string) => {
    if (state.selectedModelIds.includes(modelId)) {
      state.selectedModelIds = state.selectedModelIds.filter((id) => id !== modelId);
    } else {
      if (state.selectedModelIds.length >= 2) {
        // Limit to 2 maximum selections for side-by-side comparison
        showToast("You can only compare exactly 2 models at a time.", "err");
        return;
      }
      state.selectedModelIds = [...state.selectedModelIds, modelId];
    }
  });

  const availableModelsForAlias = state.aliasForm.providerId
    ? state.models.filter((m) => m.provider === state.aliasForm.providerId)
    : state.models;

  return (
    <div class="space-y-8">
      {/* Toast Notification */}
      {state.toast && (
        <div
          class={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl border transition-all duration-300 transform translate-y-0 ${
            state.toast.kind === "ok"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400 backdrop-blur-md"
              : "bg-rose-950/90 border-rose-500/30 text-rose-400 backdrop-blur-md"
          }`}
        >
          <span class="text-base">{state.toast.kind === "ok" ? "✓" : "⚠"}</span>
          <span>{state.toast.msg}</span>
        </div>
      )}

      {/* Compare Modal */}
      {state.compareModalOpen && (
        <div
          class="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick$={(e) => {
            if ((e.target as HTMLElement).classList.contains("fixed")) {
              state.compareModalOpen = false;
            }
          }}
        >
          <div class="bg-surface border border-surface-light rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div class="flex items-center justify-between border-b border-surface-light pb-4">
              <div>
                <h2 class="text-xl font-bold tracking-tight">Model Comparison</h2>
                <p class="text-xs text-text-muted mt-0.5">Side-by-side feature and pricing analysis</p>
              </div>
              <button
                class="text-text-muted hover:text-foreground text-2xl leading-none"
                onClick$={() => {
                  state.compareModalOpen = false;
                }}
              >
                ×
              </button>
            </div>

            {state.compareLoading ? (
              <div class="flex flex-col items-center justify-center py-12 space-y-4">
                <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p class="text-text-muted text-sm">Comparing models...</p>
              </div>
            ) : state.comparisonData ? (
              <div class="overflow-x-auto border border-surface-light rounded-xl">
                <table class="w-full border-collapse text-left">
                  <thead>
                    <tr class="border-b border-surface-light bg-surface-light/30">
                      <th class="py-4 px-4 text-sm font-semibold text-text-muted w-1/3">Feature</th>
                      <th class="py-4 px-4 text-sm font-semibold text-foreground w-1/3 border-l border-surface-light">
                        <div class="font-bold text-base text-primary">{state.comparisonData.model1.name}</div>
                        <div class="text-xs text-text-muted font-mono mt-1">{state.comparisonData.model1.id}</div>
                      </th>
                      <th class="py-4 px-4 text-sm font-semibold text-foreground w-1/3 border-l border-surface-light">
                        <div class="font-bold text-base text-primary">{state.comparisonData.model2.name}</div>
                        <div class="text-xs text-text-muted font-mono mt-1">{state.comparisonData.model2.id}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-light text-sm">
                    <tr>
                      <td class="py-3.5 px-4 font-medium text-text-muted">Provider</td>
                      <td class="py-3.5 px-4 border-l border-surface-light">
                        <Badge variant="outline">{state.comparisonData.model1.provider}</Badge>
                      </td>
                      <td class="py-3.5 px-4 border-l border-surface-light">
                        <Badge variant="outline">{state.comparisonData.model2.provider}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3.5 px-4 font-medium text-text-muted">Context Window</td>
                      <td class="py-3.5 px-4 border-l border-surface-light font-mono">
                        {fmtCtx(state.comparisonData.model1.contextWindow)}
                      </td>
                      <td class="py-3.5 px-4 border-l border-surface-light font-mono">
                        {fmtCtx(state.comparisonData.model2.contextWindow)}
                        {state.comparisonData.diff?.contextWindow !== 0 && (
                          <span
                            class={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                              state.comparisonData.diff?.contextWindow > 0
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {state.comparisonData.diff?.contextWindow > 0 ? "+" : ""}
                            {fmtCtx(state.comparisonData.diff?.contextWindow)}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3.5 px-4 font-medium text-text-muted">Max Output</td>
                      <td class="py-3.5 px-4 border-l border-surface-light font-mono">
                        {state.comparisonData.model1.maxOutput
                          ? `${(state.comparisonData.model1.maxOutput / 1000).toFixed(0)}K`
                          : "—"}
                      </td>
                      <td class="py-3.5 px-4 border-l border-surface-light font-mono">
                        {state.comparisonData.model2.maxOutput
                          ? `${(state.comparisonData.model2.maxOutput / 1000).toFixed(0)}K`
                          : "—"}
                        {state.comparisonData.diff?.maxOutput !== 0 &&
                          state.comparisonData.model1.maxOutput &&
                          state.comparisonData.model2.maxOutput && (
                            <span
                              class={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                                state.comparisonData.diff?.maxOutput > 0
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {state.comparisonData.diff?.maxOutput > 0 ? "+" : ""}
                              {(state.comparisonData.diff?.maxOutput / 1000).toFixed(0)}K
                            </span>
                          )}
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3.5 px-4 font-medium text-text-muted">Prompt Price / 1M</td>
                      <td class="py-3.5 px-4 border-l border-surface-light font-mono">
                        {fmtPrice1M(state.comparisonData.model1.pricing?.prompt)}
                      </td>
                      <td class="py-3.5 px-4 border-l border-surface-light font-mono">
                        {fmtPrice1M(state.comparisonData.model2.pricing?.prompt)}
                        {state.comparisonData.diff?.priceDiff?.prompt !== 0 &&
                          state.comparisonData.model1.pricing &&
                          state.comparisonData.model2.pricing && (
                            <span
                              class={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                                state.comparisonData.diff?.priceDiff?.prompt < 0
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {state.comparisonData.diff?.priceDiff?.prompt > 0 ? "+" : ""}
                              {fmtPrice1M(state.comparisonData.diff?.priceDiff?.prompt)}
                            </span>
                          )}
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3.5 px-4 font-medium text-text-muted">Completion Price / 1M</td>
                      <td class="py-3.5 px-4 border-l border-surface-light font-mono">
                        {fmtPrice1M(state.comparisonData.model1.pricing?.completion)}
                      </td>
                      <td class="py-3.5 px-4 border-l border-surface-light font-mono">
                        {fmtPrice1M(state.comparisonData.model2.pricing?.completion)}
                        {state.comparisonData.diff?.priceDiff?.completion !== 0 &&
                          state.comparisonData.model1.pricing &&
                          state.comparisonData.model2.pricing && (
                            <span
                              class={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                                state.comparisonData.diff?.priceDiff?.completion < 0
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {state.comparisonData.diff?.priceDiff?.completion > 0 ? "+" : ""}
                              {fmtPrice1M(state.comparisonData.diff?.priceDiff?.completion)}
                            </span>
                          )}
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3.5 px-4 font-medium text-text-muted">Capabilities</td>
                      <td class="py-3.5 px-4 border-l border-surface-light">
                        <div class="flex flex-wrap gap-1">
                          {PROVIDER_FEATURES.map((f) => {
                            const has = state.comparisonData.model1.capabilities[f.field];
                            return (
                              <Badge key={f.label} variant={has ? "success" : "secondary"} class="text-xs py-0.5">
                                {has ? "✓" : "✗"} {f.label}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                      <td class="py-3.5 px-4 border-l border-surface-light">
                        <div class="flex flex-wrap gap-1">
                          {PROVIDER_FEATURES.map((f) => {
                            const has = state.comparisonData.model2.capabilities[f.field];
                            const isDiff = state.comparisonData.diff?.capabilities?.[f.field] ?? false;
                            return (
                              <Badge
                                key={f.label}
                                variant={has ? "success" : "secondary"}
                                class={`text-xs py-0.5 ${
                                  isDiff ? "ring-2 ring-primary/60 border-primary/60" : ""
                                }`}
                              >
                                {has ? "✓" : "✗"} {f.label}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3.5 px-4 font-medium text-text-muted">Pricing Model</td>
                      <td class="py-3.5 px-4 border-l border-surface-light text-text-muted">
                        {state.comparisonData.model1.pricing ? (
                          state.comparisonData.model1.pricing.prompt === 0 &&
                          state.comparisonData.model1.pricing.completion === 0 ? (
                            <span class="text-emerald-400 font-semibold">Free</span>
                          ) : (
                            "Pay-as-you-go"
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                      <td class="py-3.5 px-4 border-l border-surface-light text-text-muted">
                        {state.comparisonData.model2.pricing ? (
                          state.comparisonData.model2.pricing.prompt === 0 &&
                          state.comparisonData.model2.pricing.completion === 0 ? (
                            <span class="text-emerald-400 font-semibold">Free</span>
                          ) : (
                            "Pay-as-you-go"
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p class="text-center py-8 text-text-muted">Failed to load comparison.</p>
            )}

            <div class="flex justify-end border-t border-surface-light pt-4">
              <Button
                variant="outline"
                onClick$={() => {
                  state.compareModalOpen = false;
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Alias Management Modal */}
      {state.aliasModalOpen && (
        <div
          class="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick$={(e) => {
            if ((e.target as HTMLElement).classList.contains("fixed")) {
              state.aliasModalOpen = false;
            }
          }}
        >
          <div class="bg-surface border border-surface-light rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 flex flex-col md:flex-row gap-6">
            {/* Left Column: Create Form */}
            <div class="flex-1 space-y-4">
              <div class="flex items-center justify-between border-b border-surface-light pb-2">
                <h3 class="font-bold text-lg text-foreground">Create New Alias</h3>
              </div>

              <div class="space-y-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Alias Name</label>
                  <Input
                    placeholder="e.g. gpt-4-latest"
                    value={state.aliasForm.alias}
                    onInput$={(e) => {
                      state.aliasForm.alias = (e.target as HTMLInputElement).value;
                    }}
                  />
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Provider Instance
                  </label>
                  <select
                    class="w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    value={state.aliasForm.providerId}
                    onChange$={(e) => {
                      state.aliasForm.providerId = (e.target as HTMLSelectElement).value;
                      state.aliasForm.modelId = ""; // Reset model when provider instance changes
                    }}
                  >
                    <option value="">Select a Provider Instance…</option>
                    {state.instances.map((inst) => (
                      <option key={inst.id} value={inst.id}>{`${inst.name} (${inst.id})`}</option>
                    ))}
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Target Model</label>
                  <select
                    class="w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    value={state.aliasForm.modelId}
                    onChange$={(e) => {
                      state.aliasForm.modelId = (e.target as HTMLSelectElement).value;
                    }}
                    disabled={!state.aliasForm.providerId}
                  >
                    <option value="">
                      {state.aliasForm.providerId ? "Select Target Model…" : "Select Provider Instance first"}
                    </option>
                    {availableModelsForAlias.map((m) => (
                      <option key={m.id} value={m.id}>{`${m.name} (${m.id})`}</option>
                    ))}
                  </select>
                </div>

                <Button
                  class="w-full mt-2"
                  disabled={
                    state.aliasForm.saving ||
                    !state.aliasForm.alias ||
                    !state.aliasForm.modelId ||
                    !state.aliasForm.providerId
                  }
                  onClick$={async () => {
                    state.aliasForm.saving = true;
                    try {
                      await api.post("/models/aliases", {
                        alias: state.aliasForm.alias,
                        modelId: state.aliasForm.modelId,
                        providerId: state.aliasForm.providerId,
                      });
                      state.aliasForm.alias = "";
                      state.aliasForm.modelId = "";
                      state.aliasForm.providerId = "";
                      await reloadAliases();
                      await showToast("Alias created successfully", "ok");
                    } catch (err) {
                      await showToast(String(err), "err");
                    } finally {
                      state.aliasForm.saving = false;
                    }
                  }}
                >
                  {state.aliasForm.saving ? "Creating…" : "Create Alias"}
                </Button>
              </div>
            </div>

            {/* Right Column: Alias List */}
            <div class="flex-1 flex flex-col min-h-[300px]">
              <div class="flex items-center justify-between border-b border-surface-light pb-2 mb-4">
                <h3 class="font-bold text-lg text-foreground">Active Aliases</h3>
                <span class="text-xs text-text-muted font-mono">{state.aliases.length} total</span>
              </div>

              {state.aliasLoading ? (
                <div class="flex-1 flex items-center justify-center">
                  <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : state.aliases.length === 0 ? (
                <div class="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-surface-light rounded-xl">
                  <span class="text-2xl text-text-muted">⚙</span>
                  <p class="text-sm font-medium text-text-muted mt-2">No aliases configured yet.</p>
                  <p class="text-xs text-text-muted/70 mt-1 max-w-[200px]">
                    Create an alias to reference models in a provider-agnostic way.
                  </p>
                </div>
              ) : (
                <div class="flex-1 overflow-y-auto max-h-[45vh] pr-2 space-y-3">
                  {state.aliases.map((a) => (
                    <div
                      key={a.alias}
                      class="flex items-center justify-between p-3 border border-surface-light rounded-xl bg-surface-light/20 hover:bg-surface-light/40 transition-all"
                    >
                      <div class="space-y-1">
                        <div class="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <span class="text-primary font-mono">🔗</span>
                          <span>{a.alias}</span>
                        </div>
                        <div class="text-xs text-text-muted">
                          Maps to <span class="font-mono text-foreground">{a.modelId}</span> on{" "}
                          <span class="font-mono text-foreground">{a.providerId}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                        onClick$={async () => {
                          if (confirm(`Are you sure you want to delete alias "${a.alias}"?`)) {
                            try {
                              await api.delete(`/models/aliases/${encodeURIComponent(a.alias)}`);
                              await reloadAliases();
                              await showToast("Alias deleted successfully", "ok");
                            } catch (err) {
                              await showToast(String(err), "err");
                            }
                          }
                        }}
                      >
                        🗑
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Absolute close button top corner */}
            <button
              class="absolute md:hidden top-4 right-4 text-text-muted hover:text-foreground text-2xl leading-none"
              onClick$={() => {
                state.aliasModalOpen = false;
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Page Title & Actions */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Model Catalog
          </h1>
          <p class="text-text-muted">Discover, filter, compare, and manage alias routing for your LLMs</p>
        </div>
        <div class="flex gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            disabled={state.selectedModelIds.length !== 2}
            onClick$={async () => {
              state.compareLoading = true;
              state.compareModalOpen = true;
              try {
                const ids = state.selectedModelIds.join(",");
                const data = await api.get<{ comparison: any }>(`/models/compare?ids=${ids}`);
                state.comparisonData = data.comparison;
              } catch (err) {
                console.error(err);
                showToast("Failed to fetch comparison details", "err");
              } finally {
                state.compareLoading = false;
              }
            }}
          >
            {`Compare Selected (${state.selectedModelIds.length})`}
          </Button>

          <Button
            variant="secondary"
            onClick$={() => {
              state.aliasForm = { alias: "", modelId: "", providerId: "", saving: false };
              state.aliasModalOpen = true;
            }}
          >
            Manage Aliases
          </Button>

          <Button
            onClick$={async () => {
              const instances = await api.get<{ instances: { id: string }[] }>("/providers/instances");
              for (const inst of instances.instances) {
                await api.post(`/providers/instances/${inst.id}/scan`);
              }
              const data = await api.get<{ models: Model[] }>("/models");
              state.models = data.models;
              showToast("Successfully scanned all instances", "ok");
            }}
          >
            Scan All
          </Button>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div class="rounded-xl border border-surface-light bg-surface p-6 space-y-4">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div class="flex-1">
            <label class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 block">
              Search Catalog
            </label>
            <div class="relative">
              <Input
                placeholder="Search models by name or identifier..."
                value={state.searchInput}
                onInput$={(e) => {
                  state.searchInput = (e.target as HTMLInputElement).value;
                }}
                class="pl-10"
              />
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg pointer-events-none">
                🔍
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div>
              <label class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 block">
                Provider Filter
              </label>
              <div class="flex flex-wrap gap-1">
                <button
                  onClick$={() => {
                    state.selectedProvider = null;
                  }}
                  class={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    state.selectedProvider === null
                      ? "bg-primary border-primary text-white"
                      : "bg-surface-light/30 border-surface-light text-text-muted hover:border-text-muted"
                  }`}
                >
                  All
                </button>
                {state.instances.map((inst) => (
                  <button
                    key={inst.id}
                    onClick$={() => {
                      state.selectedProvider = state.selectedProvider === inst.id ? null : inst.id;
                    }}
                    class={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      state.selectedProvider === inst.id
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : "bg-surface-light/30 border-surface-light text-text-muted hover:border-text-muted"
                    }`}
                  >
                    {inst.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Capability Filter Chips */}
        <div class="border-t border-surface-light pt-3">
          <span class="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
            Capabilities Filter
          </span>
          <div class="flex flex-wrap gap-1.5">
            {["vision", "tools", "reasoning", "json"].map((cap) => {
              const active = state.selectedCapabilities.includes(cap);
              return (
                <button
                  key={cap}
                  onClick$={() => toggleCapability(cap)}
                  class={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    active
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-surface-light/30 border-surface-light text-text-muted hover:border-text-muted"
                  }`}
                >
                  <span>{active ? "✓" : "+"}</span>
                  <span>{cap}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Catalog Grid */}
      {state.loading ? (
        <p class="text-text-muted text-center py-12">Loading models...</p>
      ) : filteredModels.length === 0 ? (
        <div class="text-center py-16 border border-dashed border-surface-light rounded-2xl bg-surface/50">
          <span class="text-4xl text-text-muted">🤖</span>
          <h3 class="text-lg font-bold text-foreground mt-4">No Models Found</h3>
          <p class="text-sm text-text-muted mt-2 max-w-sm mx-auto">
            Try adjusting your search query, clearing your filter chips, or scanning for new models.
          </p>
        </div>
      ) : (
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((m) => {
            const isSelected = state.selectedModelIds.includes(m.id);
            return (
              <div
                key={m.id}
                class={`relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl rounded-2xl border ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/5"
                    : "border-surface-light bg-surface hover:border-primary/40"
                }`}
              >
                {/* Compare Checkbox Selection (Top Right Overlay) */}
                <div class="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <label class="text-xs text-text-muted font-medium cursor-pointer select-none group-hover:text-text duration-200">
                    Compare
                  </label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange$={() => toggleModelSelection(m.id)}
                    class="h-4.5 w-4.5 rounded border-surface-light bg-surface text-primary focus:ring-primary cursor-pointer transition-colors"
                  />
                </div>

                <div class="p-6 space-y-4">
                  {/* Name and Provider */}
                  <div class="space-y-1.5 pr-20">
                    <h3 class="text-lg font-bold text-foreground truncate group-hover:text-primary duration-200">
                      {m.name}
                    </h3>
                    <div class="flex items-center gap-2">
                      <Badge variant="outline" class="text-[10px] uppercase font-bold tracking-wider">
                        {m.provider}
                      </Badge>
                      <span class="text-xs text-text-muted font-mono truncate">{m.id}</span>
                    </div>
                  </div>

                  {/* Specs Columns */}
                  <div class="grid grid-cols-2 gap-4 py-2 border-y border-surface-light text-sm">
                    <div class="space-y-0.5">
                      <span class="text-xs text-text-muted block">Context Window</span>
                      <span class="font-bold text-foreground font-mono">{fmtCtx(m.contextWindow)}</span>
                    </div>
                    <div class="space-y-0.5">
                      <span class="text-xs text-text-muted block">Max Output</span>
                      <span class="font-bold text-foreground font-mono">
                        {m.maxOutput ? `${(m.maxOutput / 1000).toFixed(0)}K` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div class="space-y-1.5">
                    <span class="text-xs text-text-muted block font-semibold uppercase tracking-wider">Pricing</span>
                    {m.pricing ? (
                      <div class="bg-surface-light/40 rounded-xl p-3 border border-surface-light space-y-1 font-mono text-xs">
                        <div class="flex justify-between">
                          <span class="text-text-muted">Prompt:</span>
                          <span class="text-foreground font-bold">{`${fmtPrice1M(m.pricing.prompt)} / 1M`}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-text-muted">Completion:</span>
                          <span class="text-foreground font-bold">{`${fmtPrice1M(m.pricing.completion)} / 1M`}</span>
                        </div>
                      </div>
                    ) : (
                      <div class="bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 rounded-xl p-3 text-xs font-semibold text-center">
                        Free or Unknown Pricing
                      </div>
                    )}
                  </div>

                  {/* Capabilities Badges */}
                  <div class="space-y-2 pt-1">
                    <span class="text-xs text-text-muted block font-semibold uppercase tracking-wider">
                      Capabilities
                    </span>
                    <div class="flex gap-1.5 flex-wrap">
                      {PROVIDER_FEATURES.filter((f) => m.capabilities[f.field]).map((f) => (
                        <span
                          key={f.label}
                          class={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${f.color}`}
                        >
                          {f.label}
                        </span>
                      ))}
                      {/* Check if no capabilities match */}
                      {PROVIDER_FEATURES.filter((f) => m.capabilities[f.field]).length === 0 && (
                        <span class="text-xs text-text-muted/65 italic">No advanced capabilities</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Models" };
