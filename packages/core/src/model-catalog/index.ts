import type { Model, ModelAlias, ProviderInstance } from "../types";
import { getStore } from "../store";
import { providerRegistry } from "../provider-registry";

export interface ModelScanResult {
  provider: string;
  instance: string;
  models: Model[];
  scannedAt: string;
  error?: string;
}

export class ModelCatalog {
  private store = getStore();

  listModels(): Model[] {
    const rows = this.store.query<any, []>(
      "SELECT * FROM models ORDER BY provider, name"
    ).all();
    return rows.map(this.rowToModel);
  }

  getModel(id: string): Model | undefined {
    const row = this.store.query<any, [string]>("SELECT * FROM models WHERE id = ?").get(id);
    return row ? this.rowToModel(row) : undefined;
  }

  getModelsByProvider(providerId: string): Model[] {
    const rows = this.store.query<any, [string]>(
      "SELECT * FROM models WHERE provider = ? ORDER BY name"
    ).all(providerId);
    return rows.map(this.rowToModel);
  }

  addModel(model: Model): void {
    const existing = this.getModel(model.id);
    const caps = model.capabilities;

    if (existing) {
      this.store.query<any, any[]>(
        `UPDATE models SET name=?, provider=?, context_window=?, max_output=?,
         capabilities_vision=?, capabilities_tools=?, capabilities_reasoning=?,
         capabilities_json_mode=?, capabilities_streaming=?, capabilities_prompt_caching=?,
         price_prompt=?, price_completion=?, price_cached=?, availability_status=?, metadata=?
         WHERE id=?`
      ).run(
        model.name, model.provider, model.contextWindow, model.maxOutput,
        caps.vision ? 1 : 0, caps.tools ? 1 : 0, caps.reasoning ? 1 : 0,
        caps.json_mode ? 1 : 0, caps.streaming ? 1 : 0, caps.prompt_caching ? 1 : 0,
        model.pricing?.prompt || 0, model.pricing?.completion || 0,
        model.pricing?.cached || null, model.availability?.status || "available",
        JSON.stringify(model.metadata || {}), model.id
      );
    } else {
      this.store.query<any, any[]>(
        `INSERT INTO models (id, name, provider, context_window, max_output,
         capabilities_vision, capabilities_tools, capabilities_reasoning,
         capabilities_json_mode, capabilities_streaming, capabilities_prompt_caching,
         price_prompt, price_completion, price_cached, availability_status, metadata)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).run(
        model.id, model.name, model.provider, model.contextWindow, model.maxOutput,
        caps.vision ? 1 : 0, caps.tools ? 1 : 0, caps.reasoning ? 1 : 0,
        caps.json_mode ? 1 : 0, caps.streaming ? 1 : 0, caps.prompt_caching ? 1 : 0,
        model.pricing?.prompt || 0, model.pricing?.completion || 0,
        model.pricing?.cached || null, model.availability?.status || "available",
        JSON.stringify(model.metadata || {})
      );
    }
  }

  addModels(models: Model[]): void {
    for (const model of models) this.addModel(model);
  }

  removeModel(id: string): void {
    this.store.query("DELETE FROM models WHERE id = ?").run(id);
  }

  searchModels(query: string): Model[] {
    const like = `%${query.toLowerCase()}%`;
    const rows = this.store.query<any, [string, string]>(
      "SELECT * FROM models WHERE LOWER(id) LIKE ? OR LOWER(name) LIKE ? ORDER BY name"
    ).all(like, like);
    return rows.map(this.rowToModel);
  }

  compareModels(id1: string, id2: string): { model1: Model; model2: Model; diff: Record<string, unknown> } | null {
    const model1 = this.getModel(id1);
    const model2 = this.getModel(id2);
    if (!model1 || !model2) return null;

    return {
      model1, model2,
      diff: {
        contextWindow: model2.contextWindow - model1.contextWindow,
        maxOutput: model2.maxOutput - model1.maxOutput,
        priceDiff: model1.pricing && model2.pricing ? {
          prompt: model2.pricing.prompt - model1.pricing.prompt,
          completion: model2.pricing.completion - model1.pricing.completion,
        } : null,
        capabilities: {
          vision: model1.capabilities.vision !== model2.capabilities.vision,
          tools: model1.capabilities.tools !== model2.capabilities.tools,
          reasoning: model1.capabilities.reasoning !== model2.capabilities.reasoning,
        },
      },
    };
  }

  listAliases(): ModelAlias[] {
    const rows = this.store.query<any, []>(
      "SELECT * FROM model_aliases ORDER BY alias"
    ).all();
    return rows.map(r => ({
      alias: r.alias,
      modelId: r.model_id,
      providerId: r.provider_id,
      fallback: undefined,
    }));
  }

  getAlias(alias: string): ModelAlias | undefined {
    const row = this.store.query<any, [string]>(
      "SELECT * FROM model_aliases WHERE alias = ?"
    ).get(alias);
    if (!row) return undefined;
    return { alias: row.alias, modelId: row.model_id, providerId: row.provider_id, fallback: undefined };
  }

  addAlias(alias: string, modelId: string, providerId: string): ModelAlias {
    if (!this.getModel(modelId)) throw new Error(`Model "${modelId}" not found`);

    this.store.query(
      "INSERT OR REPLACE INTO model_aliases (alias, model_id, provider_id) VALUES (?, ?, ?)"
    ).run(alias, modelId, providerId);

    return { alias, modelId, providerId, fallback: undefined };
  }

  removeAlias(alias: string): void {
    this.store.query("DELETE FROM model_aliases WHERE alias = ?").run(alias);
  }

  resolveAlias(alias: string): { model: Model; provider: ProviderInstance } | null {
    const a = this.getAlias(alias);
    if (!a) return null;
    const model = this.getModel(a.modelId);
    const provider = providerRegistry.getInstance(a.providerId);
    if (!model || !provider) return null;
    return { model, provider };
  }

  scanModels = async (instanceId: string): Promise<ModelScanResult> => {
    const instance = providerRegistry.getInstance(instanceId);
    if (!instance) return { provider: "unknown", instance: instanceId, models: [], scannedAt: new Date().toISOString(), error: "Instance not found" };

    const provider = providerRegistry.getProvider(instance.providerId);
    if (!provider) return { provider: instance.providerId, instance: instanceId, models: [], scannedAt: new Date().toISOString(), error: "Provider not found" };

    const baseUrl = instance.baseUrl || provider.baseUrl;

    try {
      const res = await fetch(`${baseUrl}/models`, {
        headers: { "Authorization": `Bearer ${instance.apiKey}` },
      });

      if (!res.ok) {
        return { provider: instance.providerId, instance: instanceId, models: [], scannedAt: new Date().toISOString(), error: `${res.status} ${res.statusText}` };
      }

      const json = await res.json() as { data: Array<{
        id: string; name?: string; context_length?: number;
        max_completion_tokens?: number; supported_features?: string[];
        pricing?: { prompt?: string; completion?: string };
      }> };

      const models: Model[] = json.data.map(m => ({
        id: m.id, name: m.name || m.id.split("/").pop() || m.id,
        provider: instance.providerId,
        contextWindow: m.context_length || 4096,
        maxOutput: m.max_completion_tokens || 4096,
        capabilities: {
          vision: m.supported_features?.includes("vision") || false,
          tools: m.supported_features?.includes("tools") || false,
          reasoning: m.supported_features?.includes("reasoning") || false,
          json_mode: m.supported_features?.includes("json_mode") || false,
          streaming: true, prompt_caching: false, fine_tuning: false,
        },
        pricing: m.pricing ? { prompt: parseFloat(m.pricing.prompt || "0"), completion: parseFloat(m.pricing.completion || "0") } : undefined,
      }));

      this.addModels(models);
      providerRegistry.updateInstance(instanceId, { lastScan: new Date().toISOString(), modelsCount: models.length });

      return { provider: instance.providerId, instance: instanceId, models, scannedAt: new Date().toISOString() };
    } catch (err) {
      return { provider: instance.providerId, instance: instanceId, models: [], scannedAt: new Date().toISOString(), error: String(err) };
    }
  };

  recommendModels(criteria: {
    task?: "coding" | "reasoning" | "vision" | "general";
    maxBudget?: number; minContextWindow?: number;
    requireTools?: boolean; requireVision?: boolean; requireReasoning?: boolean;
  }): Model[] {
    let candidates = this.listModels();

    if (criteria.minContextWindow) candidates = candidates.filter(m => m.contextWindow >= criteria.minContextWindow!);
    if (criteria.requireTools) candidates = candidates.filter(m => m.capabilities.tools);
    if (criteria.requireVision) candidates = candidates.filter(m => m.capabilities.vision);
    if (criteria.requireReasoning) candidates = candidates.filter(m => m.capabilities.reasoning);
    if (criteria.maxBudget && candidates[0]?.pricing) {
      candidates = candidates.filter(m => m.pricing && (m.pricing.prompt + m.pricing.completion) <= criteria.maxBudget!);
    }

    return candidates.sort((a, b) => {
      const scoreA = this.scoreModel(a, criteria.task || "general");
      const scoreB = this.scoreModel(b, criteria.task || "general");
      return scoreB - scoreA;
    });
  }

  private scoreModel(model: Model, task: string): number {
    let score = 0;
    if (task === "coding" && model.capabilities.tools) score += 10;
    if (task === "reasoning" && model.capabilities.reasoning) score += 10;
    if (task === "vision" && model.capabilities.vision) score += 10;
    score += Math.log10(model.contextWindow) * 2;
    if (model.pricing) score -= model.pricing.prompt * 10;
    return score;
  }

  private rowToModel(row: any): Model {
    return {
      id: row.id, name: row.name, provider: row.provider,
      contextWindow: row.context_window, maxOutput: row.max_output,
      capabilities: {
        vision: !!row.capabilities_vision, tools: !!row.capabilities_tools,
        reasoning: !!row.capabilities_reasoning, json_mode: !!row.capabilities_json_mode,
        streaming: !!row.capabilities_streaming, prompt_caching: !!row.capabilities_prompt_caching,
        fine_tuning: false,
      },
      pricing: row.price_prompt ? { prompt: row.price_prompt, completion: row.price_completion, cached: row.price_cached } : undefined,
      availability: { status: row.availability_status || "available" },
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
}

export const modelCatalog = new ModelCatalog();
