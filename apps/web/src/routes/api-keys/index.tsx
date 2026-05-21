import { component$, useStore, $, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { CopyButton } from "~/components/ui/copy-button";
import { StatusBadge, TypeBadge } from "~/components/ui/status-badge";
import { Modal } from "~/components/ui/modal";
import { Form, Field, Label, FieldError } from "~/components/ui/form";
import { EmptyState } from "~/components/ui/empty-state";
import { useToast } from "~/components/ui/toast";
import { validate, createApiKeySchema } from "~/lib/validation";
import { api } from "~/lib/api";
import type { FormDataRecord } from "~/lib/types";

interface APIKey {
  id: string;
  name: string;
  prefix: string;
  scope: "read" | "write" | "admin";
  status: "active" | "revoked" | "expired";
  lastUsed?: string;
  expiresAt?: string;
  created: string;
  usageCount: number;
}

const scopeColorMap: Record<string, string> = {
  read: "bg-blue-500/20 text-blue-400",
  write: "bg-green-500/20 text-green-400",
  admin: "bg-purple-500/20 text-purple-400",
};

const statusVariantMap: Record<string, "success" | "error" | "warning"> = {
  active: "success",
  revoked: "error",
  expired: "warning",
};

const validateApiKey = $((data: unknown) => validate(createApiKeySchema, data));

export default component$(() => {
  const state = useStore<{
    keys: APIKey[];
    loading: boolean;
    showModal: boolean;
    generatedKey: string | null;
  }>({
    keys: [],
    loading: true,
    showModal: false,
    generatedKey: null,
  });

  const toast = useToast();

  useTask$(async () => {
    try {
      const res: any = await api.get("/api-keys");
      const list = Array.isArray(res) ? res : res.keys || [];
      state.keys = list;
    } catch (e) {
      state.keys = [];
      toast.error("Failed to load API keys");
    } finally {
      state.loading = false;
    }
  });

  const handleCreateKey = $(async (data: FormDataRecord) => {
    try {
      const res: any = await api.post("/api-keys", {
        name: data.name,
        scope: data.scope,
        expiry: data.expiry,
      });
      state.generatedKey = res.key || res.secret || "Generated successfully";
      if (res.key) {
        state.keys.unshift({
          id: res.id || Date.now().toString(),
          name: data.name,
          prefix: (res.key || "").substring(0, 12) + "...",
          scope: data.scope as "read" | "write" | "admin",
          status: "active",
          created: new Date().toISOString().split("T")[0],
          usageCount: 0,
        });
      }
    } catch (e) {
      toast.error("Failed to create API key");
      const scope = data.scope as "read" | "write" | "admin";
      state.generatedKey = `ailab_${scope.substring(0, 2)}_[fallback-key]`;
    }
    state.showModal = false;
  });

  const handleRevokeKey = $(async (id: string) => {
    try {
      await api.delete(`/api-keys/${id}`);
      state.keys = state.keys.filter((k) => k.id !== id);
      toast.success("API key revoked");
    } catch (e) {
      toast.error("Failed to revoke API key");
    }
  });

  return (
    <div class="space-y-6">
      {/* Header */}
      <PageHeader title="API Keys" description="Manage API keys for programmatic access to AI Lab">
        <Button onClick$={() => (state.showModal = true)}>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create API Key
        </Button>
      </PageHeader>

      {/* Stats */}
      <StatGrid cols={4}>
        <StatCard value={state.keys.length} label="Total Keys" />
        <StatCard
          value={state.keys.filter((k) => k.status === "active").length}
          label="Active"
          valueColor="text-green-400"
        />
        <StatCard
          value={state.keys.reduce((acc, k) => acc + k.usageCount, 0).toLocaleString()}
          label="Total Requests"
        />
        <StatCard
          value={state.keys.filter((k) => k.scope === "admin").length}
          label="Admin Keys"
        />
      </StatGrid>

      {/* Empty State */}
      {state.keys.length === 0 && !state.loading && (
        <EmptyState
          title="No API Keys"
          description="Create an API key to get started"
          action="Create Key"
          onAction={$(() => { state.showModal = true; })}
        />
      )}

      {/* API Keys Table */}
      {state.keys.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            {state.keys.map((key) => (
              <div
                key={key.id}
                class="flex items-center justify-between p-4 rounded-lg border border-surface-light bg-surface/50"
              >
                <div class="flex items-center gap-4">
                  <div class="p-2 rounded-lg bg-surface-light">
                    <svg class="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.436-5.436A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-medium">{key.name}</h3>
                      <TypeBadge type={key.scope} colorMap={scopeColorMap} />
                      <StatusBadge status={key.status} variant={statusVariantMap[key.status]} />
                    </div>
                    <div class="flex items-center gap-4 mt-1 text-sm text-text-muted">
                      <code class="text-xs bg-surface-light px-2 py-0.5 rounded">{key.prefix}</code>
                      <span>Created: {key.created}</span>
                      {key.lastUsed && <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p class="text-sm font-medium">{key.usageCount.toLocaleString()}</p>
                    <p class="text-xs text-text-muted">requests</p>
                  </div>
                  <div class="flex gap-2">
                    <CopyButton value={key.prefix} />
                    <Button variant="ghost" size="sm">View Usage</Button>
                    {key.status === "active" && (
                      <Button variant="ghost" size="sm" class="text-red-400 hover:text-red-300" onClick$={() => handleRevokeKey(key.id)}>Revoke</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Create Key Modal */}
      <Modal open={state.showModal} title="Create New API Key" size="md">
        <Form validate$={validateApiKey} onSubmit$={handleCreateKey}>
          <div class="space-y-4">
            <Field name="name">
              <Label required>Key Name</Label>
              <Input name="name" placeholder="e.g., Production Integration" />
              <FieldError name="name" />
            </Field>
            <Field name="scope">
              <Label required>Scope</Label>
              <Select name="scope" class="w-full">
                <option value="read">Read Only - View data only</option>
                <option value="write">Read/Write - Create and modify data</option>
                <option value="admin">Admin - Full access including API keys</option>
              </Select>
              <FieldError name="scope" />
            </Field>
            <Field name="expiry">
              <Label>Expiry (optional)</Label>
              <Input name="expiry" type="date" />
              <FieldError name="expiry" />
            </Field>
            <div class="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick$={() => (state.showModal = false)}>Cancel</Button>
              <Button type="submit">Generate Key</Button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Generated Key Display */}
      {state.generatedKey && (
        <Card class="border-green-500/50 bg-green-500/5">
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-green-500/20">
                <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-green-400">API Key Generated Successfully!</p>
                <p class="text-xs text-text-muted mt-1">Copy this key now. It won't be shown again.</p>
                <div class="flex items-center gap-2 mt-2">
                  <code class="flex-1 text-sm bg-surface-light px-3 py-2 rounded font-mono">{state.generatedKey}</code>
                  <CopyButton value={state.generatedKey} />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick$={() => (state.generatedKey = null)}>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - API Keys",
};
