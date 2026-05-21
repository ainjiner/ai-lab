import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Select, Tooltip } from "~/components/ui";
import { PageHeader } from "~/components/ui/page-header";
import { StatGrid, StatCard } from "~/components/ui/stat-card";
import { PeriodSelector, SearchInput } from "~/components/ui/search-filter";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { Pagination } from "~/components/ui/pagination";
import { timeAgo, formatExact } from "~/lib/time";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";

interface TraceRecord {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  tokens_prompt: number;
  tokens_completion: number;
  cost_total: number;
  latency_ms: number;
  experiment_id?: string;
}

interface ExportAPIResponse {
  data: string | TraceRecord[];
}

interface TracingState {
  data: string | TraceRecord[];
  loading: boolean;
  period: "all" | "daily" | "weekly" | "monthly";
  selectedProvider: string;
  selectedModel: string;
  searchQuery: string;
  page: number;
  expandedRowIds: string[];
}

export default component$(() => {
  const toast = useToast();

  const state = useStore<TracingState>({
    data: "[]",
    loading: true,
    period: "all",
    selectedProvider: "all",
    selectedModel: "all",
    searchQuery: "",
    page: 1,
    expandedRowIds: [],
  });

  const loadData = $(async () => {
    try {
      const res = await api.get<ExportAPIResponse>("/analytics/export?format=json");
      state.data = typeof res.data === "string" ? res.data : JSON.stringify(res.data || res || []);
    } catch (err) {
      console.error("Failed to load trace logs:", err);
      toast.error("Failed to load tracing data");
    }
  });

  useTask$(async () => {
    state.loading = true;
    try {
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tracing data");
    } finally {
      state.loading = false;
    }
  });

  const parseDate = (dStr: string) => {
    return new Date(dStr + "Z").getTime();
  };

  const allRecords = (() => {
    try {
      if (Array.isArray(state.data)) return state.data;
      return JSON.parse(state.data || "[]");
    } catch {
      return [];
    }
  })();

  const uniqueProviders = Array.from(new Set(allRecords.map((r: TraceRecord) => r.provider))).filter(Boolean) as string[];
  const uniqueModels = Array.from(new Set(allRecords.map((r: TraceRecord) => r.model))).filter(Boolean) as string[];

  const filteredRecords = (() => {
    const now = Date.now();
    return allRecords.filter((r: TraceRecord) => {
      if (state.period !== "all") {
        const time = parseDate(r.timestamp);
        const diffMs = now - time;
        if (state.period === "daily" && diffMs > 24 * 60 * 60 * 1000) return false;
        if (state.period === "weekly" && diffMs > 7 * 24 * 60 * 60 * 1000) return false;
        if (state.period === "monthly" && diffMs > 30 * 24 * 60 * 60 * 1000) return false;
      }
      
      if (state.selectedProvider !== "all" && r.provider !== state.selectedProvider) {
        return false;
      }
      
      if (state.selectedModel !== "all" && r.model !== state.selectedModel) {
        return false;
      }
      
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        if (!r.model.toLowerCase().includes(query) && !r.provider.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  })();

  const limit = 50;
  const totalCount = filteredRecords.length;
  const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
  const currentPage = Math.min(state.page, totalPages);
  
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * limit, currentPage * limit);

  const exportJSON = $(async () => {
    try {
      const res = await api.get<ExportAPIResponse>("/analytics/export?format=json");
      const jsonText = typeof res === "string" 
        ? res 
        : JSON.stringify(typeof res.data === "string" ? JSON.parse(res.data) : res.data, null, 2);
      
      const blob = new Blob([jsonText], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `tracing_export_${Date.now()}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await toast.success("JSON logs exported successfully!");
    } catch (err) {
      await toast.error(`Failed to export JSON: ${String(err)}`);
    }
  });

  const exportCSV = $(async () => {
    try {
      const res = await api.get<string | { data: string }>("/analytics/export?format=csv");
      const csvText = typeof res === "string" ? res : (res && res.data) || "";
      
      if (!csvText) {
        await toast.error("No data available to export.");
        return;
      }

      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `tracing_export_${Date.now()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await toast.success("CSV logs exported successfully!");
    } catch (err) {
      await toast.error(`Failed to export CSV: ${String(err)}`);
    }
  });

  return (
    <div class="space-y-8">
      <PageHeader title="Tracing" description="Request and response logs">
        <div class="flex items-center gap-3">
          <PeriodSelector
            periods={["all", "daily", "weekly", "monthly"]}
            selected={state.period}
            onChange={$((p: string) => { state.period = p as "all" | "daily" | "weekly" | "monthly"; state.page = 1; })}
          />
        </div>
      </PageHeader>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-text-muted">Provider</label>
          <Select
            value={state.selectedProvider}
            onChange$={(e: Event) => {
              state.selectedProvider = (e.target as HTMLSelectElement).value;
              state.page = 1;
            }}
            class="capitalize"
          >
            <option value="all">All Providers</option>
            {uniqueProviders.map((p: string) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-medium text-text-muted">Model</label>
          <Select
            value={state.selectedModel}
            onChange$={(e: Event) => {
              state.selectedModel = (e.target as HTMLSelectElement).value;
              state.page = 1;
            }}
          >
            <option value="all">All Models</option>
            {uniqueModels.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-medium text-text-muted">Search</label>
          <SearchInput
            placeholder="Search by model or provider..."
            value={state.searchQuery}
            onInput$={(val: string) => { state.searchQuery = val; state.page = 1; }}
          />
        </div>
      </div>

      <StatGrid cols={3}>
        <StatCard
          value={totalCount}
          label="Total Logs"
          valueColor="text-primary tabular-nums"
        />
        <StatCard
          value={totalPages}
          label="Total Pages"
          valueColor="text-warning tabular-nums"
        />
        <StatCard
          value={currentPage}
          label="Current Page"
          valueColor="text-info tabular-nums"
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <div class="flex flex-row items-center justify-between w-full pb-2">
            <div>
              <CardTitle>Request Logs</CardTitle>
              <p class="text-xs text-text-muted mt-1">Interactive real-time model traces ({totalCount} found)</p>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick$={exportJSON}>
                <span>Export JSON</span>
              </Button>
              <Button variant="outline" size="sm" onClick$={exportCSV}>
                <span>Export CSV</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="pt-4">
            {state.loading ? (
              <div class="space-y-4 py-2">
                <div class="flex items-center space-x-4">
                  <Skeleton class="h-4 w-1/4" />
                  <Skeleton class="h-4 w-1/4" />
                  <Skeleton class="h-4 w-1/2" />
                </div>
                <div class="flex items-center space-x-4">
                  <Skeleton class="h-4 w-1/4" />
                  <Skeleton class="h-4 w-1/4" />
                  <Skeleton class="h-4 w-1/2" />
                </div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <EmptyState title="No trace records" description="No trace records match the current filters" />
            ) : (
              <div class="space-y-4">
                <div class="overflow-x-auto rounded-lg border border-surface-light">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Latency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRecords.map((r: TraceRecord) => {
                        const isExpanded = state.expandedRowIds.includes(r.id);
                        return (
                          <>
                            <TableRow
                              key={r.id}
                              class="hover:bg-surface-light/40 cursor-pointer"
                              onClick$={() => {
                                if (state.expandedRowIds.includes(r.id)) {
                                  state.expandedRowIds = state.expandedRowIds.filter((id: string) => id !== r.id);
                                } else {
                                  state.expandedRowIds = [...state.expandedRowIds, r.id];
                                }
                              }}
                            >
                              <TableCell class="text-xs font-semibold">
                                <span class="inline-block transform transition-transform duration-200 mr-2 text-text-muted text-[10px]">
                                  {isExpanded ? "▼" : "▶"}
                                </span>
                                {r.timestamp ? <Tooltip content={formatExact(r.timestamp + "Z")} position="top" class="inline-flex">{timeAgo(r.timestamp + "Z")}</Tooltip> : "—"}
                              </TableCell>
                              <TableCell class="font-medium capitalize text-xs">{r.provider}</TableCell>
                              <TableCell class="text-xs font-mono max-w-[160px]"><Tooltip content={r.model} position="top"><div class="truncate">{r.model}</div></Tooltip></TableCell>
                              <TableCell class="text-xs font-semibold tabular-nums text-indigo-400">
                                {r.tokens_prompt?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell class="text-xs font-semibold tabular-nums text-purple-400">
                                {r.tokens_completion?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell class="text-xs font-bold tabular-nums">
                                {(r.tokens_prompt + r.tokens_completion)?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell class="text-xs font-mono text-amber-400">
                                ${r.cost_total?.toFixed(6) || "0.000000"}
                              </TableCell>
                              <TableCell class="text-xs text-cyan-400 font-bold">{r.latency_ms}ms</TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow class="bg-surface/30 hover:bg-transparent">
                                <TableCell colSpan={8} class="p-6">
                                  <div class="space-y-4">
                                    <div class="space-y-1">
                                      <h4 class="text-xs font-semibold text-text-muted uppercase tracking-wider">Metadata & Parameters</h4>
                                      <pre class="p-4 rounded-lg bg-surface border border-surface-light overflow-x-auto text-xs font-mono text-indigo-200">
                                        {JSON.stringify({
                                          id: r.id,
                                          timestamp: r.timestamp,
                                          provider: r.provider,
                                          model: r.model,
                                          prompt_tokens: r.tokens_prompt,
                                          completion_tokens: r.tokens_completion,
                                          total_tokens: r.tokens_prompt + r.tokens_completion,
                                          total_cost: r.cost_total,
                                          latency_ms: r.latency_ms,
                                          experiment_id: r.experiment_id || null,
                                        }, null, 2)}
                                      </pre>
                                    </div>
                                    {r.experiment_id && (
                                      <div class="flex items-center gap-2">
                                        <span class="text-xs text-text-muted">Linked to Experiment:</span>
                                        <a
                                          href={`/experiments?id=${r.experiment_id}`}
                                          class="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                                          onClick$={(e) => e.stopPropagation()}
                                        >
                                          <span>View Experiment Details 🔬</span>
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                  <div class="text-xs text-text-muted">
                    Page {currentPage} of {totalPages} ({totalCount} total logs)
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange$={(page: number) => {
                      state.page = page;
                      state.expandedRowIds = [];
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Tracing" };
