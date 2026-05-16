# Architecture Guide

This document describes the architecture, data flow, and design decisions behind AI Lab.

---

## Overview

AI Lab is structured as a monorepo with three layers:

```
┌──────────────────────────────────────────┐
│          Presentation Layer              │
│  Web UI (Qwik)    CLI (Bun)    API HTTP  │
├──────────────────────────────────────────┤
│          Business Logic Layer            │
│  @ml-engine/core — Provider, Model,      │
│  Config, Experiments, Analytics, OMO     │
├──────────────────────────────────────────┤
│          Data Layer                      │
│  SQLite (bun:sqlite) — auto-migration    │
└──────────────────────────────────────────┘
```

---

## Data Flow

### Read Path (Web UI → Response)

```
User clicks "Models" page
  → Qwik useVisibleTask$() calls api.get("/models")
  → apps/ai-lab/src/lib/api.ts sends fetch to http://localhost:4321/api/models
  → packages/api/src/routes/index.ts handler:
      modelCatalog.listModels()
        → store.listModels()
          → SQLite: SELECT * FROM models
  ← JSON response returned to Web UI
  → Component renders model table
```

### Write Path (CLI → Persistence)

```
User runs: ml-engine provider add baseten production KEY
  → packages/cli/src/index.ts: handleProvider("add")
    → providerRegistry.addInstance({...})
      → store.createInstance({...})
        → SQLite: INSERT INTO instances ...
      → Returns instance with generated ID
  ← CLI prints: ✅ Added instance "baseten-production"
```

### Config Sync Path

```
User runs: ml-engine config sync opencode
  → packages/cli/src/index.ts: handleConfig("sync")
    → configManager.syncToTarget("opencode")
      → Reads all enabled provider instances from store
      → Generates opencode.json with provider config
      → Generates auth.json with API keys
      → Writes files to ~/.config/opencode/
  ← CLI prints: ✅ Synced to opencode
```

---

## SQLite Schema

Database location: `~/.local/share/ml-engine/engine.db`

### Tables

```sql
-- Migration tracking
CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Provider metadata
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  auth_method TEXT NOT NULL,
  features TEXT NOT NULL DEFAULT '{}'
);

-- Provider instances (API keys, settings)
CREATE TABLE IF NOT EXISTS instances (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  base_url TEXT,
  min_chunk_size INTEGER DEFAULT 80,
  enabled INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  models_count INTEGER DEFAULT 0,
  last_scan TEXT,
  labels TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Model catalog
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  context_window INTEGER,
  max_output INTEGER,
  capabilities TEXT NOT NULL DEFAULT '{}',
  pricing TEXT,
  metadata TEXT DEFAULT '{}'
);

-- Model aliases
CREATE TABLE IF NOT EXISTS aliases (
  alias TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  provider_id TEXT NOT NULL
);

-- Experiment tracking
CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  user_prompt TEXT NOT NULL,
  variables TEXT DEFAULT '{}',
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  params TEXT DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  tags TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Experiment results
CREATE TABLE IF NOT EXISTS experiment_results (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  output TEXT,
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  latency_ms REAL,
  cost_usd REAL,
  scores TEXT DEFAULT '{}',
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Usage records (cost analytics)
CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  cost_prompt REAL,
  cost_completion REAL,
  cost_total REAL,
  latency_ms REAL,
  metadata TEXT DEFAULT '{}'
);

-- Budget definitions
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  period TEXT NOT NULL,
  alerts TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Migration System

The store auto-migrates on first load:

1. Checks if `_migrations` table exists — creates it if not
2. Checks which migrations have been applied
3. Applies new migrations in order (stored in `store/migrations/`)
4. Each migration is a named SQL script that runs in a transaction

---

## Package Dependency Graph

```
@ai-lab/web (apps/ai-lab)
  └── HTTP → @ml-engine/api

@ml-engine/api (packages/api)
  └── @ml-engine/core (npm workspace dependency)

@ml-engine/cli (packages/cli)
  └── @ml-engine/core (npm workspace dependency)

@ml-engine/core (packages/core)
  ├── bun:sqlite (built-in Bun module)
  └── No non-core dependencies (pure TypeScript)

@ai-lab/openai-compatible (packages/openai-compatible)
  ├── @ai-sdk/provider (canary)
  ├── @ai-sdk/provider-utils (canary)
  └── zod ^3.25.76
```

---

## API Design Principles

### Hono Framework

- **Framework**: [Hono](https://hono.dev/) — lightweight, fast, TypeScript-native
- **Port**: 4321
- **Prefix**: All routes under `/api`
- **CORS**: Enabled globally for Web UI at `localhost:5173`

### Route Convention

```
GET    /resource          → List resources
POST   /resource          → Create resource
GET    /resource/:id      → Get resource by ID
PATCH  /resource/:id      → Update resource
DELETE /resource/:id      → Delete resource

Static routes before parameterized:
  GET /models/compare     ✓ (before /models/:id)
  GET /models/aliases     ✓ (before /models/:id)
  GET /experiments/compare ✓ (before /experiments/:id)
```

### Response Format

```json
{
  "data": { ... },
  "error": "message",
  "meta": { "total": 42 }
}
```

- Success: `200` or `201` with JSON body
- Client error: `400` or `404` with `{ "error": "message" }`
- Server error: `500` with `{ "error": "Internal server error" }`

---

## Web UI Architecture

### Framework

- **Qwik** 1.19+ — resumable framework for fast first-load performance
- **Tailwind CSS** v4 — utility-first styling
- **Custom shadcn-style components** — Card, Table, Badge, Button, Input

### Component Tree

```
layout.tsx
├── Logo (sidebar header)
├── Sidebar Navigation
│   ├── Overview → Dashboard, Models
│   ├── Research → Prompts, Experiments, Evaluations, Compare
│   ├── Monitoring → Tokens, Cost, Tracing
│   ├── Orchestration → Orchestration
│   └── Settings → Integrations, Settings
└── <Slot /> (page content)
    ├── Dashboard      → Analytics summary, recent activity, quick actions
    ├── Models         → Model catalog, search, compare, aliases
    ├── Experiments    → Experiment list, create, compare
    ├── Tokens         → Token usage charts
    ├── Cost           → Cost breakdown, projections, budgets
    ├── Tracing        → Request logs
    ├── Settings       → Config targets, preferences
    ├── Orchestration  → OMO agents, skills
    └── Integrations   → Provider management
```

### API Client

Located in `apps/ai-lab/src/lib/api.ts`:

```typescript
const API_URL = process.env.API_URL || "http://localhost:4321/api";

export const api = {
  get: <T>(path: string) => fetch(`${API_URL}${path}`).then(r => r.json()),
  post: <T>(path: string, body: unknown) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),
};
```

---

## Security Notes

- **API keys stored in SQLite** — The database file at `~/.local/share/ml-engine/engine.db` is not encrypted. Use file permissions to restrict access.
- **CORS limited** — The API only allows requests from the Web UI origin.
- **No authentication** — This is a local-first tool. Do not expose the API to the public internet.
- **Config sync writes to ~/.config/** — Always respects the user's home directory. Never writes to system paths.

---

## Performance Considerations

- **SQLite** supports concurrent reads from CLI and API simultaneously
- **Model scanning** is async — poll for results
- **Cost projections** use local aggregation — no external API calls
- **Config sync** is file I/O only — completes in <50ms
