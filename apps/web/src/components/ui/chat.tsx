import { component$, Slot } from "@builder.io/qwik";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  tokens?: number;
  latency?: number;
  class?: string;
}

export const ChatMessage = component$(({ role, tokens, latency, class: className = "" }: ChatMessageProps) => {
  return (
    <div class={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        class={`max-w-[80%] rounded-xl px-4 py-3 ${className} ${
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-surface-light text-text"
        }`}
      >
        <Slot />
        {tokens && (
          <div class="flex gap-2 mt-2 text-xs opacity-70">
            <span>{tokens} tokens</span>
            <span>•</span>
            <span>{latency}ms</span>
          </div>
        )}
      </div>
    </div>
  );
});

interface ChatContainerProps {
  class?: string;
}

export const ChatContainer = component$(({ class: className = "" }: ChatContainerProps) => {
  return (
    <div class={`flex-1 overflow-hidden flex flex-col ${className}`}>
      <Slot />
    </div>
  );
});

export const StreamingIndicator = component$(() => {
  return (
    <div class="flex justify-start">
      <div class="bg-surface-light rounded-xl px-4 py-3">
        <div class="flex gap-1">
          <span class="w-2 h-2 bg-text-muted rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-2 h-2 bg-text-muted rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-2 h-2 bg-text-muted rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>
  );
});
