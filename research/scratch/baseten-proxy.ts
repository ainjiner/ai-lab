#!/usr/bin/env bun
/**
 * Baseten SSE Proxy
 *
 * Intercepts raw SSE communication between opencode and Baseten inference endpoint.
 * Logs every SSE chunk to /tmp/opencode/baseten-sse.log for analysis.
 *
 * Usage:
 *   bun /tmp/opencode/baseten-proxy.ts
 *
 * Then set opencode.json baseten-production baseURL to http://127.0.0.1:9999/v1
 */

const PORT = 9999
const TARGET = "https://inference.baseten.co"
const LOG = "/tmp/opencode/baseten-sse.log"

const logFile = Bun.file(LOG).writer()

function log(line: string) {
  const ts = new Date().toISOString()
  const entry = `[${ts}] ${line}\n`
  process.stdout.write(entry)
  logFile.write(entry)
}

function logChunk(direction: "REQ" | "SSE" | "RAW", data: string) {
  const trimmed = data.trimEnd()
  if (!trimmed) return
  log(`${direction} ${trimmed}`)
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const targetURL = `${TARGET}${url.pathname}${url.search}`

    log(`→ ${req.method} ${url.pathname}`)

    // Forward headers, strip host
    const headers = new Headers(req.headers)
    headers.set("host", new URL(TARGET).host)

    const body = req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined

    // Log request body if JSON
    if (body && headers.get("content-type")?.includes("application/json")) {
      try {
        const txt = new TextDecoder().decode(body)
        const parsed = JSON.parse(txt)
        // Only log model and stream flag — not full messages (too verbose)
        log(`REQ model=${parsed.model} stream=${parsed.stream} msgs=${parsed.messages?.length}`)
      } catch {}
    }

    const upstream = await fetch(targetURL, {
      method: req.method,
      headers,
      body,
    })

    log(`← ${upstream.status} ${upstream.headers.get("content-type")}`)

    const isSSE = upstream.headers.get("content-type")?.includes("text/event-stream")

    if (!isSSE || !upstream.body) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: upstream.headers,
      })
    }

    // SSE: intercept each chunk while forwarding
    const [forClient, forLog] = upstream.body.tee()

    // Process log stream in background
    ;(async () => {
      const reader = forLog.getReader()
      const decoder = new TextDecoder()
      let buf = ""
      let chunkCount = 0
      let reasoningChunks = 0
      let textChunks = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split("\n")
        buf = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const raw = line.slice(6).trim()
          if (raw === "[DONE]") {
            log(`SSE [DONE] — total=${chunkCount} reasoning=${reasoningChunks} text=${textChunks}`)
            continue
          }
          try {
            const chunk = JSON.parse(raw)
            const delta = chunk.choices?.[0]?.delta
            if (!delta) continue

            chunkCount++

            const reasoning = delta.reasoning_content ?? delta.reasoning
            const content = delta.content

            if (reasoning != null) {
              reasoningChunks++
              logChunk("SSE", `reasoning_content(${String(reasoning).length}chars): ${JSON.stringify(reasoning)}`)
            }
            if (content != null) {
              textChunks++
              logChunk("SSE", `content(${String(content).length}chars): ${JSON.stringify(content)}`)
            }
          } catch {
            logChunk("RAW", line)
          }
        }
      }
      await logFile.flush()
    })()

    return new Response(forClient, {
      status: upstream.status,
      headers: upstream.headers,
    })
  },
})

log(`Baseten proxy listening on http://127.0.0.1:${PORT}`)
log(`Forwarding to ${TARGET}`)
log(`Logging SSE to ${LOG}`)
log(`─────────────────────────────────────────────`)
