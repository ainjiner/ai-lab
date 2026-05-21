import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { StatusBadge, TypeBadge } from "~/components/ui/status-badge";
import { ListItem } from "~/components/ui/list-item";
import { Progress } from "~/components/ui/progress";
import { useToast } from "~/components/ui/toast";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/api";

interface FineTuneJob {
  id: string;
  name: string;
  provider: string;
  baseModel: string;
  dataset: string;
  status: "draft" | "queued" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  epochs: number;
  created: string;
  finished?: string;
  cost?: number;
}

export default component$(() => {
  const toast = useToast();
  
  const state = useStore<{
    jobs: FineTuneJob[];
    datasets: string[];
    loading: boolean;
    creating: boolean;
    showCreateModal: boolean;
  }>({
    jobs: [],
    datasets: [],
    loading: true,
    creating: false,
    showCreateModal: false,
  });

  const createJob = $(async (name: string, provider: string, baseModel: string, dataset: string, epochs: number) => {
    state.creating = true;
    try {
      await api.post("/fine-tuning/jobs", { name, provider, baseModel, dataset, epochs });
      toast.success("Fine-tuning job created successfully");
      // Refresh jobs list
      const res: any = await api.get("/fine-tuning/jobs");
      const list = Array.isArray(res) ? res : res.jobs || [];
      state.jobs = list.slice(0, 10).map((j: any) => ({
        id: j.id || "",
        name: j.name || "Fine-tune Job",
        provider: j.provider || "openai",
        baseModel: j.model || j.baseModel || "gpt-4o-mini",
        dataset: j.dataset || "",
        status: j.status || "queued",
        progress: j.progress || 0,
        epochs: j.epochs || 3,
        created: j.created || new Date().toISOString().split("T")[0],
        finished: j.finished,
        cost: j.cost,
      }));
      state.showCreateModal = false;
    } catch (e) {
      toast.error("Failed to create fine-tuning job");
    } finally {
      state.creating = false;
    }
  });

  const cancelJob = $(async (id: string) => {
    try {
      await api.post(`/fine-tuning/jobs/${id}/cancel`);
      toast.success("Job cancelled");
      // Refresh jobs list
      const res: any = await api.get("/fine-tuning/jobs");
      const list = Array.isArray(res) ? res : res.jobs || [];
      state.jobs = list.slice(0, 10).map((j: any) => ({
        id: j.id || "",
        name: j.name || "Fine-tune Job",
        provider: j.provider || "openai",
        baseModel: j.model || j.baseModel || "gpt-4o-mini",
        dataset: j.dataset || "",
        status: j.status || "queued",
        progress: j.progress || 0,
        epochs: j.epochs || 3,
        created: j.created || new Date().toISOString().split("T")[0],
        finished: j.finished,
        cost: j.cost,
      }));
    } catch (e) {
      toast.error("Failed to cancel job");
    }
  });

  useTask$(async () => {
    try {
      const res: any = await api.get("/fine-tuning/jobs");
      const list = Array.isArray(res) ? res : res.jobs || [];
      state.jobs = list.slice(0, 10).map((j: any) => ({
        id: j.id || "",
        name: j.name || "Fine-tune Job",
        provider: j.provider || "openai",
        baseModel: j.model || j.baseModel || "gpt-4o-mini",
        dataset: j.dataset || "",
        status: j.status || "queued",
        progress: j.progress || 0,
        epochs: j.epochs || 3,
        created: j.created || new Date().toISOString().split("T")[0],
        finished: j.finished,
        cost: j.cost,
      }));
    } catch (e) {
      state.jobs = [];
      toast.error("Failed to load fine-tuning jobs");
    } finally {
      state.loading = false;
    }
  });

  const statusVariantMap: Record<string, "default" | "success" | "warning" | "error" | "info" | "pending"> = {
    draft: "pending",
    queued: "info",
    running: "warning",
    completed: "success",
    failed: "error",
    cancelled: "default",
  };

  const providerColorMap: Record<string, string> = {
    openai: "bg-green-500/20 text-green-400",
    anthropic: "bg-orange-500/20 text-orange-400",
    together: "bg-blue-500/20 text-blue-400",
  };

  const getStatusVariant = (status: string) => statusVariantMap[status] || "default";

  return (
    <div class="space-y-6">
      <PageHeader title="Fine-tuning" description="Create and manage custom model fine-tuning jobs">
        <Button onClick$={() => { state.showCreateModal = true; }}>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Fine-tune Job
        </Button>
      </PageHeader>

      {state.loading ? (
        <div class="grid grid-cols-5 gap-4">
          <Skeleton class="h-24" />
          <Skeleton class="h-24" />
          <Skeleton class="h-24" />
          <Skeleton class="h-24" />
          <Skeleton class="h-24" />
        </div>
      ) : (
        <StatGrid cols={5}>
          <StatCard value={state.jobs.length} label="Total Jobs" />
          <StatCard value={state.jobs.filter((j) => j.status === "completed").length} label="Completed" valueColor="text-green-400" />
          <StatCard value={state.jobs.filter((j) => j.status === "running").length} label="Running" valueColor="text-yellow-400" />
          <StatCard value={state.jobs.filter((j) => j.status === "queued").length} label="Queued" valueColor="text-blue-400" />
          <StatCard value={`$${state.jobs.filter((j) => j.cost).reduce((acc, j) => acc + (j.cost || 0), 0).toFixed(2)}`} label="Total Cost" valueColor="text-emerald-400" />
        </StatGrid>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fine-tuning Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div class="space-y-4">
              <Skeleton class="h-32" />
              <Skeleton class="h-32" />
              <Skeleton class="h-32" />
            </div>
          ) : state.jobs.length === 0 ? (
            <EmptyState
              icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              title="No fine-tuning jobs yet"
              description="Create your first fine-tuning job to train a custom model on your data."
              action="Create Job"
              onAction={$(() => { state.showCreateModal = true; })}
            />
          ) : (
            <div class="space-y-4">
              {state.jobs.map((job) => (
              <ListItem key={job.id}>
                <div class="w-full">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <h3 class="font-medium">{job.name}</h3>
                      <StatusBadge status={job.status} variant={getStatusVariant(job.status)} />
                      <TypeBadge type={job.provider} colorMap={providerColorMap} />
                    </div>
                    <div class="flex gap-2">
                      {job.status === "draft" && <Button size="sm">Start</Button>}
                      {job.status === "running" && <Button variant="outline" size="sm" onClick$={() => cancelJob(job.id)}>Cancel</Button>}
                      {job.status === "completed" && <Button variant="outline" size="sm">Use Model</Button>}
                      {job.status === "failed" && <Button variant="outline" size="sm">Retry</Button>}
                    </div>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-text-muted mb-3">
                    <span>{job.baseModel}</span>
                    <span>•</span>
                    <span>{job.dataset}</span>
                    <span>•</span>
                    <span>{job.epochs} epochs</span>
                    <span>•</span>
                    <span>Created {job.created}</span>
                    {job.cost && (
                      <>
                        <span>•</span>
                        <span class="text-emerald-400">${job.cost?.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                  {(job.status === "running" || job.status === "queued") && (
                    <div class="space-y-1">
                      <Progress value={job.progress} />
                      <p class="text-xs text-text-muted">{job.progress}% complete</p>
                    </div>
                  )}
                </div>
              </ListItem>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {state.showCreateModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card class="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create Fine-tuning Job</CardTitle>
            </CardHeader>
            <CardContent>
              <form class="space-y-4" preventdefault:submit onSubmit$={() => {
                const form = document.querySelector('form') as HTMLFormElement;
                const formData = new FormData(form);
                createJob(
                  formData.get('name') as string,
                  formData.get('provider') as string,
                  formData.get('baseModel') as string,
                  formData.get('dataset') as string,
                  parseInt(formData.get('epochs') as string) || 3
                );
              }}>
                <div>
                  <label class="block text-sm font-medium mb-1">Job Name</label>
                  <input name="name" type="text" required class="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary" placeholder="My Fine-tune Job" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Provider</label>
                  <select name="provider" required class="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="together">Together AI</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Base Model</label>
                  <input name="baseModel" type="text" required class="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary" placeholder="gpt-4o-mini" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Dataset</label>
                  <input name="dataset" type="text" required class="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary" placeholder="my-dataset.jsonl" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Epochs</label>
                  <input name="epochs" type="number" min="1" max="10" defaultValue="3" class="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div class="flex gap-3 pt-4">
                  <Button type="button" variant="outline" class="flex-1" onClick$={() => { state.showCreateModal = false; }}>Cancel</Button>
                  <Button type="submit" class="flex-1" disabled={state.creating}>
                    {state.creating ? "Creating..." : "Create Job"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dataset Preparation</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-sm text-text-muted">Prepare your training data in JSONL format with prompt-completion pairs.</p>
            <div class="space-y-2">
              {state.datasets.map((dataset) => (
                <div key={dataset} class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-surface-light">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-sm">{dataset}</span>
                  </div>
                  <div class="flex gap-2">
                    <Button variant="ghost" size="sm">Preview</Button>
                    <Button variant="ghost" size="sm">Validate</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" class="w-full">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Dataset
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported Providers</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="p-3 rounded-lg bg-surface/50 border border-surface-light">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">OpenAI</p>
                  <p class="text-xs text-text-muted">GPT-4o-mini, GPT-4o, GPT-3.5-turbo</p>
                </div>
                <StatusBadge status="Available" variant="success" />
              </div>
            </div>
            <div class="p-3 rounded-lg bg-surface/50 border border-surface-light">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">Anthropic</p>
                  <p class="text-xs text-text-muted">Claude 3 Haiku (beta)</p>
                </div>
                <StatusBadge status="Beta" variant="warning" />
              </div>
            </div>
            <div class="p-3 rounded-lg bg-surface/50 border border-surface-light">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">Together AI</p>
                  <p class="text-xs text-text-muted">Llama, Mistral models</p>
                </div>
                <StatusBadge status="Available" variant="success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Fine-tuning",
};
