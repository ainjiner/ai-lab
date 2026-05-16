import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { OrchestrationConfig } from "../types";
import { getStore } from "../store";

const XDG_CONFIG = process.env.XDG_CONFIG_HOME || join(process.env.HOME!, ".config");
const OMO_CONFIG_DIR = join(XDG_CONFIG, "opencode");
const OMO_CONFIG_FILE = join(OMO_CONFIG_DIR, "opencode.json");
const OMO_AGENTS_DIR = join(OMO_CONFIG_DIR, "agents");
const OMO_SKILLS_DIR = join(OMO_CONFIG_DIR, "skills");

export class OrchestrationManager {
  private store = getStore();

  detectInstalled(): Array<{ type: string; name: string; installed: boolean; version?: string }> {
    return [
      { type: "omo", name: "Oh My OpenCode", installed: existsSync(OMO_CONFIG_DIR), version: this.detectOmoVersion() },
      { type: "obra", name: "Obra Superpowers", installed: false, version: undefined },
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

  getOmoConfig(): OrchestrationConfig | null {
    if (!existsSync(OMO_CONFIG_FILE)) return null;

    try {
      const config = JSON.parse(readFileSync(OMO_CONFIG_FILE, "utf-8"));
      const agents: any[] = [];
      const skills: any[] = [];

      if (existsSync(OMO_AGENTS_DIR)) {
        const { readdirSync } = require("fs");
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
        const { readdirSync } = require("fs");
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

  getAgentList(): any[] {
    if (!existsSync(OMO_AGENTS_DIR)) return [];
    const { readdirSync } = require("fs");
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
    if (existsSync(path)) require("fs").unlinkSync(path);
  }

  getSkillsList(): Array<{ id: string; name: string; path?: string }> {
    if (!existsSync(OMO_SKILLS_DIR)) return [];
    const { readdirSync } = require("fs");
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
