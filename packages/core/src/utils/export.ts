import { writeFileSync, readFileSync, existsSync } from "fs";
import { providerRegistry } from "../provider-registry";
import { modelCatalog } from "../model-catalog";
import { configManager } from "../config-manager";
import { experimentTracker } from "../experiments";
import { budgetManager } from "../analytics";

export interface ExportPayload {
  version: string;
  exportedAt: string;
  provider: {
    instances: any[];
  };
  models: any[];
  aliases: any[];
  experiments: any[];
  budgets: any[];
  settings: Record<string, string>;
}

export function exportAll(): ExportPayload {
  const instances = providerRegistry.listInstances().map(i => ({
    ...i, apiKey: i.apiKey, // note: API keys are included for portability
  }));

  const models = modelCatalog.listModels();
  const aliases = modelCatalog.listAliases();
  const experiments = experimentTracker.list();
  const budgets = budgetManager.list();
  const settings = configManager.getSettings();

  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    provider: { instances },
    models,
    aliases,
    experiments,
    budgets,
    settings: {
      minChunkSize: String(settings.minChunkSize),
      timeout: String(settings.timeout),
      retries: String(settings.retries),
      defaultProvider: settings.defaultProvider || "",
      defaultModel: settings.defaultModel || "",
    },
  };
}

export function exportToFile(filePath: string): void {
  const data = exportAll();
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function importAll(payload: ExportPayload): { imported: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;

  for (const inst of payload.provider.instances || []) {
    try {
      providerRegistry.addInstance({
        providerId: inst.providerId,
        name: inst.name,
        apiKey: inst.apiKey,
        baseUrl: inst.baseUrl,
        minChunkSize: inst.minChunkSize,
        enabled: inst.enabled,
        priority: inst.priority,
        labels: inst.labels || [],
      });
      imported++;
    } catch (err) {
      errors.push(`Instance ${inst.id}: ${err}`);
    }
  }

  for (const model of payload.models || []) {
    try {
      modelCatalog.addModel(model);
      imported++;
    } catch (err) {
      errors.push(`Model ${model.id}: ${err}`);
    }
  }

  for (const alias of payload.aliases || []) {
    try {
      modelCatalog.addAlias(alias.alias, alias.modelId, alias.providerId);
      imported++;
    } catch (err) {
      errors.push(`Alias ${alias.alias}: ${err}`);
    }
  }

  if (payload.settings) {
    for (const [key, value] of Object.entries(payload.settings)) {
      if (value) configManager.setSetting(key, value);
    }
    imported++;
  }

  return { imported, errors };
}

export function importFromFile(filePath: string): { imported: number; errors: string[] } {
  if (!existsSync(filePath)) return { imported: 0, errors: [`File not found: ${filePath}`] };
  const data: ExportPayload = JSON.parse(readFileSync(filePath, "utf-8"));
  return importAll(data);
}
