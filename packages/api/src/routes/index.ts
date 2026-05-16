import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  providerRegistry, modelCatalog, configManager,
  experimentTracker, analyticsTracker, budgetManager, orchestrationManager,
  importFromEnv, detectEnvVars, exportAll, importAll,
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

api.delete("/experiments/:id", (c) => {
  experimentTracker.delete(c.req.param("id"));
  return c.json({ success: true });
});

// === Analytics Routes ===
api.get("/analytics/summary", (c) => {
  const period = (c.req.query("period") as "daily" | "weekly" | "monthly") || "monthly";
  const summary = analyticsTracker.getSummary(period);
  return c.json({ summary });
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

api.get("/analytics/export", (c) => {
  const format = (c.req.query("format") as "csv" | "json") || "json";
  const data = analyticsTracker.exportUsage(format);
  return c.json({ data });
});

// Budget routes
api.get("/budgets", (c) => {
  const budgets = budgetManager.list();
  return c.json({ budgets });
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
  const installed = orchestrationManager.detectInstalled();
  const omo = orchestrationManager.getOmoConfig();
  return c.json({ installed, omo });
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
api.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }));

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

export default api;
