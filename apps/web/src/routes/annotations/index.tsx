import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/ui/page-header";
import { StatGrid } from "~/components/ui/stat-card";
import { StarRating } from "~/components/ui/star-rating";
import { Select } from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";

interface Annotation {
  id: string;
  experimentId: string;
  model: string;
  prompt: string;
  output: string;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  label: "good" | "bad" | "needs_review" | null;
  correction?: string;
  annotator: string;
  timestamp: string;
}

export default component$(() => {
  const toast = useToast();
  const state = useStore<{
    annotations: Annotation[];
    filter: string;
    selectedAnnotation: Annotation | null;
    loading: boolean;
  }>({
    annotations: [],
    filter: "",
    selectedAnnotation: null,
    loading: true,
  });

  useTask$(async () => {
    try {
      const res: any = await api.get("/annotations");
      const list = Array.isArray(res) ? res : res.annotations || [];
      state.annotations = list.map((a: any) => ({
        id: a.id || "",
        experimentId: a.experimentId || "",
        model: a.model || "unknown",
        prompt: a.prompt || "",
        output: a.output || "",
        rating: a.rating || null,
        label: a.label || null,
        correction: a.correction,
        annotator: a.annotator || "unknown",
        timestamp: a.timestamp || new Date().toISOString(),
      }));
    } catch (e) {
      state.annotations = [];
      toast.error("Failed to load annotations");
    } finally {
      state.loading = false;
    }
  });

  const labelColors: Record<string, string> = {
    good: "bg-green-500/20 text-green-400",
    bad: "bg-red-500/20 text-red-400",
    needs_review: "bg-yellow-500/20 text-yellow-400",
  };

  const stats = {
    total: state.annotations.length,
    rated: state.annotations.filter((a) => a.rating).length,
    avgRating: state.annotations.filter((a) => a.rating).reduce((acc, a) => acc + (a.rating || 0), 0) / state.annotations.filter((a) => a.rating).length || 0,
    good: state.annotations.filter((a) => a.label === "good").length,
    bad: state.annotations.filter((a) => a.label === "bad").length,
    needsReview: state.annotations.filter((a) => a.label === "needs_review").length,
  };

  return (
    <div class="space-y-6">
      <PageHeader title="Annotations" description="Human feedback collection for model evaluation">
        <div class="flex gap-2">
          <Button variant="outline">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
          <Button>
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Batch
          </Button>
        </div>
      </PageHeader>

      <StatGrid cols={6}>
        {state.loading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent class="pt-6">
                  <Skeleton class="h-8 w-12 mb-1" />
                  <Skeleton class="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
        <>
        <Card>
          <CardContent class="pt-6">
            <div class="text-2xl font-bold">{stats.total}</div>
            <p class="text-xs text-text-muted">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="text-2xl font-bold">{stats.rated}</div>
            <p class="text-xs text-text-muted">Rated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p class="text-xs text-text-muted">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="text-2xl font-bold text-green-400">{stats.good}</div>
            <p class="text-xs text-text-muted">Good</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="text-2xl font-bold text-yellow-400">{stats.needsReview}</div>
            <p class="text-xs text-text-muted">Needs Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="text-2xl font-bold text-red-400">{stats.bad}</div>
            <p class="text-xs text-text-muted">Bad</p>
          </CardContent>
        </Card>
        </>
        )}
      </StatGrid>

      <div class="flex gap-4">
        <Select value={state.filter} onChange$={(e) => (state.filter = (e.target as HTMLSelectElement).value)}>
          <option value="">All Labels</option>
          <option value="good">Good</option>
          <option value="bad">Bad</option>
          <option value="needs_review">Needs Review</option>
        </Select>
        <Select>
          <option value="">All Annotators</option>
          <option value="alice">Alice</option>
          <option value="bob">Bob</option>
          <option value="charlie">Charlie</option>
        </Select>
      </div>

      {state.annotations.length === 0 && !state.loading && (
        <EmptyState
          title="No annotations found"
          description="Create your first annotation batch to get started"
          action="New Batch"
        />
      )}

      {state.annotations.length > 0 && (
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {state.annotations.map((annotation) => (
          <Card key={annotation.id} class="hover:border-surface-light/80 transition-colors cursor-pointer" onClick$={() => (state.selectedAnnotation = annotation)}>
            <CardContent class="pt-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <Badge variant="outline">{annotation.model}</Badge>
                  {annotation.label && (
                    <span class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${labelColors[annotation.label]}`}>
                      {annotation.label.replace("_", " ")}
                    </span>
                  )}
                </div>
                {annotation.rating && (
                  <StarRating rating={annotation.rating} />
                )}
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-xs text-text-muted mb-1">Prompt</p>
                  <p class="text-sm line-clamp-2">{annotation.prompt}</p>
                </div>
                <div>
                  <p class="text-xs text-text-muted mb-1">Output</p>
                  <p class="text-sm line-clamp-3">{annotation.output}</p>
                </div>
                {annotation.correction && (
                  <div class="p-2 bg-green-500/10 rounded border border-green-500/20">
                    <p class="text-xs text-green-400 mb-1">Correction</p>
                    <p class="text-sm line-clamp-2">{annotation.correction}</p>
                  </div>
                )}
              </div>
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-surface-light text-xs text-text-muted">
                <span>{annotation.annotator}</span>
                <span>{new Date(annotation.timestamp).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Annotations",
};
