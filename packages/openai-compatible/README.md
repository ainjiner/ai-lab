# @ai-lab/openai-compatible

> **Forked from** [`@ai-sdk/openai-compatible`](https://github.com/vercel/ai) — Vercel AI SDK v4 provider for OpenAI-compatible APIs, with a custom `minChunkSize` SSE fix.

## Why This Fork?

The upstream `@ai-sdk/openai-compatible` SDK (and `@ai-sdk/core` before v4) suffered from **SSE chunk fragmentation** on certain providers (notably Baseten and Together), where streaming responses were split into tiny chunks at the network level. This caused choppy streaming, incomplete reasoning deltas, and poor UX in AI coding tools.

**Upstream issue:** [vercel/ai#15343](https://github.com/vercel/ai/issues/15343) — "SSE stream responses are heavily fragmented"

**This fork adds:**

### `minChunkSize` configuration

A new option on `OpenAICompatibleChatSettings` that buffers streaming deltas until they reach the specified character threshold before flushing to the consumer.

```typescript
import { createOpenAICompatible } from "@ai-lab/openai-compatible";

const provider = createOpenAICompatible({
  name: "baseten",
  baseURL: "https://bridge.baseten.co/v1/dp_q6/direct",
  headers: {
    Authorization: `Bearer ${process.env.BASETEN_API_KEY}`,
  },
});

const model = provider.chatModel("zai-org/GLM-5", {
  minChunkSize: 80,  // Buffer until 80 chars before flushing
});
```

This replaces the **legacy SSE proxy** approach entirely — no more running a sidecar proxy for smooth streaming.

## Usage

```typescript
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-lab/openai-compatible";

const provider = createOpenAICompatible({
  name: "my-provider",
  baseURL: "https://api.example.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
});

// Without minChunkSize (default behavior)
const model = provider.chatModel("my-model");

// With minChunkSize (buffered streaming)
const buffered = provider.chatModel("my-model", {
  minChunkSize: 80,
});

const result = await generateText({
  model: buffered,
  prompt: "Write a story about...",
});
```

## Breaking Changes from Upstream

- ESM only (matching upstream v3+)
- Deprecated type aliases removed from index exports
- Internal chunk type assertion cleaned up (no more `as` cast in stream handler)

## Versioning

- This fork tracks upstream canary releases: `3.0.0-canary.x`
- Custom changes are marked in the commit history with `[fork]` prefix

## Dependencies

> ⚠️ This package uses canary dependencies: `@ai-sdk/provider@4.0.0-canary.x` and `@ai-sdk/provider-utils@5.0.0-canary.x`. These are pre-release versions and may break on update. Pin versions carefully.

- **zod** ^3.25.76 (or ^4.1.8 compatible)
- **@ai-sdk/provider** — canary
- **@ai-sdk/provider-utils** — canary

## License

[MIT](https://github.com/sandikodev/baseten-workspace-manager/blob/main/LICENSE) — Same as upstream.
