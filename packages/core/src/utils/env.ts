import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { providerRegistry } from "../provider-registry";

function loadDotEnv(): Record<string, string> {
  const paths = [
    join(process.cwd(), ".env"),
    join(process.env.HOME!, ".config/ml-engine/.env"),
  ];

  const vars: Record<string, string> = {};

  for (const envPath of paths) {
    if (!existsSync(envPath)) continue;
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      vars[key] = value;
    }
  }

  return vars;
}

export function importFromEnv(prefix: string = "PROVIDER_"): { imported: number; instances: string[] } {
  const envVars = { ...loadDotEnv(), ...process.env } as Record<string, string>;
  let imported = 0;
  const instances: string[] = [];

  for (const [key, value] of Object.entries(envVars)) {
    if (!key.startsWith(prefix) || !key.endsWith("_API_KEY") || !value) continue;

    const middle = key.slice(prefix.length, -"_API_KEY".length).toLowerCase();
    const segments = middle.split("_");

    if (segments.length >= 2) {
      const providerId = segments[0];
      const name = segments.slice(1).join("-");

      try {
        const instance = providerRegistry.addInstance({
          providerId,
          name,
          apiKey: value,
          enabled: true,
          priority: 0,
          labels: ["env-imported"],
        });
        imported++;
        instances.push(instance.id);
      } catch {
        // Instance already exists, skip
      }
    }
  }

  return { imported, instances };
}

export function detectEnvVars(): Array<{ variable: string; provider: string; name: string; status: "found" | "missing" }> {
  const patterns = [
    { var: "BASETEN_PRODUCTION_API_KEY", provider: "baseten", name: "production" },
    { var: "BASETEN_STAGING_API_KEY", provider: "baseten", name: "staging" },
    { var: "OPENROUTER_API_KEY", provider: "openrouter", name: "personal" },
    { var: "TOGETHER_API_KEY", provider: "together", name: "default" },
    { var: "ANTHROPIC_API_KEY", provider: "anthropic", name: "default" },
    { var: "OPENAI_API_KEY", provider: "openai", name: "default" },
  ];

  return patterns.map(p => ({
    variable: p.var,
    provider: p.provider,
    name: p.name,
    status: (process.env[p.var] ? "found" : "missing") as "found" | "missing",
  }));
}
