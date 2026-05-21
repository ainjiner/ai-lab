import { component$, useStore, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { PageHeader } from "~/components/ui/page-header";
import { Badge } from "~/components/ui/badge";
import { SearchInput } from "~/components/ui/search-filter";

interface Resource {
  name: string;
  url: string;
  description: string;
  tags: string[];
}

interface Category {
  id: string;
  emoji: string;
  name: string;
  description: string;
  items: Resource[];
}

const categories: Category[] = [
  {
    id: "communities",
    emoji: "📡",
    name: "Communities",
    description: "Reddit, Discord, forums — tempat diskusi AI/ML paling aktif",
    items: [
      { name: "r/MachineLearning", url: "https://reddit.com/r/MachineLearning", description: "Subreddit ML terbesar — paper, diskusi, research", tags: ["reddit","paper"] },
      { name: "r/LocalLLaMA", url: "https://reddit.com/r/LocalLLaMA", description: "Run LLM locally — tips, benchmark, hardware", tags: ["reddit","llm"] },
      { name: "r/LangChain", url: "https://reddit.com/r/LangChain", description: "Agent & chain development", tags: ["reddit","agents"] },
      { name: "r/deeplearning", url: "https://reddit.com/r/deeplearning", description: "Deep learning research & news", tags: ["reddit","research"] },
      { name: "r/learnmachinelearning", url: "https://reddit.com/r/learnmachinelearning", description: "Belajar ML dari nol — beginner-friendly", tags: ["reddit","learning"] },
      { name: "HuggingFace Forums", url: "https://discuss.huggingface.co", description: "Diskusi model, dataset, spaces di HF", tags: ["forum"] },
      { name: "EleutherAI Discord", url: "https://discord.gg/eleutherai", description: "LLM research collective", tags: ["discord","research"] },
    ],
  },
  {
    id: "repos",
    emoji: "🔧",
    name: "Essential Repositories",
    description: "Repo yang wajib distar tiap AI engineer",
    items: [
      { name: "unsloth", url: "https://github.com/unslothai/unsloth", description: "Fine-tune LLM 2x lebih cepat, 80% less memory", tags: ["fine-tuning","llm"] },
      { name: "awesome-ai-apps", url: "https://github.com/Arindam200/awesome-ai-apps", description: "Kurasi aplikasi AI terbaik yang bisa dipakai", tags: ["curated","apps"] },
      { name: "vLLM", url: "https://github.com/vllm-project/vllm", description: "High-throughput LLM serving engine", tags: ["inference","production"] },
      { name: "Ollama", url: "https://github.com/ollama/ollama", description: "Run LLM locally, one command", tags: ["local","llm"] },
      { name: "llama.cpp", url: "https://github.com/ggerganov/llama.cpp", description: "C++ inference — runs LLM on CPU", tags: ["inference","cpp"] },
      { name: "litgpt", url: "https://github.com/Lightning-AI/litgpt", description: "Pretrain, fine-tune, deploy LLM — clean code", tags: ["fine-tuning","pretrain"] },
      { name: "axolotl", url: "https://github.com/OpenAccess-AI-Collective/axolotl", description: "Fine-tuning LLM yang paling lengkap", tags: ["fine-tuning","llm"] },
      { name: "open-webui", url: "https://github.com/open-webui/open-webui", description: "ChatGPT-style UI for local/remote LLM", tags: ["ui","self-hosted"] },
      { name: "MLX", url: "https://github.com/ml-explore/mlx", description: "Apple Silicon-native ML framework", tags: ["apple","inference"] },
    ],
  },
  {
    id: "research",
    emoji: "🧠",
    name: "Research",
    description: "Paper, benchmark, dan publikasi AI/ML terkini",
    items: [
      { name: "Arxiv cs.AI", url: "https://arxiv.org/list/cs.AI/recent", description: "Latest AI papers on Arxiv", tags: ["paper"] },
      { name: "Arxiv cs.CL", url: "https://arxiv.org/list/cs.CL/recent", description: "Computational linguistics & NLP", tags: ["paper","nlp"] },
      { name: "Papers With Code", url: "https://paperswithcode.com", description: "Paper + implementation code", tags: ["paper","code"] },
      { name: "HuggingFace Daily Papers", url: "https://huggingface.co/papers", description: "Top-3 daily ranked ML papers", tags: ["paper","trending"] },
      { name: "Semantic Scholar", url: "https://www.semanticscholar.org", description: "AI-powered academic search engine", tags: ["paper","search"] },
      { name: "LiveBench", url: "https://livebench.ai", description: "Real-time LLM benchmark leaderboard", tags: ["benchmark","llm"] },
      { name: "Chatbot Arena", url: "https://chat.lmsys.org", description: "Blind battle — LLM elo rating", tags: ["benchmark","elo"] },
    ],
  },
  {
    id: "competitions",
    emoji: "🏆",
    name: "Competitions",
    description: "Ajang uji skill ML engineer",
    items: [
      { name: "Kaggle", url: "https://kaggle.com/competitions", description: "Platform kompetisi ML terbesar", tags: ["competition","datasets"] },
      { name: "HuggingFace Competitions", url: "https://huggingface.co/spaces-competitions", description: "ML competitions hosted on HF", tags: ["competition"] },
      { name: "AICrowd", url: "https://www.aicrowd.com", description: "Open innovation challenges", tags: ["competition"] },
      { name: "CodaLab", url: "https://competitions.codalab.org", description: "Research-oriented ML competitions", tags: ["competition","research"] },
    ],
  },
  {
    id: "news",
    emoji: "📰",
    name: "News & Media",
    description: "Tetap update tanpa doomscrolling",
    items: [
      { name: "The Batch (DeepLearning.AI)", url: "https://www.deeplearning.ai/the-batch/", description: "Weekly newsletter by Andrew Ng", tags: ["newsletter"] },
      { name: "TLDR AI", url: "https://tldr.tech/ai", description: "Daily AI news summary", tags: ["newsletter","daily"] },
      { name: "Import AI", url: "https://importai.substack.com", description: "Weekly deep-dive oleh Jack Clark (Anthropic)", tags: ["newsletter","deep"] },
      { name: "AI Explained (YouTube)", url: "https://youtube.com/@ai-explained-", description: "Breakdown berita AI paling netral", tags: ["youtube"] },
      { name: "Yannic Kilcher (YouTube)", url: "https://youtube.com/@YannicKilcher", description: "Paper breakdowns & ML news", tags: ["youtube","paper"] },
      { name: "Two Minute Papers (YouTube)", url: "https://youtube.com/@TwoMinutePapers", description: "Paper ringkasan 2 menit", tags: ["youtube","paper"] },
      { name: "Latent Space", url: "https://latent.space", description: "Podcast — interviews with AI builders", tags: ["podcast"] },
    ],
  },
  {
    id: "learning",
    emoji: "🎓",
    name: "Learning",
    description: "Belajar AI/ML dari yang terbaik — gratis",
    items: [
      { name: "fast.ai", url: "https://www.fast.ai", description: "Practical DL for coders", tags: ["course","free"] },
      { name: "DeepLearning.AI", url: "https://www.deeplearning.ai", description: "Courses by Andrew Ng", tags: ["course"] },
      { name: "HuggingFace NLP Course", url: "https://huggingface.co/learn/nlp-course", description: "NLP with Transformers", tags: ["course","nlp"] },
      { name: "Karpathy Zero to Hero", url: "https://github.com/karpathy/nn-zero-to-hero", description: "Build neural nets from scratch", tags: ["course","fundamentals"] },
      { name: "MIT 6.S191", url: "https://www.youtube.com/playlist?list=PLtBw6njQRU-rwp5__7C0oIVt26ZgjG9NI", description: "Intro to Deep Learning (MIT)", tags: ["course","mit"] },
      { name: "CS229 Stanford ML", url: "https://cs229.stanford.edu", description: "Machine Learning by Andrew Ng", tags: ["course","stanford"] },
    ],
  },
  {
    id: "platforms",
    emoji: "🛠️",
    name: "Platforms & Hubs",
    description: "Infrastructure untuk build dan deploy model AI",
    items: [
      { name: "HuggingFace", url: "https://huggingface.co", description: "GitHub-nya model ML — 900k+ models", tags: ["hub","models"] },
      { name: "Pinokio", url: "https://beta.pinokio.co", description: "One-click install AI apps — like app store for AI", tags: ["apps","one-click"] },
      { name: "Replicate", url: "https://replicate.com", description: "Run ML models in the cloud via API", tags: ["cloud","api"] },
      { name: "Baseten", url: "https://baseten.co", description: "Deploy open-source models with one command", tags: ["deploy","inference"] },
      { name: "RunPod", url: "https://runpod.io", description: "GPU cloud — cheap & fast", tags: ["gpu","cloud"] },
      { name: "Modal", url: "https://modal.com", description: "Serverless GPU compute", tags: ["serverless","gpu"] },
      { name: "Together AI", url: "https://together.ai", description: "Fast inference + fine-tuning platform", tags: ["inference","fine-tuning"] },
    ],
  },
];

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
      <PageHeader title="Explorer" description="Portal komunitas, paper, tools — biar selalu walking the path">
        <SearchInput
          value={state.search}
          placeholder="Cari resource, paper, tools..."
          onInput$={(val) => (state.search = val)}
        />
      </PageHeader>

      {filtered.length === 0 && (
        <div class="flex flex-col items-center justify-center py-20 text-text-muted">
          <svg class="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2 0V4.07c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93z"/></svg>
          <p class="text-lg font-medium">No results for "{state.search}"</p>
          <p class="text-sm mt-1">Try different keywords</p>
        </div>
      )}

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cat) => (
          <Card key={cat.id} class="flex flex-col">
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
              <ul class="space-y-1">
                {cat.items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="group flex flex-col rounded-lg px-3 py-2 -mx-3 hover:bg-surface-light/60 transition-colors"
                    >
                      <div class="flex items-center gap-1.5">
                        <span class="text-sm font-medium text-text group-hover:text-primary transition-colors truncate">
                          {item.name}
                        </span>
                        <svg class="w-3 h-3 text-text-subtle group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <p class="text-xs text-text-muted mt-0.5 line-clamp-1">{item.description}</p>
                      <div class="flex gap-1 mt-1.5">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" class="text-[10px] py-0 px-1.5">{tag}</Badge>
                        ))}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div class="text-center text-xs text-text-subtle pt-4 pb-8">
        Links are curated. Want to suggest one?{" "}
        <a
          href="https://github.com/ainjiner/ai-lab/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >
          Open an issue →
        </a>
      </div>
    </div>
  );
});

export const head: DocumentHead = { title: "AI Lab - Explorer" };
