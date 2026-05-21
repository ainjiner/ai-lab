import { component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { StatusBadge, TypeBadge } from "~/components/ui/status-badge";
import { ListItem, ListItemActions } from "~/components/ui/list-item";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/api";
import { useToast } from "~/components/ui/toast";
import { EmptyState } from "~/components/ui/empty-state";


interface Report {
  id: string;
  name: string;
  type: "digest" | "custom" | "scheduled";
  status: "draft" | "generating" | "ready" | "sent" | "failed";
  schedule?: string;
  lastGenerated?: string;
  created: string;
}

export default component$(() => {
  const toast = useToast();
  const state = useStore<{
    reports: Report[];
    showCreateModal: boolean;
    loading: boolean;
  }>({
    reports: [],
    showCreateModal: false,
    loading: true,
  });

  useTask$(async () => {
    try {
      const res: any = await api.get("/reports");
      const list = Array.isArray(res) ? res : res.reports || [];
      state.reports = list.map((r: any) => ({
        id: r.id || "",
        name: r.name || "",
        type: r.type || "custom",
        status: r.status || "draft",
        schedule: r.schedule,
        lastGenerated: r.lastGenerated,
        created: r.created || new Date().toISOString(),
      }));
    } catch (e) {
      state.reports = [];
      toast.show("Failed to load reports", "error");
    } finally {
      state.loading = false;
    }
  });

  const typeColorMap: Record<string, string> = {
    digest: "bg-blue-500/20 text-blue-400",
    custom: "bg-purple-500/20 text-purple-400",
    scheduled: "bg-green-500/20 text-green-400",
  };

  const statusVariantMap: Record<string, "default" | "success" | "warning" | "error" | "info" | "pending"> = {
    draft: "pending",
    generating: "warning",
    ready: "info",
    sent: "success",
    failed: "error",
  };

  return (
    <div class="space-y-6">
      <PageHeader title="Reports" description="Scheduled reports, weekly digests, and custom exports">
        <Button onClick$={() => (state.showCreateModal = true)}>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Report
        </Button>
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
        <StatCard value={state.reports.length} label="Total Reports" />
        <StatCard value={state.reports.filter((r) => r.status === "sent").length} label="Sent" valueColor="text-green-400" />
        <StatCard value={state.reports.filter((r) => r.schedule).length} label="Scheduled" />
        <StatCard value={state.reports.filter((r) => r.status === "generating").length} label="Generating" valueColor="text-blue-400" />
        </>
        )}
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-3">
            <div class="p-4 rounded-lg border border-surface-light bg-surface/50 hover:border-primary/50 cursor-pointer transition-colors">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 rounded-lg bg-blue-500/20">
                  <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium">Weekly Digest</h3>
                  <p class="text-xs text-text-muted">Cost, usage, and trends</p>
                </div>
              </div>
              <p class="text-sm text-text-muted">Automated weekly summary of platform activity, costs, and key metrics.</p>
            </div>

            <div class="p-4 rounded-lg border border-surface-light bg-surface/50 hover:border-primary/50 cursor-pointer transition-colors">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 rounded-lg bg-green-500/20">
                  <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium">Budget Report</h3>
                  <p class="text-xs text-text-muted">Spending and projections</p>
                </div>
              </div>
              <p class="text-sm text-text-muted">Detailed budget analysis with spending breakdown and cost projections.</p>
            </div>

            <div class="p-4 rounded-lg border border-surface-light bg-surface/50 hover:border-primary/50 cursor-pointer transition-colors">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 rounded-lg bg-purple-500/20">
                  <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium">Custom Report</h3>
                  <p class="text-xs text-text-muted">Build your own</p>
                </div>
              </div>
              <p class="text-sm text-text-muted">Create custom reports with selected metrics, filters, and visualizations.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            {!state.loading && state.reports.length === 0 ? (
              <EmptyState
                title="No reports yet"
                description="Create your first report to get started."
              />
            ) : (
              state.reports.map((report) => (
                <ListItem key={report.id}>
                  <div class="flex items-center gap-4">
                    <div class="p-2 rounded-lg bg-surface-light">
                      <svg class="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-medium">{report.name}</h3>
                        <TypeBadge type={report.type} colorMap={typeColorMap} />
                        <StatusBadge status={report.status} variant={statusVariantMap[report.status]} />
                      </div>
                      <div class="flex items-center gap-4 mt-1 text-xs text-text-muted">
                        <span>Created: {report.created}</span>
                        {report.schedule && <span>Schedule: {report.schedule}</span>}
                        {report.lastGenerated && <span>Last: {new Date(report.lastGenerated).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <ListItemActions>
                    {report.status === "ready" && <Button size="sm">Download</Button>}
                    {report.status === "draft" && <Button size="sm">Generate</Button>}
                    {report.status === "generating" && (
                      <span class="text-xs text-text-muted flex items-center gap-1">
                        <Spinner size="sm" />
                        Generating...
                      </span>
                    )}
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </Button>
                  </ListItemActions>
                </ListItem>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Reports",
};
