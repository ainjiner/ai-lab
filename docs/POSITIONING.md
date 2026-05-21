# AI Lab — Positioning & Differentiation

## What is AI Lab?

AI Lab is a **local-first, desktop-native ML/LLM Engineering platform** designed for developers who want complete control over their AI infrastructure. It combines observability, provider management, model catalog, evaluation, cost analytics, and config sync in a single, open-source application — runs on your machine, not someone else's server.

---

## The Problem

Building production LLM applications requires multiple specialized tools:

| Need | Current Solutions | Problem |
|------|-------------------|---------|
| **Observability** | Helicone, Langfuse, LangSmith | Separate tools, data silos |
| **Evaluation** | LangSmith, Arize Phoenix, Braintrust | Complex setup, vendor lock-in |
| **Prompt Management** | Langfuse, Helicone | Limited playground features |
| **Cost Tracking** | Helicone, LangSmith | Per-seat pricing gets expensive |
| **Experiment Tracking** | W&B, MLflow | Built for traditional ML, not LLM |
| **Model Comparison** | Manual or scattered | No unified view |
| **Config Sync** | Manual editing | Error-prone, format research |

**Result**: Teams juggle 3-5 different tools, data is fragmented, and costs spiral.

---

## AI Lab vs. The Competition

### Feature Comparison

| Feature | AI Lab | Helicone | Langfuse | LangSmith | W&B | Arize Phoenix |
|---------|--------|----------|----------|-----------|-----|---------------|
| **Desktop-Native** | ✅ Full | ✅ Full | ✅ Full | ❌ Cloud | ❌ Cloud | ✅ Full |
| **Open Source** | ✅ MIT | ✅ Apache | ✅ MIT | ❌ Closed | ❌ Closed | ✅ MIT |
| **LLM Observability** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Prompt Playground** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Model Comparison** | ✅ Side-by-side | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Cost Analysis** | ✅ Projections + alerts | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Experiment Tracking** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Evaluation Suite** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **RAG/CAG Support** | ✅ Planned | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Provider Registry** | ✅ 10 providers | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Config Sync** | ✅ OpenCode-native | ❌ | ❌ | ❌ | ❌ | ❌ |
| **OMO Orchestration** | ✅ Read agents/skills | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Explorer (AI research portal)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Marketplace (tool directory)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pricing** | **Free** | $79+/mo | $59+/mo | $39/seat | $50+/mo | Free |
```

### Key Differentiators

#### 1. **Desktop-Native, Not SaaS**

Unlike LangSmith, Braintrust, and W&B, AI Lab runs on your machine — not in the cloud:

- **No vendor lock-in**: Your data stays on your hardware
- **No per-seat pricing**: Unlimited users, no licensing costs
- **Full customization**: Extend and modify to fit your workflow
- **Planned: Tauri desktop app** — native performance, filesystem access, system tray
- **Air-gapped capable**: Works offline, no internet required for core features

#### 2. **Unified Platform, Not Point Solution**

```
Traditional Stack:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Helicone   │  │   Langfuse  │  │    W&B      │
│ (observability)│ (tracing)   │  │ (experiments)│
└─────────────┘  └─────────────┘  └─────────────┘
      ↓                ↓                ↓
   Data silos      Manual sync      Context loss

AI Lab:
┌──────────────────────────────────────────────┐
│                  AI Lab                       │
│  Observability │ Models │ Experiments        │
│  Cost │ Config Sync │ Orchestration          │
└──────────────────────────────────────────────┘
                     ↓
             Single source of truth
```

#### 3. **Model Comparison Built-In**

Most tools show you one model at a time. AI Lab provides:

- Side-by-side model comparison
- Cost-per-quality analysis
- Latency vs. quality tradeoffs
- A/B testing for prompts and models

#### 4. **Research-First Design**

Built for ML/LLM researchers, not just production monitoring:

| Research Activity | AI Lab Support |
|-------------------|-----------------|
| Prompt Engineering | ✅ Playground + templates + versioning |
| Model Selection | ✅ Comparison + benchmarks + recommendations |
| Cost Optimization | ✅ Projections + recommendations + budget alerts |
| RAG Development | ✅ Chunking + retrieval eval (planned) |
| CAG Development | ✅ Context window analysis (planned) |
| Fine-tuning Prep | ✅ Dataset curation (planned) |
| Agent Development | ✅ Tracing + debugging (planned) |
| Evaluation Design | ✅ Custom evaluators + LLM-as-judge (planned) |

#### 5. **OpenCode-Native**

AI Lab is the only platform that treats [OpenCode](https://opencode.ai) as a first-class citizen:

- **One-command config sync**: `ml-engine config sync opencode` writes provider config and auth keys directly into OpenCode's native JSON format (`~/.config/opencode/opencode.json` and `~/.local/share/opencode/auth.json`).
- **OMO aware**: Reads `~/.config/opencode/agents/` for agent list and `~/.config/opencode/skills/` for skill content — displayed directly in the Web UI orchestration dashboard.
- **Shared streaming fix**: Both AI Lab and OpenCode use the same forked `@ai-sdk/openai-compatible` with the `minChunkSize` SSE fix. No fragmentation, no buffer tricks.

> **AI Lab is to OpenCode what npm is to Node** — the companion tool that manages the underlying provider infrastructure, so you never have to edit JSON files by hand.

---

## Research Workflows Supported

### 1. Prompt Engineering

```
┌──────────────────────────────────────────────┐
│           Prompt Engineering Flow            │
├──────────────────────────────────────────────┤
│  1. Create prompt template                    │
│  2. Test with different models               │
│  3. Compare outputs side-by-side             │
│  4. Version and track changes                │
│  5. Deploy to production                     │
│  6. Monitor performance metrics              │
└──────────────────────────────────────────────┘
```

### 2. RAG (Retrieval-Augmented Generation)

```
┌──────────────────────────────────────────────┐
│              RAG Development Flow            │
├──────────────────────────────────────────────┤
│  1. Document ingestion & chunking            │
│  2. Embedding model selection                │
│  3. Retrieval strategy testing               │
│  4. Context window optimization              │
│  5. End-to-end evaluation                    │
│  6. Latency vs. quality tradeoffs            │
└──────────────────────────────────────────────┘
```

**RAG vs CAG Decision Matrix:**

| Factor | Use RAG | Use CAG |
|--------|---------|---------|
| Data Freshness | Real-time (seconds) | Static (weekly updates) |
| Knowledge Base Size | Large (>100k tokens) | Small (<128k tokens) |
| Latency Budget | Flexible (1-3s) | Strict (<500ms) |
| Infrastructure | Vector DB available | Minimal preferred |
| Use Case | Dynamic search | Policy docs, FAQs |

### 3. Model Evaluation

```
┌──────────────────────────────────────────────┐
│           Evaluation Pipeline                │
├──────────────────────────────────────────────┤
│  1. Create evaluation dataset               │
│  2. Define evaluation criteria              │
│  3. Run LLM-as-judge evaluators             │
│  4. Compare across models/prompts           │
│  5. Track improvements over time            │
│  6. Set up regression detection             │
└──────────────────────────────────────────────┘
```

### 4. Cost Optimization

```
┌──────────────────────────────────────────────┐
│           Cost Analysis Flow                 │
├──────────────────────────────────────────────┤
│  1. Track token usage per model             │
│  2. Analyze cost per query type             │
│  3. Identify expensive patterns             │
│  4. Test cheaper alternatives               │
│  5. Project monthly costs                   │
│  6. Set budget alerts                       │
└──────────────────────────────────────────────┘
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          AI Lab Platform                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐     ┌───────────────────────────────┐  │
│  │     Web UI          │     │         CLI                   │  │
│  │  (Qwik + Tailwind)  │     │   ml-engine <command>         │  │
│  │  Port 5173          │     │   30+ commands                │  │
│  └─────────┬───────────┘     └──────────┬────────────────────┘  │
│            │                            │                        │
│            └──────────┬─────────────────┘                        │
│                       ↓ HTTP                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               REST API (Hono, Port 4321)                   │  │
│  │   65+ endpoints — Provider, Model, Config, Analytics      │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               @ml-engine/core                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │  │
│  │  │Provider  │ │  Model   │ │  Config  │ │Analytics │     │  │
│  │  │Registry  │ │ Catalog  │ │ Manager  │ │+ Budgets │     │  │
│  │  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤     │  │
│  │  │ 10       │ │ Search   │ │ OpenCode │ │Usage     │     │  │
│  │  │providers │ │ Compare  │ │ Cursor   │ │Cost proj │     │  │
│  │  │Scanning  │ │Aliases   │ │ Continue │ │Alerts    │     │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────────────┐     │  │
│  │  │Experiment│ │Orchestra │ │ Utils                 │     │  │
│  │  │ Tracker  │ │  tion    │ │ Env import | Export   │     │  │
│  │  └──────────┘ └──────────┘ └───────────────────────┘     │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               SQLite Store (bun:sqlite)                   │  │
│  │  ~/.local/share/ml-engine/engine.db — auto-migration      │  │
│  │  Tables: providers, instances, models, aliases,           │  │
│  │  experiments, usage, budgets, settings                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   @ai-lab/openai-compatible (forked AI SDK)                │  │
│  │   AI SDK v4 fork with minChunkSize SSE fix                │  │
│  │   Replaces legacy SSE proxy entirely                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## When to Choose AI Lab

### Choose AI Lab if:

- ✅ You want **local-first, desktop-native** tools (planned: Tauri app)
- ✅ You need **unified** observability + provider management
- ✅ You want **model comparison** built-in
- ✅ You're doing **ML/LLM research** (not just production monitoring)
- ✅ You want **zero licensing costs**
- ✅ You need **config sync** with your AI editor
- ✅ You use **OpenCode** as your development environment
- ✅ You need **RAG/CAG development** tools

### Choose Helicone if:

- You need **AI Gateway** with 100+ providers
- You want **managed cloud** solution
- You're focused on **production observability** only

### Choose Langfuse if:

- You need **advanced tracing** for agents
- You want **prompt management** with SDK integration
- You're okay with **separate tools** for other needs

### Choose LangSmith if:

- You're already using **LangChain/LangGraph**
- You need **agent-specific** debugging
- You're okay with **cloud-only** and **per-seat pricing**

### Choose W&B if:

- You're doing **traditional ML** (not LLM)
- You need **hyperparameter sweeps**
- You want **model registry** for deployment

### Choose Arize Phoenix if:

- You want **OpenTelemetry-native** observability
- You need **evaluation** with custom scorers
- You're okay with **separate tools** for other needs

---

## Roadmap

### Phase 1: Foundation (Complete) ✅
- [x] Web UI with QwikJS + Tailwind CSS v4
- [x] Dashboard, Models, Tokens, Cost, Tracing
- [x] Provider Registry (10 providers)
- [x] Model Comparison & Recommendations
- [x] Experiments & Analytics
- [x] Config Sync (OpenCode, Cursor, Continue, Aider)
- [x] Orchestration (OMO agents + skills)
- [x] Export/Import, Env Detection
- [x] REST API (65+ endpoints)
- [x] Design System (31 UI components)
- [x] Explorer (AI resource portal — 7 categories, 50+ curated links)
- [x] Marketplace (tool directory — 7 categories, 40+ curated tools)
- [x] 28 route pages with skeleton loaders, error handling

### Phase 2: Streaming & Desktop
- [ ] Playground real SSE streaming
- [ ] Prompts template CRUD
- [ ] Tauri desktop app (native performance, filesystem, system tray)

### Phase 3: Research Graph & Talent
- [ ] Live Explorer (Arxiv + HuggingFace Daily Papers dynamic feeds)
- [ ] Paper indexer + citation graph (Semantic Scholar API)
- [ ] Engineer talent profiles (auto-generated from experiments)
- [ ] Paper → implementation linking + verification

### Phase 4: RAG/CAG Support
- [ ] Document chunking & embedding
- [ ] Retrieval evaluation
- [ ] Context window analysis
- [ ] RAG vs CAG recommendations

### Phase 5: Advanced Evaluation
- [ ] LLM-as-judge evaluators
- [ ] Custom scorer framework
- [ ] Regression detection
- [ ] A/B testing for prompts

### Phase 6: Connection Engine
- [ ] Skill ↔ Paper matching (vector search)
- [ ] Skill ↔ Job matching
- [ ] Researcher ↔ Engineer connection
- [ ] Reputation system

### Phase 7: Fine-tuning
- [ ] Dataset curation from traces
- [ ] Training data export
- [ ] Model fine-tuning integration
- [ ] LoRA/QLoRA support

### Phase 8: Agents
- [ ] Agent tracing & debugging
- [ ] Tool call visualization
- [ ] Multi-agent orchestration
- [ ] Agent evaluation

---

## Getting Started

```bash
bun install
bun run build:core
bun run cli provider add baseten production YOUR_API_KEY
bun run cli provider scan baseten-production
bun run cli config sync opencode
bun run api        # Start API at :4321
bun run dev:web    # Start UI at :5173
```

## License

MIT — Free forever, local-first, no restrictions.
