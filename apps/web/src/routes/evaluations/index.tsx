import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { Spinner } from "~/components/ui/spinner";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";

interface Evaluation {
  id: string;
  name: string;
  description: string;
  questions: string;
  results: string;
  provider_id: string;
  model_id: string;
  status: string;
  avg_score: number;
  total_tokens: number;
  tags: string;
  created_at: string;
  updated_at: string;
}

interface EvalResult {
  prompt: string;
  expected: string;
  actual: string;
  score: number;
  tokens: number;
  latency: number;
}

interface EvalState {
  evaluations: Evaluation[];
  loading: boolean;
  providers: string[];
  models: Array<{ id: string; name: string; provider?: string }>;
  showCreate: boolean;
  showRun: boolean;
  runEvalId: string | null;
  running: boolean;
  runResults: EvalResult[];
  form: { name: string; description: string; questions: string; providerId: string; modelId: string; tags: string; saving: boolean };
}

const scoreColor = (s: number) =>
  s >= 0.8 ? "text-green-400" : s >= 0.5 ? "text-amber-400" : "text-red-400";
const scoreBg = (s: number) =>
  s >= 0.8 ? "bg-green-500/20" : s >= 0.5 ? "bg-amber-500/20" : "bg-red-500/20";

export default component$(() => {
  const toast = useToast();
  const state = useStore<EvalState>({
    evaluations: [],
    loading: true,
    providers: [],
    models: [],
    showCreate: false,
    showRun: false,
    runEvalId: null,
    running: false,
    runResults: [],
    form: { name: "", description: "", questions: "", providerId: "", modelId: "", tags: "", saving: false },
  });

  const loadData = $(async () => {
    try {
      const [evalRes, modelRes]: any[] = await Promise.all([
        api.get("/evaluations"),
        api.get("/models"),
      ]);
      state.evaluations = evalRes.evaluations || [];

      const modelList = Array.isArray(modelRes) ? modelRes : modelRes.models || [];
      state.models = modelList.map((m: any) => ({ id: m.id, name: m.name || m.id, provider: m.provider }));
      const seen = new Set<string>();
      for (const m of modelList) {
        const p = m.provider || "unknown";
        if (!seen.has(p)) { seen.add(p); state.providers.push(p); }
      }
    } catch {
      state.evaluations = [];
    } finally {
      state.loading = false;
    }
  });

  useTask$(async () => { await loadData(); });

  const resetForm = $(() => {
    state.form = { name: "", description: "", questions: "", providerId: state.providers[0] || "", modelId: "", tags: "", saving: false };
  });

  const createEval = $(async () => {
    if (!state.form.name.trim()) { toast.error("Name is required"); return; }
    let questions: any[];
    try { questions = JSON.parse(state.form.questions); } catch {
      toast.error("Questions must be valid JSON array"); return;
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      toast.error("Questions array must have at least one item"); return;
    }
    state.form.saving = true;
    try {
      await api.post("/evaluations", {
        name: state.form.name.trim(),
        description: state.form.description.trim(),
        questions,
        providerId: state.form.providerId,
        modelId: state.form.modelId,
        tags: state.form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      });
      toast.success("Evaluation created");
      state.showCreate = false;
      resetForm();
      await loadData();
    } catch {
      toast.error("Failed to create evaluation");
    } finally { state.form.saving = false; }
  });

  const deleteEval = $(async (id: string) => {
    if (!confirm("Delete this evaluation?")) return;
    try {
      await api.delete(`/evaluations/${id}`);
      toast.success("Deleted");
      await loadData();
    } catch { toast.error("Failed to delete"); }
  });

  const openRun = $((evaluation: Evaluation) => {
    state.runEvalId = evaluation.id;
    state.runResults = [];
    state.showRun = true;
  });

  const runEval = $(async () => {
    if (!state.runEvalId) return;
    state.running = true;
    state.runResults = [];
    try {
      const eval_ = state.evaluations.find(e => e.id === state.runEvalId);
      if (!eval_) throw new Error("Not found");

      const pId = state.form.providerId || eval_.provider_id || state.providers[0];
      const mId = state.form.modelId || eval_.model_id || (state.models[0]?.id || "");

      const baseUrl = typeof window === "undefined" ? "" : "http://localhost:4321/api";

      const res = await fetch(`${baseUrl}/evaluations/${state.runEvalId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: pId, modelId: mId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error);
      }

      const data = await res.json();
      state.runResults = data.results || [];
      await loadData();
      toast.success(`Completed — avg score: ${(data.evaluation?.avg_score || 0).toFixed(0)}%`);
    } catch (e) {
      toast.error((e as Error).message || "Run failed");
    } finally { state.running = false; }
  });

  const questionCount = (q: string): number => {
    try { return JSON.parse(q).length; } catch { return 0; }
  };

  const parseResults = (resultsStr: string): EvalResult[] => {
    try { return JSON.parse(resultsStr); } catch { return []; }
  };

  const scorePercent = (s: number) => Math.round(s * 100);

  return (
    <div class="space-y-8">
      <PageHeader title="Evaluations" description="Model evaluation, scoring, and regression detection">
        <Button onClick$={() => { resetForm(); state.showCreate = true; }}>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          New Evaluation
        </Button>
      </PageHeader>

      {state.loading ? (
        <StatGrid cols={3}>
          {[1, 2, 3].map((i) => <StatCard key={i} value="" label="Loading..."><Skeleton class="h-4 w-20" /></StatCard>)}
        </StatGrid>
      ) : state.evaluations.length === 0 ? (
        <EmptyState title="No evaluations yet" description="Create an evaluation set to start benchmarking models" action="Create Evaluation" onAction={() => { resetForm(); state.showCreate = true; }} />
      ) : (
        <>
          <StatGrid cols={4}>
            <StatCard value={state.evaluations.length} label="Total Eval Sets" />
            <StatCard value={state.evaluations.filter(e => e.status === "completed").length} label="Completed" />
            <StatCard value={state.evaluations.filter(e => e.status === "draft").length} label="Draft" />
            <StatCard value={Math.round(state.evaluations.reduce((a, e) => a + (e.avg_score || 0), 0) / Math.max(state.evaluations.length, 1)) + "%"} label="Overall Avg Score" />
          </StatGrid>

          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.evaluations.map((eval_) => {
              const results = parseResults(eval_.results);
              return (
                <Card key={eval_.id} class="flex flex-col">
                  <CardHeader>
                    <div class="flex items-start justify-between">
                      <div>
                        <CardTitle class="text-base">{eval_.name}</CardTitle>
                        <div class="flex items-center gap-2 mt-1">
                          <span class={`text-xs font-mono px-1.5 py-0.5 rounded ${eval_.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-surface-light text-text-muted"}`}>
                            {eval_.status}
                          </span>
                          <span class="text-xs text-text-muted">{questionCount(eval_.questions)} questions</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        <button class="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-red-400 hover:bg-red-400/10" onClick$={() => deleteEval(eval_.id)}>
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent class="flex-1">
                    {eval_.description && <p class="text-xs text-text-muted mb-3 line-clamp-2">{eval_.description}</p>}

                    {eval_.status === "completed" && eval_.avg_score != null ? (
                      <div class="space-y-3">
                        <div class="flex items-center gap-3">
                          <div class={`text-2xl font-bold ${scoreColor(eval_.avg_score)}`}>{scorePercent(eval_.avg_score)}%</div>
                          <div class="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
                            <div class={`h-full rounded-full transition-all duration-500 ${scoreBg(eval_.avg_score)}`} style={`width:${scorePercent(eval_.avg_score)}%`} />
                          </div>
                        </div>
                        <div class="flex justify-between text-xs text-text-muted">
                          <span>{eval_.total_tokens?.toLocaleString() || 0} tokens</span>
                          <span>{results.length} results</span>
                        </div>
                      </div>
                    ) : (
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-text-muted">Not yet run</span>
                        <Button size="sm" variant="outline" class="h-7 text-xs" onClick$={() => openRun(eval_)}>
                          <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Run
                        </Button>
                      </div>
                    )}

                    {results.length > 0 && (
                      <div class="mt-3 pt-3 border-t border-surface-light space-y-1">
                        {results.slice(0, 3).map((r, i) => (
                          <div key={i} class="flex items-center justify-between text-xs">
                            <span class="truncate max-w-[200px] text-text-muted">{r.prompt.slice(0, 50)}...</span>
                            <span class={`font-mono font-bold ${scoreColor(r.score)}`}>{scorePercent(r.score)}%</span>
                          </div>
                        ))}
                        {results.length > 3 && <span class="text-[10px] text-text-subtle">+{results.length - 3} more</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {state.showCreate && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick$={() => { state.showCreate = false; }}>
          <Card class="w-full max-w-lg mx-4 max-h-[90vh] flex flex-col" onClick$={(e: Event) => e.stopPropagation()}>
            <CardHeader><CardTitle>Create Evaluation</CardTitle></CardHeader>
            <CardContent class="overflow-y-auto">
              <div class="space-y-4">
                <Input value={state.form.name} placeholder="Evaluation name" onInput$={(e) => { state.form.name = (e.target as HTMLInputElement).value; }} />
                <Input value={state.form.description} placeholder="Description (optional)" onInput$={(e) => { state.form.description = (e.target as HTMLInputElement).value; }} />
                <div class="space-y-2">
                  <label class="text-xs font-medium text-text-muted">Questions — JSON array of {'{prompt, expected}'}</label>
                  <Textarea class="min-h-[140px] font-mono text-xs" value={state.form.questions}
                    placeholder={'[\n  {"prompt": "What is 2+2?", "expected": "4"},\n  {"prompt": "Capital of France?", "expected": "Paris"}\n]'}
                    onInput$={(e) => { state.form.questions = (e.target as HTMLTextAreaElement).value; }} />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1"><label class="text-xs text-text-muted">Provider</label><Select value={state.form.providerId} onChange$={(e) => { state.form.providerId = (e.target as HTMLSelectElement).value; }}>{state.providers.map(p => <option key={p} value={p}>{p}</option>)}</Select></div>
                  <div class="space-y-1"><label class="text-xs text-text-muted">Model</label><Select value={state.form.modelId} onChange$={(e) => { state.form.modelId = (e.target as HTMLSelectElement).value; }}>{state.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></div>
                </div>
                <Input value={state.form.tags} placeholder="Tags (comma-separated)" onInput$={(e) => { state.form.tags = (e.target as HTMLInputElement).value; }} />
                <div class="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick$={() => { state.showCreate = false; }}>Cancel</Button>
                  <Button onClick$={createEval} disabled={state.form.saving}>{state.form.saving ? "Creating..." : "Create"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {state.showRun && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick$={() => { state.showRun = false; state.runResults = []; }}>
          <Card class="w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col" onClick$={(e: Event) => e.stopPropagation()}>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Run Evaluation</CardTitle>
                <Button variant="outline" size="sm" class="h-7 text-xs" onClick$={runEval} disabled={state.running}>
                  {state.running ? <><Spinner size="sm" class="mr-1.5" />Running...</> : "Run Now"}
                </Button>
              </div>
            </CardHeader>
            <CardContent class="overflow-y-auto space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1"><label class="text-xs text-text-muted">Provider</label><Select value={state.form.providerId} onChange$={(e) => { state.form.providerId = (e.target as HTMLSelectElement).value; }}>{state.providers.map(p => <option key={p} value={p}>{p}</option>)}</Select></div>
                <div class="space-y-1"><label class="text-xs text-text-muted">Model</label><Select value={state.form.modelId} onChange$={(e) => { state.form.modelId = (e.target as HTMLSelectElement).value; }}>{state.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></div>
              </div>

              {state.running && <div class="flex items-center justify-center py-8"><Spinner size="md" /><span class="ml-3 text-sm text-text-muted">Running evaluation...</span></div>}

              {state.runResults.length > 0 && (
                <div class="space-y-3">
                  <div class="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
                    <span class="text-2xl font-bold text-primary">{Math.round(state.runResults.reduce((a, r) => a + r.score, 0) / state.runResults.length * 100)}%</span>
                    <span class="text-sm text-text-muted">Avg score across {state.runResults.length} questions</span>
                  </div>
                  {state.runResults.map((r, i) => (
                    <div key={i} class="rounded-lg border border-surface-light p-3 space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-mono text-text-subtle">Q{i + 1}</span>
                        <span class={`text-xs font-mono font-bold ${scoreColor(r.score)}`}>{scorePercent(r.score)}%</span>
                      </div>
                      <p class="text-xs text-text-muted">{r.prompt}</p>
                      <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="rounded bg-green-500/10 p-2"><span class="text-green-400 font-medium">Expected</span><p class="text-text mt-0.5">{r.expected}</p></div>
                        <div class="rounded bg-blue-500/10 p-2"><span class="text-blue-400 font-medium">Actual</span><p class="text-text mt-0.5 line-clamp-3">{r.actual}</p></div>
                      </div>
                      <div class="flex items-center gap-3 text-[10px] text-text-subtle">
                        <span>{r.tokens.toLocaleString()} tokens</span>
                        <span>{r.latency}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Evaluations" };
