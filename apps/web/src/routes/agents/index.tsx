import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PageHeader } from "~/components/ui/page-header";
import { SelectableCard } from "~/components/ui/selectable-card";
import { StatusBadge } from "~/components/ui/status-badge";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { api } from "~/lib/api";

type StatusVariant = "default" | "success" | "warning" | "error" | "info" | "pending";


interface AgentTrace {
  id: string;
  name: string;
  model: string;
  status: "running" | "completed" | "failed";
  steps: number;
  tokens: number;
  latency: number;
  timestamp: string;
}

interface ToolCall {
  id: string;
  tool: string;
  input: string;
  output: string;
  duration: number;
}

export default component$(() => {
  const state = useStore<{
    traces: AgentTrace[];
    toolCalls: ToolCall[];
    selectedTrace: string | null;
    loading: boolean;
  }>({
    traces: [],
    toolCalls: [],
    selectedTrace: null,
    loading: true,
  });

  const toast = useToast();

  useTask$(async () => {
    try {
      const res: any = await api.get("/agents/traces");
      const list = Array.isArray(res) ? res : res.traces || [];
      state.traces = list.slice(0, 10).map((t: any) => ({
        id: t.id || "",
        name: t.name || "Agent Run",
        model: t.model || "unknown",
        status: t.status || "completed",
        steps: t.steps || 0,
        tokens: t.tokens || 0,
        latency: t.latency || 0,
        timestamp: t.timestamp || new Date().toISOString(),
      }));
    } catch (e) {
      state.traces = [];
      toast.error("Failed to load agent traces");
    } finally {
      state.loading = false;
    }
  });

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "running": return "info";
      case "completed": return "success";
      case "failed": return "error";
      default: return "default";
    }
  };

  return (
    <div class="space-y-6">
      <PageHeader
        title="Agents"
        description="Agent tracing, tool call visualization, and multi-agent debugging"
      >
        <Button>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Live Traces
        </Button>
      </PageHeader>

      <StatGrid cols={4}>
        <StatCard value={state.traces.length} label="Total Traces" />
        <StatCard value={state.traces.filter((t) => t.status === "completed").length} label="Completed" valueColor="text-green-400" />
        <StatCard value={state.traces.reduce((acc, t) => acc + t.steps, 0)} label="Total Steps" />
        <StatCard value={state.traces.reduce((acc, t) => acc + t.tokens, 0).toLocaleString()} label="Total Tokens" />
      </StatGrid>

      {state.traces.length === 0 && !state.loading && (
        <EmptyState title="No agent traces" description="Run an agent to see tracing data here" />
      )}

      <div class="grid gap-4 md:grid-cols-3">
        <Card class="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Traces</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              {state.traces.map((trace) => (
                <SelectableCard
                  key={trace.id}
                  selected={state.selectedTrace === trace.id}
                  onClick$={() => (state.selectedTrace = trace.id)}
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium">{trace.name}</span>
                    <StatusBadge status={trace.status} variant={getStatusVariant(trace.status)} />
                  </div>
                  <div class="flex items-center gap-2 text-xs text-text-muted">
                    <span>{trace.model}</span>
                    <span>•</span>
                    <span>{trace.steps} steps</span>
                    <span>•</span>
                    <span>{(trace.latency / 1000).toFixed(1)}s</span>
                  </div>
                </SelectableCard>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card class="md:col-span-2">
          {state.selectedTrace && (() => {
            const trace = state.traces.find(t => t.id === state.selectedTrace);
            if (!trace) return null;
            const traceToolCalls = trace.steps === 0 ? [] : Array.from({ length: Math.min(trace.steps, 5) }, (_, i) => ({
              id: `${trace.id}-tool-${i}`,
              tool: ["search", "calculator", "code_interpreter", "web_fetch", "database_query"][i % 5],
              input: `{ "query": "example input ${i + 1}" }`,
              output: `{ "result": "simulated output ${i + 1}" }`,
              duration: Math.floor(Math.random() * 2000) + 200,
            }));
            return (
              <>
                <CardHeader>
                  <div class="flex items-center justify-between">
                    <CardTitle>{trace.name} — Details</CardTitle>
                    <Button variant="ghost" size="sm" onClick$={() => { state.selectedTrace = null; }}>Close</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="space-y-1">
                      <span class="text-xs text-text-muted">Trace ID</span>
                      <p class="text-sm font-mono">{trace.id}</p>
                    </div>
                    <div class="space-y-1">
                      <span class="text-xs text-text-muted">Status</span>
                      <StatusBadge status={trace.status} variant={getStatusVariant(trace.status)} />
                    </div>
                    <div class="space-y-1">
                      <span class="text-xs text-text-muted">Model</span>
                      <p class="text-sm">{trace.model}</p>
                    </div>
                    <div class="space-y-1">
                      <span class="text-xs text-text-muted">Latency</span>
                      <p class="text-sm font-mono">{trace.latency}ms</p>
                    </div>
                    <div class="space-y-1">
                      <span class="text-xs text-text-muted">Tokens</span>
                      <p class="text-sm font-mono">{trace.tokens.toLocaleString()}</p>
                    </div>
                    <div class="space-y-1">
                      <span class="text-xs text-text-muted">Timestamp</span>
                      <p class="text-sm">{new Date(trace.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div class="border-t border-surface-light pt-4">
                    <h4 class="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Tool Calls ({trace.steps})</h4>
                    <div class="space-y-3">
                      {traceToolCalls.map((tc) => (
                        <div key={tc.id} class="rounded-lg border border-surface-light bg-surface/40 p-3 space-y-2">
                          <div class="flex items-center justify-between">
                            <Badge variant="outline">{tc.tool}</Badge>
                            <span class="text-xs text-text-muted">{tc.duration}ms</span>
                          </div>
                          <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="space-y-1">
                              <span class="text-text-muted">Input</span>
                              <pre class="p-2 rounded bg-surface border border-surface-light overflow-x-auto font-mono text-[10px]">{tc.input}</pre>
                            </div>
                            <div class="space-y-1">
                              <span class="text-text-muted">Output</span>
                              <pre class="p-2 rounded bg-surface border border-surface-light overflow-x-auto font-mono text-[10px]">{tc.output}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            );
          })()}
          {!state.selectedTrace && (
            <>
              <CardHeader>
                <div class="flex items-center justify-between">
                  <CardTitle>Trace Details</CardTitle>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="p-4 rounded-lg bg-surface/50 border border-surface-light">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span class="text-sm font-bold">1</span>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium">User Input</p>
                        <p class="text-xs text-text-muted">Initial prompt received</p>
                      </div>
                      <span class="text-xs text-text-muted">0ms</span>
                    </div>
                    <div class="ml-10 p-2 bg-surface-light rounded text-sm">
                      "Research the latest developments in quantum computing and summarize key breakthroughs"
                    </div>
                  </div>

                  <div class="p-4 rounded-lg bg-surface/50 border border-surface-light">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span class="text-sm font-bold text-blue-400">2</span>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium">Tool Call: web_search</p>
                        <p class="text-xs text-text-muted">Searching for quantum computing breakthroughs</p>
                      </div>
                      <span class="text-xs text-text-muted">1200ms</span>
                    </div>
                    <div class="ml-10 p-2 bg-surface-light rounded text-sm">
                      <p class="text-xs text-text-muted mb-1">Input:</p>
                      <code class="text-xs">query: "quantum computing breakthroughs 2024"</code>
                    </div>
                  </div>

                  <div class="p-4 rounded-lg bg-surface/50 border border-surface-light">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span class="text-sm font-bold text-green-400">3</span>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium">Reasoning Step</p>
                        <p class="text-xs text-text-muted">Analyzing search results</p>
                      </div>
                      <span class="text-xs text-text-muted">3500ms</span>
                    </div>
                    <div class="ml-10 p-2 bg-surface-light rounded text-sm">
                      <p class="text-xs text-text-muted">Agent is processing the search results and identifying key breakthroughs...</p>
                    </div>
                  </div>

                  <div class="p-4 rounded-lg bg-surface/50 border border-surface-light">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span class="text-sm font-bold text-purple-400">4</span>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium">Final Response</p>
                        <p class="text-xs text-text-muted">Summary generated</p>
                      </div>
                      <span class="text-xs text-text-muted">7800ms</span>
                    </div>
                    <div class="ml-10 p-2 bg-surface-light rounded text-sm">
                      <p>Key quantum computing breakthroughs in 2024 include...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Call Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-surface-light">
                  <th class="text-left py-3 px-4 font-medium text-text-muted">Tool</th>
                  <th class="text-left py-3 px-4 font-medium text-text-muted">Input</th>
                  <th class="text-left py-3 px-4 font-medium text-text-muted">Output</th>
                  <th class="text-right py-3 px-4 font-medium text-text-muted">Duration</th>
                </tr>
              </thead>
              <tbody>
                {state.toolCalls.map((call) => (
                  <tr key={call.id} class="border-b border-surface-light/50 hover:bg-surface/50">
                    <td class="py-3 px-4">
                      <Badge variant="outline">{call.tool}</Badge>
                    </td>
                    <td class="py-3 px-4 font-mono text-xs">{call.input}</td>
                    <td class="py-3 px-4 text-xs text-text-muted">{call.output}</td>
                    <td class="py-3 px-4 text-right text-xs">{call.duration}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Agents",
};
