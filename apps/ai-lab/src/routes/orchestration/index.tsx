import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/lib/api";

export default component$(() => {
  const state = useStore<{ installed: any[]; omo: any; agents: any[]; skills: any[]; loading: boolean }>({
    installed: [], omo: null, agents: [], skills: [], loading: true,
  });

  useVisibleTask$(async () => {
    try {
      const o = await api.get<any>("/orchestration");
      state.installed = o.installed || [];
      state.omo = o.omo;
      if (o.omo?.enabled) {
        const [agents, skills] = await Promise.all([
          api.get<any>("/orchestration/agents"),
          api.get<any>("/orchestration/skills"),
        ]);
        state.agents = agents.agents || [];
        state.skills = skills.skills || [];
      }
      state.loading = false;
    } catch { state.loading = false; }
  });

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Orchestration</h1>
        <p class="text-text-muted">Manage OMO agents, skills, and external integrations</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        {state.installed.map((i: any) => (
          <Card key={i.type}>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>{i.name}</CardTitle>
                <Badge variant={i.installed ? "success" : "secondary"}>
                  {i.installed ? "installed" : "not installed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-text-muted mb-3">
                {i.installed
                  ? `Version: ${i.version || "unknown"}`
                  : "Not detected on this system"}
              </p>
              {i.installed && (
                <div class="flex gap-2">
                  <Button size="sm">Configure</Button>
                  <Button size="sm" variant="outline">View Config</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {state.omo?.enabled && (
        <>
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>OMO Agents ({state.agents.length})</CardTitle>
                <Button size="sm" variant="outline">Add Agent</Button>
              </div>
            </CardHeader>
            <CardContent>
              {state.agents.length === 0 ? (
                <p class="text-text-muted">No agents configured</p>
              ) : (
                <div class="space-y-2">
                  {state.agents.map((a: any) => (
                    <div key={a.id} class="flex items-center justify-between rounded-lg border border-surface-light bg-surface/50 p-3">
                      <div>
                        <span class="font-medium">{a.name || a.id}</span>
                        <span class="text-xs text-text-muted ml-2">{a.type}</span>
                        {a.model && <span class="text-xs text-text-muted ml-2">({a.model})</span>}
                      </div>
                      <Badge variant={a.enabled !== false ? "success" : "secondary"}>
                        {a.enabled !== false ? "active" : "disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>OMO Skills ({state.skills.length})</CardTitle></CardHeader>
            <CardContent>
              {state.skills.length === 0 ? (
                <p class="text-text-muted">No skills configured</p>
              ) : (
                <div class="space-y-2">
                  {state.skills.map((s: any) => (
                    <div key={s.id} class="rounded-lg border border-surface-light bg-surface/50 p-3">
                      <span class="font-medium">{s.name}</span>
                      {s.path && <span class="text-xs text-text-muted ml-2">{s.path}</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
});

export const head: DocumentHead = { title: "ML Engine - Orchestration" };
