# AI Lab - Positioning & Differentiation

## What is AI Lab?

AI Lab is a **self-hosted, unified ML/LLM Engineering research platform** designed for teams who want complete control over their AI infrastructure. It combines observability, evaluation, prompt engineering, and cost management in a single, open-source solution.

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

**Result**: Teams juggle 3-5 different tools, data is fragmented, and costs spiral.

## AI Lab vs. The Competition

### Feature Comparison

| Feature | AI Lab | Helicone | Langfuse | LangSmith | W&B | Arize Phoenix | Braintrust |
|---------|--------|----------|----------|-----------|-----|---------------|------------|
| **Self-Hosted** | ✅ Full | ✅ Full | ✅ Full | ❌ Cloud | ❌ Cloud | ✅ Full | ❌ Cloud |
| **Open Source** | ✅ MIT | ✅ Apache | ✅ MIT | ❌ Closed | ❌ Closed | ✅ MIT | ❌ Closed |
| **LLM Observability** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Prompt Playground** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Model Comparison** | ✅ Side-by-side | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Cost Analysis** | ✅ Projections | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Experiment Tracking** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Evaluation Suite** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **RAG/CAG Support** | ✅ Planned | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AI Gateway** | ✅ Built-in | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Pricing** | **Free** | $79+/mo | $59+/mo | $39/seat | $50+/mo | Free | $100+/mo |

### Key Differentiators

#### 1. **Unified Platform, Not Point Solution**

```
Traditional Stack:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Helicone   │  │   Langfuse  │  │    W&B      │
│ (observability)│ (tracing)   │  │ (experiments)│
└─────────────┘  └─────────────┘  └─────────────┘
      ↓                ↓                ↓
   Data silos      Manual sync      Context loss

AI Lab:
┌─────────────────────────────────────────────┐
│                  AI Lab                      │
│  Observability │ Evaluation │ Experiments  │
│  Prompts │ Cost │ Models │ Integrations     │
└─────────────────────────────────────────────┘
                    ↓
            Single source of truth
```

#### 2. **Self-Hosted by Default**

Unlike LangSmith, Braintrust, and W&B, AI Lab is designed for self-hosting from day one:

- **No vendor lock-in**: Your data stays on your infrastructure
- **No per-seat pricing**: Unlimited users, no licensing costs
- **Full customization**: Extend and modify to fit your workflow
- **Air-gapped capable**: Works in restricted environments

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
| Model Selection | ✅ Comparison + benchmarks |
| Cost Optimization | ✅ Projections + recommendations |
| RAG Development | ✅ Chunking + retrieval eval (planned) |
| CAG Development | ✅ Context window analysis (planned) |
| Fine-tuning Prep | ✅ Dataset curation (planned) |
| Agent Development | ✅ Tracing + debugging |
| Evaluation Design | ✅ Custom evaluators + LLM-as-judge |

## Research Workflows Supported

### 1. Prompt Engineering

```
┌─────────────────────────────────────────────┐
│           Prompt Engineering Flow           │
├─────────────────────────────────────────────┤
│  1. Create prompt template                   │
│  2. Test with different models              │
│  3. Compare outputs side-by-side            │
│  4. Version and track changes               │
│  5. Deploy to production                    │
│  6. Monitor performance metrics             │
└─────────────────────────────────────────────┘
```

### 2. RAG (Retrieval-Augmented Generation)

```
┌─────────────────────────────────────────────┐
│              RAG Development Flow           │
├─────────────────────────────────────────────┤
│  1. Document ingestion & chunking           │
│  2. Embedding model selection               │
│  3. Retrieval strategy testing              │
│  4. Context window optimization             │
│  5. End-to-end evaluation                   │
│  6. Latency vs. quality tradeoffs           │
└─────────────────────────────────────────────┘
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
┌─────────────────────────────────────────────┐
│           Evaluation Pipeline               │
├─────────────────────────────────────────────┤
│  1. Create evaluation dataset              │
│  2. Define evaluation criteria             │
│  3. Run LLM-as-judge evaluators            │
│  4. Compare across models/prompts          │
│  5. Track improvements over time           │
│  6. Set up regression detection           │
└─────────────────────────────────────────────┘
```

### 4. Cost Optimization

```
┌─────────────────────────────────────────────┐
│           Cost Analysis Flow                │
├─────────────────────────────────────────────┤
│  1. Track token usage per model            │
│  2. Analyze cost per query type           │
│  3. Identify expensive patterns           │
│  4. Test cheaper alternatives             │
│  5. Project monthly costs                 │
│  6. Set budget alerts                     │
└─────────────────────────────────────────────┘
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AI Lab                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web UI    │  │  Workspace  │  │  SSE Proxy  │        │
│  │  (QwikJS)   │  │  Manager    │  │  (Buffer)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         ↓                ↓                ↓                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              @ai-lab/openai-compatible              │   │
│  │           (SDK with minChunkSize support)           │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↓                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Baseten API                      │   │
│  │     (100+ models: GPT, Claude, DeepSeek, GLM)      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## When to Choose AI Lab

### Choose AI Lab if:

- ✅ You want **self-hosted** infrastructure
- ✅ You need **unified** observability + evaluation
- ✅ You want **model comparison** built-in
- ✅ You're doing **ML/LLM research** (not just production monitoring)
- ✅ You want **zero licensing costs**
- ✅ You need **RAG/CAG development** tools
- ✅ You want **Baseten integration** out of the box

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

## Roadmap

### Phase 1: Foundation (Current)
- [x] Web UI with QwikJS + Tailwind CSS v4
- [x] Dashboard, Models, Tokens, Cost, Tracing
- [x] Prompt Playground
- [x] Model Comparison
- [x] Experiments & Evaluations
- [x] Settings & Integrations

### Phase 2: RAG/CAG Support
- [ ] Document chunking & embedding
- [ ] Retrieval evaluation
- [ ] Context window analysis
- [ ] RAG vs CAG recommendations

### Phase 3: Advanced Evaluation
- [ ] LLM-as-judge evaluators
- [ ] Custom scorer framework
- [ ] Regression detection
- [ ] A/B testing for prompts

### Phase 4: Fine-tuning
- [ ] Dataset curation from traces
- [ ] Training data export
- [ ] Model fine-tuning integration
- [ ] LoRA/QLoRA support

### Phase 5: Agents
- [ ] Agent tracing & debugging
- [ ] Tool call visualization
- [ ] Multi-agent orchestration
- [ ] Agent evaluation

## Getting Started

```bash
# Clone
git clone https://github.com/sandikodev/baseten-workspace-manager.git
cd baseten-workspace-manager

# Install
bun install

# Run
bun run dev
```

## License

MIT - Free forever, self-hosted, no restrictions.
