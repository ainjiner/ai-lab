import { component$, useStore, useVisibleTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";

export default component$(() => {
  const toast = useToast();

  const state = useStore<any>({
    active: "omo",
    omo: null,
    obra: null,
    models: [],
    loading: true,
    showAgentModal: false,
    agentForm: {
      isEdit: false,
      id: "",
      name: "",
      type: "explore",
      model: "",
      systemPrompt: "",
      enabled: true,
    },
    savingAgent: false,
    showPreviewModal: false,
    previewTarget: null,
    previewConfigs: [],
    loadingPreview: false,
    applyingSwitch: false,
  });

  const loadData = $(async () => {
    try {
      const o = await api.get<any>("/orchestration");
      state.active = o.active || "omo";
      state.omo = o.omo;
      state.obra = o.obra;

      const m = await api.get<any>("/models");
      state.models = m.models || [];
    } catch (e) {
      console.error("Failed to load orchestration status:", e);
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

  const activeOrchestrator = state.active === "omo" ? state.omo : state.obra;
  const currentAgents = activeOrchestrator?.config?.agents || [];
  const currentSkills = activeOrchestrator?.config?.skills || [];

  return (
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Orchestration</h1>
          <p class="text-text-muted">Manage agents, skills, and orchestrator candidates</p>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div class={["rounded-xl border border-surface-light bg-surface p-6", state.active === "omo" ? "border-primary shadow-lg border-2 bg-surface/80" : ""]}>
          <div class="mb-4 flex flex-row items-center justify-between pb-2 border-b border-surface-light/30">
            <div>
              <h3 class="text-lg font-semibold leading-none tracking-tight">Oh My OpenCode (OMO)</h3>
              <p class="text-xs text-text-muted mt-0.5">Classic developer-first AI editor orchestration</p>
            </div>
            <Badge variant={state.omo?.installed ? "success" : "secondary"}>
              {state.omo?.installed ? "Installed" : "Not Installed"}
            </Badge>
          </div>
          <div>
            <div class="pt-2 space-y-4">
              <div class="flex justify-between items-center text-xs">
                <span class="text-text-muted">Status:</span>
                {state.active === "omo" ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="warning">Inactive</Badge>
                )}
              </div>
              <div class="flex justify-between items-center text-xs border-t border-surface-light/40 pt-2">
                <span class="text-text-muted">Detected Version:</span>
                <span class="font-mono text-text">{state.omo?.version || "—"}</span>
              </div>
              
              <div class="flex gap-2 flex-wrap items-center justify-end border-t border-surface-light/40 pt-3">
                {state.active !== "omo" && state.omo?.installed && (
                  <>
                    <Button
                      size="sm"
                      onClick$={async () => {
                        try {
                          await api.post("/orchestration/switch", { target: "omo", backup: true });
                          await loadData();
                          await toast.success("Switched to Oh My OpenCode successfully! ✅");
                        } catch (err) {
                          await toast.error(`Switch failed: ${String(err)}`);
                        }
                      }}
                    >
                      Set Active
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick$={async () => {
                        state.loadingPreview = true;
                        state.previewTarget = "omo";
                        state.showPreviewModal = true;
                        try {
                          const res = await api.get<any>("/orchestration/preview/omo");
                          state.previewConfigs = res.configs || [];
                        } catch (err) {
                          await toast.error(`Failed to load preview: ${String(err)}`);
                          state.showPreviewModal = false;
                        } finally {
                          state.loadingPreview = false;
                        }
                      }}
                    >
                      Preview Changes
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div class={["rounded-xl border border-surface-light bg-surface p-6", state.active === "obra" ? "border-primary shadow-lg border-2 bg-surface/80" : ""]}>
          <div class="mb-4 flex flex-row items-center justify-between pb-2 border-b border-surface-light/30">
            <div>
              <h3 class="text-lg font-semibold leading-none tracking-tight">Obra Superpowers</h3>
              <p class="text-xs text-text-muted mt-0.5">Advanced agentic reasoning and thoughts configuration</p>
            </div>
            <Badge variant={state.obra?.installed ? "success" : "secondary"}>
              {state.obra?.installed ? "Installed" : "Not Installed"}
            </Badge>
          </div>
          <div>
            <div class="pt-2 space-y-4">
              <div class="flex justify-between items-center text-xs">
                <span class="text-text-muted">Status:</span>
                {state.active === "obra" ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="warning">Inactive</Badge>
                )}
              </div>
              <div class="flex justify-between items-center text-xs border-t border-surface-light/40 pt-2">
                <span class="text-text-muted">Detected Version:</span>
                <span class="font-mono text-text">{state.obra?.version || "—"}</span>
              </div>
              
              <div class="flex gap-2 flex-wrap items-center justify-end border-t border-surface-light/40 pt-3">
                {state.active !== "obra" && state.obra?.installed && (
                  <>
                    <Button
                      size="sm"
                      onClick$={async () => {
                        try {
                          await api.post("/orchestration/switch", { target: "obra", backup: true });
                          await loadData();
                          await toast.success("Switched to Obra Superpowers successfully! ✅");
                        } catch (err) {
                          await toast.error(`Switch failed: ${String(err)}`);
                        }
                      }}
                    >
                      Set Active
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick$={async () => {
                        state.loadingPreview = true;
                        state.previewTarget = "obra";
                        state.showPreviewModal = true;
                        try {
                          const res = await api.get<any>("/orchestration/preview/obra");
                          state.previewConfigs = res.configs || [];
                        } catch (err) {
                          await toast.error(`Failed to load preview: ${String(err)}`);
                          state.showPreviewModal = false;
                        } finally {
                          state.loadingPreview = false;
                        }
                      }}
                    >
                      Preview Changes
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div class="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
            <div>
              <CardTitle>Agents ({currentAgents.length})</CardTitle>
              <p class="text-xs text-text-muted mt-1">Configure parameters and LLM selections for current orchestrator</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick$={() => {
                state.agentForm.id = "";
                state.agentForm.name = "";
                state.agentForm.type = "build";
                state.agentForm.model = "";
                state.agentForm.systemPrompt = "";
                state.agentForm.tools = [];
                state.agentForm.enabled = true;
                state.isEditingAgent = false;
                state.showAgentModal = true;
              }}
            >
              <span>Add Agent</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="pt-2">
            {state.loading ? (
              <p class="text-text-muted text-sm py-4">Loading active configuration...</p>
            ) : currentAgents.length === 0 ? (
              <p class="text-text-muted text-sm py-8 text-center bg-surface/20 rounded-lg border border-dashed border-surface-light">
                No agents configured for this orchestrator. Click "+ Add Agent" to construct one.
              </p>
            ) : (
              <div class="space-y-4">
                {currentAgents.map((a: any) => (
                  <div key={a.id} class="flex items-center justify-between p-4 rounded-lg border border-surface-light bg-surface/40">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-text text-sm">{a.name || a.id}</span>
                        <Badge variant="outline" class="capitalize text-[10px] py-0 px-1.5">{a.type}</Badge>
                        <Badge variant={a.enabled !== false ? "success" : "secondary"}>
                          {a.enabled !== false ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <div class="text-xs text-text-muted font-mono">{a.model || "No model assigned"}</div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick$={() => {
                        state.agentForm.isEdit = true;
                        state.agentForm.id = a.id;
                        state.agentForm.name = a.name || "";
                        state.agentForm.type = a.type || "explore";
                        state.agentForm.model = a.model || "";
                        state.agentForm.systemPrompt = a.systemPrompt || "";
                        state.agentForm.enabled = a.enabled !== false;
                        state.showAgentModal = true;
                      }}
                    >
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills ({currentSkills.length})</CardTitle>
          <p class="text-xs text-text-muted mt-1">Available skills executed dynamically by OMO/Obra agents</p>
        </CardHeader>
        <CardContent>
          <div class="pt-2">
            {state.loading ? (
              <p class="text-text-muted text-sm py-4">Loading active skills...</p>
            ) : currentSkills.length === 0 ? (
              <p class="text-text-muted text-sm py-8 text-center bg-surface/20 rounded-lg border border-dashed border-surface-light">
                No active skills scanned in the skills candidate directories.
              </p>
            ) : (
              <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {currentSkills.map((s: any) => (
                  <div key={s.id} class="p-4 rounded-lg border border-surface-light bg-surface/40 flex flex-col justify-between space-y-2">
                    <div>
                      <div class="text-sm font-bold text-text capitalize">{s.name}</div>
                      <p class="text-xs text-text-muted mt-1 truncate" title={s.path}>{s.path || "No location path"}</p>
                    </div>
                    <Badge variant="outline" class="self-start text-[9px]">Shared Skill</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {state.showAgentModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="w-full max-w-lg rounded-xl border border-surface-light bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-surface-light pb-3">
              <h3 class="text-lg font-bold text-text">
                {state.agentForm.isEdit ? `Configure Agent: ${state.agentForm.id}` : "Create New Agent"}
              </h3>
              <button
                onClick$={() => { state.showAgentModal = false; }}
                class="text-text-muted hover:text-text text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-text-muted">Agent ID</label>
                <Input
                  placeholder="e.g. sisyphus"
                  value={state.agentForm.id}
                  disabled={state.agentForm.isEdit}
                  onInput$={(e: any) => {
                    state.agentForm.id = e.target.value;
                  }}
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-text-muted">Name</label>
                <Input
                  placeholder="e.g. Sisyphus task manager"
                  value={state.agentForm.name}
                  onInput$={(e: any) => {
                    state.agentForm.name = e.target.value;
                  }}
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-text-muted">Agent Type</label>
                <select
                  value={state.agentForm.type}
                  onChange$={(e: any) => {
                    state.agentForm.type = e.target.value;
                  }}
                  class="flex h-10 w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary capitalize"
                >
                  <option value="build">Build</option>
                  <option value="explore">Explore</option>
                  <option value="oracle">Oracle</option>
                  <option value="librarian">Librarian</option>
                  <option value="metis">Metis</option>
                  <option value="momus">Momus</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-text-muted">LLM Catalog Model</label>
                <select
                  value={state.agentForm.model}
                  onChange$={(e: any) => {
                    state.agentForm.model = e.target.value;
                  }}
                  class="flex h-10 w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Select a model...</option>
                  {state.models.map((m: any) => (
                    <option key={m.id} value={m.id}>{`${m.name} (${m.provider})`}</option>
                  ))}
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-text-muted">System Prompt</label>
                <textarea
                  placeholder="Insert core directives here..."
                  value={state.agentForm.systemPrompt}
                  onInput$={(e: any) => {
                    state.agentForm.systemPrompt = e.target.value;
                  }}
                  class="flex min-h-[100px] w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div class="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="agent_enabled"
                  checked={state.agentForm.enabled}
                  onChange$={(e: any) => {
                    state.agentForm.enabled = e.target.checked;
                  }}
                  class="h-4 w-4 rounded border-surface-light text-primary bg-surface focus:ring-primary"
                />
                <label for="agent_enabled" class="text-sm font-medium text-text select-none">
                  Enable agent configuration
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-surface-light">
              <div>
                {state.agentForm.isEdit && (
                  <Button
                    variant="outline"
                    class="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/60"
                    disabled={state.savingAgent}
                    onClick$={async () => {
                      if (!confirm(`Delete agent "${state.agentForm.id}"?`)) return;
                      state.savingAgent = true;
                      try {
                        await api.delete(`/orchestration/agents/${state.agentForm.id}`);
                        await loadData();
                        state.showAgentModal = false;
                        await toast.success(`Agent "${state.agentForm.id}" deleted successfully. ✅`);
                      } catch (err) {
                        await toast.error(`Failed to delete agent: ${String(err)}`);
                      } finally {
                        state.savingAgent = false;
                      }
                    }}
                  >
                    Delete Agent
                  </Button>
                )}
              </div>

              <div class="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick$={() => { state.showAgentModal = false; }}
                  disabled={state.savingAgent}
                >
                  Cancel
                </Button>
                <Button
                  disabled={state.savingAgent}
                  onClick$={async () => {
                    const { id, name, type, model, systemPrompt, enabled } = state.agentForm;
                    if (!id.trim()) {
                      await toast.error("Please enter a valid Agent ID.");
                      return;
                    }
                    if (!name.trim()) {
                      await toast.error("Please enter a valid Agent Name.");
                      return;
                    }

                    state.savingAgent = true;
                    try {
                      await api.post("/orchestration/agents", {
                        id: id.trim().toLowerCase(),
                        name: name.trim(),
                        type,
                        model,
                        systemPrompt: systemPrompt.trim(),
                        enabled,
                      });
                      await loadData();
                      state.showAgentModal = false;
                      await toast.success(`Agent "${id.trim()}" saved successfully! ✅`);
                    } catch (err) {
                      await toast.error(`Failed to save agent: ${String(err)}`);
                    } finally {
                      state.savingAgent = false;
                    }
                  }}
                >
                  {state.savingAgent ? "Saving..." : "Save Agent"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {state.showPreviewModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="w-full max-w-4xl rounded-xl border border-surface-light bg-surface/90 shadow-2xl space-y-4 max-h-[85vh] flex flex-col p-6 backdrop-blur-md">
            <div class="flex items-center justify-between border-b border-surface-light pb-3">
              <div>
                <h3 class="text-lg font-bold text-text">Preview Configuration Switch to: {state.previewTarget}</h3>
                <p class="text-xs text-text-muted mt-0.5">Proposed changes compared with the active configuration</p>
              </div>
              <button
                onClick$={() => { state.showPreviewModal = false; }}
                class="text-text-muted hover:text-text text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div class="flex-1 overflow-y-auto grid gap-6 md:grid-cols-2 pr-1 pb-4">
              <div class="space-y-2">
                <span class="text-xs font-bold text-red-400 uppercase tracking-wider">Current Configuration</span>
                <pre class="font-mono text-xs overflow-auto bg-slate-900 border-2 border-red-500/20 p-4 rounded-xl text-slate-300 max-h-[50vh]">
                  {JSON.stringify(activeOrchestrator?.config || {}, null, 2)}
                </pre>
              </div>

              <div class="space-y-2">
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Proposed Generated Configuration</span>
                {state.loadingPreview ? (
                  <p class="text-text-muted text-xs p-4">Generating dry-run preview...</p>
                ) : state.previewConfigs.length === 0 ? (
                  <p class="text-text-muted text-xs p-4">No changes proposed.</p>
                ) : (
                  <div class="space-y-4">
                    {state.previewConfigs.map((c: any) => (
                      <div key={c.path} class="space-y-1">
                        <div class="text-[10px] text-text-muted font-mono truncate" title={c.path}>{c.path}</div>
                        <pre class="font-mono text-xs overflow-auto bg-slate-900 border-2 border-emerald-500/20 p-4 rounded-xl text-emerald-200/80 max-h-[44vh]">
                          {c.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-surface-light">
              <Button variant="outline" onClick$={() => { state.showPreviewModal = false; }}>
                Cancel
              </Button>
              <Button
                disabled={state.applyingSwitch || state.loadingPreview}
                onClick$={async () => {
                  state.applyingSwitch = true;
                  try {
                    await api.post("/orchestration/switch", { target: state.previewTarget, backup: true });
                    await loadData();
                    state.showPreviewModal = false;
                    await toast.success(`Successfully switched active orchestrator to ${state.previewTarget}! ✅`);
                  } catch (err) {
                    await toast.error(`Switch failed: ${String(err)}`);
                  } finally {
                    state.applyingSwitch = false;
                  }
                }}
              >
                {state.applyingSwitch ? "Applying..." : "Backup & Apply"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Orchestration" };
