import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";

export default component$(() => {
  const toast = useToast();

  const state = useStore<any>({
    data: "[]",
    loading: true,
    period: "all",
    selectedProvider: "all",
    selectedModel: "all",
    page: 1,
    expandedRowIds: [],
  });

  const loadData = $(async () => {
    try {
      const res = await api.get<any>("/analytics/export?format=json");
      state.data = typeof res.data === "string" ? res.data : JSON.stringify(res.data || res || []);
    } catch (e) {
      console.error("Failed to load trace logs:", e);
    }
  });

  useTask$(async () => {
    state.loading = true;
    try {
      await loadData();
    } catch (e) {
      console.error(e);
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

  const uniqueProviders = Array.from(new Set(allRecords.map((r: any) => r.provider))).filter(Boolean) as string[];
  const uniqueModels = Array.from(new Set(allRecords.map((r: any) => r.model))).filter(Boolean) as string[];

  const filteredRecords = (() => {
    const now = Date.now();
    return allRecords.filter((r: any) => {
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
      const res = await api.get<any>("/analytics/export?format=json");
      const jsonText = typeof res === "string" ? res : JSON.stringify(res.data ? JSON.parse(res.data) : res, null, 2);
      
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
      const res = await api.get<any>("/analytics/export?format=csv");
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
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Tracing</h1>
        <p class="text-text-muted">Request and response logs</p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-text-muted">Period</label>
          <select
            value={state.period}
            onChange$={(e: any) => {
              state.period = e.target.value;
              state.page = 1;
            }}
            class="flex h-10 w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary capitalize"
          >
            <option value="all">All Time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-text-muted">Provider</label>
          <select
            value={state.selectedProvider}
            onChange$={(e: any) => {
              state.selectedProvider = e.target.value;
              state.page = 1;
            }}
            class="flex h-10 w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary capitalize"
          >
            <option value="all">All Providers</option>
            {uniqueProviders.map((p: string) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-text-muted">Model</label>
          <select
            value={state.selectedModel}
            onChange$={(e: any) => {
              state.selectedModel = e.target.value;
              state.page = 1;
            }}
            class="flex h-10 w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="all">All Models</option>
            {uniqueModels.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

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
              <p class="text-text-muted text-sm py-4">Loading trace records...</p>
            ) : filteredRecords.length === 0 ? (
              <p class="text-text-muted text-sm py-8 text-center">No trace records match the current filters.</p>
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
                      {paginatedRecords.map((r: any) => {
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
                                {r.timestamp ? new Date(r.timestamp + "Z").toLocaleString() : "—"}
                              </TableCell>
                              <TableCell class="font-medium capitalize text-xs">{r.provider}</TableCell>
                              <TableCell class="text-xs font-mono max-w-[160px] truncate" title={r.model}>{r.model}</TableCell>
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
                  <div class="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick$={() => {
                        state.page--;
                        state.expandedRowIds = [];
                      }}
                    >
                      <span>Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick$={() => {
                        state.page++;
                        state.expandedRowIds = [];
                      }}
                    >
                      <span>Next</span>
                    </Button>
                  </div>
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
