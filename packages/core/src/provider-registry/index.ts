import type { Provider, ProviderInstance } from "../types";
import { getStore } from "../store";

export const BUILTIN_PROVIDERS: Provider[] = [
  {
    id: "baseten", name: "Baseten", type: "inference",
    baseUrl: "https://inference.baseten.co/v1", authMethod: "api_key",
    features: { streaming: true, vision: false, tools: true, reasoning: true, json_mode: true, prompt_caching: false },
    documentation: "https://docs.baseten.co/",
    description: "High-performance inference platform with enterprise-grade models",
  },
  {
    id: "openrouter", name: "OpenRouter", type: "gateway",
    baseUrl: "https://openrouter.ai/api/v1", authMethod: "api_key",
    features: { streaming: true, vision: true, tools: true, reasoning: true, json_mode: true, prompt_caching: false },
    pricing: { markup: 0.05 }, documentation: "https://openrouter.ai/docs",
    description: "Unified API for 100+ models from multiple providers",
  },
  {
    id: "together", name: "Together AI", type: "inference",
    baseUrl: "https://api.together.xyz/v1", authMethod: "api_key",
    features: { streaming: true, vision: false, tools: true, reasoning: false, json_mode: true, prompt_caching: true },
    documentation: "https://docs.together.ai/",
    description: "Fast inference for open-source models",
  },
  {
    id: "fireworks", name: "Fireworks AI", type: "inference",
    baseUrl: "https://api.fireworks.ai/inference/v1", authMethod: "api_key",
    features: { streaming: true, vision: true, tools: true, reasoning: false, json_mode: true, prompt_caching: true },
    documentation: "https://docs.fireworks.ai/",
    description: "Serverless inference with auto-scaling",
  },
  {
    id: "groq", name: "Groq", type: "inference",
    baseUrl: "https://api.groq.com/openai/v1", authMethod: "api_key",
    features: { streaming: true, vision: true, tools: true, reasoning: false, json_mode: true, prompt_caching: false },
    documentation: "https://console.groq.com/docs",
    description: "Ultra-fast inference with LPU technology",
  },
  {
    id: "anthropic", name: "Anthropic", type: "inference",
    baseUrl: "https://api.anthropic.com/v1", authMethod: "api_key",
    features: { streaming: true, vision: true, tools: true, reasoning: true, json_mode: false, prompt_caching: true },
    documentation: "https://docs.anthropic.com/",
    description: "Claude models with advanced reasoning",
  },
  {
    id: "openai", name: "OpenAI", type: "inference",
    baseUrl: "https://api.openai.com/v1", authMethod: "api_key",
    features: { streaming: true, vision: true, tools: true, reasoning: true, json_mode: true, prompt_caching: true },
    documentation: "https://platform.openai.com/docs",
    description: "GPT models with broad capabilities",
  },
  {
    id: "google", name: "Google AI", type: "inference",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta", authMethod: "api_key",
    features: { streaming: true, vision: true, tools: true, reasoning: false, json_mode: true, prompt_caching: false },
    documentation: "https://ai.google.dev/docs",
    description: "Gemini models with multimodal capabilities",
  },
  {
    id: "deepseek", name: "DeepSeek", type: "inference",
    baseUrl: "https://api.deepseek.com/v1", authMethod: "api_key",
    features: { streaming: true, vision: false, tools: true, reasoning: true, json_mode: true, prompt_caching: false },
    documentation: "https://platform.deepseek.com/docs",
    description: "DeepSeek models with advanced reasoning",
  },
  {
    id: "ollama", name: "Ollama", type: "local",
    baseUrl: "http://localhost:11434/v1", authMethod: "none",
    features: { streaming: true, vision: true, tools: false, reasoning: false, json_mode: true, prompt_caching: false },
    documentation: "https://ollama.com/docs",
    description: "Run models locally with Ollama",
  },
];

export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map();
  private store = getStore();

  constructor() {
    for (const p of BUILTIN_PROVIDERS) this.providers.set(p.id, p);
  }

  listProviders(): Provider[] {
    return [...this.providers.values()];
  }

  getProvider(id: string): Provider | undefined {
    return this.providers.get(id);
  }

  listInstances(): ProviderInstance[] {
    const rows = this.store.query<any, []>("SELECT * FROM provider_instances ORDER BY priority").all();
    return rows.map(this.rowToInstance);
  }

  getInstance(id: string): ProviderInstance | undefined {
    const row = this.store.query<any, [string]>("SELECT * FROM provider_instances WHERE id = ?").get(id);
    return row ? this.rowToInstance(row) : undefined;
  }

  addInstance(opts: {
    providerId: string; name: string; apiKey: string; baseUrl?: string;
    minChunkSize?: number; enabled?: boolean; priority?: number; labels?: string[];
  }): ProviderInstance {
    const provider = this.getProvider(opts.providerId);
    if (!provider) throw new Error(`Provider "${opts.providerId}" not found`);

    const id = `${opts.providerId}-${opts.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const existing = this.getInstance(id);
    if (existing) throw new Error(`Instance "${id}" already exists`);

    this.store.query<null, any[]>(
      `INSERT INTO provider_instances (id, provider_id, name, api_key, base_url, min_chunk_size, enabled, priority, labels)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, opts.providerId, opts.name, opts.apiKey,
      opts.baseUrl || null, opts.minChunkSize ?? null,
      opts.enabled ?? 1, opts.priority ?? 0,
      JSON.stringify(opts.labels || [])
    );

    return this.getInstance(id)!;
  }

  updateInstance(id: string, updates: Partial<ProviderInstance>): ProviderInstance {
    const existing = this.getInstance(id);
    if (!existing) throw new Error(`Instance "${id}" not found`);

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.apiKey !== undefined) { fields.push("api_key = ?"); values.push(updates.apiKey); }
    if (updates.baseUrl !== undefined) { fields.push("base_url = ?"); values.push(updates.baseUrl); }
    if (updates.enabled !== undefined) { fields.push("enabled = ?"); values.push(updates.enabled ? 1 : 0); }
    if (updates.priority !== undefined) { fields.push("priority = ?"); values.push(updates.priority); }
    if (updates.modelsCount !== undefined) { fields.push("models_count = ?"); values.push(updates.modelsCount); }
    if (updates.lastScan !== undefined) { fields.push("last_scan = ?"); values.push(updates.lastScan); }
    if (updates.labels !== undefined) { fields.push("labels = ?"); values.push(JSON.stringify(updates.labels)); }

    if (fields.length === 0) return existing;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    this.store.query(`UPDATE provider_instances SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    return this.getInstance(id)!;
  }

  removeInstance(id: string): void {
    this.store.query("DELETE FROM provider_instances WHERE id = ?").run(id);
  }

  enableInstance(id: string): void { this.updateInstance(id, { enabled: true }); }
  disableInstance(id: string): void { this.updateInstance(id, { enabled: false }); }

  getEnabledInstances(): ProviderInstance[] {
    return this.listInstances().filter(i => i.enabled);
  }

  getByProvider(providerId: string): ProviderInstance[] {
    const rows = this.store.query<any, [string]>(
      "SELECT * FROM provider_instances WHERE provider_id = ? ORDER BY priority"
    ).all(providerId);
    return rows.map(this.rowToInstance);
  }

  getByLabel(label: string): ProviderInstance[] {
    return this.listInstances().filter(i => i.labels?.includes(label));
  }

  testConnection = async (instanceId: string): Promise<{ success: boolean; latency: number; error?: string }> => {
    const instance = this.getInstance(instanceId);
    if (!instance) return { success: false, latency: 0, error: "Instance not found" };

    const provider = this.getProvider(instance.providerId);
    if (!provider) return { success: false, latency: 0, error: "Provider not found" };

    const baseUrl = instance.baseUrl || provider.baseUrl;
    const start = Date.now();

    try {
      const res = await fetch(`${baseUrl}/models`, {
        headers: { "Authorization": `Bearer ${instance.apiKey}` },
      });
      const latency = Date.now() - start;
      if (!res.ok) return { success: false, latency, error: `${res.status} ${res.statusText}` };
      return { success: true, latency };
    } catch (err) {
      return { success: false, latency: Date.now() - start, error: String(err) };
    }
  };

  private rowToInstance(row: any): ProviderInstance {
    return {
      id: row.id, providerId: row.provider_id, name: row.name,
      apiKey: row.api_key, baseUrl: row.base_url,
      enabled: !!row.enabled, priority: row.priority,
      labels: JSON.parse(row.labels || "[]"),
      modelsCount: row.models_count, lastScan: row.last_scan,
      createdAt: row.created_at, updatedAt: row.updated_at,
    };
  }
}

export const providerRegistry = new ProviderRegistry();
