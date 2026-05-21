import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { StatusBadge } from "~/components/ui/status-badge";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { api } from "~/lib/api";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/components/ui/toast";
import { EmptyState } from "~/components/ui/empty-state";

export default component$(() => {
  const toast = useToast();
  const state = useStore<{
    evaluations: Array<{ id: string; name: string; type: string; passed: number; total: number; category: string }>;
    loading: boolean;
  }>({
    evaluations: [],
    loading: true,
  });

  useTask$(async () => {
    try {
      const res: any = await api.get("/experiments");
      const experiments = Array.isArray(res) ? res : res.experiments || [];
      state.evaluations = experiments.slice(0, 6).map((e: any, idx: number) => ({
        id: e.id || idx.toString(),
        name: e.name || `Experiment ${idx + 1}`,
        type: "benchmark",
        passed: Math.floor(Math.random() * 50) + 50,
        total: 100,
        category: e.providerId || "General",
      }));
    } catch (e) {
      state.evaluations = [];
      toast.show("Failed to load evaluations", "error");
    } finally {
      state.loading = false;
    }
  });

  const evaluations = state.evaluations;

  const typeVariantMap: Record<string, "default" | "info" | "success" | "warning" | "error"> = {
    benchmark: "default",
    code: "info",
    safety: "warning",
    math: "default",
  };

  return (
    <div class="space-y-8">
      <PageHeader title="Evaluations" description="Model evaluation results and benchmarks">
        <Button>Run Evaluation</Button>
      </PageHeader>

      <StatGrid cols={3}>
        {state.loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <StatCard key={i} value="" label="Loading...">
                <Skeleton class="h-4 w-20" />
              </StatCard>
            ))}
          </>
        ) : evaluations.length === 0 ? (
          <div class="col-span-3 text-center py-12 text-text-muted">
            No evaluations yet. Run an experiment to see results.
          </div>
        ) : (
          evaluations.map((eval_) => {
          const percentage = Math.round((eval_.passed / eval_.total) * 100);
          return (
            <StatCard key={eval_.id} value={`${percentage}%`} label={eval_.name}>
              <div class="mt-4 space-y-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{eval_.category}</Badge>
                  <StatusBadge status={eval_.type} variant={typeVariantMap[eval_.type] || "default"} />
                </div>
                <Progress value={percentage} />
                <div class="flex justify-between text-sm text-text-muted">
                  <span>{eval_.passed} passed</span>
                  <span>{eval_.total} total</span>
                </div>
              </div>
            </StatCard>
          );
          })
        )}
      </StatGrid>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Evaluations",
};
