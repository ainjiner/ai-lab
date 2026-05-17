import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getStore } from "../store";
import { providerRegistry } from "../provider-registry";
import { modelCatalog } from "../model-catalog";
import type { ConfigTarget } from "../types";

const XDG_CONFIG = process.env.XDG_CONFIG_HOME || join(process.env.HOME!, ".config");

export const BUILTIN_TARGETS: ConfigTarget[] = [
  { id: "opencode", name: "OpenCode", configPath: join(XDG_CONFIG, "opencode/opencode.json"), authPath: join(process.env.HOME!, ".local/share/opencode/auth.json"), enabled: true },
  { id: "cursor", name: "Cursor", configPath: join(process.env.HOME!, ".cursor/config.json"), enabled: false },
  { id: "continue", name: "Continue", configPath: join(process.env.HOME!, ".continue/config.json"), enabled: false },
  { id: "aider", name: "Aider", configPath: join(process.env.HOME!, ".aider/config.json"), enabled: false },
];

export interface GeneratedConfig {
  target: ConfigTarget;
  provider: Record<string, unknown>;
  auth: Record<string, unknown>;
}

export class ConfigManager {
  private targets: Map<string, ConfigTarget> = new Map();
  private store = getStore();

  constructor() {
    for (const t of BUILTIN_TARGETS) this.targets.set(t.id, t);
    try {
      const rows = this.store.query<{ key: string; value: string }, []>(
        "SELECT key, value FROM settings WHERE key LIKE 'target.%.enabled'"
      ).all();
      for (const row of rows) {
        const match = row.key.match(/^target\.(.+)\.enabled$/);
        if (match) {
          const id = match[1];
          const t = this.targets.get(id);
          if (t) {
            this.targets.set(id, { ...t, enabled: row.value === "true" });
          }
        }
      }
    } catch (e) {}
  }

  getSettings(): { minChunkSize: number; timeout: number; retries: number; defaultProvider?: string; defaultModel?: string } {
    const q = (key: string, def: string) => {
      const row = this.store.query<{ value: string }, [string]>("SELECT value FROM settings WHERE key = ?").get(key);
      return row ? row.value : def;
    };
    return {
      minChunkSize: parseInt(q("minChunkSize", "80")),
      timeout: parseInt(q("timeout", "60000")),
      retries: parseInt(q("retries", "3")),
      defaultProvider: q("defaultProvider", "") || undefined,
      defaultModel: q("defaultModel", "") || undefined,
    };
  }

  getConfig(): { settings: { minChunkSize: number; timeout: number; retries: number }; defaults: { provider?: string; model?: string } } {
    const s = this.getSettings();
    return {
      settings: {
        minChunkSize: s.minChunkSize,
        timeout: s.timeout,
        retries: s.retries,
      },
      defaults: {
        provider: s.defaultProvider,
        model: s.defaultModel,
      },
    };
  }

  updateConfig(config: { settings: { minChunkSize?: number; timeout?: number; retries?: number }; defaults?: { provider?: string; model?: string } }): void {
    if (config.settings) {
      for (const [key, value] of Object.entries(config.settings)) {
        if (value !== undefined) {
          this.setSetting(key, String(value));
        }
      }
    }
    if (config.defaults) {
      if (config.defaults.provider !== undefined) {
        this.setSetting("defaultProvider", config.defaults.provider);
      }
      if (config.defaults.model !== undefined) {
        this.setSetting("defaultModel", config.defaults.model);
      }
    }
  }

  setSetting(key: string, value: string): void {
    this.store.query(
      "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))"
    ).run(key, value);
  }

  listTargets(): (ConfigTarget & { lastSynced?: string })[] {
    const list = [...this.targets.values()];
    return list.map(t => {
      const row = this.store.query<{ value: string }, [string]>("SELECT value FROM settings WHERE key = ?").get(`target.${t.id}.last_synced`);
      return { ...t, lastSynced: row ? row.value : undefined };
    });
  }

  getTarget(id: string): ConfigTarget | undefined {
    return this.targets.get(id);
  }

  getEnabledTargets(): ConfigTarget[] {
    return this.listTargets().filter(t => t.enabled);
  }

  enableTarget(id: string): void {
    const t = this.targets.get(id);
    if (t) {
      this.targets.set(id, { ...t, enabled: true });
      this.setSetting(`target.${id}.enabled`, "true");
    }
  }

  disableTarget(id: string): void {
    const t = this.targets.get(id);
    if (t) {
      this.targets.set(id, { ...t, enabled: false });
      this.setSetting(`target.${id}.enabled`, "false");
    }
  }

  validateTarget(targetId: string): { valid: boolean; errors: string[] } {
    const target = this.getTarget(targetId);
    if (!target) {
      return { valid: false, errors: ["Target not found"] };
    }

    const errors: string[] = [];

    if (existsSync(target.configPath)) {
      try {
        JSON.parse(readFileSync(target.configPath, "utf-8"));
      } catch (e) {
        errors.push("Config file is not valid JSON");
      }
    } else {
      errors.push("Config file does not exist");
    }

    const valid = !errors.includes("Config file is not valid JSON");
    return { valid, errors };
  }

  syncToTarget(targetId: string): GeneratedConfig {
    const target = this.getTarget(targetId);
    if (!target) throw new Error(`Target "${targetId}" not found`);

    const instances = providerRegistry.getEnabledInstances();
    const settings = this.getSettings();

    const provider: Record<string, unknown> = {};
    const auth: Record<string, unknown> = {};

    for (const inst of instances) {
      const p = providerRegistry.getProvider(inst.providerId);
      if (!p) continue;

      const baseUrl = inst.baseUrl || p.baseUrl;
      const models = modelCatalog.getModelsByProvider(inst.providerId);
      const modelsConfig: Record<string, { name: string }> = {};

      for (const m of models) modelsConfig[m.id] = { name: m.name };

      provider[inst.id] = {
        npm: this.getNpmPackage(inst.providerId, targetId),
        name: `${p.name} · ${inst.name}`,
        options: { baseURL: baseUrl, minChunkSize: settings.minChunkSize },
        models: modelsConfig,
      };

      auth[inst.id] = { type: "api", key: inst.apiKey };
    }

    const dir = join(target.configPath, "..");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const existing = existsSync(target.configPath) ? JSON.parse(readFileSync(target.configPath, "utf-8")) : { provider: {} };
    for (const k of Object.keys(existing.provider || {})) {
      if (!instances.some(i => i.id === k)) provider[k] = existing.provider[k];
    }
    writeFileSync(target.configPath, JSON.stringify({ ...existing, provider }, null, 2));

    if (target.authPath) {
      const authDir = join(target.authPath, "..");
      if (!existsSync(authDir)) mkdirSync(authDir, { recursive: true });

      const existingAuth = existsSync(target.authPath) ? JSON.parse(readFileSync(target.authPath, "utf-8")) : {};
      for (const k of Object.keys(existingAuth)) {
        if (!instances.some(i => i.id === k)) auth[k] = existingAuth[k];
      }
      writeFileSync(target.authPath, JSON.stringify(auth, null, 2));
    }

    this.setSetting(`target.${targetId}.last_synced`, new Date().toISOString());

    return { target, provider, auth };
  }

  syncToAllTargets(): GeneratedConfig[] {
    return this.getEnabledTargets().map(t => this.syncToTarget(t.id));
  }

  generatePreview(targetId: string): GeneratedConfig {
    const target = this.getTarget(targetId);
    if (!target) throw new Error(`Target "${targetId}" not found`);

    const instances = providerRegistry.getEnabledInstances();
    const provider: Record<string, unknown> = {};
    const auth: Record<string, unknown> = {};

    for (const inst of instances) {
      provider[inst.id] = { name: inst.name, apiKey: `${inst.apiKey.slice(0, 8)}...${inst.apiKey.slice(-4)}` };
      auth[inst.id] = { type: "api", key: `${inst.apiKey.slice(0, 8)}...${inst.apiKey.slice(-4)}` };
    }

    return { target, provider, auth };
  }

  private getNpmPackage(providerId: string, targetId: string): string {
    const map: Record<string, Record<string, string>> = {
      baseten: { opencode: "@ai-sdk/baseten", cursor: "@ai-sdk/openai-compatible", continue: "@ai-sdk/openai-compatible", aider: "@ai-sdk/openai-compatible" },
      openrouter: { opencode: "@ai-sdk/openrouter", cursor: "@ai-sdk/openai-compatible", continue: "@ai-sdk/openai-compatible", aider: "@ai-sdk/openai-compatible" },
      together: { opencode: "@ai-sdk/together-ai", cursor: "@ai-sdk/openai-compatible", continue: "@ai-sdk/openai-compatible", aider: "@ai-sdk/openai-compatible" },
    };
    return map[providerId]?.[targetId] || "@ai-sdk/openai-compatible";
  }
}

export const configManager = new ConfigManager();
