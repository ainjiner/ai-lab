# Baseten Workspace Manager

Manage multiple Baseten API workspaces with dynamic model scanning for OpenCode.

## Features

- **Multiple Workspaces**: Manage multiple Baseten API keys/workspaces dynamically
- **Model Scanning**: Automatically scan available models from Baseten API
- **Auto-sync**: Sync workspaces to OpenCode configuration files
- **SSE Proxy Support**: Works with SSE buffer proxy for smooth streaming

## Prerequisites

- [Bun](https://bun.sh/) runtime
- [OpenCode](https://opencode.ai/) installed
- Baseten API key(s)
- SSE buffer proxy (optional, for smooth streaming)

## Installation

```bash
# Clone the repository
git clone https://github.com/sandikodev/baseten-workspace-manager.git
cd baseten-workspace-manager

# Make executable
chmod +x src/index.ts
```

## Quick Start

```bash
# List all workspaces
bun run src/index.ts list

# Add a new workspace
bun run src/index.ts add my-workspace YOUR_API_KEY

# Scan available models
bun run src/index.ts scan my-workspace

# Apply all scanned models
bun run src/index.ts apply-models my-workspace --all

# Sync to OpenCode config
bun run src/index.ts sync
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | List all configured workspaces |
| `add <name> <api_key> [models...]` | Add a new workspace |
| `remove <name>` | Remove a workspace |
| `scan <workspace>` | Scan available models from a workspace |
| `scan-all` | Scan all workspaces |
| `apply-models <workspace> <model_ids...>` | Apply specific models to workspace |
| `apply-models <workspace> --all` | Apply all scanned models to workspace |
| `sync` | Sync to opencode.json and auth.json |
| `generate` | Show generated config (dry-run) |
| `set-proxy <url>` | Set proxy URL |

## Configuration Files

The tool manages three configuration files:

| File | Purpose |
|------|---------|
| `~/.config/opencode/baseten-workspaces.json` | Workspace definitions (API keys, models) |
| `~/.local/share/opencode/auth.json` | OpenCode authentication store |
| `~/.config/opencode/opencode.json` | OpenCode main configuration |

## Workflow

### 1. Add Workspace

```bash
bun run src/index.ts add production YOUR_API_KEY
bun run src/index.ts add staging ANOTHER_API_KEY
```

### 2. Scan Models

```bash
bun run src/index.ts scan production
```

Output:
```
🔍 Scanning models for workspace "production"...

Found 9 models:

[1] zai-org/GLM-4.7
    Name: GLM 4.7
    Context: 200K tokens | Max output: 200K
    Features: tools, json_mode, structured_outputs
    Price: $0.000000/1M in, $0.000002/1M out

[2] zai-org/GLM-5
    Name: GLM 5
    Context: 203K tokens | Max output: 203K
    Features: tools, json_mode, structured_outputs
    Price: $0.000001/1M in, $0.000003/1M out

...
```

### 3. Apply Models

```bash
# Apply specific models
bun run src/index.ts apply-models production zai-org/GLM-5 deepseek-ai/DeepSeek-V4-Pro

# Or apply all scanned models
bun run src/index.ts apply-models production --all
```

### 4. Sync to OpenCode

```bash
bun run src/index.ts sync
```

### 5. Use in OpenCode

After syncing, models are available as:

```
baseten-ws-production/zai-org/GLM-5
baseten-ws-staging/deepseek-ai/DeepSeek-V4-Pro
```

## Available Models

Baseten provides these models (as of May 2026):

| Model ID | Display Name | Context | Features |
|-----------|--------------|---------|----------|
| `openai/gpt-oss-120b` | OpenAI GPT 120B | 128K | tools, reasoning, json_mode |
| `deepseek-ai/DeepSeek-V3.1` | DeepSeek V3.1 | 164K | tools, reasoning |
| `deepseek-ai/DeepSeek-V4-Pro` | DeepSeek V4 Pro | 131K | tools, reasoning |
| `zai-org/GLM-4.7` | GLM 4.7 | 200K | tools, json_mode |
| `zai-org/GLM-5` | GLM 5 | 203K | tools, json_mode |
| `moonshotai/Kimi-K2.5` | Kimi K2.5 | 262K | tools, vision |
| `moonshotai/Kimi-K2.6` | Kimi K2.6 | 262K | tools, reasoning |
| `MiniMaxAI/MiniMax-M2.5` | Minimax M2.5 | 204K | tools, reasoning |
| `nvidia/Nemotron-120B-A12B` | Nemotron Super | 203K | tools, reasoning |

## SSE Buffer Proxy

Due to [SSE chunk fragmentation issue](https://github.com/vercel/ai/issues/15343), it's recommended to use the SSE buffer proxy:

```bash
# Start proxy
cd ~/project/sse-buffer-proxy
bun run sse-proxy.ts

# Set proxy URL in workspace manager
bun run src/index.ts set-proxy http://127.0.0.1:8899/v1
```

## Example Configuration

### baseten-workspaces.json

```json
{
  "proxyUrl": "http://127.0.0.1:8899/v1",
  "workspaces": {
    "production": {
      "apiKey": "abc123...",
      "models": [
        "zai-org/GLM-5",
        "deepseek-ai/DeepSeek-V4-Pro"
      ],
      "lastScan": "2026-05-16T10:00:00.000Z"
    },
    "staging": {
      "apiKey": "xyz789...",
      "models": [
        "zai-org/GLM-4.7"
      ]
    }
  }
}
```

### Generated opencode.json Entry

```json
{
  "provider": {
    "baseten-ws-production": {
      "npm": "@ai-sdk/baseten",
      "name": "Baseten (production)",
      "options": {
        "baseURL": "http://127.0.0.1:8899/v1"
      },
      "models": {
        "zai-org/GLM-5": {
          "name": "GLM 5"
        },
        "deepseek-ai/DeepSeek-V4-Pro": {
          "name": "DeepSeek V4 Pro"
        }
      }
    }
  }
}
```

### Generated auth.json Entry

```json
{
  "baseten-ws-production": {
    "type": "api",
    "key": "abc123..."
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `XDG_CONFIG_HOME` | `~/.config` | Config directory location |

## Troubleshooting

### "No scanned models found"

Run `scan <workspace>` before `apply-models`:

```bash
bun run src/index.ts scan my-workspace
bun run src/index.ts apply-models my-workspace --all
```

### "Failed to fetch models"

1. Check if proxy is running (if using proxy)
2. Verify API key is correct
3. Check network connectivity

### Models not appearing in OpenCode

1. Run `sync` to update configuration
2. Restart OpenCode

## Related

- [SSE Buffer Proxy](https://github.com/vercel/ai/issues/15343) - Workaround for SSE fragmentation
- [OpenCode](https://opencode.ai/) - AI coding assistant
- [Baseten](https://baseten.co/) - LLM inference platform

## License

MIT
