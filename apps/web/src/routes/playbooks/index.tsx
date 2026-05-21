import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { StatusBadge, TypeBadge } from "~/components/ui/status-badge";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Select } from "~/components/ui/select";
import { SearchInput } from "~/components/ui/search-filter";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";

interface Playbook {
  id: string;
  name: string;
  description: string;
  type: "evaluation" | "benchmark" | "comparison" | "custom";
  steps: number;
  status: "draft" | "active" | "running" | "completed" | "failed";
  lastRun?: string;
  schedule?: string;
  created: string;
  tags: string[];
}

export default component$(() => {
  const state = useStore<{
    playbooks: Playbook[];
    search: string;
    loading: boolean;
    expandedPlaybook: string | null;
  }>({
    playbooks: [],
    search: "",
    loading: true,
    expandedPlaybook: null,
  });

  const toast = useToast();

  useTask$(async () => {
    try {
      const res: any = await api.get("/playbooks");
      const list = Array.isArray(res) ? res : res.playbooks || [];
      state.playbooks = list.map((p: any) => ({
        id: p.id || "",
        name: p.name || "",
        description: p.description || "",
        type: p.type || "custom",
        steps: p.steps || 0,
        status: p.status || "draft",
        lastRun: p.lastRun,
        schedule: p.schedule,
        created: p.created || new Date().toISOString(),
        tags: p.tags || [],
      }));
    } catch (e) {
      state.playbooks = [];
      toast.error("Failed to load playbooks");
    } finally {
      state.loading = false;
    }
  });

  const statusVariantMap: Record<string, "success" | "info" | "pending" | "default" | "error"> = {
    draft: "pending",
    active: "success",
    running: "info",
    completed: "success",
    failed: "error",
  };

  const filteredPlaybooks = state.playbooks.filter((p) =>
    p.name.toLowerCase().includes(state.search.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(state.search.toLowerCase()))
  );

  return (
    <div class="space-y-6">
      <PageHeader title="Playbooks" description="Automated evaluation workflows and batch processing">
        <div class="flex gap-2">
          <Button variant="outline">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Import Template
          </Button>
          <Button onClick$={() => toast.info("Playbook creation coming soon")}>
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Playbook
          </Button>
        </div>
      </PageHeader>

      <StatGrid cols={4}>
        {state.loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <StatCard key={i} value="" label="Loading...">
                <Skeleton class="h-4 w-20" />
              </StatCard>
            ))}
          </>
        ) : (
          <>
            <StatCard value={state.playbooks.length} label="Total Playbooks" />
            <StatCard value={state.playbooks.filter((p) => p.status === "active").length} label="Active" valueColor="text-green-400" />
            <StatCard value={state.playbooks.filter((p) => p.status === "running").length} label="Running" valueColor="text-blue-400" />
            <StatCard value={state.playbooks.filter((p) => p.schedule).length} label="Scheduled" />
          </>
        )}
      </StatGrid>

      <div class="flex gap-4">
        <div class="flex-1">
          <SearchInput
            value={state.search}
            placeholder="Search playbooks..."
            onInput$={(val) => (state.search = val)}
          />
        </div>
        <Select>
          <option value="">All Types</option>
          <option value="evaluation">Evaluation</option>
          <option value="benchmark">Benchmark</option>
          <option value="comparison">Comparison</option>
          <option value="custom">Custom</option>
        </Select>
        <Select>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      {filteredPlaybooks.length === 0 && !state.loading && (
        <EmptyState title="No playbooks" description="Create a playbook to automate evaluation workflows" />
      )}

      <div class="grid gap-4 md:grid-cols-2">
        {filteredPlaybooks.map((playbook) => (
          <div key={playbook.id} class="flex flex-col rounded-lg border border-surface-light bg-surface/50 hover:bg-surface transition-colors hover:border-surface-light/80 cursor-pointer" onClick$={() => { state.expandedPlaybook = state.expandedPlaybook === playbook.id ? null : playbook.id; }}>
            <div class="w-full p-4 pb-2">
              <div class="flex items-start justify-between">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-semibold">{playbook.name}</h3>
                    <span class="text-text-muted text-xs">
                      {state.expandedPlaybook === playbook.id ? "▼" : "▶"}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <TypeBadge type={playbook.type} />
                    <StatusBadge status={playbook.status} variant={statusVariantMap[playbook.status]} />
                  </div>
                </div>
                <button class="text-text-muted hover:text-text" onClick$={(e) => e.stopPropagation()}>
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="w-full px-4 pb-4">
              <p class="text-sm text-text-muted mb-4">{playbook.description}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-muted">{playbook.steps} steps</span>
                <div class="flex gap-1">
                  {playbook.tags.map((tag) => (
                    <Badge key={tag} variant="outline" class="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-surface-light flex justify-between text-xs text-text-muted">
                <div>
                  {playbook.schedule && (
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {playbook.schedule}
                    </span>
                  )}
                  {!playbook.schedule && <span>Created: {playbook.created}</span>}
                </div>
                <div class="flex gap-2" onClick$={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">Run</Button>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
              {state.expandedPlaybook === playbook.id && (
                <div class="mt-4 border-t border-surface-light pt-4 space-y-3">
                  <h4 class="text-sm font-semibold text-text-muted uppercase tracking-wider">Steps ({playbook.steps})</h4>
                  <div class="space-y-2">
                    {Array.from({ length: playbook.steps }, (_, i) => (
                      <div key={i} class="flex items-center gap-3 p-3 rounded-lg bg-surface/40 border border-surface-light">
                        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium">{["Prepare data", "Run evaluation", "Analyze results", "Generate report", "Review output", "Deploy model"][i % 6]}</p>
                          <p class="text-xs text-text-muted">Step {i + 1} of {playbook.steps}</p>
                        </div>
                        <StatusBadge
                          status={i < Math.floor(playbook.steps * 0.6) ? "completed" : i === Math.floor(playbook.steps * 0.6) ? "running" : "pending"}
                          variant={i < Math.floor(playbook.steps * 0.6) ? "success" : i === Math.floor(playbook.steps * 0.6) ? "info" : "pending"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Playbooks",
};
