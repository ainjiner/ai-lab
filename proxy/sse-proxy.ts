#!/usr/bin/env bun
/**
 * SSE Stream Inspector + Content Buffer Proxy
 * 
 * Usage:
 *   bun run sse-proxy.ts
 *
 * Starts on :8899 — point opencode.json baseURL to http://127.0.0.1:8899/v1
 */

import type { Server } from "bun";

const BASETEN_ORIGIN = "https://inference.baseten.co";
const PORT = 8899;
const BUFFER_THRESHOLD = 80;
const FLUSH_AT_SENTENCE = true;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const target = new URL(url.pathname + url.search, BASETEN_ORIGIN);

    console.log(`\n─── ${req.method} ${url.pathname} ───`);

    const headers = new Headers(req.headers);
    headers.delete("host");

    const isStream =
      req.headers.get("accept") === "text/event-stream" ||
      url.pathname.includes("/chat/completions");

    if (!isStream) {
      const res = await fetch(target.href, {
        method: req.method,
        headers,
        body: req.body,
      });
      const text = await res.clone().text();
      console.log(`  → ${res.status} ${text.length} bytes`);
      return res;
    }

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
    let buf = "";
    let contentBuf = "";
    let reasoningBuf = "";
    let eventCount = 0;

    const transform = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();

        function emitSSE(data: string) {
          try {
            controller.enqueue(enc.encode(`data: ${data}\n\n`));
          } catch (e) {
            console.error(`  [error] Failed to emit SSE: ${e}`);
          }
        }

        function shouldFlush(text: string): boolean {
          if (text.length >= BUFFER_THRESHOLD) return true;
          if (FLUSH_AT_SENTENCE && /[.!?]\s*$/.test(text) && text.length > 20) return true;
          return false;
        }

        let pendingFinishReason: string | null = null;

        function flushContent() {
          if (!contentBuf) return;
          const choice: Record<string, unknown> = {
            index: 0,
            delta: { content: contentBuf },
          };
          if (pendingFinishReason) {
            choice.finish_reason = pendingFinishReason;
            pendingFinishReason = null;
          }
          const payload = JSON.stringify({ choices: [choice] });
          emitSSE(payload);
          console.log(
            `  [buf] CONTENT: ${contentBuf.length} chars | ${
              contentBuf.split(/\s+/).filter(Boolean).length
            } words${choice.finish_reason ? ` | finish_reason: ${choice.finish_reason}` : ""}`
          );
          contentBuf = "";
        }

        function flushReasoning() {
          if (!reasoningBuf) return;
          const payload = JSON.stringify({
            choices: [{ delta: { reasoning_content: reasoningBuf } }],
          });
          emitSSE(payload);
          console.log(
            `  [buf] REASONING: ${reasoningBuf.length} chars | ${
              reasoningBuf.split(/\s+/).filter(Boolean).length
            } words`
          );
          reasoningBuf = "";
        }

        function flushAll() {
          flushReasoning();
          flushContent();
        }

        function safeParseJSON(raw: string): Record<string, unknown> | null {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buf += chunk;

          const lines = buf.split("\n");
          buf = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (!trimmedLine) continue;
            
            if (!trimmedLine.startsWith("data: ")) {
              continue;
            }

            const raw = trimmedLine.slice(6);
            eventCount++;

            if (raw === "[DONE]") {
              flushAll();
              emitSSE("[DONE]");
              console.log(`  [${eventCount}] [DONE]`);
              continue;
            }

            const json = safeParseJSON(raw);
            
            if (!json) {
              console.log(`  [${eventCount}] (invalid JSON, skipping): ${raw.slice(0, 60)}...`);
              continue;
            }

            const choice = json.choices?.[0];
            const delta = choice?.delta;

            if (!delta) {
              if (json.id || json.model || json.object) {
                emitSSE(raw);
              }
              continue;
            }

            const content = delta.content || "";
            const reasoning = delta.reasoning_content || "";
            const finishReason = choice?.finish_reason || null;
            const ts = Date.now();

            if (reasoning) {
              reasoningBuf += reasoning;
              console.log(
                `  [${eventCount}] @${ts} | +${reasoning.length} chars | buf: ${reasoningBuf.length} [REASONING]`
              );
              if (shouldFlush(reasoningBuf)) {
                flushReasoning();
              }
            }

            if (content) {
              contentBuf += content;
              if (finishReason) pendingFinishReason = finishReason;

              const wordCount = content.split(/\s+/).filter(Boolean).length;
              console.log(
                `  [${eventCount}] @${ts} | +${content.length} chars (${wordCount} word(s)) | buf: ${contentBuf.length}${finishReason ? ` | finish_reason: ${finishReason}` : ""}`
              );

              if (shouldFlush(contentBuf) || finishReason) {
                flushContent();
              }
            }

            if (!content && !reasoning && !delta.tool_calls && !delta.function_call) {
              emitSSE(raw);
            }
          }
        }

        flushAll();
        console.log(`\n─── Stream complete: ${eventCount} raw events ───`);
        controller.close();
      },
    });

    const responseHeaders = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    return new Response(transform, {
      status: res.status,
      headers: responseHeaders,
    });
  },
});

console.log(`
╔════════════════════════════════════════════════════════╗
║  SSE Stream Inspector + Content Buffer Proxy          ║
║  Listening on http://127.0.0.1:${PORT}                       ║
║  Buffer threshold: ${BUFFER_THRESHOLD} chars                  ║
║  Flush on sentence: ${FLUSH_AT_SENTENCE}                       ║
║                                                        ║
║  Point Baseten config to:                              ║
║    http://127.0.0.1:8899/v1                            ║
╚════════════════════════════════════════════════════════╝
`);
