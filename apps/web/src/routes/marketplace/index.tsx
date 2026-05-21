import { component$, useStore, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { PageHeader } from "~/components/ui/page-header";
import { Badge } from "~/components/ui/badge";
import { SearchInput } from "~/components/ui/search-filter";

interface Tool {
  name: string;
  url: string;
  description: string;
  stars?: string;
  tags: string[];
}

interface Category {
  id: string;
  emoji: string;
  name: string;
  description: string;
  items: Tool[];
}

const categories: Category[] = [
  {
    id: "fine-tuning",
    emoji: "🚀",
    name: "Fine-Tuning",
    description: "Tools untuk men-train dan fine-tune LLM sendiri",
    items: [
      { name: "Unsloth", url: "https://github.com/unslothai/unsloth", description: "2x faster fine-tuning, 80% less VRAM — supports Llama, Mistral, Gemma", stars: "37k+", tags: ["free","llm","qlora"] },
      { name: "Axolotl", url: "https://github.com/OpenAccess-AI-Collective/axolotl", description: "Most complete fine-tuning config system — YAML-based", stars: "9k+", tags: ["free","config","llm"] },
      { name: "LLaMA-Factory", url: "https://github.com/hiyouga/LLaMA-Factory", description: "GUI-based fine-tuning — 100+ models supported", stars: "45k+", tags: ["free","gui","llm"] },
      { name: "torchtune", url: "https://github.com/pytorch/torchtune", description: "PyTorch-native fine-tuning library by Meta", stars: "5k+", tags: ["free","pytorch","official"] },
      { name: "HuggingFace TRL", url: "https://github.com/huggingface/trl", description: "RLHF, DPO, SFT — HF native training library", stars: "12k+", tags: ["free","rlhf","hf"] },
    ],
  },
  {
    id: "inference",
    emoji: "⚡",
    name: "Inference Engines",
    description: "Serve LLM di production dengan throughput maksimal",
    items: [
      { name: "vLLM", url: "https://github.com/vllm-project/vllm", description: "High-throughput LLM serving — PagedAttention, continuous batching", stars: "47k+", tags: ["free","production","openai-api"] },
      { name: "Ollama", url: "https://github.com/ollama/ollama", description: "Run LLM locally — one command, auto-download, OpenAI compatible", stars: "132k+", tags: ["free","local","openai-api"] },
      { name: "llama.cpp", url: "https://github.com/ggerganov/llama.cpp", description: "Pure C/C++ inference — runs on CPU, GPU, Apple Silicon", stars: "78k+", tags: ["free","cpp","gguf"] },
      { name: "Text Generation Inference", url: "https://github.com/huggingface/text-generation-inference", description: "HuggingFace production inference server", stars: "10k+", tags: ["free","hf","production"] },
      { name: "SGLang", url: "https://github.com/sgl-project/sglang", description: "Structured generation language — fast backend runtime", stars: "10k+", tags: ["free","structured","radix"] },
      { name: "MLX", url: "https://github.com/ml-explore/mlx", description: "Apple Silicon-native ML framework by Apple", stars: "20k+", tags: ["free","apple","unified-memory"] },
    ],
  },
  {
    id: "agents",
    emoji: "🤖",
    name: "Agent Frameworks",
    description: "Framework untuk bikin autonomous AI agent",
    items: [
      { name: "CrewAI", url: "https://github.com/crewAIInc/crewAI", description: "Multi-agent orchestration — role-based agents", stars: "28k+", tags: ["free","multi-agent","python"] },
      { name: "LangGraph", url: "https://github.com/langchain-ai/langgraph", description: "Stateful agent workflows — graph-based", stars: "12k+", tags: ["free","graph","stateful"] },
      { name: "Dify", url: "https://github.com/langgenius/dify", description: "Visual AI app builder — drag & drop agents", stars: "80k+", tags: ["free","visual","self-hosted"] },
      { name: "n8n", url: "https://github.com/n8n-io/n8n", description: "Workflow automation + AI nodes — self-hostable", stars: "60k+", tags: ["free","workflow","low-code"] },
      { name: "AutoGen", url: "https://github.com/microsoft/autogen", description: "Multi-agent conversation framework by Microsoft", stars: "41k+", tags: ["free","microsoft","multi-agent"] },
      { name: "MetaGPT", url: "https://github.com/geekan/MetaGPT", description: "Multi-agent meta programming — agents as software team", stars: "50k+", tags: ["free","swe","multi-agent"] },
      { name: "TaskWeaver", url: "https://github.com/microsoft/TaskWeaver", description: "Code-first agent framework by Microsoft", stars: "6k+", tags: ["free","microsoft","code"] },
    ],
  },
  {
    id: "rag",
    emoji: "📚",
    name: "RAG & Retrieval",
    description: "Bangun aplikasi RAG dan search AI",
    items: [
      { name: "LangChain", url: "https://github.com/langchain-ai/langchain", description: "LLM application framework — chains, agents, RAG", stars: "104k+", tags: ["free","chains","llm"] },
      { name: "LlamaIndex", url: "https://github.com/run-llama/llama_index", description: "Data framework for LLM — connectors, indexing, query", stars: "39k+", tags: ["free","indexing","data"] },
      { name: "RAGFlow", url: "https://github.com/infiniflow/ragflow", description: "Open-source RAG engine with deep document understanding", stars: "48k+", tags: ["free","ocr","self-hosted"] },
      { name: "Verba", url: "https://github.com/weaviate/Verba", description: "Golden RAGtriever — Weaviate-powered RAG app", stars: "8k+", tags: ["free","weaviate","ui"] },
      { name: "anything-llm", url: "https://github.com/Mintplex-Labs/anything-llm", description: "All-in-one desktop RAG app — multi-user, multi-model", stars: "42k+", tags: ["free","desktop","multi-model"] },
      { name: "Kotaemon", url: "https://github.com/Cinnamon/kotaemon", description: "Open-source RAG UI for document QA", stars: "21k+", tags: ["free","ui","document"] },
    ],
  },
  {
    id: "eval",
    emoji: "🔍",
    name: "Evaluation & Observability",
    description: "Ukur kualitas LLM app dan pantau di production",
    items: [
      { name: "LangFuse", url: "https://github.com/langfuse/langfuse", description: "Open-source LLM observability — tracing, eval, prompt mgmt", stars: "10k+", tags: ["free","tracing","prompts"] },
      { name: "DeepEval", url: "https://github.com/confident-ai/deepeval", description: "LLM evaluation framework — unit-test style assertions", stars: "5k+", tags: ["free","testing","metrics"] },
      { name: "Ragas", url: "https://github.com/explodinggradients/ragas", description: "RAG evaluation — faithfulness, relevancy, context precision", stars: "9k+", tags: ["free","rag","metrics"] },
      { name: "Arize Phoenix", url: "https://github.com/Arize-AI/phoenix", description: "AI observability — tracing, eval, embeddings viz", stars: "11k+", tags: ["free","tracing","embeddings"] },
      { name: "Braintrust", url: "https://github.com/braintrustdata/braintrust", description: "Eval platform — datasets, experiments, scoring", stars: "3k+", tags: ["free","experiments","scoring"] },
      { name: "Promptfoo", url: "https://github.com/promptfoo/promptfoo", description: "Prompt testing & eval — red team, comparison, regression", stars: "6k+", tags: ["free","prompt","testing"] },
    ],
  },
  {
    id: "ui",
    emoji: "🖥️",
    name: "Open Web UIs",
    description: "ChatGPT-style interface untuk LLM self-hosted",
    items: [
      { name: "Open WebUI", url: "https://github.com/open-webui/open-webui", description: "Feature-rich self-hosted chat UI — RAG, tools, multi-user", stars: "80k+", tags: ["free","self-hosted","rag"] },
      { name: "LobeChat", url: "https://github.com/lobehub/lobe-chat", description: "Modern chat framework — plugins, agents, TTS", stars: "60k+", tags: ["free","plugins","tts"] },
      { name: "LibreChat", url: "https://github.com/danny-avila/LibreChat", description: "Multi-provider chat — OpenAI, Anthropic, Google, custom", stars: "24k+", tags: ["free","multi-provider"] },
      { name: "big-AGI", url: "https://github.com/enricoros/big-AGI", description: "Professional AI suite — multi-model, personas, beam", stars: "6k+", tags: ["free","personas","multi-model"] },
      { name: "Chatbot UI", url: "https://github.com/mckaywrigley/chatbot-ui", description: "Clean ChatGPT clone — works with any OpenAI-compatible API", stars: "30k+", tags: ["free","openai-api","clean"] },
    ],
  },
  {
    id: "deploy",
    emoji: "📦",
    name: "One-Click Deploy",
    description: "Deploy model AI ke production tanpa pusing infra",
    items: [
      { name: "Pinokio", url: "https://pinokio.computer", description: "One-click install AI apps — browser for AI", stars: "5k+", tags: ["free","one-click","desktop"] },
      { name: "Replicate", url: "https://replicate.com", description: "Run ML models via API — pay per inference", tags: ["cloud","api","payg"] },
      { name: "Baseten", url: "https://baseten.co", description: "Deploy open-source models — Truss, cold-start optimization", tags: ["cloud","truss","cold-start"] },
      { name: "RunPod", url: "https://runpod.io", description: "Cheapest GPU cloud — serverless or dedicated", tags: ["cloud","gpu","cheap"] },
      { name: "Modal", url: "https://modal.com", description: "Serverless GPU — Python-native, cold-boot < 1s", tags: ["cloud","serverless","python"] },
      { name: "Together AI", url: "https://together.ai", description: "Fast inference API + fine-tuning — 100+ models", tags: ["cloud","api","fine-tuning"] },
    ],
  },
];

const starLevel = (stars?: string) => {
  if (!stars) return "bg-surface-light text-text-muted";
  const n = parseInt(stars.replace(/\D/g, ""));
  if (n >= 50) return "bg-yellow-500/20 text-yellow-400";
  if (n >= 20) return "bg-purple-500/20 text-purple-400";
  if (n >= 5) return "bg-blue-500/20 text-blue-400";
  return "bg-green-500/20 text-green-400";
};

export default component$(() => {
  const state = useStore({ search: "" });

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(state.search.toLowerCase()) ||
          item.description.toLowerCase().includes(state.search.toLowerCase()) ||
          item.tags.some((t) => t.toLowerCase().includes(state.search.toLowerCase())) ||
          cat.name.toLowerCase().includes(state.search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div class="space-y-8">
      <PageHeader title="Marketplace" description="Direktori tool & aplikasi AI yang wajib diketahui">
        <SearchInput
          value={state.search}
          placeholder="Cari tools, framework, apps..."
          onInput$={(val) => (state.search = val)}
        />
      </PageHeader>

      {filtered.length === 0 && (
        <div class="flex flex-col items-center justify-center py-20 text-text-muted">
          <svg class="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 4h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/></svg>
          <p class="text-lg font-medium">No results for "{state.search}"</p>
          <p class="text-sm mt-1">Try a different category or keyword</p>
        </div>
      )}

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cat) => (
          <Card key={cat.id} class="flex flex-col group/card">
            <CardHeader>
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">{cat.emoji}</span>
                <div>
                  <CardTitle class="text-base">{cat.name}</CardTitle>
                  <p class="text-xs text-text-muted">{cat.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent class="flex-1">
              <div class="space-y-3">
                {cat.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group block rounded-lg p-3 -mx-1 hover:bg-surface-light/60 transition-colors"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5">
                          <span class="text-sm font-medium text-text group-hover:text-primary transition-colors truncate">
                            {item.name}
                          </span>
                          <svg class="w-3 h-3 text-text-subtle group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <p class="text-xs text-text-muted mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                      {item.stars && (
                        <span class={["text-[10px] font-mono font-semibold rounded-full px-1.5 py-0.5 shrink-0", starLevel(item.stars)]}>
                          ⭐ {item.stars}
                        </span>
                      )}
                    </div>
                    <div class="flex gap-1 mt-2 flex-wrap">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" class="text-[10px] py-0 px-1.5">{tag}</Badge>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div class="text-center text-xs text-text-subtle pt-4 pb-8">
        Missing a tool?{" "}
        <a
          href="https://github.com/ainjiner/ai-lab/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >
          Suggest via issue →
        </a>
      </div>
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Marketplace" };
