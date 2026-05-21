import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { TypeBadge } from "~/components/ui/status-badge";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { Select } from "~/components/ui/select";
import { SearchInput } from "~/components/ui/search-filter";
import { api } from "~/lib/api";

interface Dataset {
  id: string;
  name: string;
  description: string;
  type: "qa" | "code" | "reasoning" | "safety" | "custom";
  entries: number;
  version: string;
  tags: string[];
  created: string;
  lastModified: string;
}

const typeColors: Record<string, string> = {
  qa: "bg-blue-500/20 text-blue-400",
  code: "bg-green-500/20 text-green-400",
  reasoning: "bg-purple-500/20 text-purple-400",
  safety: "bg-red-500/20 text-red-400",
  custom: "bg-yellow-500/20 text-yellow-400",
};

export default component$(() => {
  const toast = useToast();
  const state = useStore<{
    datasets: Dataset[];
    search: string;
    loading: boolean;
    showCreateModal: boolean;
    showImportModal: boolean;
    form: {
      name: string;
      description: string;
      type: string;
      saving: boolean;
    };
    importData: string;
  }>({
    datasets: [],
    search: "",
    loading: true,
    showCreateModal: false,
    showImportModal: false,
    form: {
      name: "",
      description: "",
      type: "custom",
      saving: false,
    },
    importData: "",
  });

  useTask$(async () => {
    try {
      const res: any = await api.get("/datasets");
      state.datasets = Array.isArray(res) ? res : res.datasets || [];
    } catch (e) {
      state.datasets = [];
      toast.error("Failed to load datasets");
    } finally {
      state.loading = false;
    }
  });

  const createDataset = $(async () => {
    if (!state.form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    state.form.saving = true;
    try {
      await api.post("/datasets", {
        name: state.form.name,
        description: state.form.description,
        type: state.form.type,
      });
      toast.success("Dataset created");
      state.showCreateModal = false;
      state.form = { name: "", description: "", type: "custom", saving: false };
      const res: any = await api.get("/datasets");
      state.datasets = Array.isArray(res) ? res : res.datasets || [];
    } catch (e) {
      toast.error("Failed to create dataset");
    } finally {
      state.form.saving = false;
    }
  });

  const deleteDataset = $(async (id: string) => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;
    try {
      await api.delete(`/datasets/${id}`);
      toast.success("Dataset deleted");
      state.datasets = state.datasets.filter((d) => d.id !== id);
    } catch (e) {
      toast.error("Failed to delete dataset");
    }
  });

  const importDataset = $(async () => {
    if (!state.form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    state.form.saving = true;
    try {
      await api.post("/datasets/import", {
        name: state.form.name,
        data: state.importData,
      });
      toast.success("Dataset imported");
      state.showImportModal = false;
      state.form = { name: "", description: "", type: "custom", saving: false };
      state.importData = "";
      const res: any = await api.get("/datasets");
      state.datasets = Array.isArray(res) ? res : res.datasets || [];
    } catch (e) {
      toast.error("Failed to import dataset");
    } finally {
      state.form.saving = false;
    }
  });

  const filteredDatasets = state.datasets.filter((d) =>
    d.name.toLowerCase().includes(state.search.toLowerCase()) ||
    d.tags.some((t) => t.toLowerCase().includes(state.search.toLowerCase()))
  );

  return (
    <div class="space-y-6">
      <PageHeader title="Datasets" description="Manage evaluation datasets and test cases">
        <div class="flex gap-2">
          <Button variant="outline" onClick$={() => { state.showImportModal = true; }}>
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </Button>
          <Button onClick$={() => { state.showCreateModal = true; }}>
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Dataset
          </Button>
        </div>
      </PageHeader>

      <StatGrid cols={4}>
        <StatCard value={state.datasets.length} label="Total Datasets" />
        <StatCard value={state.datasets.reduce((acc, d) => acc + d.entries, 0).toLocaleString()} label="Total Entries" />
        <StatCard value={state.datasets.filter((d) => d.type === "code").length} label="Code Datasets" />
        <StatCard value={state.datasets.filter((d) => d.type === "custom").length} label="Custom Datasets" />
      </StatGrid>

      <div class="flex gap-4">
        <SearchInput
          value={state.search}
          placeholder="Search datasets by name or tag..."
          onInput$={(val) => (state.search = val)}
        />
        <Select>
          <option value="">All Types</option>
          <option value="qa">QA</option>
          <option value="code">Code</option>
          <option value="reasoning">Reasoning</option>
          <option value="safety">Safety</option>
          <option value="custom">Custom</option>
        </Select>
      </div>

      {state.datasets.length === 0 && !state.loading && (
        <EmptyState
          title="No datasets found"
          description="Create your first dataset to get started"
          action="Create Dataset"
        />
      )}

      {state.datasets.length > 0 && (
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDatasets.map((dataset) => (
          <Card key={dataset.id} class="hover:border-surface-light/80 transition-colors cursor-pointer">
            <CardHeader>
              <div class="flex items-start justify-between">
                <div class="flex flex-col gap-2">
                  <CardTitle class="text-lg">{dataset.name}</CardTitle>
                  <div class="flex items-center gap-2">
                    <TypeBadge type={dataset.type} colorMap={typeColors} />
                    <span class="text-xs text-text-muted">v{dataset.version}</span>
                  </div>
                </div>
                <button class="text-text-muted hover:text-text">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-text-muted mb-4">{dataset.description}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-muted">{dataset.entries.toLocaleString()} entries</span>
                <div class="flex gap-1">
                  {dataset.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" class="text-xs">{tag}</Badge>
                  ))}
                  {dataset.tags.length > 2 && (
                    <span class="text-xs text-text-muted">+{dataset.tags.length - 2}</span>
                  )}
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-surface-light flex justify-between text-xs text-text-muted">
                <span>Modified: {dataset.lastModified}</span>
                <div class="flex gap-2">
                  <button class="hover:text-text">Export</button>
                  <button class="hover:text-text">Duplicate</button>
                  <button class="hover:text-red-400" onClick$={() => deleteDataset(dataset.id)}>Delete</button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {state.datasets.length > 0 && filteredDatasets.length === 0 && (
        <EmptyState
          title="No datasets found"
          description="Try adjusting your search or filters"
        />
      )}

      {/* Create Dataset Modal */}
      {state.showCreateModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card class="w-full max-w-md mx-4">
            <CardHeader><CardTitle>Create Dataset</CardTitle></CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Name</label>
                  <Input value={state.form.name} onInput$={(e) => { state.form.name = (e.target as HTMLInputElement).value; }} placeholder="My Dataset" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium">Description</label>
                  <Input value={state.form.description} onInput$={(e) => { state.form.description = (e.target as HTMLInputElement).value; }} placeholder="Optional description" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium">Type</label>
                  <Select value={state.form.type} onChange$={(e) => { state.form.type = (e.target as HTMLSelectElement).value; }}>
                    <option value="qa">Q&A</option>
                    <option value="code">Code</option>
                    <option value="reasoning">Reasoning</option>
                    <option value="safety">Safety</option>
                    <option value="custom">Custom</option>
                  </Select>
                </div>
                <div class="flex gap-2 justify-end">
                  <Button variant="outline" onClick$={() => { state.showCreateModal = false; }}>Cancel</Button>
                  <Button onClick$={createDataset} disabled={state.form.saving}>
                    {state.form.saving ? "Creating..." : "Create Dataset"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Dataset Modal */}
      {state.showImportModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card class="w-full max-w-lg mx-4">
            <CardHeader><CardTitle>Import Dataset</CardTitle></CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Dataset Name</label>
                  <Input value={state.form.name} onInput$={(e) => { state.form.name = (e.target as HTMLInputElement).value; }} placeholder="My Imported Dataset" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium">JSONL Data</label>
                  <textarea
                    placeholder='{"prompt": "...", "completion": "..."}&#10;{"prompt": "...", "completion": "..."}'
                    class="w-full min-h-[120px] rounded-lg border border-surface-light bg-surface p-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    onInput$={(e) => { state.importData = (e.target as HTMLTextAreaElement).value; }}
                  />
                  <p class="text-xs text-text-muted">Paste JSONL entries, one per line</p>
                </div>
                <div class="flex gap-2 justify-end">
                  <Button variant="outline" onClick$={() => { state.showImportModal = false; }}>Cancel</Button>
                  <Button onClick$={importDataset} disabled={state.form.saving}>
                    {state.form.saving ? "Importing..." : "Import Dataset"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Datasets",
};
