import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { StatusBadge } from "~/components/ui/status-badge";
import { ListItem } from "~/components/ui/list-item";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";

interface EmbeddingJob {
  id: string;
  name: string;
  model: string;
  documents: number;
  dimensions: number;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  created: string;
}

interface SimilarityResult {
  id: string;
  text1: string;
  text2: string;
  score: number;
}

export default component$(() => {
  const toast = useToast();

  const state = useStore<{
    jobs: EmbeddingJob[];
    similarityResults: SimilarityResult[];
    searchQuery: string;
    loading: boolean;
  }>({
    jobs: [],
    similarityResults: [],
    searchQuery: "",
    loading: true,
  });

  useTask$(async () => {
    try {
      const res: any = await api.get("/embeddings/jobs");
      const list = Array.isArray(res) ? res : res.jobs || [];
      state.jobs = list.slice(0, 10).map((j: any) => ({
        id: j.id || "",
        name: j.name || "Embedding Job",
        model: j.model || "text-embedding-3-small",
        documents: j.documents || 0,
        dimensions: j.dimensions || 1536,
        status: j.status || "pending",
        progress: j.progress || 0,
        created: j.created || new Date().toISOString().split("T")[0],
      }));
    } catch (e) {
      toast.error("Failed to load embedding jobs");
      state.jobs = [];
    } finally {
      state.loading = false;
    }
  });

  const statusVariant: Record<string, "pending" | "info" | "success" | "error"> = {
    pending: "pending",
    processing: "info",
    completed: "success",
    failed: "error",
  };

  return (
    <div class="space-y-6">
      <PageHeader
        title="Embeddings"
        description="Manage embedding jobs, similarity search, and clustering"
      >
        <Button>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Embedding Job
        </Button>
      </PageHeader>

      <StatGrid cols={4}>
        {state.loading ? (
          <>
            <StatCard value="" label="Total Jobs"><Skeleton class="h-4 w-20" /></StatCard>
            <StatCard value="" label="Completed"><Skeleton class="h-4 w-20" /></StatCard>
            <StatCard value="" label="Total Documents"><Skeleton class="h-4 w-20" /></StatCard>
            <StatCard value="" label="Processing"><Skeleton class="h-4 w-20" /></StatCard>
          </>
        ) : (
          <>
            <StatCard value={state.jobs.length.toString()} label="Total Jobs" />
            <StatCard value={state.jobs.filter((j) => j.status === "completed").length.toString()} label="Completed" valueColor="text-green-400" />
            <StatCard value={state.jobs.reduce((acc, j) => acc + j.documents, 0).toLocaleString()} label="Total Documents" />
            <StatCard value={state.jobs.filter((j) => j.status === "processing").length.toString()} label="Processing" valueColor="text-blue-400" />
          </>
        )}
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Embedding Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {state.jobs.length === 0 && !state.loading ? (
            <EmptyState title="No embedding jobs" description="Create an embedding job to get started" />
          ) : (
          <div class="space-y-4">
            {state.jobs.map((job) => (
              <ListItem key={job.id}>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <h3 class="font-medium">{job.name}</h3>
                    <StatusBadge status={job.status} variant={statusVariant[job.status]} />
                  </div>
                  <div class="flex gap-2">
                    {job.status === "completed" && (
                      <Button variant="outline" size="sm">Search</Button>
                    )}
                    {job.status === "pending" && (
                      <Button size="sm">Start</Button>
                    )}
                    {job.status === "failed" && (
                      <Button variant="outline" size="sm">Retry</Button>
                    )}
                  </div>
                </div>
                <div class="flex items-center gap-4 text-sm text-text-muted mb-3">
                  <span>{job.model}</span>
                  <span>•</span>
                  <span>{job.documents.toLocaleString()} docs</span>
                  <span>•</span>
                  <span>{job.dimensions} dims</span>
                  <span>•</span>
                  <span>{job.created}</span>
                </div>
                {job.status === "processing" && (
                  <div class="space-y-1">
                    <Progress value={job.progress} />
                    <p class="text-xs text-text-muted">{job.progress}% complete</p>
                  </div>
                )}
              </ListItem>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Similarity Search</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex gap-2">
              <Input
                placeholder="Enter text to find similar documents..."
                value={state.searchQuery}
                onInput$={(e) => (state.searchQuery = (e.target as HTMLInputElement).value)}
                class="flex-1"
              />
              <Button>Search</Button>
            </div>
            <div class="space-y-2">
              {state.similarityResults.map((result) => (
                <div key={result.id} class="p-3 rounded-lg bg-surface/50 border border-surface-light">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium">{result.text1}</span>
                      <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      <span class="text-sm">{result.text2}</span>
                    </div>
                    <StatusBadge status={`${(result.score * 100).toFixed(0)}%`} variant="success" />
                  </div>
                  <div class="w-full bg-surface-light rounded-full h-1.5">
                    <div class="bg-primary h-1.5 rounded-full" style={`width: ${result.score * 100}%`}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <ListItem>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">text-embedding-3-small</p>
                  <p class="text-xs text-text-muted">OpenAI • 1536 dimensions</p>
                </div>
                <StatusBadge status="Fast" variant="info" />
              </div>
            </ListItem>
            <ListItem>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">text-embedding-3-large</p>
                  <p class="text-xs text-text-muted">OpenAI • 3072 dimensions</p>
                </div>
                <StatusBadge status="High Quality" variant="success" />
              </div>
            </ListItem>
            <ListItem>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">nomic-embed-text</p>
                  <p class="text-xs text-text-muted">Ollama • 768 dimensions</p>
                </div>
                <StatusBadge status="Local" variant="pending" />
              </div>
            </ListItem>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Embeddings",
};
