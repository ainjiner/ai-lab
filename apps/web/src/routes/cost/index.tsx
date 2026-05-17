import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";
import { Skeleton } from "~/components/ui/skeleton";

export default component$(() => {
  const toast = useToast();
  
  const state = useStore<any>({
    summary: null,
    projection: null,
    budgets: [],
    loading: true,
    period: "monthly",
    showBudgetModal: false,
    budgetForm: {
      name: "",
      limit: "",
      period: "monthly",
      saving: false,
    },
    breakdown: null,
  });

  const reload = $(async () => {
    try {
      const [summaryData, projectionData, budgetsData, breakdownData] = await Promise.all([
        api.get<any>(`/analytics/summary?period=${state.period}`),
        api.get<any>("/analytics/projection?days=30"),
        api.get<any>("/budgets"),
        api.get<any>(`/analytics/breakdown?period=${state.period}`),
      ]);
      state.summary = summaryData;
      state.projection = projectionData;
      state.budgets = budgetsData.budgets;
      state.breakdown = breakdownData.breakdown;
    } catch (e) {
      console.error("Failed to reload cost data:", e);
    }
  });

  useTask$(async ({ track }) => {
    track(() => state.period);
    state.loading = true;
    try {
      const [summaryData, projectionData, budgetsData, breakdownData] = await Promise.all([
        api.get<any>(`/analytics/summary?period=${state.period}`),
        api.get<any>("/analytics/projection?days=30"),
        api.get<any>("/budgets"),
        api.get<any>(`/analytics/breakdown?period=${state.period}`),
      ]);
      state.summary = summaryData;
      state.projection = projectionData;
      state.budgets = budgetsData.budgets;
      state.breakdown = breakdownData.breakdown;
    } catch (e) {
      console.error("Failed to load cost data:", e);
    } finally {
      state.loading = false;
    }
  });

  const getTrend = () => {
    if (!state.summary || !state.summary.summary) return null;
    const totalCost = parseFloat(state.summary.summary.totalCost || 0);
    const previousCost = parseFloat(state.summary.previous || 0);
    
    if (previousCost === 0) {
      if (totalCost === 0) return { pct: 0, text: "0%", color: "text-text-muted" };
      return { pct: 100, text: "▲ +100%", color: "text-red-400" };
    }
    
    const pctChange = ((totalCost - previousCost) / previousCost) * 100;
    const sign = pctChange >= 0 ? "+" : "";
    const arrow = pctChange >= 0 ? "▲" : "▼";
    const color = pctChange > 0 ? "text-red-400" : pctChange < 0 ? "text-emerald-400" : "text-text-muted";
    
    return {
      pct: pctChange,
      text: `${arrow} ${sign}${pctChange.toFixed(1)}%`,
      color,
    };
  };

  const providers = state.breakdown?.byProvider || [];
  const maxProviderCost = Math.max(...providers.map((p: any) => p.cost), 0);
  
  const models = state.breakdown?.byModel || [];
  const maxModelCost = Math.max(...models.map((m: any) => m.cost), 0);

  return (
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Cost</h1>
          <p class="text-text-muted">Spending analysis and budget tracking</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="inline-flex rounded-lg border border-surface-light bg-surface p-1">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick$={() => { state.period = p; }}
                class={[
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize cursor-pointer",
                  state.period === p
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-muted hover:text-text"
                ]}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick$={async () => {
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
                link.setAttribute("download", `spend_export_${state.period}_${Date.now()}.csv`);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                await toast.success("CSV export downloaded successfully!");
              } catch (err) {
                await toast.error(`Failed to export CSV: ${String(err)}`);
              }
            }}
          >
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div class="pt-6">
              <div class="text-sm text-text-muted capitalize">{state.period} Spend</div>
              <div class="flex items-baseline gap-2 mt-1">
                <div class="text-2xl font-bold tabular-nums text-amber-400">
                  {state.loading ? "..." : `$${(state.summary?.summary?.totalCost || 0).toFixed(4)}`}
                </div>
                {!state.loading && state.summary && (() => {
                  const trend = getTrend();
                  if (!trend) return null;
                  return (
                    <span class={`text-xs font-semibold ${trend.color}`}>
                      {trend.text}
                    </span>
                  );
                })()}
              </div>
              <p class="text-xs text-text-muted mt-1">
                vs previous period (${parseFloat(state.summary?.previous || 0).toFixed(4)})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div class="pt-6">
              <div class="text-sm text-text-muted">Request Count</div>
              <div class="text-2xl font-bold tabular-nums text-primary mt-1">
                {state.loading ? "..." : (state.summary?.summary?.requestCount || 0)}
              </div>
              <p class="text-xs text-text-muted mt-1">Across all models & providers</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div class="pt-6">
              <div class="text-sm text-text-muted">Avg Latency</div>
              <div class="text-2xl font-bold tabular-nums text-cyan-400 mt-1">
                {state.loading ? "..." : `${state.summary?.summary?.avgLatency || 0}ms`}
              </div>
              <p class="text-xs text-text-muted mt-1">Average response duration</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spend by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="pt-2 space-y-4">
              {state.loading ? (
                <div class="space-y-4 py-2">
                  <div class="space-y-2">
                    <div class="flex justify-between"><Skeleton class="h-4 w-20" /><Skeleton class="h-4 w-12" /></div>
                    <Skeleton class="h-2 w-full" />
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between"><Skeleton class="h-4 w-24" /><Skeleton class="h-4 w-16" /></div>
                    <Skeleton class="h-2 w-full" />
                  </div>
                </div>
              ) : providers.length === 0 ? (
                <p class="text-text-muted text-sm py-4 text-center">No provider spend data in this period.</p>
              ) : (
                providers.map((item: any) => {
                  const pct = maxProviderCost > 0 ? (item.cost / maxProviderCost) * 100 : 0;
                  return (
                    <div key={item.name} class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span class="font-medium capitalize">{item.name}</span>
                        <div class="flex items-center gap-2 text-xs">
                          <span class="text-text-muted">{item.requests} reqs</span>
                          <span class="font-bold text-text">${item.cost.toFixed(4)}</span>
                        </div>
                      </div>
                      <div class="w-full h-2 rounded bg-surface-light overflow-hidden">
                        <div
                          class="h-full bg-primary rounded transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spend by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="pt-2 space-y-4">
              {state.loading ? (
                <div class="space-y-4 py-2">
                  <div class="space-y-2">
                    <div class="flex justify-between"><Skeleton class="h-4 w-28" /><Skeleton class="h-4 w-12" /></div>
                    <Skeleton class="h-2 w-full" />
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between"><Skeleton class="h-4 w-32" /><Skeleton class="h-4 w-16" /></div>
                    <Skeleton class="h-2 w-full" />
                  </div>
                </div>
              ) : models.length === 0 ? (
                <p class="text-text-muted text-sm py-4 text-center">No model spend data in this period.</p>
              ) : (
                models.map((item: any) => {
                  const pct = maxModelCost > 0 ? (item.cost / maxModelCost) * 100 : 0;
                  return (
                    <div key={item.name} class="space-y-1">
                      <div class="flex justify-between text-sm">
                        <span class="font-medium truncate max-w-[240px]" title={item.name}>{item.name}</span>
                        <div class="flex items-center gap-2 text-xs">
                          <span class="text-text-muted">{item.requests} reqs</span>
                          <span class="font-bold text-text">${item.cost.toFixed(4)}</span>
                        </div>
                      </div>
                      <div class="w-full h-2 rounded bg-surface-light overflow-hidden">
                        <div
                          class="h-full bg-teal-500 rounded transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div class="md:col-span-2">
          <Card>
            <CardHeader>
              <div class="flex flex-row items-center justify-between w-full pb-2">
                <div>
                  <CardTitle>Budgets</CardTitle>
                  <p class="text-xs text-text-muted mt-1">Configure spending limits and track consumption</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick$={() => {
                    state.budgetForm.name = "";
                    state.budgetForm.limit = "";
                    state.budgetForm.period = "monthly";
                    state.showBudgetModal = true;
                  }}
                >
                  <span>+ Create Budget</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div class="pt-2">
                {state.loading ? (
                  <div class="space-y-4 py-2">
                    <div class="flex items-center justify-between border-b border-surface-light pb-4 last:border-0">
                      <div class="space-y-2"><Skeleton class="h-4 w-24" /><Skeleton class="h-3 w-32" /></div>
                      <div class="flex items-center gap-4"><Skeleton class="h-4 w-12" /><Skeleton class="h-5 w-16" /></div>
                    </div>
                    <div class="flex items-center justify-between border-b border-surface-light pb-4 last:border-0">
                      <div class="space-y-2"><Skeleton class="h-4 w-32" /><Skeleton class="h-3 w-28" /></div>
                      <div class="flex items-center gap-4"><Skeleton class="h-4 w-14" /><Skeleton class="h-5 w-16" /></div>
                    </div>
                  </div>
                ) : state.budgets.length === 0 ? (
                  <p class="text-text-muted text-sm py-6 text-center">
                    No budgets configured. Click "+ Create Budget" to get started.
                  </p>
                ) : (
                  <div class="space-y-4">
                    {state.budgets.map((b: any) => {
                      const current = b.current || 0;
                      const limit = b.limit || 1;
                      const pct = (current / limit) * 100;
                      
                      let progressBg = "bg-emerald-500";
                      let textAlert = "text-emerald-400";
                      if (pct >= 100) {
                        progressBg = "bg-red-500";
                        textAlert = "text-red-400 font-bold animate-pulse";
                      } else if (pct >= 80) {
                        progressBg = "bg-amber-500";
                        textAlert = "text-amber-400 font-semibold";
                      }

                      return (
                        <div key={b.id} class="p-4 rounded-lg border border-surface-light bg-surface/40 space-y-3">
                          <div class="flex items-center justify-between">
                            <div class="space-y-1">
                              <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold text-text text-sm">{b.name}</span>
                                <Badge variant="outline" class="capitalize text-[10px] py-0 px-1.5">{b.period}</Badge>
                                <Badge variant={b.enabled ? "success" : "secondary"}>
                                  {b.enabled ? "Active" : "Disabled"}
                                </Badge>
                              </div>
                              <div class="text-xs text-text-muted">
                                Spent <span class={textAlert}>${current.toFixed(4)}</span> of ${limit.toFixed(2)} limit ({pct.toFixed(1)}%)
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              class="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 rounded-md"
                              title="Delete Budget"
                              onClick$={async () => {
                                if (!confirm(`Delete budget "${b.name}"?`)) return;
                                try {
                                  await api.delete(`/budgets/${b.id}`);
                                  await reload();
                                  await toast.success(`Budget "${b.name}" deleted successfully.`);
                                } catch (err) {
                                  await toast.error(`Failed to delete budget: ${String(err)}`);
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </div>
                          
                          <div class="w-full h-2.5 rounded-full bg-surface-light overflow-hidden">
                            <div
                              class={`h-full rounded-full transition-all duration-500 ${progressBg}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="pt-2">
                {state.loading ? (
                  <div class="space-y-4 py-2">
                    <div class="flex justify-between items-center"><Skeleton class="h-4 w-28" /><Skeleton class="h-4 w-16" /></div>
                    <div class="flex justify-between items-center"><Skeleton class="h-5 w-32" /><Skeleton class="h-5 w-20" /></div>
                  </div>
                ) : state.projection ? (
                  <div class="space-y-4">
                    <div class="flex justify-between items-center text-sm border-b border-surface-light pb-2">
                      <span class="text-text-muted">Current monthly spent</span>
                      <span class="font-medium text-text">${state.projection.projection.currentTotal.toFixed(4)}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm border-b border-surface-light pb-2 last:border-0">
                      <span class="text-text-muted">Projected 30 days</span>
                      <span class="font-bold text-amber-400">${state.projection.projection.projected.toFixed(4)}</span>
                    </div>
                  </div>
                ) : (
                  <p class="text-text-muted text-sm">No projection data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {state.showBudgetModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="w-full max-w-md rounded-xl border border-surface-light bg-surface p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-surface-light pb-3">
              <h3 class="text-lg font-bold text-text">Create New Budget</h3>
              <button
                onClick$={() => { state.showBudgetModal = false; }}
                class="text-text-muted hover:text-text text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-text-muted">Budget Name</label>
                <Input
                  placeholder="e.g. LLM API Cap"
                  value={state.budgetForm.name}
                  onInput$={(e: any) => {
                    state.budgetForm.name = e.target.value;
                  }}
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-text-muted">Limit Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 100.00"
                  value={state.budgetForm.limit}
                  onInput$={(e: any) => {
                    state.budgetForm.limit = e.target.value;
                  }}
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-text-muted">Period</label>
                <select
                  value={state.budgetForm.period}
                  onChange$={(e: any) => {
                    state.budgetForm.period = e.target.value;
                  }}
                  class="flex h-10 w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick$={() => { state.showBudgetModal = false; }}
                disabled={state.budgetForm.saving}
              >
                Cancel
              </Button>
              <Button
                onClick$={async () => {
                  const { name, limit, period } = state.budgetForm;
                  if (!name.trim()) {
                    await toast.error("Please enter a budget name.");
                    return;
                  }
                  const parsedLimit = parseFloat(limit);
                  if (isNaN(parsedLimit) || parsedLimit <= 0) {
                    await toast.error("Please enter a valid limit amount greater than 0.");
                    return;
                  }

                  state.budgetForm.saving = true;
                  try {
                    await api.post("/budgets", {
                      name: name.trim(),
                      limit: parsedLimit,
                      period,
                    });
                    await reload();
                    state.showBudgetModal = false;
                    await toast.success(`Budget "${name}" created successfully!`);
                  } catch (err) {
                    await toast.error(`Failed to create budget: ${String(err)}`);
                  } finally {
                    state.budgetForm.saving = false;
                  }
                }}
                disabled={state.budgetForm.saving}
              >
                {state.budgetForm.saving ? "Creating..." : "Create Budget"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Cost" };
