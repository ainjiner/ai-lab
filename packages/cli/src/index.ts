#!/usr/bin/env bun

import { providerRegistry, modelCatalog, configManager, exportAll, importFromEnv, detectEnvVars } from "@ml-engine/core";
import { writeFileSync } from "fs";

function printUsage(): void {
  console.log(`
🤖 ML/LLM Engineering Platform CLI

Usage:
  ml-engine <command> [args]

Provider Commands:
  provider list                    List all providers
  provider instances               List configured instances
  provider add <provider> <name> <api_key>
                                   Add a new provider instance
  provider remove <instance_id>    Remove a provider instance
  provider enable <instance_id>    Enable a provider instance
  provider disable <instance_id>    Disable a provider instance
  provider test <instance_id>      Test connection
  provider scan <instance_id>      Scan available models

Model Commands:
  model list [--provider <id>]     List all models
  model search <query>             Search models
  model info <model_id>            Get model details
  model compare <id1> <id2>        Compare two models
  model alias add <alias> <model_id> <instance_id>
                                   Create a model alias
  model alias list                 List all aliases
  model alias remove <alias>       Remove an alias
  model recommend [options]        Get model recommendations

Config Commands:
  config list                      List config targets
  config sync [target]             Sync to target(s)
  config preview [target]          Preview generated config
  config validate [target]         Validate target config
  config enable <target>           Enable a target
  config disable <target>          Disable a target

Settings Commands:
  settings show                    Show current settings
  settings set <key> <value>       Update a setting

Env Commands:
  env detect                       Detect provider env vars
  env import                       Import from PROVIDER_*_API_KEY

Export Commands:
  export                           Show export summary
  export all                       Print full JSON export
  export save <filepath>           Save export to file

Examples:
  # Add providers
  ml-engine provider add baseten production abc123...
  ml-engine provider add openrouter personal xyz789...

  # Scan models
  ml-engine provider scan baseten-production

  # Create aliases
  ml-engine model alias add smart zai-org/GLM-5 baseten-production
  ml-engine model alias add fast meta-llama/Llama-3.1-8B openrouter-personal

  # Sync to OpenCode
  ml-engine config sync opencode

  # Or sync all enabled targets
  ml-engine config sync --all
`);
}

function parseArgs(args: string[]): { positional: string[]; options: Record<string, string> } {
  const positional: string[] = [];
  const options: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith("--")) {
        options[key] = value;
        i++;
      } else {
        options[key] = "true";
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

async function handleProvider(args: string[]): Promise<void> {
  const [subcommand, ...rest] = args;

  switch (subcommand) {
    case "list": {
      const providers = providerRegistry.listProviders();
      console.log("\n📦 Available Providers\n");
      for (const p of providers) {
        console.log(`  ${p.id.padEnd(15)} ${p.name}`);
        console.log(`  ${" ".repeat(15)} ${p.type} | ${p.authMethod} | ${p.baseUrl}`);
        console.log();
      }
      break;
    }

    case "instances": {
      const instances = providerRegistry.listInstances();
      console.log("\n🔑 Provider Instances\n");
      if (instances.length === 0) {
        console.log("  No instances configured.");
        console.log("  Run 'provider add <provider> <name> <api_key>' to add one.\n");
        break;
      }
      for (const i of instances) {
        const status = i.enabled ? "✅" : "⚪";
        console.log(`  ${status} ${i.id}`);
        console.log(`     Provider: ${i.providerId}`);
        console.log(`     API Key: ${i.apiKey.slice(0, 8)}...${i.apiKey.slice(-4)}`);
        console.log(`     Models: ${i.modelsCount} | Last scan: ${i.lastScan || "never"}`);
        console.log();
      }
      break;
    }

    case "add": {
      const [providerId, name, apiKey] = rest;
      if (!providerId || !name || !apiKey) {
        console.error("Usage: provider add <provider> <name> <api_key>");
        process.exit(1);
      }

      try {
        const instance = providerRegistry.addInstance({
          providerId,
          name,
          apiKey,
          enabled: true,
          priority: 0,
          labels: [],
        });
        console.log(`✅ Added instance "${instance.id}"`);
        console.log(`   Run 'provider scan ${instance.id}' to discover models.`);
      } catch (err) {
        console.error(`❌ ${err}`);
        process.exit(1);
      }
      break;
    }

    case "remove": {
      const [instanceId] = rest;
      if (!instanceId) {
        console.error("Usage: provider remove <instance_id>");
        process.exit(1);
      }

      try {
        providerRegistry.removeInstance(instanceId);
        console.log(`✅ Removed instance "${instanceId}"`);
      } catch (err) {
        console.error(`❌ ${err}`);
        process.exit(1);
      }
      break;
    }

    case "enable": {
      const [instanceId] = rest;
      if (!instanceId) {
        console.error("Usage: provider enable <instance_id>");
        process.exit(1);
      }
      providerRegistry.enableInstance(instanceId);
      console.log(`✅ Enabled instance "${instanceId}"`);
      break;
    }

    case "disable": {
      const [instanceId] = rest;
      if (!instanceId) {
        console.error("Usage: provider disable <instance_id>");
        process.exit(1);
      }
      providerRegistry.disableInstance(instanceId);
      console.log(`✅ Disabled instance "${instanceId}"`);
      break;
    }

    case "test": {
      const [instanceId] = rest;
      if (!instanceId) {
        console.error("Usage: provider test <instance_id>");
        process.exit(1);
      }

      console.log(`\n🔍 Testing connection to "${instanceId}"...\n`);
      const result = await providerRegistry.testConnection(instanceId);
      
      if (result.success) {
        console.log(`✅ Connection successful`);
        console.log(`   Latency: ${result.latency}ms`);
      } else {
        console.log(`❌ Connection failed`);
        console.log(`   Error: ${result.error}`);
      }
      break;
    }

    case "scan": {
      const [instanceId] = rest;
      if (!instanceId) {
        console.error("Usage: provider scan <instance_id>");
        process.exit(1);
      }

      console.log(`\n🔍 Scanning models for "${instanceId}"...\n`);
      const result = await modelCatalog.scanModels(instanceId);

      if (result.error) {
        console.log(`❌ Scan failed: ${result.error}`);
      } else {
        console.log(`✅ Found ${result.models.length} models\n`);
        for (let i = 0; i < Math.min(result.models.length, 10); i++) {
          const m = result.models[i];
          console.log(`  [${i + 1}] ${m.id}`);
          console.log(`      Context: ${(m.contextWindow / 1000).toFixed(0)}K | Output: ${(m.maxOutput / 1000).toFixed(0)}K`);
        }
        if (result.models.length > 10) {
          console.log(`\n  ... and ${result.models.length - 10} more`);
        }
      }
      break;
    }

    default:
      console.error(`Unknown provider command: ${subcommand}`);
      console.log("Run 'ml-engine provider' for usage.");
  }
}

async function handleModel(args: string[]): Promise<void> {
  const [subcommand, ...rest] = args;

  switch (subcommand) {
    case "list": {
      const { options } = parseArgs(rest);
      const providerId = options.provider;
      
      const models = providerId 
        ? modelCatalog.getModelsByProvider(providerId)
        : modelCatalog.listModels();

      console.log(`\n🤖 Models (${models.length})\n`);
      
      for (let i = 0; i < Math.min(models.length, 20); i++) {
        const m = models[i];
        const caps = [
          m.capabilities.vision && "vision",
          m.capabilities.tools && "tools",
          m.capabilities.reasoning && "reasoning",
        ].filter(Boolean).join(", ") || "none";

        console.log(`  [${i + 1}] ${m.id}`);
        console.log(`      ${m.name} | Context: ${(m.contextWindow / 1000).toFixed(0)}K`);
        console.log(`      Features: ${caps}`);
        if (m.pricing) {
          console.log(`      Price: $${m.pricing.prompt}/1M prompt, $${m.pricing.completion}/1M completion`);
        }
        console.log();
      }

      if (models.length > 20) {
        console.log(`  ... and ${models.length - 20} more\n`);
      }
      break;
    }

    case "search": {
      const [query] = rest;
      if (!query) {
        console.error("Usage: model search <query>");
        process.exit(1);
      }

      const models = modelCatalog.searchModels(query);
      console.log(`\n🔍 Search results for "${query}" (${models.length})\n`);
      
      for (const m of models.slice(0, 10)) {
        console.log(`  ${m.id}`);
      }
      break;
    }

    case "info": {
      const [modelId] = rest;
      if (!modelId) {
        console.error("Usage: model info <model_id>");
        process.exit(1);
      }

      const model = modelCatalog.getModel(modelId);
      if (!model) {
        console.error(`Model "${modelId}" not found`);
        process.exit(1);
      }

      console.log(`\n🤖 ${model.id}\n`);
      console.log(`  Name: ${model.name}`);
      console.log(`  Provider: ${model.provider}`);
      console.log(`  Context: ${(model.contextWindow / 1000).toFixed(0)}K tokens`);
      console.log(`  Max Output: ${(model.maxOutput / 1000).toFixed(0)}K tokens`);
      console.log(`\n  Capabilities:`);
      console.log(`    Vision: ${model.capabilities.vision ? "✅" : "❌"}`);
      console.log(`    Tools: ${model.capabilities.tools ? "✅" : "❌"}`);
      console.log(`    Reasoning: ${model.capabilities.reasoning ? "✅" : "❌"}`);
      console.log(`    JSON Mode: ${model.capabilities.json_mode ? "✅" : "❌"}`);
      
      if (model.pricing) {
        console.log(`\n  Pricing:`);
        console.log(`    Prompt: $${model.pricing.prompt}/1M tokens`);
        console.log(`    Completion: $${model.pricing.completion}/1M tokens`);
      }
      console.log();
      break;
    }

    case "compare": {
      const [id1, id2] = rest;
      if (!id1 || !id2) {
        console.error("Usage: model compare <model_id1> <model_id2>");
        process.exit(1);
      }

      const result = modelCatalog.compareModels(id1, id2);
      if (!result) {
        console.error("One or both models not found");
        process.exit(1);
      }

      console.log(`\n📊 Model Comparison\n`);
      console.log(`  ${id1} vs ${id2}\n`);
      console.log(`  Context Window: ${result.model1.contextWindow} → ${result.model2.contextWindow} (${result.diff.contextWindow > 0 ? "+" : ""}${result.diff.contextWindow})`);
      console.log(`  Max Output: ${result.model1.maxOutput} → ${result.model2.maxOutput} (${result.diff.maxOutput > 0 ? "+" : ""}${result.diff.maxOutput})`);
      
      if (result.diff.priceDiff) {
        console.log(`  Price (prompt): $${result.model1.pricing?.prompt} → $${result.model2.pricing?.prompt}`);
        console.log(`  Price (completion): $${result.model1.pricing?.completion} → $${result.model2.pricing?.completion}`);
      }
      console.log();
      break;
    }

    case "alias": {
      const [aliasCmd, ...aliasArgs] = rest;

      switch (aliasCmd) {
        case "add": {
          const [alias, modelId, instanceId] = aliasArgs;
          if (!alias || !modelId || !instanceId) {
            console.error("Usage: model alias add <alias> <model_id> <instance_id>");
            process.exit(1);
          }

          try {
            modelCatalog.addAlias(alias, modelId, instanceId);
            console.log(`✅ Created alias "${alias}" → ${modelId}@${instanceId}`);
          } catch (err) {
            console.error(`❌ ${err}`);
            process.exit(1);
          }
          break;
        }

        case "list": {
          const aliases = modelCatalog.listAliases();
          console.log("\n🏷️  Model Aliases\n");
          for (const a of aliases) {
            console.log(`  ${a.alias.padEnd(15)} → ${a.modelId}@${a.providerId}`);
          }
          console.log();
          break;
        }

        case "remove": {
          const [alias] = aliasArgs;
          if (!alias) {
            console.error("Usage: model alias remove <alias>");
            process.exit(1);
          }
          modelCatalog.removeAlias(alias);
          console.log(`✅ Removed alias "${alias}"`);
          break;
        }

        default:
          console.error(`Unknown alias command: ${aliasCmd}`);
      }
      break;
    }

    case "recommend": {
      const { options } = parseArgs(rest);
      
      const criteria = {
        task: options.task as "coding" | "reasoning" | "vision" | "general" | undefined,
        maxBudget: options.budget ? parseFloat(options.budget) : undefined,
        minContextWindow: options.context ? parseInt(options.context) : undefined,
        requireTools: options.tools === "true",
        requireVision: options.vision === "true",
        requireReasoning: options.reasoning === "true",
      };

      const models = modelCatalog.recommendModels(criteria);
      console.log(`\n🎯 Recommended Models\n`);
      
      for (let i = 0; i < Math.min(models.length, 5); i++) {
        const m = models[i];
        console.log(`  [${i + 1}] ${m.id}`);
        console.log(`      Context: ${(m.contextWindow / 1000).toFixed(0)}K | Price: $${m.pricing?.prompt || 0}/1M`);
      }
      console.log();
      break;
    }

    default:
      console.error(`Unknown model command: ${subcommand}`);
      console.log("Run 'ml-engine model' for usage.");
  }
}

async function handleConfig(args: string[]): Promise<void> {
  const [subcommand, ...rest] = args;

  switch (subcommand) {
    case "list": {
      const targets = configManager.listTargets();
      console.log("\n⚙️  Config Targets\n");
      for (const t of targets) {
        const status = t.enabled ? "✅" : "⚪";
        console.log(`  ${status} ${t.id.padEnd(12)} ${t.name}`);
        console.log(`     Config: ${t.configPath}`);
        if (t.authPath) {
          console.log(`     Auth: ${t.authPath}`);
        }
        console.log();
      }
      break;
    }

    case "sync": {
      const [targetId] = rest;
      
      if (targetId === "--all") {
        console.log("\n🔄 Syncing to all enabled targets...\n");
        const results = configManager.syncToAllTargets();
        for (const r of results) {
          console.log(`✅ Synced to ${r.target.name}`);
        }
      } else if (targetId) {
        console.log(`\n🔄 Syncing to "${targetId}"...\n`);
        configManager.syncToTarget(targetId);
        console.log(`✅ Synced to ${targetId}`);
      } else {
        console.log("\n🔄 Syncing to all enabled targets...\n");
        const results = configManager.syncToAllTargets();
        for (const r of results) {
          console.log(`✅ Synced to ${r.target.name}`);
        }
      }
      break;
    }

    case "preview": {
      const [targetId] = rest;
      if (!targetId) {
        console.error("Usage: config preview <target>");
        process.exit(1);
      }

      const result = configManager.generatePreview(targetId);
      console.log(`\n📋 Preview for "${targetId}"\n`);
      console.log("Provider config:");
      console.log(JSON.stringify(result.provider, null, 2));
      console.log("\nAuth config:");
      console.log(JSON.stringify(result.auth, null, 2));
      break;
    }

    case "validate": {
      const [targetId] = rest;
      if (!targetId) {
        console.error("Usage: config validate <target>");
        process.exit(1);
      }

      const result = configManager.validateTarget(targetId);
      console.log(`\n🔍 Validating "${targetId}"...\n`);
      
      if (result.valid) {
        console.log("✅ Config is valid");
      } else {
        console.log("❌ Config has errors:");
        for (const err of result.errors) {
          console.log(`   - ${err}`);
        }
      }
      break;
    }

    case "enable": {
      const [targetId] = rest;
      if (!targetId) {
        console.error("Usage: config enable <target>");
        process.exit(1);
      }
      configManager.enableTarget(targetId);
      console.log(`✅ Enabled target "${targetId}"`);
      break;
    }

    case "disable": {
      const [targetId] = rest;
      if (!targetId) {
        console.error("Usage: config disable <target>");
        process.exit(1);
      }
      configManager.disableTarget(targetId);
      console.log(`✅ Disabled target "${targetId}"`);
      break;
    }

    default:
      console.error(`Unknown config command: ${subcommand}`);
      console.log("Run 'ml-engine config' for usage.");
  }
}

function handleSettings(args: string[]): void {
  const [subcommand, ...rest] = args;

  switch (subcommand) {
    case "show": {
      const config = configManager.getConfig();
      console.log("\n⚙️  Current Settings\n");
      console.log(`  minChunkSize: ${config.settings.minChunkSize}`);
      console.log(`  timeout: ${config.settings.timeout}ms`);
      console.log(`  retries: ${config.settings.retries}`);
      console.log();
      if (config.defaults.provider) {
        console.log(`  Default provider: ${config.defaults.provider}`);
      }
      if (config.defaults.model) {
        console.log(`  Default model: ${config.defaults.model}`);
      }
      break;
    }

    case "set": {
      const [key, value] = rest;
      if (!key || !value) {
        console.error("Usage: settings set <key> <value>");
        process.exit(1);
      }

      const config = configManager.getConfig();
      const numValue = parseInt(value);

      switch (key) {
        case "minChunkSize":
          config.settings.minChunkSize = numValue;
          break;
        case "timeout":
          config.settings.timeout = numValue;
          break;
        case "retries":
          config.settings.retries = numValue;
          break;
        case "defaultProvider":
          config.defaults.provider = value;
          break;
        case "defaultModel":
          config.defaults.model = value;
          break;
        default:
          console.error(`Unknown setting: ${key}`);
          process.exit(1);
      }

      configManager.updateConfig(config);
      console.log(`✅ Set ${key} = ${value}`);
      break;
    }

    default:
      console.error(`Unknown settings command: ${subcommand}`);
      console.log("Run 'ml-engine settings' for usage.");
  }
}

function handleEnv(args: string[]): void {
  const [subcommand] = args;

  switch (subcommand) {
    case "detect": {
      console.log("\n🔍 Detecting Environment Variables\n");
      const vars = detectEnvVars();
      for (const v of vars) {
        const icon = v.status === "found" ? "✅" : "⚪";
        console.log(`  ${icon} ${v.variable.padEnd(40)} ${v.provider}/${v.name}`);
      }
      console.log();
      break;
    }

    case "import": {
      console.log("\n📥 Importing from Environment Variables\n");
      console.log("  Scanning for PROVIDER_*_API_KEY vars...");
      const result = importFromEnv("PROVIDER_");
      if (result.imported > 0) {
        console.log(`  ✅ Imported ${result.imported} instances:`);
        for (const id of result.instances) {
          console.log(`     - ${id}`);
        }
      } else {
        console.log("  No new instances found (may already exist)");
      }
      console.log();
      break;
    }

    default:
      console.error(`Unknown env command: ${subcommand}`);
      console.log("Usage: ml-engine env detect|import");
  }
}

function handleExport(args: string[]): void {
  const [subcommand, ...rest] = args;

  switch (subcommand) {
    case "all": {
      const data = exportAll();
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case "save": {
      const [filePath] = rest;
      if (!filePath) {
        console.error("Usage: export save <filepath>");
        process.exit(1);
      }
      const data = exportAll();
      writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Exported to ${filePath}`);
      break;
    }

    default: {
      const data = exportAll();
      console.log(`📦 Export summary:\n`);
      console.log(`  Instances: ${data.provider.instances.length}`);
      console.log(`  Models: ${data.models.length}`);
      console.log(`  Aliases: ${data.aliases.length}`);
      console.log(`  Experiments: ${data.experiments.length}`);
      console.log(`  Budgets: ${data.budgets.length}`);
      console.log(`  Version: ${data.version}`);
      console.log(`\n  Use 'export all' for full JSON or 'export save <path>' to write to file`);
      break;
    }
  }
}

async function main(): Promise<void> {
  const [,, command, ...args] = process.argv;

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  switch (command) {
    case "provider":
      await handleProvider(args);
      break;
    case "model":
      await handleModel(args);
      break;
    case "config":
      await handleConfig(args);
      break;
    case "settings":
      handleSettings(args);
      break;
    case "env":
      handleEnv(args);
      break;
    case "export":
      handleExport(args);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch(console.error);
