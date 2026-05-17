import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, copyFileSync } from "fs";
import { join } from "path";
import type { OrchestrationConfig } from "../types";
import { getStore } from "../store";

const XDG_CONFIG = process.env.XDG_CONFIG_HOME || join(process.env.HOME!, ".config");
const OMO_CONFIG_DIR = join(XDG_CONFIG, "opencode");
const OMO_CONFIG_FILE = join(OMO_CONFIG_DIR, "opencode.json");
const OMO_AGENTS_DIR = join(OMO_CONFIG_DIR, "agents");
const OMO_SKILLS_DIR = join(OMO_CONFIG_DIR, "skills");

export interface OrchestratorSwitchResult {
  from: "omo" | "obra" | "none";
  to: "omo" | "obra";
  configsWritten: string[];
  preview: Array<{ path: string; content: string }>;
}

export class OrchestrationManager {
  detectInstalled(): Array<{ type: string; name: string; installed: boolean; version?: string }> {
    const omoInstalled = existsSync(OMO_CONFIG_DIR);
    const omoVersion = this.detectOmoVersion();
    const obra = this.detectObra();

    return [
      { type: "omo", name: "Oh My OpenCode", installed: omoInstalled, version: omoVersion },
      { type: "obra", name: "Obra Superpowers", installed: obra.installed, version: obra.version },
    ];
  }

  private detectOmoVersion(): string | undefined {
    if (!existsSync(OMO_CONFIG_DIR)) return undefined;
    try {
      const config = JSON.parse(readFileSync(OMO_CONFIG_FILE, "utf-8"));
      return config.version || "1.0.0";
    } catch {
      return "1.0.0";
    }
  }

  private detectObra(): { installed: boolean; version?: string; configPath?: string } {
    const candidates = [
      join(OMO_CONFIG_DIR, "obra.json"),
      join(OMO_CONFIG_DIR, "superpower.json"),
      join(OMO_CONFIG_DIR, "oh-my-openagent.json"),
    ];

    for (const p of candidates) {
      if (existsSync(p)) {
        try {
          const config = JSON.parse(readFileSync(p, "utf-8"));
          const version = config.version || "1.0.0";
          return { installed: true, version, configPath: p };
        } catch {
          return { installed: true, version: "1.0.0", configPath: p };
        }
      }
    }

    return { installed: false };
  }

  getOmoConfig(): OrchestrationConfig | null {
    if (!existsSync(OMO_CONFIG_FILE)) return null;

    try {
      const config = JSON.parse(readFileSync(OMO_CONFIG_FILE, "utf-8"));
      const agents: any[] = [];
      const skills: any[] = [];

      if (existsSync(OMO_AGENTS_DIR)) {
        for (const file of readdirSync(OMO_AGENTS_DIR)) {
          if (file.endsWith(".json")) {
            try {
              const agent = JSON.parse(readFileSync(join(OMO_AGENTS_DIR, file), "utf-8"));
              agents.push(agent);
            } catch {}
          }
        }
      }

      if (existsSync(OMO_SKILLS_DIR)) {
        for (const dir of readdirSync(OMO_SKILLS_DIR)) {
          const skillFile = join(OMO_SKILLS_DIR, dir, "SKILL.md");
          if (existsSync(skillFile)) {
            skills.push({ id: dir, name: dir, description: "See SKILL.md", triggers: [], enabled: true, path: skillFile });
          }
        }
      }

      return { enabled: true, type: "omo", version: config.version, agents, skills };
    } catch {
      return null;
    }
  }

  getObraConfig(): OrchestrationConfig | null {
    const obra = this.detectObra();
    if (!obra.installed || !obra.configPath) return null;

    try {
      const config = JSON.parse(readFileSync(obra.configPath, "utf-8"));
      const agents = this.readObraAgents(config);
      const skills = this.readObraSkills();

      return {
        enabled: true,
        type: "obra",
        version: obra.version,
        agents,
        skills,
      };
    } catch {
      return null;
    }
  }

  private readObraAgents(obra: any): any[] {
    const agentsList: any[] = [];
    if (obra && typeof obra.agents === "object" && obra.agents !== null) {
      for (const [key, value] of Object.entries(obra.agents)) {
        if (value && typeof value === "object") {
          agentsList.push({
            id: key,
            ...(value as any),
          });
        }
      }
    }
    return agentsList;
  }

  private readObraSkills(): any[] {
    const skills: any[] = [];
    if (existsSync(OMO_SKILLS_DIR)) {
      for (const dir of readdirSync(OMO_SKILLS_DIR)) {
        const skillFile = join(OMO_SKILLS_DIR, dir, "SKILL.md");
        if (existsSync(skillFile)) {
          skills.push({ id: dir, name: dir, description: "See SKILL.md", triggers: [], enabled: true, path: skillFile });
        }
      }
    }
    return skills;
  }

  getActiveOrchestrator(): "omo" | "obra" | "none" {
    try {
      const store = getStore();
      const row = store.query<{ value: string }, [string]>("SELECT value FROM settings WHERE key = ?").get("active_orchestrator");
      if (row && (row.value === "omo" || row.value === "obra")) {
        return row.value as "omo" | "obra";
      }
    } catch {}

    const obra = this.detectObra();
    if (obra.installed) return "obra";
    if (existsSync(OMO_CONFIG_FILE)) return "omo";

    return "none";
  }

  backupConfig(orchestrator: "omo" | "obra"): string[] {
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = new Date();
    const timestamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const backupsCreated: string[] = [];

    const backupFile = (originalPath: string) => {
      if (existsSync(originalPath)) {
        const dest = `${originalPath}.bak.${timestamp}`;
        copyFileSync(originalPath, dest);
        backupsCreated.push(dest);
      }
    };

    if (orchestrator === "omo") {
      backupFile(OMO_CONFIG_FILE);
      const authPath = join(process.env.HOME!, ".local/share/opencode/auth.json");
      backupFile(authPath);
    } else if (orchestrator === "obra") {
      const obra = this.detectObra();
      if (obra.installed && obra.configPath) {
        backupFile(obra.configPath);
      }
    }

    return backupsCreated;
  }

  restoreConfig(backupPath: string): void {
    if (!existsSync(backupPath)) throw new Error("Backup file not found");
    const dest = backupPath.replace(/\.bak\.\d{8}-\d{6}$/, "");
    copyFileSync(backupPath, dest);

    let active: "omo" | "obra" = "omo";
    if (dest.endsWith("oh-my-openagent.json") || dest.endsWith("superpower.json") || dest.endsWith("obra.json")) {
      active = "obra";
    }

    const store = getStore();
    store.query(
      "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('active_orchestrator', ?, datetime('now'))"
    ).run(active);
  }

  listBackups(): Array<{ path: string; timestamp: string; orchestrator: "omo" | "obra" }> {
    const list: Array<{ path: string; timestamp: string; orchestrator: "omo" | "obra" }> = [];

    const scanDir = (dir: string) => {
      if (!existsSync(dir)) return;
      for (const file of readdirSync(dir)) {
        const match = file.match(/(.+)\.json\.bak\.(\d{8}-\d{6})$/);
        if (match) {
          const name = match[1];
          const timestamp = match[2];
          let orchestrator: "omo" | "obra" = "omo";
          if (name === "oh-my-openagent" || name === "superpower" || name === "obra") {
            orchestrator = "obra";
          }
          list.push({
            path: join(dir, file),
            timestamp,
            orchestrator,
          });
        }
      }
    };

    scanDir(OMO_CONFIG_DIR);
    scanDir(join(process.env.HOME!, ".local/share/opencode"));

    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  switchOrchestrator(target: "omo" | "obra", opts: { dryRun?: boolean; backup?: boolean } = {}): OrchestratorSwitchResult {
    const from = this.getActiveOrchestrator();

    if (opts.backup && !opts.dryRun) {
      this.backupConfig(from === "none" ? target : from);
    }

    const configsWritten: string[] = [];
    const preview: Array<{ path: string; content: string }> = [];

    const store = getStore();
    const instances = store.query<any, []>("SELECT * FROM instances WHERE enabled = 1").all();

    let minChunkSize = 80;
    try {
      const row = store.query<{ value: string }, [string]>("SELECT value FROM settings WHERE key = ?").get("minChunkSize");
      if (row) minChunkSize = parseInt(row.value);
    } catch {}

    if (target === "omo") {
      const provider: Record<string, any> = {};
      const auth: Record<string, any> = {};

      for (const inst of instances) {
        const instModels = store.query<any, [string]>("SELECT * FROM models WHERE provider = ?").all(inst.providerId);
        const modelsConfig: Record<string, { name: string }> = {};
        for (const m of instModels) {
          modelsConfig[m.id] = { name: m.name };
        }

        provider[inst.id] = {
          npm: inst.providerId === "baseten" ? "@ai-sdk/baseten" : "@ai-sdk/openai-compatible",
          name: `${inst.providerId} · ${inst.name}`,
          options: { baseURL: inst.baseUrl || undefined, minChunkSize },
          models: modelsConfig,
        };

        auth[inst.id] = { type: "api", key: inst.apiKey };
      }

      const opencodeContent = JSON.stringify({ version: "1.0.0", provider }, null, 2);
      const authContent = JSON.stringify(auth, null, 2);

      preview.push({ path: OMO_CONFIG_FILE, content: opencodeContent });
      const authPath = join(process.env.HOME!, ".local/share/opencode/auth.json");
      preview.push({ path: authPath, content: authContent });

      if (!opts.dryRun) {
        if (!existsSync(OMO_CONFIG_DIR)) mkdirSync(OMO_CONFIG_DIR, { recursive: true });
        writeFileSync(OMO_CONFIG_FILE, opencodeContent);

        const authDir = join(authPath, "..");
        if (!existsSync(authDir)) mkdirSync(authDir, { recursive: true });
        writeFileSync(authPath, authContent);

        configsWritten.push(OMO_CONFIG_FILE);
        configsWritten.push(authPath);
      }
    } else if (target === "obra") {
      const obraPath = join(OMO_CONFIG_DIR, "oh-my-openagent.json");
      let existingObra: any = {};
      if (existsSync(obraPath)) {
        try {
          existingObra = JSON.parse(readFileSync(obraPath, "utf-8"));
        } catch {}
      }

      const agents: Record<string, any> = {};
      if (existsSync(OMO_AGENTS_DIR)) {
        for (const file of readdirSync(OMO_AGENTS_DIR)) {
          if (file.endsWith(".json")) {
            try {
              const a = JSON.parse(readFileSync(join(OMO_AGENTS_DIR, file), "utf-8"));
              agents[a.id] = {
                name: a.name,
                type: a.type || "explore",
                model: a.model || "",
                systemPrompt: a.systemPrompt || "",
                tools: a.tools || [],
              };
            } catch {}
          }
        }
      }

      const mergedObra = {
        version: "1.0.0",
        agents: { ...existingObra.agents, ...agents },
        thinkingConfig: existingObra.thinkingConfig || {
          enabled: true,
          temperature: 0.7,
          maxTokens: 1024,
        },
      };

      const obraContent = JSON.stringify(mergedObra, null, 2);
      preview.push({ path: obraPath, content: obraContent });

      if (!opts.dryRun) {
        if (!existsSync(OMO_CONFIG_DIR)) mkdirSync(OMO_CONFIG_DIR, { recursive: true });
        writeFileSync(obraPath, obraContent);
        configsWritten.push(obraPath);
      }
    }

    if (!opts.dryRun) {
      store.query(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('active_orchestrator', ?, datetime('now'))"
      ).run(target);
    }

    return {
      from,
      to: target,
      configsWritten,
      preview,
    };
  }

  getAgentList(): any[] {
    if (!existsSync(OMO_AGENTS_DIR)) return [];
    const agents: any[] = [];
    for (const file of readdirSync(OMO_AGENTS_DIR)) {
      if (file.endsWith(".json")) {
        try {
          agents.push(JSON.parse(readFileSync(join(OMO_AGENTS_DIR, file), "utf-8")));
        } catch {}
      }
    }
    return agents;
  }

  saveAgent(agent: { id: string; name: string; type: string; model?: string; systemPrompt?: string; tools?: string[] }): void {
    if (!existsSync(OMO_AGENTS_DIR)) mkdirSync(OMO_AGENTS_DIR, { recursive: true });
    writeFileSync(join(OMO_AGENTS_DIR, `${agent.id}.json`), JSON.stringify(agent, null, 2));
  }

  removeAgent(id: string): void {
    const path = join(OMO_AGENTS_DIR, `${id}.json`);
    if (existsSync(path)) unlinkSync(path);
  }

  getSkillsList(): Array<{ id: string; name: string; path?: string }> {
    if (!existsSync(OMO_SKILLS_DIR)) return [];
    const skills: Array<{ id: string; name: string; path?: string }> = [];
    for (const dir of readdirSync(OMO_SKILLS_DIR)) {
      const skillFile = join(OMO_SKILLS_DIR, dir, "SKILL.md");
      if (existsSync(skillFile)) {
        skills.push({ id: dir, name: dir, path: skillFile });
      }
    }
    return skills;
  }

  getSkillContent(id: string): string | null {
    const path = join(OMO_SKILLS_DIR, id, "SKILL.md");
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  }
}

export const orchestrationManager = new OrchestrationManager();
