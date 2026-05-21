import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { PageHeader } from "~/components/ui/page-header";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string;
  tags: string;
  version: number;
  created_at: string;
  updated_at: string;
}

interface PromptState {
  input: string;
  output: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isLoading: boolean;
  streaming: boolean;
  models: Array<{ id: string; name: string; provider?: string }>;
  history: Array<{
    id: number;
    input: string;
    output: string;
    model: string;
    tokens: number;
    latency: number;
    timestamp: Date;
  }>;
  templates: PromptTemplate[];
  templatesLoading: boolean;
  showCreateModal: boolean;
  showEditModal: boolean;
  editingId: string | null;
  form: {
    name: string;
    description: string;
    template: string;
    tags: string;
    saving: boolean;
  };
}

const API_BASE = "http://localhost:4321/api";

export default component$(() => {
  const toast = useToast();
  const state = useStore<PromptState>({
    input: "",
    output: "",
    model: "",
    temperature: 0.7,
    maxTokens: 2048,
    isLoading: false,
    streaming: false,
    models: [],
    history: [],
    templates: [],
    templatesLoading: true,
    showCreateModal: false,
    showEditModal: false,
    editingId: null,
    form: { name: "", description: "", template: "", tags: "", saving: false },
  });

  useTask$(async () => {
    try {
      const res: any = await api.get("/models");
      const modelList = Array.isArray(res) ? res : res.models || [];
      state.models = modelList.slice(0, 30).map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        provider: m.provider,
      }));
      if (state.models.length > 0 && !state.model) {
        state.model = state.models[0].id;
      }
    } catch {
      state.models = [];
    }
  });

  const loadTemplates = $(async () => {
    try {
      const res: any = await api.get("/prompts");
      state.templates = res.templates || [];
    } catch {
      state.templates = [];
    } finally {
      state.templatesLoading = false;
    }
  });

  useTask$(async () => {
    await loadTemplates();
  });

  const runPrompt = $(async () => {
    if (!state.input.trim() || state.isLoading || state.streaming) return;
    state.isLoading = true;
    state.streaming = true;

    const startTime = Date.now();
    let fullOutput = "";
    let totalTokens = 0;

    try {
      const response = await fetch(`${API_BASE}/playground/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: state.input }],
          model: state.model,
          provider: "baseten",
          temperature: state.temperature,
          maxTokens: state.maxTokens,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(err.error || "Stream request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) { fullOutput += delta; totalTokens++; }
          } catch { continue; }
        }
      }
    } catch (e) {
      fullOutput = `Error: ${(e as Error).message || "Failed to stream response"}`;
    } finally {
      state.streaming = false;
      state.isLoading = false;
      state.output = fullOutput;
      if (fullOutput && !fullOutput.startsWith("Error:")) {
        state.history.unshift({
          id: Date.now(),
          input: state.input,
          output: fullOutput,
          model: state.model,
          tokens: totalTokens || Math.ceil(fullOutput.length / 4),
          latency: Date.now() - startTime,
          timestamp: new Date(),
        });
      }
    }
  });

  const clearSession = $(() => {
    state.output = "";
  });

  const resetForm = $(() => {
    state.form = { name: "", description: "", template: "", tags: "", saving: false };
    state.editingId = null;
  });

  const openCreate = $(() => {
    resetForm();
    state.showCreateModal = true;
  });

  const openEdit = $((tpl: PromptTemplate) => {
    const tags = (() => {
      try { return JSON.parse(tpl.tags).join(", "); } catch { return tpl.tags; }
    })();
    state.form = {
      name: tpl.name,
      description: tpl.description || "",
      template: tpl.template,
      tags,
      saving: false,
    };
    state.editingId = tpl.id;
    state.showEditModal = true;
  });

  const saveTemplate = $(async () => {
    if (!state.form.name.trim() || !state.form.template.trim()) {
      toast.error("Name and template are required");
      return;
    }
    state.form.saving = true;
    try {
      const tags = state.form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const body = {
        name: state.form.name.trim(),
        description: state.form.description.trim(),
        template: state.form.template.trim(),
        tags,
        variables: [],
      };

      if (state.editingId) {
        await api.patch(`/prompts/${state.editingId}`, body);
        toast.success("Template updated");
      } else {
        await api.post("/prompts", body);
        toast.success("Template created");
      }
      state.showCreateModal = false;
      state.showEditModal = false;
      resetForm();
      await loadTemplates();
    } catch {
      toast.error("Failed to save template");
    } finally {
      state.form.saving = false;
    }
  });

  const deleteTemplate = $(async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await api.delete(`/prompts/${id}`);
      toast.success("Template deleted");
      await loadTemplates();
    } catch {
      toast.error("Failed to delete template");
    }
  });

  const useTemplate = $((tpl: PromptTemplate) => {
    state.input = tpl.template;
  });

  const renderModal = (title: string, isCreate: boolean) => (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick$={() => { state.showCreateModal = false; state.showEditModal = false; }}>
      <Card class="w-full max-w-lg mx-4 max-h-[90vh] flex flex-col" onClick$={(e: Event) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent class="overflow-y-auto">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Name</label>
              <Input value={state.form.name} placeholder="e.g. Summarize Long Text" onInput$={(e) => { state.form.name = (e.target as HTMLInputElement).value; }} />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Description</label>
              <Input value={state.form.description} placeholder="Optional description" onInput$={(e) => { state.form.description = (e.target as HTMLInputElement).value; }} />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Template <span class="text-text-subtle font-normal">— use {"{var}"} placeholders</span></label>
              <Textarea class="min-h-[120px] font-mono text-sm" value={state.form.template} placeholder="Summarize the following:\n\n{text}" onInput$={(e) => { state.form.template = (e.target as HTMLTextAreaElement).value; }} />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Tags <span class="text-text-subtle font-normal">— comma-separated</span></label>
              <Input value={state.form.tags} placeholder="e.g. summarization, text, nlp" onInput$={(e) => { state.form.tags = (e.target as HTMLInputElement).value; }} />
            </div>
            <div class="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick$={() => { state.showCreateModal = false; state.showEditModal = false; resetForm(); }}>Cancel</Button>
              <Button onClick$={saveTemplate} disabled={state.form.saving}>{state.form.saving ? "Saving..." : isCreate ? "Create" : "Update"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tagsFromJSON = (raw: string): string[] => {
    try { return JSON.parse(raw); } catch { return raw ? raw.split(",").map((s: string) => s.trim()) : []; }
  };

  return (
    <div class="space-y-6">
      <PageHeader title="Prompt Engineering" description="Create, manage, and test prompt templates">
        <Button onClick$={openCreate}>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          New Template
        </Button>
      </PageHeader>

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Playground</CardTitle>
                <div class="flex items-center gap-2">
                  <Select value={state.model} onChange$={(e) => { state.model = (e.target as HTMLSelectElement).value; }}>
                    {state.models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Input</label>
                  <Textarea class="min-h-[100px]" placeholder="Enter your prompt here..." value={state.input} onInput$={(e) => { state.input = (e.target as HTMLTextAreaElement).value; }} />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-sm font-medium">Temperature: {state.temperature.toFixed(1)}</label>
                    <input type="range" min="0" max="2" step="0.1" value={state.temperature} class="w-full accent-primary" onInput$={(e) => { state.temperature = parseFloat((e.target as HTMLInputElement).value); }} />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-medium">Max Tokens</label>
                    <Input type="number" value={state.maxTokens} onInput$={(e) => { state.maxTokens = parseInt((e.target as HTMLInputElement).value); }} />
                  </div>
                </div>

                <div class="flex gap-2">
                  <Button class="flex-1" onClick$={runPrompt} disabled={state.isLoading}>
                    {state.streaming ? "Streaming..." : state.isLoading ? "Connecting..." : "Generate"}
                  </Button>
                  <Button variant="outline" onClick$={clearSession}>Clear</Button>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium">Output</label>
                  <div class="min-h-[100px] rounded-lg border border-surface-light bg-surface/50 p-3 text-sm whitespace-pre-wrap">
                    {state.output || <span class="text-text-muted">Output will appear here...</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {state.templatesLoading ? (
                <div class="space-y-2">
                  {[1, 2, 3].map((i) => (<Skeleton key={i} class="h-12 w-full rounded-lg" />))}
                </div>
              ) : state.templates.length === 0 ? (
                <EmptyState title="No templates yet" description="Create your first prompt template" action="Create Template" onAction={openCreate} />
              ) : (
                <div class="space-y-2">
                  {state.templates.map((tpl) => (
                    <div key={tpl.id} class="rounded-lg border border-surface-light bg-surface p-3 space-y-2 transition-colors hover:border-surface-light/80">
                      <div class="flex items-start justify-between gap-2">
                        <button class="text-left text-sm font-medium text-text hover:text-primary transition-colors" onClick$={() => useTemplate(tpl)}>
                          {tpl.name}
                        </button>
                        <div class="flex gap-1 shrink-0">
                          <button class="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-primary hover:bg-surface-light transition-colors" onClick$={() => openEdit(tpl)} title="Edit">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button class="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors" onClick$={() => deleteTemplate(tpl.id)} title="Delete">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      {tpl.description && <p class="text-xs text-text-muted line-clamp-2">{tpl.description}</p>}
                      <div class="flex items-center gap-1 flex-wrap">
                        {tagsFromJSON(tpl.tags).slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" class="text-[10px] py-0 px-1.5">{tag}</Badge>
                        ))}
                        <span class="text-[10px] text-text-subtle">v{tpl.version}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-text-muted">Total Requests</span>
                  <span class="font-medium">{state.history.length}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-muted">Total Tokens</span>
                  <span class="font-medium">{state.history.reduce((a, b) => a + b.tokens, 0).toLocaleString()}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-muted">Avg Latency</span>
                  <span class="font-medium">{(state.history.reduce((a, b) => a + b.latency, 0) / Math.max(state.history.length, 1)).toFixed(0)}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {state.history.length === 0 ? (
            <EmptyState title="No history yet" description="Run a prompt to see it here" />
          ) : (
            <div class="space-y-3">
              {state.history.map((item) => (
                <div key={item.id} class="rounded-lg border border-surface-light bg-surface/50 p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">{item.input}</p>
                      <p class="mt-2 text-sm text-text-muted line-clamp-2">{item.output}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">{item.model}</Badge>
                      <span class="text-xs text-text-muted">{item.tokens.toLocaleString()} tokens</span>
                      <span class="text-xs text-text-muted">{item.latency}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {state.showCreateModal && renderModal("Create Template", true)}
      {state.showEditModal && renderModal("Edit Template", false)}
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Prompt Engineering",
};
