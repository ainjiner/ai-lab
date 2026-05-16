#!/usr/bin/env bun

import type { Server } from "bun";

const BASETEN_ORIGIN = "https://inference.baseten.co";
const PORT = 8899;
const BUFFER_THRESHOLD = 80;
const REASONING_THRESHOLD = 40;

const server = Bun.serve({
  port: PORT,
  idleTimeout: 255,
  async fetch(req, srv) {
    const url = new URL(req.url);
    const target = new URL(url.pathname + url.search, BASETEN_ORIGIN);

    console.log(`\n─── ${req.method} ${url.pathname} ───`);

    const headers = new Headers(req.headers);
    headers.delete("host");

    const isStream = url.pathname.includes("/chat/completions");

    if (!isStream) {
      const res = await fetch(target.href, {
        method: req.method,
        headers,
        body: req.body,
      });
      console.log(`  → ${res.status}`);
      return res;
    }

    srv.timeout(req, 0);

    const res = await fetch(target.href, {
      method: req.method,
      headers,
      body: req.body,
    });

    if (!res.body) {
      console.log(`  → ${res.status} (no body)`);
      return res;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let lineBuf = "";
    let contentBuf = "";
    let reasoningBuf = "";

    const transform = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();

        function emit(data: string) {
          controller.enqueue(enc.encode(data));
        }

        function flushContent() {
          if (!contentBuf) return;
          emit(`data: ${JSON.stringify({
            choices: [{ index: 0, delta: { content: contentBuf } }]
          })}\n\n`);
          console.log(`  [buf] CONTENT: ${contentBuf.length} chars`);
          contentBuf = "";
        }

        function flushReasoning() {
          if (!reasoningBuf) return;
          emit(`data: ${JSON.stringify({
            choices: [{ index: 0, delta: { reasoning_content: reasoningBuf } }]
          })}\n\n`);
          console.log(`  [buf] REASONING: ${reasoningBuf.length} chars`);
          reasoningBuf = "";
        }

        function flushAll() {
          flushReasoning();
          flushContent();
        }

        function processLine(line: string) {
          const trimmed = line.trim();
          if (!trimmed) return;

          if (!trimmed.startsWith("data: ")) {
            emit(line + "\n");
            return;
          }

          const raw = trimmed.slice(6);

          if (raw === "[DONE]") {
            flushAll();
            emit("data: [DONE]\n\n");
            console.log(`  [DONE]`);
            return;
          }

          let json: Record<string, unknown>;
          try {
            json = JSON.parse(raw);
          } catch {
            emit(line + "\n");
            return;
          }

          const choice = json.choices?.[0];
          const delta = choice?.delta;

          if (!delta) {
            emit(line + "\n");
            return;
          }

          const content = delta.content as string | undefined;
          const reasoning = delta.reasoning_content as string | undefined;
          const finishReason = choice?.finish_reason;
          const toolCalls = delta.tool_calls as unknown[];
          const functionCall = delta.function_call;
          const hasToolCalls = (toolCalls && toolCalls.length > 0) || functionCall;

          if (hasToolCalls) {
            flushAll();
            emit(line + "\n");
            console.log(`  [tool] pass through`);
            return;
          }

          if (content) {
            contentBuf += content;
            if (contentBuf.length >= BUFFER_THRESHOLD || finishReason) {
              flushContent();
              if (finishReason) {
                emit(`data: ${JSON.stringify({
                  choices: [{ index: 0, delta: {}, finish_reason: finishReason }]
                })}\n\n`);
              }
            }
          }

          if (reasoning) {
            reasoningBuf += reasoning;
            if (reasoningBuf.length >= REASONING_THRESHOLD) {
              flushReasoning();
            }
          }

          if (!content && !reasoning) {
            emit(line + "\n");
          }
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              if (lineBuf) processLine(lineBuf);
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            lineBuf += chunk;

            const lines = lineBuf.split("\n");
            lineBuf = lines.pop() || "";

            for (const line of lines) {
              processLine(line);
            }
          }

          flushAll();
          console.log(`  ─── Stream complete ───`);
        } catch (e) {
          console.error(`  [error] ${e}`);
          flushAll();
        } finally {
          try { reader.cancel(); } catch {}
          try { controller.close(); } catch {}
        }
      }
    });

    return new Response(transform, {
      status: res.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  },
});

console.log(`
╔════════════════════════════════════════════════════════╗
║  SSE Buffer Proxy v2                                   ║
║  Listening on http://127.0.0.1:${PORT}                       ║
║  Content threshold: ${BUFFER_THRESHOLD} chars                  ║
║  Reasoning threshold: ${REASONING_THRESHOLD} chars                 ║
╚════════════════════════════════════════════════════════╝
`);
