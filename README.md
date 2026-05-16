# AI Lab — ML/LLM Engineering Platform

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-Bun-%23f9f9f9" alt="Bun"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/language-TypeScript-3178C6" alt="TypeScript"></a>
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/OpenCode-native-6366f1" alt="OpenCode Native"></a>
</p>

<p align="center">
  <strong>One platform. Ten providers. Zero friction.</strong><br>
  The missing engineering layer for AI developers who live in OpenCode.
</p>

---

> **AI Lab** is a unified, self-hosted ML/LLM Engineering platform — part observability, part gateway, part model catalog, and part cost analytics — designed from day one for developers who use [OpenCode](https://opencode.ai) as their AI coding companion. Manage 10+ providers, discover 100+ models, track experiments, sync config in one command, and never context-switch between tools again.

---

## Why AI Lab?

Building production AI applications forces teams to juggle 3–5 separate tools: observability (Helicone), experiments (W&B), model playgrounds (Langfuse), cost tracking, and config management. Data fragments across silos, costs pile up on per-seat pricing, and developers waste time stitching workflows together.

AI Lab solves this with one premise: **the platform should adapt to your workflow, not the other way around.**

| Problem | AI Lab Solution |
|---------|----------------|
| Fragmented observability | Unified dashboard — tokens, cost, latency, traces in one view |
| Model vendor lock-in | Registry for 10+ providers, switch models in seconds |
| Cost overruns | Real-time tracking + projections + budget alerts |
| Tool sprawl | One self-hosted instance replaces 5+ tools |
| Config sync overhead | `config sync opencode` bridges your AI editor in one command |
| Per-seat licensing | Free. Unlimited users. Self-hosted. |

---

## Features

| Area | Capabilities | Status |
|------|-------------|--------|
| **Provider Management** | 10 built-in providers, multi-instance per provider, connection testing, model scanning | ✅ |
| **Model Catalog** | Search, compare side-by-side, recommend by task/budget, aliases | ✅ |
| **Config Sync** | Sync to OpenCode, Cursor, Continue, Aider — auto-generated provider config | ✅ |
| **Experiment Tracking** | Create, run, save results, compare across models and prompts | ✅ |
| **Cost Analytics** | Usage breakdown by provider/model, projections, budget alerts | ✅ |
| **Orchestration** | OMO agent detection, skill viewer, OpenCode config reader | ✅ |
| **Export/Import** | Full platform config as JSON — share with your team | ✅ |
| **Env Detection** | Auto-import from `PROVIDER_*_API_KEY` environment variables | ✅ |

---

## OpenCode-Native

AI Lab is the only ML/LLM engineering platform that treats OpenCode as a first-class citizen.

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Lab + OpenCode                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ml-engine config sync opencode                              │
│       ↓                                                     │
│  Reads provider instances from SQLite store                  │
│       ↓                                                     │
│  Generates ~/.config/opencode/opencode.json                 │
│  Generates ~/.local/share/opencode/auth.json                │
│       ↓                                                     │
│  OpenCode instantly has access to all your providers        │
│  and models — no manual config editing                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What makes it native:**

- **One-command config sync** — `ml-engine config sync opencode` writes provider config and auth keys directly into OpenCode's native JSON format. No third-party scripts, no manual editing.
- **OMO (Oh My OpenCode) aware** — AI Lab reads agents from `~/.config/opencode/agents/` and skills from `~/.config/opencode/skills/`, giving you a dashboard of your entire OpenCode orchestration setup.
- **Forked AI SDK** — `@ai-lab/openai-compatible` (forked from `@ai-sdk/openai-compatible`) includes the `minChunkSize` fix that stops SSE chunk fragmentation — the same fix that powers smooth streaming in OpenCode itself.
- **Works the way you work** — add a provider in the CLI or Web UI, sync to OpenCode, and your editor is ready. No file hunting, no config format research.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AI Lab Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐     ┌──────────────────────────────┐  │
│  │     Web UI          │     │         CLI                  │  │
│  │  (Qwik + Tailwind)  │     │   ml-engine <command>        │  │
│  │  Port 5173          │     │   30+ commands               │  │
│  └─────────┬───────────┘     └──────────┬───────────────────┘  │
│            │                            │                       │
│            └──────────┬─────────────────┘                       │
│                       ↓ HTTP                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               REST API (Hono, Port 4321)                  │  │
│  │   65+ endpoints | Provider | Model | Config | Analytics  │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               @ml-engine/core                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  │Provider  │ │  Model   │ │  Config  │ │Analytics │    │  │
│  │  │Registry  │ │ Catalog  │ │ Manager  │ │+ Budgets │    │  │
│  │  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤    │  │
│  │  │ 10       │ │ Search   │ │ OpenCode │ │Usage     │    │  │
│  │  │providers │ │ Compare  │ │ Cursor   │ │Cost proj │    │  │
│  │  │Scanning  │ │Aliases   │ │ Continue │ │Alerts    │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐    │  │
│  │  │Experiment│ │Orchestra │ │ Utils                │    │  │
│  │  │ Tracker  │ │  tion    │ │ Env import | Export  │    │  │
│  │  └──────────┘ └──────────┘ └──────────────────────┘    │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               SQLite Store (bun:sqlite)                   │  │
│  │  ~/.local/share/ml-engine/engine.db                      │  │
│  │  Auto-migration | Tables: providers, models,             │  │
│  │  experiments, usage, budgets, settings                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   @ai-lab/openai-compatible (forked AI SDK)               │  │
│  │   AI SDK v4 fork with minChunkSize SSE fix               │  │
│  │   Replaces legacy SSE proxy entirely                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# 1. Prerequisites
curl -fsSL https://bun.sh/install | bash
git clone https://github.com/sandikodev/baseten-workspace-manager.git
cd baseten-workspace-manager

# 2. Install
bun install

# 3. Build core engine
bun run build:core

# 4. Add your provider
bun run cli provider add baseten production YOUR_BASETEN_API_KEY

# 5. Scan models
bun run cli provider scan baseten-production

# 6. Sync to OpenCode (optional)
bun run cli config sync opencode

# 7. Start the API (port 4321)
bun run api

# 8. Start the Web UI (separate terminal)
bun run dev:web
```

> Open `http://localhost:5173` to see the dashboard.

---

## CLI Reference

```
ml-engine <command> [args]
```

### Provider Commands

| Command | Description |
|---------|-------------|
| `provider list` | List all supported providers |
| `provider instances` | List configured instances |
| `provider add <p> <name> <key>` | Add a provider instance |
| `provider remove <id>` | Remove an instance |
| `provider enable <id>` | Enable an instance |
| `provider disable <id>` | Disable an instance |
| `provider test <id>` | Test API connection |
| `provider scan <id>` | Discover available models |

### Model Commands

| Command | Description |
|---------|-------------|
| `model list [--provider <id>]` | List all models |
| `model search <query>` | Search models by name |
| `model info <id>` | Get model details |
| `model compare <id1> <id2>` | Side-by-side comparison |
| `model alias add <a> <mid> <pid>` | Create model alias |
| `model alias list` | List all aliases |
| `model alias remove <a>` | Remove alias |
| `model recommend [opts]` | Get task-based recommendations |

### Config Commands

| Command | Description |
|---------|-------------|
| `config list` | List config targets |
| `config sync <target>` | Sync to target (opencode/cursor/continue/aider) |
| `config sync --all` | Sync all enabled targets |
| `config preview <target>` | Preview generated config |
| `config enable <target>` | Enable target |
| `config disable <target>` | Disable target |

### Settings Commands

| Command | Description |
|---------|-------------|
| `settings show` | Show current settings |
| `settings set <key> <value>` | Update a setting |

### Environment & Export

| Command | Description |
|---------|-------------|
| `env detect` | Detect provider env vars |
| `env import` | Import from `PROVIDER_*_API_KEY` |
| `export` | Show export summary |
| `export all` | Full JSON export to stdout |
| `export save <path>` | Save export to file |

---

## REST API

The API runs on `http://localhost:4321/api`.

### Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/providers` | List all providers |
| GET | `/providers/instances` | List configured instances |
| POST | `/providers/instances` | Add instance |
| GET | `/providers/instances/:id` | Get instance |
| PATCH | `/providers/instances/:id` | Update instance |
| DELETE | `/providers/instances/:id` | Delete instance |
| POST | `/providers/instances/:id/test` | Test connection |
| POST | `/providers/instances/:id/scan` | Scan models |

### Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/models` | List models (?provider=&search=) |
| GET | `/models/compare?ids=a,b` | Compare two models |
| GET | `/models/aliases` | List aliases |
| GET | `/models/:id` | Get model details |
| POST | `/models/recommend` | Get recommendations |
| POST | `/models/aliases` | Create alias |
| DELETE | `/models/aliases/:alias` | Delete alias |

### Config

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | Targets + settings |
| POST | `/config/targets/:id/sync` | Sync to target |
| POST | `/config/targets/:id/toggle` | Enable/disable target |
| POST | `/config/sync-all` | Sync all enabled |
| GET | `/config/preview/:id` | Preview config |
| GET | `/config/settings` | Get settings |
| POST | `/config/settings` | Update settings |

### Experiments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/experiments` | List experiments (?status=) |
| POST | `/experiments` | Create experiment |
| GET | `/experiments/:id` | Get experiment |
| POST | `/experiments/:id/result` | Save result |
| GET | `/experiments/compare?ids=a,b` | Compare experiments |
| DELETE | `/experiments/:id` | Delete experiment |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | Usage summary |
| GET | `/analytics/breakdown` | By provider/model |
| GET | `/analytics/projection?days=30` | Cost projection |
| GET | `/analytics/export?format=json` | Export usage data |
| GET | `/budgets` | List budgets |
| POST | `/budgets` | Create budget |
| GET | `/budgets/check` | Check alerts |
| DELETE | `/budgets/:id` | Delete budget |

### Orchestration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orchestration` | Installed tools + OMO config |
| GET | `/orchestration/agents` | List agents |
| POST | `/orchestration/agents` | Save agent |
| GET | `/orchestration/skills` | List skills |
| GET | `/orchestration/skills/:id` | Get skill content |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/export` | Export all config |
| POST | `/import` | Import config |
| POST | `/import-env` | Import from env vars |
| GET | `/detect-env` | Detect environment variables |

---

## Supported Providers

| Provider | Type | Auth | Features |
|----------|------|------|----------|
| **Baseten** | Inference | API Key | tools, reasoning, JSON mode |
| **OpenRouter** | Gateway | API Key | vision, tools, reasoning |
| **Together** | Inference | API Key | vision, tools, prompt caching |
| **Fireworks** | Inference | API Key | vision, tools, prompt caching |
| **Groq** | Inference | API Key | vision, tools |
| **Anthropic** | Inference | API Key | vision, tools, reasoning, caching |
| **OpenAI** | Inference | API Key | vision, tools, reasoning, caching |
| **Google** | Inference | API Key | vision, tools |
| **DeepSeek** | Inference | API Key | tools, reasoning |
| **Ollama** | Local | None | vision |

---

## Storage

All data persists in SQLite at `~/.local/share/ml-engine/engine.db`:

| Table | Contents |
|-------|----------|
| `providers` | Provider registry metadata |
| `instances` | API keys, settings, scan results |
| `models` | Discovered models with pricing |
| `aliases` | Model alias mapping |
| `experiments` | Experiment configs and results |
| `usage` | Token usage records |
| `budgets` | Budget definitions and alerts |
| `settings` | Platform config preferences |

---

## Config Sync Targets

| Target | Config Path | Auth Path |
|--------|-------------|-----------|
| **OpenCode** | `~/.config/opencode/opencode.json` | `~/.local/share/opencode/auth.json` |
| **Cursor** | `~/.cursor/config.json` | — |
| **Continue** | `~/.continue/config.json` | — |
| **Aider** | `~/.aider/config.json` | — |

---

## Programmatic Usage

```typescript
import {
  providerRegistry,
  modelCatalog,
  configManager,
  experimentTracker,
  analyticsTracker,
  orchestrationManager,
  exportAll,
  importFromEnv,
} from "@ml-engine/core";

// Add a provider instance
const instance = providerRegistry.addInstance({
  providerId: "baseten",
  name: "production",
  apiKey: "abc123...",
});

// Scan for models
const scan = await modelCatalog.scanModels(instance.id);

// Create an experiment
const exp = experimentTracker.create({
  name: "Reasoning benchmark",
  userPrompt: "Solve this logic puzzle",
  providerId: instance.id,
  modelId: "zai-org/GLM-5",
});

// Save a result
experimentTracker.saveResult(exp.id, {
  output: "Step 1: ... Answer: 42",
  tokensPrompt: 150,
  tokensCompletion: 75,
  latencyMs: 2400,
  costUsd: 0.0025,
});

// Sync config to OpenCode
configManager.syncToTarget("opencode");

// Export everything for backup or team sharing
const backup = exportAll();

// Auto-import from environment
const result = importFromEnv("PROVIDER_");
```

---

## Comparison with Other Tools

| Feature | **AI Lab** | Helicone | Langfuse | LangSmith | W&B | Arize Phoenix |
|---------|------------|----------|----------|-----------|-----|---------------|
| Self-Hosted | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Open Source | ✅ MIT | ✅ Apache | ✅ MIT | ❌ | ❌ | ✅ MIT |
| Model Comparison | ✅ Side-by-side | ❌ | ❌ | ❌ | ❌ | ❌ |
| Config Sync | ✅ OpenCode-native | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cost Projections | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Budget Alerts | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Experiment Tracking | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Provider Registry | ✅ 10 providers | ❌ | ❌ | ❌ | ❌ | ❌ |
| OMO Orchestration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pricing | **Free** | $79+/mo | $59+/mo | $39/seat | $50+/mo | Free |

---

## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **1. Foundation** | Provider registry, model catalog, config sync, CLI, API, Web UI | ✅ Complete |
| **2. SSE Streaming** | Forked AI SDK with `minChunkSize` fix | ✅ Complete |
| **3. RAG/CAG Support** | Document chunking, retrieval eval, context analysis | 🔜 Planned |
| **4. Advanced Evaluation** | LLM-as-judge, custom scorers, regression detection | 🔜 Planned |
| **5. Fine-tuning** | Dataset curation from traces, training data export | 🔜 Planned |
| **6. Agent Development** | Agent tracing, tool call visualization, multi-agent debug | 🔜 Planned |

---

## Contributors

AI Lab is built by [sandikodev](https://github.com/sandikodev) and contributors.

Contributions are welcome! See [CONTRIBUTING.md](docs/CONTRIBUTING.md).

---

## License

[MIT](LICENSE) — Free forever, self-hosted, no restrictions.
