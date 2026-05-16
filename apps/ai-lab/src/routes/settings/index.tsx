import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default component$(() => {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <p class="text-text-muted">Configure your AI Lab instance</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Baseten API Key</label>
                <Input type="password" placeholder="bt-..." />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Default Model</label>
                <select class="w-full rounded-lg border border-surface-light bg-surface px-3 py-2 text-sm">
                  <option>Llama 3.1 8B</option>
                  <option>Llama 3.1 70B</option>
                  <option>Qwen 2.5 72B</option>
                  <option>DeepSeek R1</option>
                </select>
              </div>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Temperature</label>
                <Input type="number" step="0.1" value="0.7" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Max Tokens</label>
                <Input type="number" value="1024" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Top P</label>
                <Input type="number" step="0.1" value="0.9" />
              </div>
              <Button variant="outline">Reset to Defaults</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observability</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Enable Tracing</p>
                  <p class="text-sm text-text-muted">Log all requests and responses</p>
                </div>
                <input type="checkbox" checked class="h-4 w-4" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Cost Tracking</p>
                  <p class="text-sm text-text-muted">Track token usage and costs</p>
                </div>
                <input type="checkbox" checked class="h-4 w-4" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">Performance Metrics</p>
                  <p class="text-sm text-text-muted">Track latency and throughput</p>
                </div>
                <input type="checkbox" checked class="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between rounded-lg border border-surface-light bg-surface/50 p-3">
                <div>
                  <p class="font-medium">Export Data</p>
                  <p class="text-sm text-text-muted">Download all traces and metrics</p>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>
              <div class="flex items-center justify-between rounded-lg border border-surface-light bg-surface/50 p-3">
                <div>
                  <p class="font-medium">Clear History</p>
                  <p class="text-sm text-text-muted">Delete all trace history</p>
                </div>
                <Button variant="outline" size="sm">Clear</Button>
              </div>
              <div class="flex items-center justify-between rounded-lg border border-error/20 bg-error/10 p-3">
                <div>
                  <p class="font-medium text-error">Reset All</p>
                  <p class="text-sm text-text-muted">Reset all settings to defaults</p>
                </div>
                <Button variant="destructive" size="sm">Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Settings",
};
