import { component$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";

interface Trace {
  id: string;
  timestamp: string;
  model: string;
  prompt: string;
  response: string;
  tokens: { input: number; output: number };
  latency: number;
  status: "success" | "error" | "timeout";
  metadata: Record<string, string>;
}

export default component$(() => {
  const state = useStore({
    search: "",
    filter: "all",
    traces: [
      {
        id: "tr_001",
        timestamp: "2026-05-16 16:45:23",
        model: "llama-3.1-8b",
        prompt: "Explain quantum computing in simple terms",
        response: "Quantum computing uses quantum bits...",
        tokens: { input: 12, output: 245 },
        latency: 1.23,
        status: "success" as const,
        metadata: { temperature: "0.7", max_tokens: "1024" },
      },
      {
        id: "tr_002",
        timestamp: "2026-05-16 16:44:15",
        model: "qwen-2.5-72b",
        prompt: "Write a haiku about AI",
        response: "Silicon dreams flow...",
        tokens: { input: 8, output: 32 },
        latency: 0.85,
        status: "success" as const,
        metadata: { temperature: "0.9", max_tokens: "100" },
      },
      {
        id: "tr_003",
        timestamp: "2026-05-16 16:43:02",
        model: "deepseek-r1",
        prompt: "Solve: x^2 + 5x + 6 = 0",
        response: "To solve this quadratic equation...",
        tokens: { input: 15, output: 180 },
        latency: 2.45,
        status: "success" as const,
        metadata: { temperature: "0.0", max_tokens: "512" },
      },
      {
        id: "tr_004",
        timestamp: "2026-05-16 16:42:30",
        model: "llama-3.1-70b",
        prompt: "Generate Python code for sorting",
        response: "",
        tokens: { input: 10, output: 0 },
        latency: 30.0,
        status: "timeout" as const,
        metadata: { temperature: "0.5", max_tokens: "2048" },
      },
    ] as Trace[],
  });

  const statusConfig = {
    success: { variant: "success" as const, label: "Success" },
    error: { variant: "destructive" as const, label: "Error" },
    timeout: { variant: "warning" as const, label: "Timeout" },
  };

  const stats = {
    total: state.traces.length,
    success: state.traces.filter((t) => t.status === "success").length,
    error: state.traces.filter((t) => t.status === "error").length,
    avgLatency: (state.traces.reduce((a, b) => a + b.latency, 0) / state.traces.length).toFixed(2),
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Tracing</h1>
          <p class="text-text-muted">Request/response logs and debugging</p>
        </div>
        <div class="flex gap-2">
          <Input
            type="text"
            placeholder="Search traces..."
            value={state.search}
            onInput$={(e) => { state.search = (e.target as HTMLInputElement).value; }}
          />
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Total Requests</span>
              <span class="text-3xl font-bold tabular-nums">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Success Rate</span>
              <span class="text-3xl font-bold tabular-nums text-success">
                {((stats.success / stats.total) * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Avg Latency</span>
              <span class="text-3xl font-bold tabular-nums">{stats.avgLatency}s</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-text-muted">Total Tokens</span>
              <span class="text-3xl font-bold tabular-nums">
                {state.traces.reduce((a, b) => a + b.tokens.input + b.tokens.output, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            {state.traces.map((trace) => (
              <details
                key={trace.id}
                class="group rounded-lg border border-surface-light bg-surface/50"
              >
                <summary class="flex cursor-pointer items-center justify-between p-4">
                  <div class="flex items-center gap-4">
                    <Badge variant={statusConfig[trace.status].variant}>
                      {statusConfig[trace.status].label}
                    </Badge>
                    <span class="text-sm font-medium">{trace.model}</span>
                    <span class="text-sm text-text-muted">{trace.timestamp}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-text-muted">
                      {trace.tokens.input + trace.tokens.output} tokens
                    </span>
                    <span class="text-sm text-text-muted">{trace.latency}s</span>
                  </div>
                </summary>
                <div class="border-t border-surface-light p-4">
                  <div class="grid gap-4 md:grid-cols-2">
                    <div class="space-y-2">
                      <label class="text-sm font-medium">Request</label>
                      <div class="rounded-lg bg-surface p-3 text-sm">
                        {trace.prompt}
                      </div>
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-medium">Response</label>
                      <div class="rounded-lg bg-surface p-3 text-sm">
                        {trace.response || <span class="text-text-muted">No response</span>}
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    {Object.entries(trace.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        class="inline-flex items-center rounded-md bg-surface-light px-2 py-1 text-xs text-text-muted"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Tracing",
};
