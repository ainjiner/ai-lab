# AI Lab — Web UI

The AI Lab Web UI is a [Qwik](https://qwik.dev/) application providing a graphical interface for the ML/LLM Engineering Platform.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — analytics summary, recent activity |
| `/models` | Model catalog — list, search, compare, aliases |
| `/playground` | Interactive chat playground — test prompts, compare models |
| `/explorer` | AI research portal — 7 categories, 50+ curated community links |
| `/marketplace` | AI tool directory — 7 categories, 40+ curated tools |
| `/experiments` | Experiment tracking — create, list, compare results |
| `/prompts` | Prompt library — browse and manage prompt templates |
| `/evaluations` | Evaluation — scoring, benchmark results |
| `/compare` | Model comparison matrix |
| `/tokens` | Token usage charts |
| `/cost` | Cost analysis — breakdown, projections, budgets |
| `/tracing` | Request logs — timestamp, provider, model, tokens, cost, latency |
| `/alerts` | Alert management — budget alerts, usage notifications |
| `/cache` | Cache monitoring — hit rates, storage |
| `/settings` | Platform settings and config targets |
| `/integrations` | Provider management — add, test, scan |
| `/orchestration` | OMO agents and skills viewer |
| `/agents` | Agent management — CRUD, configuration |
| `/datasets` | Dataset management — create, import, export |
| `/embeddings` | Embeddings — vector store viewer |
| `/fine-tuning` | Fine-tuning jobs — list, monitor |
| `/playbooks` | Playbooks — step-by-step ML workflows |
| `/annotations` | Annotations viewer |
| `/api-keys` | API key management |
| `/teams` | Team management |
| `/reports` | Reports and analytics export |
| `/404` | Custom not-found page |

## Prerequisites

- **Bun** >= 1.2
- The **REST API** running on `http://localhost:4321/api`

## Getting Started

```bash
# From repo root
bun install
bun run build:core
bun run api          # Start API on :4321 (needed by Web UI)

# In another terminal:
bun run dev:web      # Start Web UI on :5173
```

The Web UI consumes data exclusively via HTTP from the API. It does not import `@ml-engine/core` directly (Qwik's SSR is incompatible with core's Bun-native dependencies like `bun:sqlite`).

## API Client

All API calls go through `src/lib/api.ts`:

```typescript
const API_URL = process.env.API_URL || "http://localhost:4321/api";
```

Override with `API_URL` environment variable if needed.

## Tech Stack

- **Qwik** 1.19+ — resumable framework
- **Tailwind CSS** v4 — utility-first CSS
- **Custom UI components** — Card, Table, Badge, Button, Input (shadcn-style)

## Building for Production

```bash
bun run build
bun run preview       # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── logo/          # SVG lettermark logo component
│   ├── ui/            # Reusable UI components (Card, Table, etc.)
│   ├── locale-selector/  # Language selector
│   └── router-head/   # Head meta tags
├── routes/
│   ├── layout.tsx     # Sidebar layout + navigation
│   ├── index.tsx      # Dashboard page
│   ├── models/        # Model catalog
│   ├── experiments/   # Experiment tracking
│   ├── tokens/        # Token usage
│   ├── cost/          # Cost analysis
│   ├── tracing/       # Request logs
│   ├── settings/      # Platform settings
│   ├── integrations/  # Provider management
│   └── orchestration/  # OMO agents and skills
├── lib/
│   └── api.ts         # API client
└── global.css         # Tailwind imports + custom styles
```
