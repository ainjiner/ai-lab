import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { StatusBadge, TypeBadge } from "~/components/ui/status-badge";
import { ListItem, ListItemActions } from "~/components/ui/list-item";
import { Modal } from "~/components/ui/modal";
import { useToast } from "~/components/ui/toast";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/api";

interface Alert {
  id: string;
  name: string;
  type: "budget" | "anomaly" | "rate_limit" | "latency" | "error_rate";
  status: "active" | "triggered" | "resolved" | "disabled";
  threshold: number;
  currentValue?: number;
  lastTriggered?: string;
  created: string;
  channels: string[];
}

interface AlertHistory {
  id: string;
  alertId: string;
  alertName: string;
  type: string;
  message: string;
  timestamp: string;
  status: "sent" | "failed";
}

const typeIcons: Record<string, string> = {
  budget: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  anomaly: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  rate_limit: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  latency: "M13 10V3L4 14h7v7l9-11h-7z",
  error_rate: "M6 18L18 6M6 6l12 12",
};

const statusVariants: Record<string, "success" | "error" | "info" | "default"> = {
  active: "success",
  triggered: "error",
  resolved: "info",
  disabled: "default",
};

const typeColors: Record<string, string> = {
  budget: "bg-green-500/20 text-green-400",
  anomaly: "bg-yellow-500/20 text-yellow-400",
  rate_limit: "bg-blue-500/20 text-blue-400",
  latency: "bg-purple-500/20 text-purple-400",
  error_rate: "bg-red-500/20 text-red-400",
};

export default component$(() => {
  const state = useStore<{
    alerts: Alert[];
    history: AlertHistory[];
    loading: boolean;
    showModal: boolean;
    form: { name: string; type: string; threshold: number; channel: string };
  }>({
    alerts: [],
    history: [],
    loading: true,
    showModal: false,
    form: { name: "", type: "budget", threshold: 1000, channel: "email" },
  });

  const toast = useToast();

  useTask$(async () => {
    try {
      const res: any = await api.get("/alerts");
      state.alerts = Array.isArray(res) ? res : res.alerts || [];
      const historyRes: any = await api.get("/alerts/history");
      state.history = Array.isArray(historyRes) ? historyRes : historyRes.history || [];
    } catch (e) {
      state.alerts = [];
      toast.error("Failed to load alerts");
    } finally {
      state.loading = false;
    }
  });

  const createAlert = $(async () => {
    try {
      await api.post("/alerts", {
        name: state.form.name,
        type: state.form.type,
        threshold: state.form.threshold,
        channels: [state.form.channel],
      });
      toast.success("Alert created");
      state.showModal = false;
      state.form = { name: "", type: "budget", threshold: 1000, channel: "email" };
      const res: any = await api.get("/alerts");
      state.alerts = Array.isArray(res) ? res : res.alerts || [];
    } catch (e) {
      toast.error("Failed to create alert");
    }
  });

  const deleteAlert = $(async (id: string) => {
    try {
      await api.delete(`/alerts/${id}`);
      state.alerts = state.alerts.filter((a) => a.id !== id);
    } catch (e) {
      console.error("Failed to delete alert", e);
      toast.error("Failed to delete alert");
    }
  });

  return (
    <div class="space-y-6">
      <PageHeader title="Alerts" description="Configure budget alerts, anomaly detection, and notifications">
        <Button onClick$={() => (state.showModal = true)}>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Alert
        </Button>
      </PageHeader>

      <StatGrid cols={4}>
        {state.loading ? (
          <>
            <StatCard key={0} value="" label="Loading..."><Skeleton class="h-4 w-20" /></StatCard>
            <StatCard key={1} value="" label="Loading..."><Skeleton class="h-4 w-20" /></StatCard>
            <StatCard key={2} value="" label="Loading..."><Skeleton class="h-4 w-20" /></StatCard>
            <StatCard key={3} value="" label="Loading..."><Skeleton class="h-4 w-20" /></StatCard>
          </>
        ) : (
          <>
            <StatCard value={state.alerts.length} label="Total Alerts" />
            <StatCard value={state.alerts.filter((a) => a.status === "active").length} label="Active" valueColor="text-green-400" />
            <StatCard value={state.alerts.filter((a) => a.status === "triggered").length} label="Triggered" valueColor="text-red-400" />
            <StatCard value={state.history.length} label="Notifications (30d)" />
          </>
        )}
      </StatGrid>

      {state.alerts.length === 0 && !state.loading && (
        <EmptyState title="No alerts configured" description="Create an alert to get notified about budget limits, anomalies, and rate limits" />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            {state.alerts.map((alert) => (
              <ListItem key={alert.id}>
                <div class="flex items-center gap-4 flex-1">
                  <div class={`p-2 rounded-lg ${typeColors[alert.type]}`}>
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={typeIcons[alert.type]} />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h3 class="font-medium">{alert.name}</h3>
                      <TypeBadge type={alert.type} />
                    </div>
                    <div class="flex items-center gap-4 mt-1 text-sm text-text-muted">
                      <span>Threshold: {alert.threshold.toLocaleString()}</span>
                      {alert.currentValue !== undefined && (
                        <span>Current: {alert.currentValue.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <ListItemActions>
                  <StatusBadge status={alert.status} variant={statusVariants[alert.status]} />
                  <div class="flex gap-1">
                    {alert.channels.map((ch) => (
                      <Badge key={ch} variant="outline" class="text-xs">{ch}</Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">
                    {alert.status === "disabled" ? "Enable" : "Disable"}
                  </Button>
                  <Button variant="ghost" size="sm" class="text-red-400 hover:text-red-300" onClick$={() => deleteAlert(alert.id)}>Delete</Button>
                </ListItemActions>
              </ListItem>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Notification History</CardTitle>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            {state.history.map((h) => (
              <ListItem key={h.id}>
                <div class="flex items-center gap-3 flex-1">
                  <div class={`w-2 h-2 rounded-full ${h.status === "sent" ? "bg-green-400" : "bg-red-400"}`}></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium">{h.alertName}</p>
                    <p class="text-xs text-text-muted">{h.message}</p>
                  </div>
                </div>
                <ListItemActions>
                  <span class="text-xs text-text-muted">{new Date(h.timestamp).toLocaleString()}</span>
                  <StatusBadge status={h.status} variant={h.status === "sent" ? "success" : "error"} />
                </ListItemActions>
              </ListItem>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Create Alert Modal */}
      <Modal open={state.showModal} title="Create Alert" size="md">
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Alert Name</label>
            <Input
              placeholder="e.g., Monthly Budget Warning"
              value={state.form.name}
              onInput$={(e) => { state.form.name = (e.target as HTMLInputElement).value; }}
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Type</label>
            <Select
              value={state.form.type}
              onChange$={(e) => { state.form.type = (e.target as HTMLSelectElement).value; }}
              class="w-full"
            >
              <option value="budget">Budget Limit</option>
              <option value="anomaly">Anomaly Detection</option>
              <option value="rate_limit">Rate Limit</option>
              <option value="latency">Latency Threshold</option>
              <option value="error_rate">Error Rate</option>
            </Select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Threshold</label>
            <Input
              type="number"
              value={state.form.threshold}
              onInput$={(e) => { state.form.threshold = parseInt((e.target as HTMLInputElement).value) || 0; }}
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Notification Channel</label>
            <Select
              value={state.form.channel}
              onChange$={(e) => { state.form.channel = (e.target as HTMLSelectElement).value; }}
              class="w-full"
            >
              <option value="email">Email</option>
              <option value="slack">Slack</option>
              <option value="webhook">Webhook</option>
            </Select>
          </div>
          <div class="flex gap-2 justify-end">
            <Button variant="outline" onClick$={() => (state.showModal = false)}>Cancel</Button>
            <Button onClick$={createAlert}>Create Alert</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Alerts",
};
