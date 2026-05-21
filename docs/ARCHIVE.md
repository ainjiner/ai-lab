# AI Lab - Baseten Workspace Manager

A comprehensive ML/LLM Engineering research platform with workspace management, SSE proxy, and web UI.

## Project Structure

```
baseten-workspace-manager/
├── packages/
│   ├── openai-compatible/    # Forked SDK with minChunkSize
│   ├── workspace-manager/     # CLI tool for workspace management
│   └── sse-proxy/            # SSE buffer proxy
├── apps/
│   └── ai-lab/               # QwikJS Web UI
└── README.md
```

## Quick Start

```bash
# Clone
git clone https://github.com/ainjiner/ai-lab.git
cd baseten-workspace-manager

# Install
bun install

# Run Web UI
bun run dev

# Run SSE Proxy
bun run dev:proxy
```

## AI Lab Web UI

A modern web dashboard for ML/LLM Engineering research built with QwikJS and Tailwind CSS v4.

### Features

| Page | Description |
|------|-------------|
| **Dashboard** | Overview metrics, quick actions, recent activity |
| **Models** | Model management and configuration |
| **Prompts** | Playground with templates, parameters, history |
| **Experiments** | Track and manage ML experiments |
| **Evaluations** | Benchmark results with progress charts |
| **Compare** | Side-by-side model comparison |
| **Tokens** | Token usage tracking |
| **Cost** | Spending analysis with projections |
| **Tracing** | Request/response logs with search |
| **Integrations** | Service connections (Baseten, Pinecone, etc.) |
| **Settings** | API configuration and preferences |

### Navigation

```
📊 Overview
   ├── Dashboard
   └── Models

🔬 Research
   ├── Prompts
   ├── Experiments
   ├── Evaluations
   └── Compare

📈 Monitoring
   ├── Tokens
   ├── Cost
   └── Tracing

⚙️ Settings
   ├── Integrations
   └── Settings
```

### Tech Stack

- **Framework**: QwikJS 1.19+
- **Styling**: Tailwind CSS v4
- **Runtime**: Bun
- **UI Components**: Custom shadcn-style components

### Development

```bash
# Start dev server
bun run dev

# Build for production
bun run build:web

# Serve production build
bun run serve
```

## Workspace Manager CLI

Manage multiple Baseten API workspaces with dynamic model scanning.

### Commands

```bash
# List workspaces
bun run workspace list

# Add workspace
bun run workspace add <name> <api_key>

# Scan models
bun run workspace scan <name>

# Apply models
bun run workspace apply-models <name> --all

# Sync to OpenCode
bun run workspace sync
```

### Configuration Files

| File | Purpose |
|------|---------|
| `~/.config/opencode/baseten-workspaces.json` | Workspace definitions |
| `~/.local/share/opencode/auth.json` | OpenCode auth store |
| `~/.config/opencode/opencode.json` | OpenCode config |

## SSE Buffer Proxy

Workaround for [SSE chunk fragmentation issue](https://github.com/vercel/ai/issues/15343).

### Usage

```bash
# Start proxy
bun run dev:proxy

# Manage proxy
bun run proxy:manager start
bun run proxy:manager stop
bun run proxy:manager status
bun run proxy:manager toggle
```

### How It Works

1. Receives streaming response from Baseten
2. Buffers content until threshold (80 chars) or sentence boundary
3. Flushes buffered content as single SSE event
4. Prevents UI stuttering from 1-2 word chunks

## @ai-lab/openai-compatible

Forked `@ai-sdk/openai-compatible` with `minChunkSize` option for smooth streaming.

### Installation

```bash
cd packages/openai-compatible
bun install
bun run build
```

### Usage

```typescript
import { createOpenAICompatible } from '@ai-lab/openai-compatible';

const provider = createOpenAICompatible({
  baseURL: 'https://api.baseten.co/v1',
  minChunkSize: 80,  // Buffer chunks until 80 chars
});
```

## Available Models

Baseten provides these models (as of May 2026):

| Model ID | Display Name | Context | Features |
|----------|--------------|---------|----------|
| `openai/gpt-oss-120b` | OpenAI GPT 120B | 128K | tools, reasoning, json_mode |
| `deepseek-ai/DeepSeek-V3.1` | DeepSeek V3.1 | 164K | tools, reasoning |
| `deepseek-ai/DeepSeek-V4-Pro` | DeepSeek V4 Pro | 131K | tools, reasoning |
| `zai-org/GLM-4.7` | GLM 4.7 | 200K | tools, json_mode |
| `zai-org/GLM-5` | GLM 5 | 203K | tools, json_mode |
| `moonshotai/Kimi-K2.5` | Kimi K2.5 | 262K | tools, vision |
| `moonshotai/Kimi-K2.6` | Kimi K2.6 | 262K | tools, reasoning |
| `MiniMaxAI/MiniMax-M2.5` | Minimax M2.5 | 204K | tools, reasoning |
| `nvidia/Nemotron-120B-A12B` | Nemotron Super | 203K | tools, reasoning |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start AI Lab Web UI |
| `bun run dev:web` | Start AI Lab Web UI (explicit) |
| `bun run dev:proxy` | Start SSE proxy |
| `bun run build` | Build all packages |
| `bun run build:web` | Build AI Lab |
| `bun run test` | Run tests |
| `bun run workspace` | Workspace manager CLI |
| `bun run proxy:manager` | Proxy manager |

## Related

- [Issue #15343](https://github.com/vercel/ai/issues/15343) - SSE chunk fragmentation
- [PR #15344](https://github.com/vercel/ai/pull/15344) - minChunkSize fix proposal
- [OpenCode](https://opencode.ai/) - AI coding assistant
- [Baseten](https://baseten.co/) - LLM inference platform
- [Qwik](https://qwik.dev/) - Web framework

## License

MIT
