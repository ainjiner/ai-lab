import { component$, useStore, $, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { EmptyState } from "~/components/ui/empty-state";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Select } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { ChatContainer, ChatMessage, StreamingIndicator } from "~/components/ui/chat";
import { api } from "~/lib/api";

interface PlaygroundConfig {
  provider: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  tokens?: number;
  latency?: number;
}

interface PlaygroundStore {
  messages: Message[];
  input: string;
  streaming: boolean;
  compareMode: boolean;
  configs: PlaygroundConfig[];
  providers: string[];
  models: string[];
}

export default component$(() => {
  const store = useStore<PlaygroundStore>({
    messages: [],
    input: "",
    streaming: false,
    compareMode: false,
    configs: [
      { provider: "baseten", model: "zai-org/GLM-5", temperature: 0.7, topP: 0.9, maxTokens: 2048, systemPrompt: "You are a helpful AI assistant." },
      { provider: "openrouter", model: "anthropic/claude-3.5-sonnet", temperature: 0.7, topP: 0.9, maxTokens: 2048, systemPrompt: "You are a helpful AI assistant." },
    ],
    providers: [],
    models: [],
  });

  useTask$(async () => {
    try {
      const res: any = await api.get("/models");
      const raw: any[] = Array.isArray(res) ? res : res.models || [];
      const seen = new Set<string>();
      const provs: string[] = [];
      for (const m of raw) {
        const p = m.provider || "unknown";
        if (!seen.has(p)) { seen.add(p); provs.push(p); }
      }
      store.providers = provs.length > 0 ? provs : ["baseten", "openrouter", "together", "fireworks", "groq", "anthropic", "openai", "google", "deepseek", "ollama"];
      store.models = raw.length > 0 ? raw.map((m: any) => String(m.id || m.name || "")) : ["zai-org/GLM-5", "anthropic/claude-3.5-sonnet", "openai/gpt-4o", "meta-llama/llama-3.1-70b-instruct"];
    } catch {
      store.providers = ["baseten", "openrouter", "together", "fireworks", "groq", "anthropic", "openai", "google", "deepseek", "ollama"];
      store.models = ["zai-org/GLM-5", "anthropic/claude-3.5-sonnet", "openai/gpt-4o", "meta-llama/llama-3.1-70b-instruct"];
    }
  });

  const sendMessage = $(async () => {
    if (!store.input.trim() || store.streaming) return;

    const userMessage = {
      role: "user" as const,
      content: store.input,
      timestamp: new Date().toISOString(),
    };
    store.messages = [...store.messages, userMessage];
    store.input = "";
    store.streaming = true;

    try {
      const res: any = await api.post("/playground/chat", {
        messages: store.messages.slice(0, -1),
        model: store.configs[0].model,
        provider: store.configs[0].provider,
        temperature: store.configs[0].temperature,
        maxTokens: store.configs[0].maxTokens,
      });

      store.messages = [...store.messages, {
        role: "assistant",
        content: res.response || "No response",
        timestamp: new Date().toISOString(),
        tokens: (res.tokens?.prompt || 0) + (res.tokens?.completion || 0),
        latency: res.latency || 0,
      }];
    } catch {
      store.messages = [...store.messages, {
        role: "assistant",
        content: "Error: Failed to get response",
        timestamp: new Date().toISOString(),
      }];
    } finally {
      store.streaming = false;
    }
  });

  const clearChat = $(() => {
    store.messages = [];
  });

  const setInput = $((val: string) => {
    store.input = val;
  });

  return (
    <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
      <div class="flex-1 min-w-0 flex flex-col bg-surface-elevated rounded-xl border border-surface-light shadow-sm overflow-hidden">
        <div class="shrink-0 px-6 py-4 border-b border-surface-light bg-surface/50 backdrop-blur-sm flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold tracking-tight text-text">Playground</h1>
            <p class="text-xs text-text-muted mt-0.5">Test models interactively with live streaming</p>
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick$={() => (store.compareMode = !store.compareMode)}
              class="h-8 text-xs bg-surface"
            >
              {store.compareMode ? (
                <><svg class="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg> Exit Compare</>
              ) : (
                <><svg class="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> Compare Mode</>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick$={clearChat} class="h-8 text-xs bg-surface hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Clear
            </Button>
          </div>
        </div>

        <ChatContainer class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-surface-elevated">
          {store.messages.length === 0 && (
            <div class="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20">
                <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-text mb-2">Welcome to Playground</h3>
              <p class="text-sm text-text-muted">
                Configure your model on the right and start typing below to interact. The conversation history is maintained for context.
              </p>
            </div>
          )}
          {store.messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} tokens={msg.tokens} latency={msg.latency}>
              <p class="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </ChatMessage>
          ))}
          {store.streaming && <StreamingIndicator />}
        </ChatContainer>

        <div class="shrink-0 p-4 bg-surface/50 border-t border-surface-light">
          <div class="relative max-w-4xl mx-auto flex items-end gap-3 bg-surface border border-surface-light focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all rounded-xl p-2 shadow-sm">
            <div class="flex-1">
              <Textarea
                placeholder="Message the model... (Press Enter to send, Shift+Enter for newline)"
                value={store.input}
                onInput$={(e) => setInput((e.target as HTMLTextAreaElement).value)}
                onKeyDown$={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                class="min-h-[44px] max-h-[200px] w-full resize-none border-0 bg-transparent focus:ring-0 px-2 py-2.5 text-sm placeholder:text-text-muted/60"
              />
            </div>
            <div class="shrink-0 pb-1 pr-1">
              <Button 
                onClick$={sendMessage} 
                disabled={store.streaming || !store.input.trim()}
                class="w-9 h-9 rounded-lg p-0 flex items-center justify-center transition-all shadow-sm"
              >
                {store.streaming ? (
                  <Spinner size="sm" />
                ) : (
                  <svg class="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
          <div class="text-center mt-2">
            <span class="text-[10px] text-text-subtle">Models can make mistakes. Verify important information.</span>
          </div>
        </div>
      </div>

      <aside class="w-full lg:w-80 shrink-0 h-full flex flex-col space-y-4">
        <Card class="flex-1 flex flex-col overflow-hidden bg-surface border-surface-light shadow-sm">
          <div class="shrink-0 border-b border-surface-light px-4 py-3 bg-surface/50">
            <h3 class="text-sm font-bold text-text flex items-center gap-2">
              <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuration
            </h3>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-6">
            <div class="space-y-4">
              <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-1">Model Selection</h4>
              
              <div class="space-y-2">
                <label class="text-xs font-medium text-text-muted flex justify-between">
                  Provider
                  <span class="text-primary text-[10px] uppercase font-bold tracking-widest">{store.configs[0].provider}</span>
                </label>
                <Select
                  class="w-full bg-surface-elevated border-surface-light focus:border-primary/50 text-sm h-9"
                  value={store.configs[0].provider}
                  onChange$={(e: any) => (store.configs[0].provider = e.target.value)}
                >
                  {store.providers.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </Select>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-medium text-text-muted">Model</label>
                <Select
                  class="w-full bg-surface-elevated border-surface-light focus:border-primary/50 text-sm h-9"
                  value={store.configs[0].model}
                  onChange$={(e: any) => (store.configs[0].model = e.target.value)}
                >
                  {store.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div class="w-full h-px bg-surface-light"></div>

            <div class="space-y-5">
              <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-subtle mb-1">Parameters</h4>
              
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-medium text-text-muted">Temperature</label>
                  <span class="text-xs font-mono bg-surface-light px-1.5 py-0.5 rounded text-text">{store.configs[0].temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={store.configs[0].temperature}
                  onInput$={(e) => (store.configs[0].temperature = parseFloat((e.target as HTMLInputElement).value))}
                  class="w-full h-1.5 bg-surface-light rounded-lg appearance-none cursor-pointer accent-primary outline-none"
                  style="accent-color: var(--color-primary);"
                />
                <div class="flex justify-between text-[10px] text-text-subtle">
                  <span>Precise (0.0)</span>
                  <span>Creative (2.0)</span>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-medium text-text-muted">Top P</label>
                  <span class="text-xs font-mono bg-surface-light px-1.5 py-0.5 rounded text-text">{store.configs[0].topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={store.configs[0].topP}
                  onInput$={(e) => (store.configs[0].topP = parseFloat((e.target as HTMLInputElement).value))}
                  class="w-full h-1.5 bg-surface-light rounded-lg appearance-none cursor-pointer accent-primary outline-none"
                  style="accent-color: var(--color-primary);"
                />
              </div>

              <div class="space-y-2">
                <label class="text-xs font-medium text-text-muted">Max Output Tokens</label>
                <Input
                  type="number"
                  value={store.configs[0].maxTokens}
                  onInput$={(e) => (store.configs[0].maxTokens = parseInt((e.target as HTMLInputElement).value))}
                  class="w-full bg-surface-elevated text-sm h-9"
                />
              </div>
            </div>

            <div class="w-full h-px bg-surface-light"></div>

            <div class="space-y-3 pb-2">
              <div class="flex justify-between items-center">
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-subtle">System Prompt</h4>
              </div>
              <Textarea
                value={store.configs[0].systemPrompt}
                onInput$={(e) => (store.configs[0].systemPrompt = (e.target as HTMLTextAreaElement).value)}
                class="min-h-[120px] text-xs font-mono bg-surface-elevated leading-relaxed resize-y border-surface-light focus:border-primary/50"
              />
            </div>
          </div>
        </Card>

        <Card class="shrink-0 bg-surface border-surface-light shadow-sm">
          <div class="p-3 grid grid-cols-2 gap-2">
            <Button variant="outline" class="w-full h-8 text-[11px] font-medium bg-surface-elevated hover:bg-surface-light justify-center" size="sm">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              Save Exp.
            </Button>
            <Button variant="outline" class="w-full h-8 text-[11px] font-medium bg-surface-elevated hover:bg-surface-light justify-center" size="sm">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Load Cfg
            </Button>
          </div>
        </Card>
      </aside>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Playground",
};
