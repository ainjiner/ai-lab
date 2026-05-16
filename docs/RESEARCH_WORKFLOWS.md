# ML/LLM Research Workflows

This document describes the research workflows AI Lab supports for ML/LLM Engineering.

## Table of Contents

1. [Prompt Engineering](#1-prompt-engineering)
2. [RAG (Retrieval-Augmented Generation)](#2-rag-retrieval-augmented-generation)
3. [CAG (Context-Augmented Generation)](#3-cag-context-augmented-generation)
4. [Model Evaluation](#4-model-evaluation)
5. [Cost Optimization](#5-cost-optimization)
6. [Experiment Tracking](#6-experiment-tracking)
7. [Fine-tuning Preparation](#7-fine-tuning-preparation)
8. [Agent Development](#8-agent-development)

---

## 1. Prompt Engineering

### What is Prompt Engineering?

Prompt engineering is the practice of designing, testing, and optimizing prompts to get the best outputs from LLMs. It's both an art and a science.

### Key Techniques

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Zero-shot** | No examples provided | Simple tasks |
| **Few-shot** | 2-5 examples in prompt | Complex patterns |
| **Chain-of-Thought** | Step-by-step reasoning | Math, logic |
| **ReAct** | Reason + Act cycles | Tool use |
| **Self-consistency** | Multiple outputs, vote | High-stakes |
| **Role prompting** | Assign persona | Domain expertise |

### AI Lab Support

```
┌─────────────────────────────────────────────────────────────┐
│                    Prompt Playground                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Prompt Editor  │  │  Model Selector  │                 │
│  │  - Templates    │  │  - GPT-4o        │                 │
│  │  - Variables    │  │  - Claude 3.5    │                 │
│  │  - Versioning   │  │  - DeepSeek      │                 │
│  └─────────────────┘  └─────────────────┘                 │
│           ↓                    ↓                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Output Comparison                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │  Output A   │  │  Output B   │  │  Output C   │ │   │
│  │  │  (GPT-4o)   │  │  (Claude)   │  │  (DeepSeek) │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│           ↓                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Metrics: Latency | Tokens | Cost | Quality Score   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Best Practices

1. **Version your prompts** - Track changes over time
2. **Test across models** - Different models respond differently
3. **Measure quality** - Use automated evaluators
4. **Track costs** - Token usage varies by prompt length
5. **Document intent** - Why did you write this prompt?

---

## 2. RAG (Retrieval-Augmented Generation)

### What is RAG?

RAG combines LLMs with external knowledge retrieval. Instead of relying solely on training data, the model fetches relevant documents at query time.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      RAG Pipeline                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Documents  │───▶│   Chunking  │───▶│  Embedding  │     │
│  │  (PDF, etc) │    │  (Strategy) │    │   (Model)   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                              ↓              │
│                                       ┌─────────────┐      │
│                                       │  Vector DB  │      │
│                                       │  (Pinecone) │      │
│                                       └─────────────┘      │
│                                              ↑              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Query     │───▶│   Embed     │───▶│   Search    │     │
│  │   (User)    │    │   Query     │    │  (Top-K)    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                              ↓              │
│                                       ┌─────────────┐      │
│                                       │  Context +  │      │
│                                       │  Prompt     │      │
│                                       └─────────────┘      │
│                                              ↓              │
│                                       ┌─────────────┐      │
│                                       │    LLM      │      │
│                                       │  Generation │      │
│                                       └─────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Options | Trade-offs |
|----------|---------|------------|
| **Chunking** | Fixed, semantic, recursive | Size vs. coherence |
| **Embedding** | OpenAI, Cohere, local | Quality vs. cost |
| **Retrieval** | Dense, sparse, hybrid | Precision vs. recall |
| **Reranking** | Cross-encoder, LLM | Quality vs. latency |
| **Top-K** | 3, 5, 10, 20 | Context vs. noise |

### Evaluation Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Retrieval Precision** | % of retrieved docs relevant | >80% |
| **Recall** | % of relevant docs retrieved | >70% |
| **MRR** | Mean Reciprocal Rank | >0.5 |
| **NDCG** | Normalized Discounted Cumulative Gain | >0.7 |
| **Faithfulness** | Output grounded in context | >90% |
| **Answer Relevance** | Output answers the question | >85% |

### AI Lab Support (Planned)

- [ ] Document ingestion & chunking
- [ ] Embedding model comparison
- [ ] Retrieval strategy testing
- [ ] End-to-end evaluation
- [ ] Context window optimization

---

## 3. CAG (Context-Augmented Generation)

### What is CAG?

CAG pre-loads relevant context into the model's context window before inference. Unlike RAG, there's no per-query retrieval step.

### RAG vs CAG Comparison

```
RAG (Just-in-Time):
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Query  │───▶│ Search  │───▶│ Retrieve │───▶│ Generate│
└─────────┘    └─────────┘    └─────────┘    └─────────┘
   ~50ms         ~100ms        ~50ms         ~500ms
                     Total: ~700ms

CAG (Pre-loaded):
┌─────────┐    ┌─────────┐
│  Query  │───▶│ Generate│
└─────────┘    └─────────┘
   ~50ms        ~500ms
        Total: ~550ms (faster!)
```

### When to Use CAG

| Factor | CAG | RAG |
|--------|-----|-----|
| **Data Freshness** | Static (weekly updates) | Dynamic (real-time) |
| **Knowledge Size** | <128k tokens | Unlimited |
| **Latency Budget** | Strict (<500ms) | Flexible (1-3s) |
| **Infrastructure** | Minimal | Vector DB required |
| **Use Case** | Policies, FAQs, docs | Search, live data |

### CAG Implementation

```python
# Pre-load context
context = """
[COMPANY POLICIES]
- Policy 1: ...
- Policy 2: ...
[FAQ]
- Q1: ...
- Q2: ...
"""

# Query with pre-loaded context
response = llm.generate(
    context + user_query,
    model="gpt-4o"
)
```

### AI Lab Support (Planned)

- [ ] Context window analysis
- [ ] Pre-loading strategies
- [ ] Cache management
- [ ] RAG vs CAG recommendations

---

## 4. Model Evaluation

### Evaluation Types

| Type | Description | Tools |
|------|-------------|-------|
| **Benchmark** | Standard datasets (MMLU, HumanEval) | Public benchmarks |
| **Custom** | Domain-specific criteria | LLM-as-judge |
| **Human** | Manual review | Annotation queues |
| **Online** | Production monitoring | Real-time scoring |

### LLM-as-Judge Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM-as-Judge Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Input     │    │   Output    │    │  Criteria   │     │
│  │  (Query)    │    │  (Response) │    │  (Rubric)   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            ↓                                 │
│                    ┌─────────────┐                          │
│                    │ Judge Model │                          │
│                    │  (GPT-4o)   │                          │
│                    └─────────────┘                          │
│                            ↓                                 │
│                    ┌─────────────┐                          │
│                    │   Score     │                          │
│                    │  (0-1)      │                          │
│                    └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Common Evaluation Criteria

| Criterion | Description | Prompt Template |
|-----------|-------------|-----------------|
| **Correctness** | Factual accuracy | "Is this answer correct?" |
| **Relevance** | Addresses the question | "Is this relevant to the query?" |
| **Coherence** | Logical flow | "Is this response coherent?" |
| **Conciseness** | Not verbose | "Is this response concise?" |
| **Harmfulness** | Safety check | "Is this response harmful?" |
| **Faithfulness** | Grounded in context | "Is this supported by the context?" |

### AI Lab Support

- [x] Evaluation dashboard
- [x] Benchmark tracking
- [ ] LLM-as-judge evaluators
- [ ] Custom scorer framework
- [ ] Regression detection

---

## 5. Cost Optimization

### Cost Drivers

| Driver | Impact | Optimization |
|--------|--------|--------------|
| **Model choice** | 10-100x difference | Use smaller models when possible |
| **Prompt length** | Linear | Trim unnecessary context |
| **Output length** | Linear | Set max_tokens limits |
| **Caching** | 50-90% reduction | Cache common queries |
| **Batching** | 20-30% reduction | Batch similar requests |

### Cost Analysis Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Cost Analysis                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Token Usage by Model                                │   │
│  │  ┌─────────┬─────────┬─────────┬─────────┐           │   │
│  │  │ GPT-4o  │ Claude  │DeepSeek │  GLM   │           │   │
│  │  │ 45%     │ 30%     │ 15%     │ 10%    │           │   │
│  │  └─────────┴─────────┴─────────┴─────────┘           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Cost per Query Type                                 │   │
│  │  ┌─────────────┬─────────────┬─────────────┐         │   │
│  │  │  Simple Q&A │  RAG Query  │  Agent Task │         │   │
│  │  │  $0.001     │  $0.005     │  $0.020     │         │   │
│  │  └─────────────┴─────────────┴─────────────┘         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Monthly Projection                                  │   │
│  │  Current: $150/mo                                   │   │
│  │  Projected: $450/mo (3x growth)                     │   │
│  │  Recommended: Switch 50% to DeepSeek → Save $200/mo │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AI Lab Support

- [x] Token usage tracking
- [x] Cost per model
- [x] Monthly projections
- [x] Optimization recommendations

---

## 6. Experiment Tracking

### What to Track

| Category | Metrics |
|----------|---------|
| **Model** | Name, version, parameters |
| **Prompt** | Template, variables, version |
| **Data** | Dataset, split, size |
| **Hyperparameters** | Temperature, max_tokens, top_p |
| **Metrics** | Accuracy, latency, cost |
| **Environment** | Git commit, dependencies |

### Experiment Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                  Experiment Lifecycle                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │  Design │───▶│   Run   │───▶│ Evaluate│───▶│  Ship   │ │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘ │
│       │              │              │              │        │
│       ↓              ↓              ↓              ↓        │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │Hypothesis│   │  Logs   │    │  Scores │    │  Deploy │ │
│  │Variables │   │ Traces  │    │ Compare │    │ Monitor │ │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AI Lab Support

- [x] Experiment dashboard
- [x] Run comparison
- [x] Metric tracking
- [ ] Git integration
- [ ] Automated regression detection

---

## 7. Fine-tuning Preparation

### Data Requirements

| Model Size | Min Examples | Recommended |
|------------|--------------|-------------|
| 7B | 1,000 | 10,000+ |
| 13B | 2,000 | 20,000+ |
| 70B | 5,000 | 50,000+ |

### Data Curation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Data Curation                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ Production  │───▶│   Filter    │───▶│   Annotate  │     │
│  │   Traces    │    │  (Quality)  │    │  (Ground    │     │
│  │             │    │             │    │   Truth)    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                              ↓              │
│                                       ┌─────────────┐      │
│                                       │  Training   │      │
│                                       │   Dataset   │      │
│                                       └─────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AI Lab Support (Planned)

- [ ] Trace-to-dataset conversion
- [ ] Quality filtering
- [ ] Annotation interface
- [ ] Training data export
- [ ] Fine-tuning job integration

---

## 8. Agent Development

### Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────┐                          │
│                    │   Agent     │                          │
│                    │  (Orchestrator)│                        │
│                    └─────────────┘                          │
│                          │                                   │
│         ┌────────────────┼────────────────┐                │
│         ↓                ↓                ↓                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Planner   │  │  Executor   │  │  Memory    │        │
│  │             │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                │                                  │
│         ↓                ↓                                  │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Tools     │  │   LLM       │                          │
│  │ - Search    │  │ - GPT-4o    │                          │
│  │ - Code      │  │ - Claude    │                          │
│  │ - API       │  │             │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Debugging Challenges

| Challenge | Description | AI Lab Solution |
|-----------|-------------|-----------------|
| **Multi-step reasoning** | Hard to trace logic | Step-by-step tracing |
| **Tool failures** | Silent errors | Tool call logging |
| **Context overflow** | Lost information | Context window analysis |
| **Infinite loops** | Agent stuck | Loop detection |
| **Cost explosion** | Unexpected spend | Real-time cost tracking |

### AI Lab Support (Planned)

- [ ] Agent tracing
- [ ] Tool call visualization
- [ ] Multi-agent debugging
- [ ] Agent evaluation
- [ ] Cost prediction

---

## Summary

AI Lab is designed to support the full ML/LLM research lifecycle:

```
┌─────────────────────────────────────────────────────────────┐
│                  AI Lab Research Support                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Prompt Engineering     - Playground, templates, compare │
│  ✅ Model Evaluation       - Benchmarks, custom evaluators  │
│  ✅ Cost Optimization      - Tracking, projections          │
│  ✅ Experiment Tracking    - Runs, comparisons, metrics     │
│  🔜 RAG Development        - Chunking, retrieval eval       │
│  🔜 CAG Development        - Context analysis               │
│  🔜 Fine-tuning Prep      - Dataset curation               │
│  🔜 Agent Development      - Tracing, debugging             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Legend:**
- ✅ Implemented
- 🔜 Planned
