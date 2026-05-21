import { Hono } from "hono";
import { cors } from "hono/cors";
import { join } from "path";
import {
  providerRegistry, modelCatalog, configManager,
  experimentTracker, analyticsTracker, budgetManager, orchestrationManager,
  importFromEnv, detectEnvVars, exportAll, importAll, getStore,
} from "@ml-engine/core";

const api = new Hono();
api.use("*", cors());

// === Provider Routes ===
api.get("/providers", (c) => {
  const providers = providerRegistry.listProviders();
  return c.json({ providers });
});

api.get("/providers/instances", (c) => {
  const instances = providerRegistry.listInstances();
  return c.json({ instances });
});

api.post("/providers/instances", async (c) => {
  const { providerId, name, apiKey, baseUrl, minChunkSize, labels } = await c.req.json<{
    providerId: string; name: string; apiKey: string; baseUrl?: string;
    minChunkSize?: number; labels?: string[];
  }>();
  try {
    const instance = providerRegistry.addInstance({
      providerId, name, apiKey, baseUrl, minChunkSize,
      enabled: true, priority: 0, labels: labels || [],
    });
    return c.json({ instance }, 201);
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.get("/providers/instances/:id", (c) => {
  const instance = providerRegistry.getInstance(c.req.param("id"));
  if (!instance) return c.json({ error: "Not found" }, 404);
  return c.json({ instance });
});

api.patch("/providers/instances/:id", async (c) => {
  const updates = await c.req.json<{
    enabled?: boolean; baseUrl?: string; minChunkSize?: number; labels?: string[];
  }>();
  try {
    const instance = providerRegistry.updateInstance(c.req.param("id"), updates);
    return c.json({ instance });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.delete("/providers/instances/:id", (c) => {
  try {
    providerRegistry.removeInstance(c.req.param("id"));
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.post("/providers/instances/:id/test", async (c) => {
  const result = await providerRegistry.testConnection(c.req.param("id"));
  return c.json({ result });
});

api.post("/providers/instances/:id/scan", async (c) => {
  const result = await modelCatalog.scanModels(c.req.param("id"));
  return c.json({ result });
});

// === Model Routes ===
api.get("/models", (c) => {
  const provider = c.req.query("provider");
  const search = c.req.query("search");
  let models;
  if (search) models = modelCatalog.searchModels(search);
  else if (provider) models = modelCatalog.getModelsByProvider(provider);
  else models = modelCatalog.listModels();
  return c.json({ models, total: models.length });
});

// Static routes BEFORE /models/:id to avoid wildcard capture
api.get("/models/compare", (c) => {
  const ids = c.req.query("ids")?.split(",") || [];
  if (ids.length < 2) return c.json({ error: "Need at least 2 model IDs" }, 400);
  const result = modelCatalog.compareModels(ids[0], ids[1]);
  if (!result) return c.json({ error: "Models not found" }, 404);
  return c.json({ comparison: result });
});

api.get("/models/aliases", (c) => {
  const aliases = modelCatalog.listAliases();
  return c.json({ aliases });
});

api.get("/models/:id", (c) => {
  const model = modelCatalog.getModel(c.req.param("id"));
  if (!model) return c.json({ error: "Not found" }, 404);
  return c.json({ model });
});

api.post("/models/recommend", async (c) => {
  const criteria = await c.req.json();
  const models = modelCatalog.recommendModels(criteria);
  return c.json({ models });
});

api.post("/models/aliases", async (c) => {
  const { alias, modelId, providerId } = await c.req.json<{
    alias: string; modelId: string; providerId: string;
  }>();
  try {
    const created = modelCatalog.addAlias(alias, modelId, providerId);
    return c.json({ alias: created }, 201);
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.delete("/models/aliases/:alias", (c) => {
  modelCatalog.removeAlias(c.req.param("alias"));
  return c.json({ success: true });
});

// === Config Routes ===
api.get("/config", (c) => {
  const targets = configManager.listTargets();
  const settings = configManager.getSettings();
  return c.json({ targets, settings });
});

api.post("/config/targets/:id/sync", (c) => {
  try {
    const result = configManager.syncToTarget(c.req.param("id"));
    return c.json({ result });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.post("/config/targets/:id/toggle", (c) => {
  const { enabled } = c.req.query();
  if (enabled === "true") configManager.enableTarget(c.req.param("id"));
  else configManager.disableTarget(c.req.param("id"));
  return c.json({ success: true });
});

api.post("/config/targets/:id/validate", (c) => {
  try {
    const result = configManager.validateTarget(c.req.param("id"));
    return c.json(result);
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.post("/config/sync-all", (c) => {
  const results = configManager.syncToAllTargets();
  return c.json({ results });
});

api.get("/config/preview/:id", (c) => {
  const preview = configManager.generatePreview(c.req.param("id"));
  return c.json({ preview });
});

api.get("/config/settings", (c) => {
  const settings = configManager.getSettings();
  return c.json({ settings });
});

api.post("/config/settings", async (c) => {
  const updates = await c.req.json<Record<string, string>>();
  for (const [key, value] of Object.entries(updates)) {
    configManager.setSetting(key, value);
  }
  return c.json({ success: true });
});

// === Experiment Routes ===
api.get("/experiments", (c) => {
  const status = c.req.query("status");
  const experiments = experimentTracker.list(status ? { status } : undefined);
  return c.json({ experiments, total: experiments.length });
});

// Static routes BEFORE /experiments/:id to avoid wildcard capture
api.get("/experiments/compare", (c) => {
  const ids = c.req.query("ids")?.split(",") || [];
  const experiments = experimentTracker.compare(ids);
  return c.json({ experiments });
});

api.get("/experiments/:id", (c) => {
  const experiment = experimentTracker.get(c.req.param("id"));
  if (!experiment) return c.json({ error: "Not found" }, 404);
  return c.json({ experiment });
});

api.post("/experiments", async (c) => {
  const body = await c.req.json<{
    name: string; description?: string; systemPrompt?: string; userPrompt: string;
    variables?: Record<string, string>; providerId: string; modelId: string;
    params?: Record<string, unknown>; tags?: string[];
  }>();
  const experiment = experimentTracker.create(body);
  return c.json({ experiment }, 201);
});

api.post("/experiments/:id/result", async (c) => {
  const result = await c.req.json();
  experimentTracker.saveResult(c.req.param("id"), result);
  return c.json({ success: true });
});

api.post("/experiments/:id/rating", async (c) => {
  const { rating } = await c.req.json<{ rating: number }>();
  try {
    experimentTracker.updateRating(c.req.param("id"), rating);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.delete("/experiments/:id", (c) => {
  experimentTracker.delete(c.req.param("id"));
  return c.json({ success: true });
});

// === Analytics Routes ===
api.get("/analytics/summary", (c) => {
  const period = (c.req.query("period") as "daily" | "weekly" | "monthly") || "monthly";
  const summary = analyticsTracker.getSummary(period);
  
  let prevStart = "-60 days";
  let prevEnd = "-30 days";
  if (period === "daily") {
    prevStart = "-2 days";
    prevEnd = "-1 day";
  } else if (period === "weekly") {
    prevStart = "-14 days";
    prevEnd = "-7 days";
  }

  let previous = 0;
  try {
    const store = (analyticsTracker as any).store;
    const row = store.query(
      `SELECT COALESCE(SUM(cost_total), 0) as total_cost
       FROM usage_records
       WHERE timestamp >= datetime('now', ?) AND timestamp < datetime('now', ?)`
    ).get(prevStart, prevEnd);
    previous = row?.total_cost || 0;
  } catch (e) {
    previous = 0;
  }

  return c.json({ summary, previous });
});

api.get("/analytics/breakdown", (c) => {
  const period = (c.req.query("period") as "daily" | "weekly" | "monthly") || "monthly";
  const breakdown = analyticsTracker.getBreakdown(period);
  return c.json({ breakdown });
});

api.get("/analytics/projection", (c) => {
  const days = parseInt(c.req.query("days") || "30");
  const projection = analyticsTracker.getCostProjection(days);
  return c.json({ projection });
});

api.get("/analytics/daily-trend", (c) => {
  const days = parseInt(c.req.query("days") || "30");
  const trend = analyticsTracker.getDailyTrend(days);
  return c.json({ trend });
});

api.get("/analytics/export", (c) => {
  const format = (c.req.query("format") as "csv" | "json") || "json";
  const data = analyticsTracker.exportUsage(format);
  return c.json({ data });
});

// Budget routes
api.get("/budgets", (c) => {
  const budgets = budgetManager.list();
  const budgetsWithCurrent = budgets.map((b) => {
    const summary = analyticsTracker.getSummary(b.period);
    return {
      ...b,
      current: summary.totalCost,
    };
  });
  return c.json({ budgets: budgetsWithCurrent });
});

api.post("/budgets", async (c) => {
  const body = await c.req.json<{
    name: string; limit: number; period: "daily" | "weekly" | "monthly";
    alerts?: Array<{ threshold: number; action: "notify" | "disable" }>;
  }>();
  const budget = budgetManager.create(body);
  return c.json({ budget }, 201);
});

api.delete("/budgets/:id", (c) => {
  budgetManager.delete(c.req.param("id"));
  return c.json({ success: true });
});

api.get("/budgets/check", (c) => {
  const summary = analyticsTracker.getSummary("monthly");
  const alerts = budgetManager.checkBudgets(summary);
  return c.json({ alerts });
});

// === Orchestration Routes ===
api.get("/orchestration", (c) => {
  const installedList = orchestrationManager.detectInstalled();
  const omo = installedList.find(i => i.type === "omo");
  const obra = installedList.find(i => i.type === "obra");
  
  const omoConfig = orchestrationManager.getOmoConfig();
  const obraConfig = orchestrationManager.getObraConfig();

  let active = "omo";
  try {
    const store = (configManager as any).store;
    const row = store.query("SELECT value FROM settings WHERE key = 'active_orchestrator'").get();
    if (row && row.value) active = row.value;
  } catch {
    active = "omo";
  }

  return c.json({
    active,
    omo: {
      installed: !!omo?.installed,
      version: omo?.version || "1.0.0",
      config: omoConfig,
    },
    obra: {
      installed: !!obra?.installed,
      version: obra?.version || "1.0.0",
      config: obraConfig,
    },
  });
});

api.get("/orchestration/status", (c) => {
  const installedList = orchestrationManager.detectInstalled();
  const omo = installedList.find(i => i.type === "omo");
  const obra = installedList.find(i => i.type === "obra");

  let active = "omo";
  try {
    const store = (configManager as any).store;
    const row = store.query("SELECT value FROM settings WHERE key = 'active_orchestrator'").get();
    if (row && row.value) active = row.value;
  } catch {
    active = "omo";
  }

  return c.json({
    active,
    omo: {
      installed: !!omo?.installed,
      version: omo?.version || "1.0.0",
    },
    obra: {
      installed: !!obra?.installed,
      version: obra?.version || "1.0.0",
    },
  });
});

api.post("/orchestration/switch", async (c) => {
  try {
    const { target, dryRun, backup } = await c.req.json<{
      target: "omo" | "obra";
      dryRun?: boolean;
      backup?: boolean;
    }>();
    const result = orchestrationManager.switchOrchestrator(target, { dryRun, backup });
    return c.json({ success: true, result });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.get("/orchestration/backups", (c) => {
  try {
    const backups = orchestrationManager.listBackups();
    return c.json({ backups });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.post("/orchestration/restore", async (c) => {
  try {
    const { backupPath } = await c.req.json<{ backupPath: string }>();
    orchestrationManager.restoreConfig(backupPath);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.get("/orchestration/preview/:target", (c) => {
  try {
    const target = c.req.param("target") as "omo" | "obra";
    if (target !== "omo" && target !== "obra") {
      return c.json({ error: "Invalid target" }, 400);
    }
    const result = orchestrationManager.switchOrchestrator(target, { dryRun: true });
    return c.json({ configs: result.preview });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

api.get("/orchestration/agents", (c) => {
  const agents = orchestrationManager.getAgentList();
  return c.json({ agents });
});

api.post("/orchestration/agents", async (c) => {
  const agent = await c.req.json();
  orchestrationManager.saveAgent(agent);
  return c.json({ success: true }, 201);
});

api.delete("/orchestration/agents/:id", (c) => {
  orchestrationManager.removeAgent(c.req.param("id"));
  return c.json({ success: true });
});

api.get("/orchestration/skills", (c) => {
  const skills = orchestrationManager.getSkillsList();
  return c.json({ skills });
});

api.get("/orchestration/skills/:id", (c) => {
  const content = orchestrationManager.getSkillContent(c.req.param("id"));
  if (!content) return c.json({ error: "Not found" }, 404);
  return c.json({ skill: { id: c.req.param("id"), content } });
});

// === Health Check ===
api.get("/health", (c) => {
  const dbPath = join(process.env.HOME!, ".local/share/ml-engine/engine.db");
  const providersCount = providerRegistry.listInstances().length;
  const modelsCount = modelCatalog.listModels().length;
  return c.json({
    status: "ok",
    version: "0.1.0",
    uptime: Math.floor(process.uptime()),
    db: dbPath,
    providers: providersCount,
    models: modelsCount,
    timestamp: new Date().toISOString()
  });
});

// === Export/Import ===
api.get("/export", (c) => {
  const data = exportAll();
  c.header("Content-Type", "application/json");
  c.header("Content-Disposition", "attachment; filename=ml-engine-export.json");
  return c.json(data);
});

api.post("/import", async (c) => {
  const payload = await c.req.json();
  const result = importAll(payload);
  return c.json(result);
});

// === Env Import ===
api.post("/import-env", async (c) => {
  const { prefix } = await c.req.json<{ prefix?: string }>();
  const result = importFromEnv(prefix || "PROVIDER_");
  return c.json(result);
});

api.get("/detect-env", (c) => {
  const vars = detectEnvVars();
  return c.json({ variables: vars });
});

// === Datasets Routes ===
api.get("/datasets", (c) => {
  const datasets = [
    { id: "1", name: "MMLU Benchmark", type: "qa", entries: 14042, version: "1.0.0", tags: ["benchmark", "knowledge"] },
    { id: "2", name: "HumanEval Python", type: "code", entries: 164, version: "2.1.0", tags: ["code", "python"] },
    { id: "3", name: "TruthfulQA Set", type: "safety", entries: 817, version: "1.0.0", tags: ["safety", "truthfulness"] },
    { id: "4", name: "GSM8K Math", type: "reasoning", entries: 8500, version: "1.0.0", tags: ["math", "reasoning"] },
    { id: "5", name: "Custom QA Set", type: "custom", entries: 256, version: "3.2.0", tags: ["internal", "product"] },
  ];
  return c.json({ datasets });
});

api.post("/datasets", async (c) => {
  const { name, type, description, tags } = await c.req.json();
  const dataset = { id: Date.now().toString(), name, type, description, tags: tags || [], entries: 0, version: "1.0.0" };
  return c.json({ dataset }, 201);
});

api.get("/datasets/:id", (c) => {
  return c.json({ dataset: { id: c.req.param("id"), name: "Dataset", entries: 0 } });
});

api.delete("/datasets/:id", (c) => {
  return c.json({ success: true });
});

// === Playground Routes ===
api.post("/playground/chat", async (c) => {
  const { messages, model, provider, temperature, maxTokens } = await c.req.json();
  return c.json({ 
    response: "This is a simulated response. Connect to actual provider API for real responses.",
    tokens: { prompt: 100, completion: 50 },
    latency: 1250
  });
});

api.post("/playground/stream", async (c) => {
  const { messages, model, provider: providerId, temperature, maxTokens, systemPrompt } = await c.req.json();

  const instances = providerRegistry.listInstances();
  const instance = instances.find(i => i.providerId === providerId && i.enabled !== false);

  if (!instance) {
    return c.json({ error: `No enabled instance found for provider "${providerId}". Add one via Integrations page.` }, 404);
  }

  const prov = providerRegistry.getProvider(providerId);
  const baseUrl = instance.baseUrl || prov?.baseUrl || "";

  const apiMessages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    apiMessages.push({ role: "system", content: systemPrompt });
  }
  for (const m of messages) {
    if (m.role === "user" || m.role === "assistant") {
      apiMessages.push({ role: m.role, content: m.content });
    }
  }

  const body: Record<string, unknown> = {
    model,
    messages: apiMessages,
    temperature,
    max_tokens: maxTokens || 2048,
    stream: true,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (prov?.authMethod !== "none") {
    headers["Authorization"] = `Bearer ${instance.apiKey}`;
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return c.json({ error: `Provider API error (${response.status}): ${errText.slice(0, 300)}` }, 502);
    }

    if (!response.body) {
      return c.json({ error: "Provider returned empty response body" }, 502);
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return c.json({ error: `Failed to connect to provider: ${err.message}` }, 502);
  }
});

// === Prompt Templates Routes ===
api.get("/prompts", (c) => {
  const store = getStore();
  const rows = store.query<any, []>(
    "SELECT * FROM prompt_templates ORDER BY updated_at DESC"
  ).all();
  return c.json({ templates: rows });
});

api.get("/prompts/:id", (c) => {
  const store = getStore();
  const row = store.query<any, [string]>(
    "SELECT * FROM prompt_templates WHERE id = ?"
  ).get(c.req.param("id"));
  if (!row) return c.json({ error: "Template not found" }, 404);
  return c.json({ template: row });
});

api.post("/prompts", async (c) => {
  const { name, description, template, variables, tags } = await c.req.json();
  if (!name || !template) return c.json({ error: "Name and template are required" }, 400);

  const id = crypto.randomUUID();
  const store = getStore();
  store.query<any, [string, string, string, string, string, string]>(
    `INSERT INTO prompt_templates (id, name, description, template, variables, tags)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, name, description || "", template, JSON.stringify(variables || []), JSON.stringify(tags || []));

  const created = store.query<any, [string]>(
    "SELECT * FROM prompt_templates WHERE id = ?"
  ).get(id);
  return c.json({ template: created }, 201);
});

api.patch("/prompts/:id", async (c) => {
  const store = getStore();
  const existing = store.query<any, [string]>(
    "SELECT id FROM prompt_templates WHERE id = ?"
  ).get(c.req.param("id"));
  if (!existing) return c.json({ error: "Template not found" }, 404);

  const { name, description, template, variables, tags } = await c.req.json();
  const pairs: string[] = [];
  const vals: any[] = [];

  if (name !== undefined) { pairs.push("name = ?"); vals.push(name); }
  if (description !== undefined) { pairs.push("description = ?"); vals.push(description); }
  if (template !== undefined) { pairs.push("template = ?"); vals.push(template); }
  if (variables !== undefined) { pairs.push("variables = ?"); vals.push(JSON.stringify(variables)); }
  if (tags !== undefined) { pairs.push("tags = ?"); vals.push(JSON.stringify(tags)); }
  pairs.push("updated_at = datetime('now')");
  vals.push(c.req.param("id"));

  store.query(`UPDATE prompt_templates SET ${pairs.join(", ")} WHERE id = ?`).run(...vals);
  const updated = store.query<any, [string]>(
    "SELECT * FROM prompt_templates WHERE id = ?"
  ).get(c.req.param("id"));
  return c.json({ template: updated });
});

api.delete("/prompts/:id", (c) => {
  const store = getStore();
  const existing = store.query<any, [string]>(
    "SELECT id FROM prompt_templates WHERE id = ?"
  ).get(c.req.param("id"));
  if (!existing) return c.json({ error: "Template not found" }, 404);
  store.query("DELETE FROM prompt_templates WHERE id = ?").run(c.req.param("id"));
  return c.json({ success: true });
});

// === Alerts Routes ===
api.get("/alerts", (c) => {
  const alerts = [
    { id: "1", name: "Monthly Budget Alert", type: "budget", status: "active", threshold: 500, currentValue: 342.50, channels: ["email", "webhook"] },
    { id: "2", name: "Daily Spend Spike", type: "anomaly", status: "triggered", threshold: 50, currentValue: 78.20, channels: ["email"] },
    { id: "3", name: "Rate Limit Warning", type: "rate_limit", status: "active", threshold: 80, channels: ["slack"] },
  ];
  return c.json({ alerts });
});

api.post("/alerts", async (c) => {
  const { name, type, threshold, channels } = await c.req.json();
  const alert = { id: Date.now().toString(), name, type, threshold, channels, status: "active" };
  return c.json({ alert }, 201);
});

api.patch("/alerts/:id", async (c) => {
  const updates = await c.req.json();
  return c.json({ alert: { id: c.req.param("id"), ...updates } });
});

api.delete("/alerts/:id", (c) => {
  return c.json({ success: true });
});

api.get("/alerts/history", (c) => {
  const history = [
    { id: "h1", alertId: "2", alertName: "Daily Spend Spike", message: "Daily spend exceeded threshold", timestamp: new Date().toISOString(), status: "sent" },
  ];
  return c.json({ history });
});

// === API Keys Routes ===
api.get("/api-keys", (c) => {
  const keys = [
    { id: "1", name: "Production API Key", prefix: "ailab_live_", scope: "admin", status: "active", usageCount: 15420 },
    { id: "2", name: "Development Key", prefix: "ailab_dev_", scope: "write", status: "active", usageCount: 3250 },
    { id: "3", name: "Read-Only Dashboard", prefix: "ailab_ro_", scope: "read", status: "active", usageCount: 890 },
  ];
  return c.json({ keys });
});

api.post("/api-keys", async (c) => {
  const { name, scope, expiresAt } = await c.req.json();
  const key = `ailab_${scope.substring(0, 2)}_${Math.random().toString(36).substring(2, 15)}`;
  return c.json({ key: { id: Date.now().toString(), name, prefix: key.substring(0, 12) + "...", scope, status: "active" }, fullKey: key }, 201);
});

api.delete("/api-keys/:id", (c) => {
  return c.json({ success: true });
});

// === Playbooks Routes ===
api.get("/playbooks", (c) => {
  const playbooks = [
    { id: "1", name: "Model Quality Check", type: "evaluation", steps: 5, status: "active", schedule: "0 8 * * *" },
    { id: "2", name: "Weekly Benchmark Suite", type: "benchmark", steps: 12, status: "running", schedule: "0 6 * * 1" },
    { id: "3", name: "Provider Comparison", type: "comparison", steps: 8, status: "completed" },
  ];
  return c.json({ playbooks });
});

api.post("/playbooks", async (c) => {
  const { name, type, steps, schedule } = await c.req.json();
  const playbook = { id: Date.now().toString(), name, type, steps: steps || [], status: "draft", schedule };
  return c.json({ playbook }, 201);
});

api.post("/playbooks/:id/run", (c) => {
  return c.json({ success: true, status: "running" });
});

// === Annotations Routes ===
api.get("/annotations", (c) => {
  const annotations = [
    { id: "1", experimentId: "exp_001", model: "gpt-4o", rating: 5, label: "good", annotator: "alice" },
    { id: "2", experimentId: "exp_001", model: "claude-3.5-sonnet", rating: 4, label: "good", annotator: "bob" },
    { id: "3", experimentId: "exp_002", model: "gpt-4o", rating: 3, label: "needs_review", annotator: "alice" },
  ];
  return c.json({ annotations });
});

api.post("/annotations", async (c) => {
  const { experimentId, model, rating, label, correction } = await c.req.json();
  const annotation = { id: Date.now().toString(), experimentId, model, rating, label, correction, annotator: "user" };
  return c.json({ annotation }, 201);
});

// === Cache Analytics Routes ===
api.get("/cache/stats", (c) => {
  const stats = [
    { provider: "anthropic", hitRate: 78, totalRequests: 15420, cacheHits: 12028, cacheMisses: 3392, estimatedSavings: 245.50 },
    { provider: "openai", hitRate: 65, totalRequests: 8750, cacheHits: 5688, cacheMisses: 3062, estimatedSavings: 125.30 },
    { provider: "together", hitRate: 42, totalRequests: 3200, cacheHits: 1344, cacheMisses: 1856, estimatedSavings: 45.20 },
  ];
  return c.json({ stats });
});

// === Teams Routes ===
api.get("/teams", (c) => {
  const teams = [
    { id: "1", name: "Engineering", members: 8, role: "owner" },
    { id: "2", name: "Research", members: 5, role: "admin" },
    { id: "3", name: "Data Science", members: 4, role: "member" },
  ];
  return c.json({ teams });
});

api.post("/teams", async (c) => {
  const { name, description } = await c.req.json();
  const team = { id: Date.now().toString(), name, description, members: 1, role: "owner" };
  return c.json({ team }, 201);
});

api.get("/teams/:id/members", (c) => {
  const members = [
    { id: "m1", name: "Alice Johnson", email: "alice@example.com", role: "owner", status: "active" },
    { id: "m2", name: "Bob Smith", email: "bob@example.com", role: "admin", status: "active" },
  ];
  return c.json({ members });
});

api.post("/teams/:id/members", async (c) => {
  const { email, role } = await c.req.json();
  return c.json({ member: { id: Date.now().toString(), email, role, status: "pending" } }, 201);
});

// === Embeddings Routes ===
api.get("/embeddings/jobs", (c) => {
  const jobs = [
    { id: "1", name: "Product Descriptions", model: "text-embedding-3-small", documents: 1250, status: "completed", progress: 100 },
    { id: "2", name: "Customer Reviews", model: "text-embedding-3-large", documents: 8500, status: "processing", progress: 67 },
  ];
  return c.json({ jobs });
});

api.post("/embeddings/jobs", async (c) => {
  const { name, model, documents } = await c.req.json();
  const job = { id: Date.now().toString(), name, model, documents: documents?.length || 0, status: "pending", progress: 0 };
  return c.json({ job }, 201);
});

api.post("/embeddings/search", async (c) => {
  const { query, jobId, limit } = await c.req.json();
  const results = [
    { id: "1", text: "Similar document 1", score: 0.92 },
    { id: "2", text: "Similar document 2", score: 0.87 },
  ];
  return c.json({ results });
});

// === Fine-tuning Routes ===
api.get("/fine-tuning/jobs", (c) => {
  const jobs = [
    { id: "1", name: "Customer Support Bot", provider: "openai", baseModel: "gpt-4o-mini", status: "completed", progress: 100, cost: 45.20 },
    { id: "2", name: "Code Assistant", provider: "anthropic", baseModel: "claude-3-haiku", status: "running", progress: 45 },
  ];
  return c.json({ jobs });
});

api.post("/fine-tuning/jobs", async (c) => {
  const { name, provider, baseModel, dataset, epochs } = await c.req.json();
  const job = { id: Date.now().toString(), name, provider, baseModel, dataset, epochs, status: "queued", progress: 0 };
  return c.json({ job }, 201);
});

// === Agents Routes ===
api.get("/agents/traces", (c) => {
  const traces = [
    { id: "1", name: "Research Agent", model: "gpt-4o", status: "completed", steps: 5, tokens: 3250, latency: 12500 },
    { id: "2", name: "Code Assistant", model: "claude-3.5-sonnet", status: "running", steps: 3, tokens: 1850, latency: 8200 },
  ];
  return c.json({ traces });
});

api.get("/agents/traces/:id", (c) => {
  const trace = {
    id: c.req.param("id"),
    name: "Research Agent",
    steps: [
      { step: 1, type: "input", content: "Research quantum computing", duration: 0 },
      { step: 2, type: "tool_call", tool: "web_search", duration: 1200 },
      { step: 3, type: "reasoning", duration: 3500 },
      { step: 4, type: "output", duration: 7800 },
    ]
  };
  return c.json({ trace });
});

// === Reports Routes ===
api.get("/reports", (c) => {
  const reports = [
    { id: "1", name: "Weekly Cost Summary", type: "digest", status: "sent", schedule: "0 9 * * 1" },
    { id: "2", name: "Monthly Provider Analysis", type: "scheduled", status: "ready", schedule: "0 9 1 * *" },
    { id: "3", name: "Q1 Performance Report", type: "custom", status: "sent" },
  ];
  return c.json({ reports });
});

api.post("/reports", async (c) => {
  const { name, type, schedule, config } = await c.req.json();
  const report = { id: Date.now().toString(), name, type, schedule, config, status: "draft" };
  return c.json({ report }, 201);
});

api.post("/reports/:id/generate", (c) => {
  return c.json({ success: true, status: "generating" });
});

api.get("/reports/:id/download", (c) => {
  return c.json({ downloadUrl: `/reports/${c.req.param("id")}/download/file.pdf` });
});

export default api;
