#!/usr/bin/env bun
/**
 * Baseten Workspace Manager
 * 
 * Usage:
 *   bun run index.ts list
 *   bun run index.ts add <name> <api_key> [models...]
 *   bun run index.ts remove <name>
 *   bun run index.ts scan <workspace>
 *   bun run index.ts scan-all
 *   bun run index.ts apply-models <workspace> [model_ids...]
 *   bun run index.ts sync
 *   bun run index.ts generate
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CONFIG_DIR = process.env.XDG_CONFIG_HOME || join(process.env.HOME!, ".config/opencode");
const WORKSPACES_FILE = join(CONFIG_DIR, "baseten-workspaces.json");
const AUTH_FILE = join(process.env.HOME!, ".local/share/opencode/auth.json");
const OPENCODE_FILE = join(CONFIG_DIR, "opencode.json");

const DEFAULT_MODELS = [
  "zai-org/GLM-4.7",
  "zai-org/GLM-5",
  "deepseek-ai/DeepSeek-V4-Pro",
  "moonshotai/Kimi-K2.5",
];

interface BasetenModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  max_completion_tokens?: number;
  supported_features?: string[];
  input_modalities?: string[];
  output_modalities?: string[];
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

interface BasetenModelsResponse {
  data: BasetenModel[];
}

interface Workspace {
  apiKey: string;
  models: string[];
  scannedModels?: BasetenModel[];
  lastScan?: string;
}

interface WorkspacesConfig {
  proxyUrl: string;
  workspaces: Record<string, Workspace>;
}

interface AuthConfig {
  [provider: string]: {
    type: "api";
    key: string;
  };
}

interface OpenCodeConfig {
  provider: Record<string, unknown>;
  [key: string]: unknown;
}

function loadWorkspaces(): WorkspacesConfig {
  if (!existsSync(WORKSPACES_FILE)) {
    return {
      proxyUrl: "http://127.0.0.1:8899/v1",
      workspaces: {},
    };
  }
  return JSON.parse(readFileSync(WORKSPACES_FILE, "utf-8"));
}

function saveWorkspaces(config: WorkspacesConfig): void {
  writeFileSync(WORKSPACES_FILE, JSON.stringify(config, null, 2));
}

function loadAuth(): AuthConfig {
  if (!existsSync(AUTH_FILE)) {
    return {};
  }
  return JSON.parse(readFileSync(AUTH_FILE, "utf-8"));
}

function saveAuth(auth: AuthConfig): void {
  writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));
}

function loadOpenCode(): OpenCodeConfig {
  if (!existsSync(OPENCODE_FILE)) {
    return { provider: {} };
  }
  return JSON.parse(readFileSync(OPENCODE_FILE, "utf-8"));
}

function saveOpenCode(config: OpenCodeConfig): void {
  writeFileSync(OPENCODE_FILE, JSON.stringify(config, null, 2));
}

async function fetchModels(proxyUrl: string, apiKey: string): Promise<BasetenModel[]> {
  const url = `${proxyUrl}/models`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as BasetenModelsResponse;
  return data.data || [];
}

function formatModel(model: BasetenModel, index: number): string {
  const features = model.supported_features?.join(", ") || "none";
  const ctx = model.context_length ? `${(model.context_length / 1000).toFixed(0)}K` : "?";
  const priceIn = model.pricing?.prompt ? `$${parseFloat(model.pricing.prompt).toFixed(6)}` : "?";
  const priceOut = model.pricing?.completion ? `$${parseFloat(model.pricing.completion).toFixed(6)}` : "?";
  
  return `[${index + 1}] ${model.id}
    Name: ${model.name}
    Context: ${ctx} tokens | Max output: ${model.max_completion_tokens ? (model.max_completion_tokens / 1000).toFixed(0) + 'K' : '?'}
    Features: ${features}
    Price: ${priceIn}/1M in, ${priceOut}/1M out
    ${model.description ? `    Desc: ${model.description.slice(0, 80)}...` : ""}`;
}

function generateProviderEntry(
  name: string,
  workspace: Workspace,
  proxyUrl: string
): Record<string, unknown> {
  const models: Record<string, { name: string }> = {};
  for (const modelId of workspace.models) {
    const scannedModel = workspace.scannedModels?.find(m => m.id === modelId);
    models[modelId] = {
      name: scannedModel?.name || modelId.split("/").pop() || modelId,
    };
  }

  return {
    npm: "@ai-sdk/baseten",
    name: `Baseten (${name})`,
    options: {
      baseURL: proxyUrl,
    },
    models,
  };
}

function cmdList(): void {
  const config = loadWorkspaces();
  console.log("\n📦 Baseten Workspaces\n");
  console.log(`Proxy URL: ${config.proxyUrl}\n`);

  const names = Object.keys(config.workspaces);
  if (names.length === 0) {
    console.log("  No workspaces configured.\n");
    return;
  }

  for (const name of names) {
    const ws = config.workspaces[name];
    console.log(`  🔑 ${name}`);
    console.log(`     API Key: ${ws.apiKey.slice(0, 8)}...${ws.apiKey.slice(-4)}`);
    console.log(`     Models: ${ws.models.join(", ")}`);
    if (ws.lastScan) {
      console.log(`     Last scan: ${ws.lastScan}`);
    }
    console.log();
  }
}

function cmdAdd(name: string, apiKey: string, models: string[]): void {
  const config = loadWorkspaces();

  if (config.workspaces[name]) {
    console.error(`❌ Workspace "${name}" already exists. Use "remove" first.`);
    process.exit(1);
  }

  const workspaceModels = models.length > 0 ? models : DEFAULT_MODELS;

  config.workspaces[name] = {
    apiKey,
    models: workspaceModels,
  };

  saveWorkspaces(config);
  console.log(`✅ Added workspace "${name}"`);
  console.log(`   Models: ${workspaceModels.join(", ")}`);
  console.log("\nRun 'sync' to apply changes to opencode.json and auth.json");
}

function cmdRemove(name: string): void {
  const config = loadWorkspaces();

  if (!config.workspaces[name]) {
    console.error(`❌ Workspace "${name}" not found.`);
    process.exit(1);
  }

  delete config.workspaces[name];
  saveWorkspaces(config);
  console.log(`✅ Removed workspace "${name}"`);
  console.log("\nRun 'sync' to apply changes to opencode.json and auth.json");
}

async function cmdScan(workspaceName: string): Promise<void> {
  const config = loadWorkspaces();

  if (!config.workspaces[workspaceName]) {
    console.error(`❌ Workspace "${workspaceName}" not found.`);
    process.exit(1);
  }

  const ws = config.workspaces[workspaceName];
  console.log(`\n🔍 Scanning models for workspace "${workspaceName}"...\n`);

  try {
    const models = await fetchModels(config.proxyUrl, ws.apiKey);
    
    ws.scannedModels = models;
    ws.lastScan = new Date().toISOString();
    saveWorkspaces(config);

    console.log(`Found ${models.length} models:\n`);
    
    for (let i = 0; i < models.length; i++) {
      console.log(formatModel(models[i], i));
      console.log();
    }

    console.log(`\n✅ Scanned ${models.length} models.`);
    console.log(`\nTo apply models to workspace:`);
    console.log(`  bun run index.ts apply-models ${workspaceName} <model_ids...>`);
    console.log(`\nOr apply all:`);
    console.log(`  bun run index.ts apply-models ${workspaceName} --all`);
  } catch (err) {
    console.error(`❌ Failed to scan: ${err}`);
    process.exit(1);
  }
}

async function cmdScanAll(): Promise<void> {
  const config = loadWorkspaces();
  const names = Object.keys(config.workspaces);

  if (names.length === 0) {
    console.log("No workspaces configured.");
    return;
  }

  for (const name of names) {
    await cmdScan(name);
    console.log("\n" + "─".repeat(50) + "\n");
  }
}

function cmdApplyModels(workspaceName: string, modelIds: string[]): void {
  const config = loadWorkspaces();

  if (!config.workspaces[workspaceName]) {
    console.error(`❌ Workspace "${workspaceName}" not found.`);
    process.exit(1);
  }

  const ws = config.workspaces[workspaceName];

  if (!ws.scannedModels || ws.scannedModels.length === 0) {
    console.error(`❌ No scanned models found. Run 'scan ${workspaceName}' first.`);
    process.exit(1);
  }

  if (modelIds[0] === "--all") {
    ws.models = ws.scannedModels.map(m => m.id);
  } else {
    const validIds = modelIds.filter(id => 
      ws.scannedModels!.some(m => m.id === id)
    );
    const invalidIds = modelIds.filter(id => 
      !ws.scannedModels!.some(m => m.id === id)
    );

    if (invalidIds.length > 0) {
      console.warn(`⚠️  Invalid model IDs (not in scan): ${invalidIds.join(", ")}`);
    }

    if (validIds.length === 0) {
      console.error(`❌ No valid model IDs provided.`);
      process.exit(1);
    }

    ws.models = validIds;
  }

  saveWorkspaces(config);
  console.log(`✅ Applied ${ws.models.length} models to workspace "${workspaceName}"`);
  console.log(`   Models: ${ws.models.join(", ")}`);
  console.log("\nRun 'sync' to apply changes to opencode.json and auth.json");
}

function cmdSync(): void {
  const config = loadWorkspaces();
  const auth = loadAuth();
  const opencode = loadOpenCode();

  opencode.provider = opencode.provider || {};

  const oldProviderKeys = Object.keys(opencode.provider).filter(k => k.startsWith("baseten-ws-"));
  const oldAuthKeys = Object.keys(auth).filter(k => k.startsWith("baseten-ws-"));

  for (const key of oldProviderKeys) delete opencode.provider[key];
  for (const key of oldAuthKeys) delete auth[key];

  for (const [name, workspace] of Object.entries(config.workspaces)) {
    const providerId = `baseten-ws-${name}`;
    auth[providerId] = { type: "api", key: workspace.apiKey };
    opencode.provider[providerId] = generateProviderEntry(name, workspace, config.proxyUrl);
  }

  saveAuth(auth);
  saveOpenCode(opencode);
  saveWorkspaces(config);

  console.log("✅ Synced workspaces to opencode.json and auth.json");
  console.log(`   ${Object.keys(config.workspaces).length} workspace(s) configured`);
}

function cmdGenerate(): void {
  const config = loadWorkspaces();

  console.log("\n📋 Generated opencode.json provider entries:\n");

  for (const [name, workspace] of Object.entries(config.workspaces)) {
    const providerId = `baseten-ws-${name}`;
    const entry = generateProviderEntry(name, workspace, config.proxyUrl);
    console.log(`"${providerId}": ${JSON.stringify(entry, null, 2)},\n`);
  }

  console.log("\n📋 Generated auth.json entries:\n");

  for (const [name, workspace] of Object.entries(config.workspaces)) {
    const providerId = `baseten-ws-${name}`;
    console.log(`"${providerId}": {
  "type": "api",
  "key": "${workspace.apiKey}"
},\n`);
  }
}

function cmdSetProxy(url: string): void {
  const config = loadWorkspaces();
  config.proxyUrl = url;
  saveWorkspaces(config);
  console.log(`✅ Set proxy URL to ${url}`);
}

function printUsage(): void {
  console.log(`
📦 Baseten Workspace Manager

Usage:
  bun run index.ts <command> [args]

Commands:
  list                          List all workspaces
  add <name> <api_key> [models] Add a new workspace
  remove <name>                 Remove a workspace
  scan <workspace>              Scan available models from workspace
  scan-all                      Scan all workspaces
  apply-models <workspace> [ids] Apply scanned models (--all for all)
  sync                          Sync to opencode.json and auth.json
  generate                      Show generated config (dry-run)
  set-proxy <url>               Set proxy URL

Examples:
  bun run index.ts list
  bun run index.ts add my-workspace abc123...
  bun run index.ts scan my-workspace
  bun run index.ts apply-models my-workspace zai-org/GLM-5 deepseek-ai/DeepSeek-V4-Pro
  bun run index.ts apply-models my-workspace --all
  bun run index.ts sync

Config files:
  ${WORKSPACES_FILE}
  ${AUTH_FILE}
  ${OPENCODE_FILE}
`);
}

const [,, command, ...args] = process.argv;

switch (command) {
  case "list":
    cmdList();
    break;
  case "add":
    if (args.length < 2) {
      console.error("Usage: add <name> <api_key> [models...]");
      process.exit(1);
    }
    cmdAdd(args[0], args[1], args.slice(2));
    break;
  case "remove":
    if (args.length < 1) {
      console.error("Usage: remove <name>");
      process.exit(1);
    }
    cmdRemove(args[0]);
    break;
  case "scan":
    if (args.length < 1) {
      console.error("Usage: scan <workspace>");
      process.exit(1);
    }
    cmdScan(args[0]);
    break;
  case "scan-all":
    cmdScanAll();
    break;
  case "apply-models":
    if (args.length < 2) {
      console.error("Usage: apply-models <workspace> <model_ids...|--all>");
      process.exit(1);
    }
    cmdApplyModels(args[0], args.slice(1));
    break;
  case "sync":
    cmdSync();
    break;
  case "generate":
    cmdGenerate();
    break;
  case "set-proxy":
    if (args.length < 1) {
      console.error("Usage: set-proxy <url>");
      process.exit(1);
    }
    cmdSetProxy(args[0]);
    break;
  default:
    printUsage();
}
