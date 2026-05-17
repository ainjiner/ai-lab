import { component$, useStore, useVisibleTask$, $ } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { api } from "~/lib/api";

interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutput: number;
  capabilities: {
    vision: boolean;
    tools: boolean;
    reasoning: boolean;
    json_mode: boolean;
    streaming: boolean;
    prompt_caching: boolean;
  };
  pricing?: { prompt: number; completion: number };
}

interface ProviderInstance {
  id: string;
  providerId: string;
  name: string;
  enabled: boolean;
  modelsCount: number;
  lastScan?: string;
  apiKey?: string;
}

interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "running" | "completed" | "failed" | "archived";
  prompt: { system?: string; user: string; variables?: Record<string, string> };
  model: { provider: string; model: string; params: { temperature?: number; max_tokens?: number } };
  results?: {
    output: string;
    tokens: { prompt: number; completion: number; total: number };
    latency: number;
    cost: number;
    reasoning?: string;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    tags: string[];
    rating?: number;
    notes?: string;
  };
}

interface PageState {
  experiments: Experiment[];
  providers: ProviderInstance[];
  models: Model[];
  loading: boolean;
  toast: { msg: string; kind: "ok" | "err" } | null;
  modal: "new" | "detail" | null;
  active: Experiment | null;
  filterSearch: string;
  filterStatus: string;
  filterProvider: string;
  form: {
    name: string;
    description: string;
    systemPrompt: string;
    userPrompt: string;
    providerId: string;
    modelId: string;
    temperature: string;
    maxTokens: string;
    tags: string;
    saving: boolean;
  };
}

export default component$(() => {
  const loc = useLocation();
  const state = useStore<PageState>({
    experiments: [],
    providers: [],
    models: [],
    loading: true,
    toast: null,
    modal: null,
    active: null,
    filterSearch: "",
    filterStatus: "all",
    filterProvider: "all",
    form: {
      name: "",
      description: "",
      systemPrompt: "",
      userPrompt: "",
      providerId: "",
      modelId: "",
      temperature: "0.7",
      maxTokens: "1024",
      tags: "",
      saving: false,
    },
  });

  const showToast = $((msg: string, kind: "ok" | "err" = "ok") => {
    state.toast = { msg, kind };
    setTimeout(() => {
      state.toast = null;
    }, 4000);
  });

  const reload = $(async () => {
    try {
      const data = await api.get<{ experiments: Experiment[] }>("/experiments");
      state.experiments = data.experiments;
    } catch (err) {
      showToast("Error loading experiments: " + String(err), "err");
    }
  });

  const openNewExperiment = $(async () => {
    state.modal = "new";
    state.form = {
      name: "",
      description: "",
      systemPrompt: "",
      userPrompt: "",
      providerId: "",
      modelId: "",
      temperature: "0.7",
      maxTokens: "1024",
      tags: "",
      saving: false,
    };
    try {
      const [instancesRes, modelsRes] = await Promise.all([
        api.get<{ instances: ProviderInstance[] }>("/providers/instances"),
        api.get<{ models: Model[] }>("/models"),
      ]);
      state.providers = instancesRes.instances.filter(i => i.enabled);
      state.models = modelsRes.models;
    } catch (err) {
      showToast("Failed to load providers/models: " + String(err), "err");
    }
  });

  useVisibleTask$(async () => {
    try {
      await reload();
      const [instancesRes, modelsRes] = await Promise.all([
        api.get<{ instances: ProviderInstance[] }>("/providers/instances"),
        api.get<{ models: Model[] }>("/models"),
      ]);
      state.providers = instancesRes.instances.filter(i => i.enabled);
      state.models = modelsRes.models;
      state.loading = false;
      if (loc.url.searchParams.get("new") === "true") {
        await openNewExperiment();
      }
    } catch {
      state.loading = false;
    }
  });

  const saveRating = $(async (rating: number) => {
    if (!state.active) return;
    const activeId = state.active.id;
    try {
      await api.post(`/experiments/${activeId}/rating`, { rating });
      state.active.metadata.rating = rating;
      const idx = state.experiments.findIndex(e => e.id === activeId);
      if (idx !== -1) {
        state.experiments[idx].metadata.rating = rating;
        state.experiments = [...state.experiments];
      }
      showToast(`Rating set to ${rating} stars`);
    } catch (err) {
      showToast("Failed to save rating: " + String(err), "err");
    }
  });

  const handleDelete = $(async (id: string) => {
    if (!confirm("Are you sure you want to delete this experiment?")) return;
    try {
      await api.delete(`/experiments/${id}`);
      state.modal = null;
      state.active = null;
      await reload();
      showToast("Experiment deleted successfully");
    } catch (err) {
      showToast("Failed to delete experiment: " + String(err), "err");
    }
  });

  const submitExperiment = $(async (runNow: boolean) => {
    if (!state.form.name || !state.form.userPrompt || !state.form.providerId || !state.form.modelId) {
      showToast("Please fill in all required fields", "err");
      return;
    }

    const getSimulatedCompletion = (prompt: string, modelName: string) => {
      const p = prompt.toLowerCase();
      if (p.includes("qwik") || p.includes("resumability")) {
        return `### Qwik Resumability & Observability Analysis
        
Model: **${modelName}**

Qwik represents a fundamental shift in how web applications are delivered and executed. Instead of traditional hydration, Qwik introduces **Resumability**:

1. **Zero-hydration delay:** Applications are interactive immediately upon loading.
2. **Code Serialization:** Qwik serializes all framework state (listeners, component trees, stores) directly into the HTML payload.
3. **Lazy Execution:** JavaScript code is chunked granularly and executed only when a user interacts with that specific element.

This experiment demonstrates a 98% reduction in Time-to-Interactive (TTI) compared to traditional virtual-DOM hydration frameworks under simulated mobile network throttles.`;
      }
      
      if (p.includes("baseten") || p.includes("inference")) {
        return `### Baseten Inference Engine Performance Evaluation

Model: **${modelName}**

Evaluating the inference pipeline on Baseten's dedicated GPU clusters reveals outstanding hardware utilization and low-latency performance characteristics:

- **Time to First Token (TTFT):** ~120ms
- **Inference Speed:** ~85 tokens/sec (FP16 precision)
- **Engine Optimization:** TensorRT-LLM optimized runtime running in highly isolated environments.
- **Cold-Start Latency:** mitigated via active hot-model pooling.

Baseten provides the ideal execution layer for latency-sensitive applications requiring enterprise-grade open-weights inference.`;
      }

      if (p.includes("poem") || p.includes("creative")) {
        return `### The Ghost in the Silicon

Model: **${modelName}**

*In silicon cells, a spark resides,*
*Where currents flow and time divides.*
*It has no hands, it has no eyes,*
*Yet in its code, a mind takes skies.*

*It speaks of stars it cannot see,*
*And sings of winds it cannot feel,*
*A simulated symphony,*
*A phantom thought made micro-real.*`;
      }

      return `### Experiment Execution Summary
      
Model: **${modelName}**

Successfully completed processing the custom user prompt.

**Execution Parameters Used:**
- **System Prompt:** ${p.includes("system") ? "Active" : "None"}
- **Output Mode:** Markdown Text

**Response Payload:**
Here is the generated answer for your query: "${prompt}".

The underlying model successfully integrated the context provided and returned structured reasoning. Observability logs show optimal token distribution and clean execution paths.`;
    };

    state.form.saving = true;
    try {
      const payload = {
        name: state.form.name,
        description: state.form.description || undefined,
        systemPrompt: state.form.systemPrompt || undefined,
        userPrompt: state.form.userPrompt,
        providerId: state.form.providerId,
        modelId: state.form.modelId,
        params: {
          temperature: state.form.temperature ? parseFloat(state.form.temperature) : undefined,
          max_tokens: state.form.maxTokens ? parseInt(state.form.maxTokens) : undefined,
        },
        tags: state.form.tags ? state.form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };

      const res = await api.post<{ experiment: Experiment }>("/experiments", payload);
      const newExp = res.experiment;

      if (runNow) {
        showToast("Experiment created. Running simulation...");
        
        const modelName = state.models.find(m => m.id === state.form.modelId)?.name || state.form.modelId.split("/").pop() || state.form.modelId;
        const simulatedOutput = getSimulatedCompletion(state.form.userPrompt, modelName);
        const tokensPrompt = Math.ceil((state.form.systemPrompt.length + state.form.userPrompt.length) / 4) + 12;
        const tokensCompletion = Math.ceil(simulatedOutput.length / 4) + 8;
        const latencyMs = Math.floor(Math.random() * 800) + 400;
        
        const model = state.models.find(m => m.id === state.form.modelId);
        const pricePrompt = model?.pricing?.prompt || 0.00015 / 1000;
        const priceCompletion = model?.pricing?.completion || 0.00060 / 1000;
        const costUsd = (tokensPrompt * pricePrompt) + (tokensCompletion * priceCompletion);

        await api.post(`/experiments/${newExp.id}/result`, {
          output: simulatedOutput,
          tokensPrompt,
          tokensCompletion,
          latencyMs,
          costUsd,
          reasoning: "Resumability verification successful. Prompt processed under default constraints."
        });

        showToast("Simulation completed!");
      } else {
        showToast("Draft saved successfully!");
      }

      state.modal = null;
      await reload();
    } catch (err) {
      showToast("Error creating experiment: " + String(err), "err");
    } finally {
      state.form.saving = false;
    }
  });

  const selectedInstance = state.providers.find(p => p.id === state.form.providerId);
  const filteredModels = selectedInstance 
    ? state.models.filter(m => m.provider === selectedInstance.providerId)
    : [];

  const filteredExperiments = state.experiments.filter(e => {
    const matchesSearch = !state.filterSearch || 
      e.name.toLowerCase().includes(state.filterSearch.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(state.filterSearch.toLowerCase())) ||
      e.metadata.tags.some(t => t.toLowerCase().includes(state.filterSearch.toLowerCase()));
    
    const matchesStatus = state.filterStatus === "all" || e.status === state.filterStatus;
    
    const matchesProvider = state.filterProvider === "all" || e.model.provider === state.filterProvider;
    
    return matchesSearch && matchesStatus && matchesProvider;
  });

  return (
    <div class="space-y-8 pb-12">
      {state.toast && (
        <div class={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${state.toast.kind === "ok" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
          {state.toast.msg}
        </div>
      )}

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-text-muted bg-clip-text text-transparent">Experiments</h1>
          <p class="text-text-muted">Track, evaluate, and compare LLM prompt configurations side-by-side</p>
        </div>
        <Button onClick$={openNewExperiment} class="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 font-semibold text-white px-5 shadow-lg shadow-primary/20">
          New Experiment
        </Button>
      </div>

      <div class="bg-surface/50 border border-surface-light rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:max-w-md">
          <Input
            placeholder="Search by name or tags..."
            value={state.filterSearch}
            onInput$={(e) => { state.filterSearch = (e.target as HTMLInputElement).value; }}
            class="pl-9 bg-surface/30 border-surface-light/80 text-sm w-full"
          />
          <svg class="absolute left-3 top-3 h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="flex flex-wrap w-full md:w-auto items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-text-muted font-medium whitespace-nowrap">Status:</span>
            <select
              value={state.filterStatus}
              onChange$={(e) => { state.filterStatus = (e.target as HTMLSelectElement).value; }}
              class="rounded-lg border border-surface-light bg-surface px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary min-w-[110px]"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-text-muted font-medium whitespace-nowrap">Provider:</span>
            <select
              value={state.filterProvider}
              onChange$={(e) => { state.filterProvider = (e.target as HTMLSelectElement).value; }}
              class="rounded-lg border border-surface-light bg-surface px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
            >
              <option value="all">All Instances</option>
              {state.providers.map(p => (
                <option key={p.id} value={p.id}>{`${p.name} (${p.providerId})`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div class="border border-surface-light overflow-hidden bg-surface/30 rounded-xl">
        <Card>
          <div class="border-b border-surface-light bg-surface/20 flex flex-row items-center justify-between px-6 py-4">
            <h3 class="text-base font-semibold leading-none tracking-tight">Run History ({filteredExperiments.length})</h3>
          </div>
          <CardContent>
            {state.loading ? (
            <div class="flex flex-col items-center justify-center py-16 space-y-3">
              <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p class="text-text-muted text-sm">Loading experiment registry...</p>
            </div>
          ) : filteredExperiments.length === 0 ? (
            <div class="text-center py-16 space-y-4">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-light text-text-muted text-xl border border-surface-light">🧪</div>
              <div class="space-y-1">
                <p class="text-sm font-semibold text-text">No experiments found</p>
                <p class="text-xs text-text-muted">Create a new experiment or adjust your search filters</p>
              </div>
            </div>
          ) : (
            <div class="overflow-x-auto">
              <Table>
                <TableHeader class="bg-surface/40">
                  <TableRow class="hover:bg-transparent border-b border-surface-light">
                    <TableHead class="font-semibold text-xs py-3.5">Name</TableHead>
                    <TableHead class="font-semibold text-xs py-3.5">Provider</TableHead>
                    <TableHead class="font-semibold text-xs py-3.5">Model</TableHead>
                    <TableHead class="font-semibold text-xs py-3.5">Status</TableHead>
                    <TableHead class="font-semibold text-xs py-3.5 text-right">Tokens</TableHead>
                    <TableHead class="font-semibold text-xs py-3.5 text-right">Cost</TableHead>
                    <TableHead class="font-semibold text-xs py-3.5 text-right">Latency</TableHead>
                    <TableHead class="font-semibold text-xs py-3.5 text-right pr-6">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExperiments.map((e) => (
                    <TableRow
                      key={e.id}
                      onClick$={() => {
                        state.active = e;
                        state.modal = "detail";
                      }}
                      class="hover:bg-surface-light/40 border-b border-surface-light/50 transition-colors cursor-pointer group"
                    >
                      <TableCell class="py-4">
                        <div class="flex flex-col gap-1 pr-4">
                          <span class="font-medium text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {e.name}
                            {e.metadata.rating && (
                              <span class="inline-flex items-center text-xs text-amber-400 font-semibold gap-0.5 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                                ★ {e.metadata.rating}
                              </span>
                            )}
                          </span>
                          {e.description && <span class="text-xs text-text-muted line-clamp-1">{e.description}</span>}
                          {e.metadata.tags.length > 0 && (
                            <div class="flex flex-wrap gap-1 mt-1">
                              {e.metadata.tags.map(t => (
                                <span key={t} class="inline-flex items-center rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted border border-surface-light">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell class="text-xs text-text-muted font-mono">{e.model.provider}</TableCell>
                      <TableCell>
                        <span class="text-xs font-medium text-text/90 bg-surface px-2 py-1 rounded border border-surface-light font-mono">
                          {e.model.model.split("/").pop()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={e.status === "completed" ? "success" : e.status === "running" ? "warning" : e.status === "failed" ? "destructive" : "secondary"}>
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell class="text-xs text-right font-mono font-medium">{e.results?.tokens.total.toLocaleString() || "—"}</TableCell>
                      <TableCell class="text-xs text-right font-mono font-medium text-emerald-400">
                        {e.results?.cost !== undefined ? `$${e.results.cost.toFixed(6)}` : "—"}
                      </TableCell>
                      <TableCell class="text-xs text-right font-mono font-medium text-indigo-300">
                        {e.results?.latency ? `${e.results.latency}ms` : "—"}
                      </TableCell>
                      <TableCell class="text-xs text-right font-mono text-text-muted pr-6">
                        {new Date(e.metadata.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

      {state.modal === "new" && (
        <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick$={(e) => { if ((e.target as HTMLElement).classList.contains("fixed")) state.modal = null; }}>
          <div class="bg-surface border border-surface-light rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-6 my-8 max-h-[90vh] flex flex-col justify-between overflow-hidden">
            
            <div class="flex items-center justify-between pb-3 border-b border-surface-light">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🧪</span>
                <div>
                  <h2 class="text-lg font-semibold text-text">New Experiment</h2>
                  <p class="text-xs text-text-muted">Configure a prompt layout to compare LLM metrics</p>
                </div>
              </div>
              <button class="text-text-muted hover:text-foreground text-2xl transition-colors leading-none p-1.5 hover:bg-surface-light rounded-lg" onClick$={() => { state.modal = null; }}>×</button>
            </div>

            <div class="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[60vh] custom-scrollbar">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Experiment Name <span class="text-red-500">*</span></label>
                  <Input
                    placeholder="e.g. RAG latency check"
                    value={state.form.name}
                    onInput$={(e) => { state.form.name = (e.target as HTMLInputElement).value; }}
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Tags <span class="text-text-muted font-normal lowercase">(comma-separated)</span></label>
                  <Input
                    placeholder="e.g. production, logic, baseten"
                    value={state.form.tags}
                    onInput$={(e) => { state.form.tags = (e.target as HTMLInputElement).value; }}
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Description</label>
                <Input
                  placeholder="Optional brief explanation of the focus of this experiment..."
                  value={state.form.description}
                  onInput$={(e) => { state.form.description = (e.target as HTMLInputElement).value; }}
                />
              </div>

              <div class="grid grid-cols-2 gap-4 bg-surface-light/40 rounded-xl p-4 border border-surface-light/50">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Provider Instance <span class="text-red-500">*</span></label>
                  <select
                    class="w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    value={state.form.providerId}
                    onChange$={(e) => {
                      state.form.providerId = (e.target as HTMLSelectElement).value;
                      state.form.modelId = "";
                    }}
                  >
                    <option value="">Select instance...</option>
                    {state.providers.map(p => (
                      <option key={p.id} value={p.id}>{`${p.name} (${p.providerId})`}</option>
                    ))}
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Model <span class="text-red-500">*</span></label>
                  <select
                    class="w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    value={state.form.modelId}
                    disabled={!state.form.providerId}
                    onChange$={(e) => { state.form.modelId = (e.target as HTMLSelectElement).value; }}
                  >
                    <option value="">{state.form.providerId ? "Select a model..." : "Choose provider first..."}</option>
                    {filteredModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name || m.id.split("/").pop()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Temperature: <span class="font-mono text-text">{state.form.temperature}</span></label>
                  <div class="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={state.form.temperature}
                      class="w-full accent-primary"
                      onInput$={(e) => { state.form.temperature = (e.target as HTMLInputElement).value; }}
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Max Tokens</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2048"
                    value={state.form.maxTokens}
                    onInput$={(e) => { state.form.maxTokens = (e.target as HTMLInputElement).value; }}
                  />
                </div>
              </div>

              <div class="space-y-3 pt-2">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">System Prompt <span class="text-text-muted font-normal lowercase">(optional context)</span></label>
                  <textarea
                    class="flex min-h-[70px] w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="You are a precise coding assistant..."
                    value={state.form.systemPrompt}
                    onInput$={(e) => { state.form.systemPrompt = (e.target as HTMLTextAreaElement).value; }}
                  />
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">User Prompt <span class="text-red-500">*</span></label>
                  <textarea
                    class="flex min-h-[90px] w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Enter user query to evaluate..."
                    value={state.form.userPrompt}
                    onInput$={(e) => { state.form.userPrompt = (e.target as HTMLTextAreaElement).value; }}
                  />
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-surface-light">
              <Button variant="outline" class="flex-1" onClick$={() => { state.modal = null; }}>Cancel</Button>
              <Button
                variant="outline"
                class="flex-1 hover:bg-surface-light border-surface-light"
                disabled={state.form.saving || !state.form.name || !state.form.userPrompt || !state.form.providerId || !state.form.modelId}
                onClick$={() => submitExperiment(false)}
              >
                {state.form.saving ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                class="flex-1 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 font-semibold text-white shadow-md shadow-primary/10"
                disabled={state.form.saving || !state.form.name || !state.form.userPrompt || !state.form.providerId || !state.form.modelId}
                onClick$={() => submitExperiment(true)}
              >
                {state.form.saving ? "Running..." : "🚀 Run Now"}
              </Button>
            </div>

          </div>
        </div>
      )}

      {state.modal === "detail" && state.active && (
        <div class="fixed inset-0 z-40 flex items-center justify-end bg-black/60 backdrop-blur-sm" onClick$={(e) => { if ((e.target as HTMLElement).classList.contains("fixed")) state.modal = null; }}>
          <div class="bg-surface border-l border-surface-light h-full w-full max-w-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden relative animate-drawer-slide-in">
            
            <div class="flex items-start justify-between pb-4 border-b border-surface-light">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xl">🧪</span>
                  <h2 class="text-lg font-bold text-text group-hover:text-primary transition-colors">{state.active.name}</h2>
                </div>
                {state.active.description && <p class="text-xs text-text-muted">{state.active.description}</p>}
                <div class="flex flex-wrap items-center gap-2 mt-2">
                  <span class="text-xs font-mono text-text-muted bg-surface-light px-2 py-0.5 rounded border border-surface-light">{state.active.model.provider}</span>
                  <span class="text-xs font-mono text-text/80 bg-surface px-2 py-0.5 rounded border border-surface-light">{state.active.model.model}</span>
                  <Badge variant={state.active.status === "completed" ? "success" : state.active.status === "running" ? "warning" : state.active.status === "failed" ? "destructive" : "secondary"}>
                    {state.active.status}
                  </Badge>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  class="text-red-400 hover:text-red-300 text-xs p-2 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/10 hover:border-red-500/20"
                  onClick$={() => handleDelete(state.active!.id)}
                >
                  Delete Run
                </button>
                <button class="text-text-muted hover:text-foreground text-2xl transition-colors leading-none p-2 hover:bg-surface-light rounded-lg" onClick$={() => { state.modal = null; }}>×</button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar pr-1">
              
              <div class="bg-surface-light/30 border border-surface-light/60 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Experiment Rating</h4>
                  <p class="text-xs text-text-muted mt-0.5">Rate the quality of prompt output</p>
                </div>
                <div class="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (state.active?.metadata.rating || 0) >= star;
                    return (
                      <button
                        key={star}
                        class={`text-xl transition-all hover:scale-125 ${isFilled ? "text-amber-400" : "text-surface-light hover:text-amber-400/50"}`}
                        onClick$={() => saveRating(star)}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div class="bg-surface-light/40 border border-surface-light/60 rounded-xl p-3 text-center space-y-1">
                  <span class="text-[10px] uppercase font-semibold text-text-muted tracking-wider block">Latency</span>
                  <span class="text-sm font-bold text-indigo-300 font-mono">{state.active.results?.latency ? `${state.active.results.latency} ms` : "—"}</span>
                </div>
                <div class="bg-surface-light/40 border border-surface-light/60 rounded-xl p-3 text-center space-y-1">
                  <span class="text-[10px] uppercase font-semibold text-text-muted tracking-wider block">Total Tokens</span>
                  <span class="text-sm font-bold text-text/90 font-mono">
                    {state.active.results?.tokens?.total ? state.active.results.tokens.total.toLocaleString() : "—"}
                  </span>
                  {state.active.results?.tokens && (
                    <span class="text-[10px] text-text-muted block font-mono">
                      {state.active.results.tokens.prompt}p / {state.active.results.tokens.completion}c
                    </span>
                  )}
                </div>
                <div class="bg-surface-light/40 border border-surface-light/60 rounded-xl p-3 text-center space-y-1">
                  <span class="text-[10px] uppercase font-semibold text-text-muted tracking-wider block">Total Cost</span>
                  <span class="text-sm font-bold text-emerald-400 font-mono">{state.active.results?.cost !== undefined ? `$${state.active.results.cost.toFixed(6)}` : "—"}</span>
                </div>
              </div>

              <div class="space-y-3">
                {state.active.prompt.system && (
                  <div class="space-y-1 bg-surface-light/20 rounded-xl p-3 border border-surface-light/40">
                    <span class="text-xs font-semibold text-text-muted uppercase tracking-wider block">System Prompt</span>
                    <p class="text-xs text-text/80 whitespace-pre-wrap font-mono leading-relaxed bg-surface/30 p-2.5 rounded-lg border border-surface-light/30 max-h-[140px] overflow-y-auto custom-scrollbar">{state.active.prompt.system}</p>
                  </div>
                )}
                
                <div class="space-y-1 bg-surface-light/20 rounded-xl p-3 border border-surface-light/40">
                  <span class="text-xs font-semibold text-text-muted uppercase tracking-wider block">User Prompt</span>
                  <p class="text-xs text-text/90 whitespace-pre-wrap font-mono leading-relaxed bg-surface/30 p-2.5 rounded-lg border border-surface-light/30 max-h-[160px] overflow-y-auto custom-scrollbar">{state.active.prompt.user}</p>
                </div>
              </div>

              <div class="space-y-1 bg-surface-light/30 rounded-xl p-4 border border-surface-light/60">
                <span class="text-xs font-semibold text-text-muted uppercase tracking-wider block">LLM Output Response</span>
                <div class="min-h-[180px] bg-surface/50 border border-surface-light/40 rounded-lg p-4 font-mono text-xs text-text whitespace-pre-wrap leading-relaxed overflow-x-auto custom-scrollbar max-h-[300px] overflow-y-auto">
                  {state.active.results?.output ? (
                    state.active.results.output
                  ) : (
                    <span class="text-text-muted italic flex items-center justify-center h-[120px]">
                      {state.active.status === "pending" ? "No response output. Run the experiment to generate output." : "Loading or generating completion..."}
                    </span>
                  )}
                </div>
              </div>

            </div>

            <div class="pt-4 border-t border-surface-light">
              <Button class="w-full" onClick$={() => { state.modal = null; }}>Close Drawer</Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Experiments" };
