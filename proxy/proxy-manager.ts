#!/usr/bin/env bun
/**
 * LLM Proxy Manager
 * 
 * Usage:
 *   bun run proxy-manager.ts start
 *   bun run proxy-manager.ts stop
 *   bun run proxy-manager.ts status
 *   bun run proxy-manager.ts toggle
 */

import { $ } from "bun";

const PROXY_PORT = 8899;
const PROXY_SCRIPT = import.meta.dir + "/sse-proxy.ts";
const PID_FILE = "/tmp/sse-proxy.pid";

interface ProcessInfo {
  pid: number;
  command: string;
}

async function getProxyProcess(): Promise<ProcessInfo | null> {
  try {
    const result = await $`lsof -i :${PROXY_PORT} -t`.quiet();
    const pid = parseInt(result.text().trim());
    if (isNaN(pid)) return null;
    
    const cmdResult = await $`ps -p ${pid} -o comm=`.quiet();
    return {
      pid,
      command: cmdResult.text().trim()
    };
  } catch {
    return null;
  }
}

async function startProxy(): Promise<void> {
  const existing = await getProxyProcess();
  if (existing) {
    console.log(`⚠️  Proxy already running (PID: ${existing.pid})`);
    return;
  }

  console.log("🚀 Starting SSE proxy...");
  
  const proc = Bun.spawn(["bun", "run", PROXY_SCRIPT], {
    detached: true,
    stdout: "ignore",
    stderr: "ignore",
  });

  await Bun.write(PID_FILE, proc.pid.toString());
  
  await new Promise(r => setTimeout(r, 1000));
  
  const check = await getProxyProcess();
  if (check) {
    console.log(`✅ Proxy started (PID: ${check.pid})`);
    console.log(`   Listening on http://127.0.0.1:${PROXY_PORT}`);
  } else {
    console.log("❌ Failed to start proxy");
  }
}

async function stopProxy(): Promise<void> {
  const existing = await getProxyProcess();
  if (!existing) {
    console.log("⚠️  Proxy not running");
    return;
  }

  console.log(`🛑 Stopping proxy (PID: ${existing.pid})...`);
  
  try {
    await $`kill ${existing.pid}`.quiet();
    await new Promise(r => setTimeout(r, 500));
    
    const check = await getProxyProcess();
    if (!check) {
      console.log("✅ Proxy stopped");
      await $`rm -f ${PID_FILE}`.quiet();
    } else {
      console.log("⚠️  Proxy still running, force killing...");
      await $`kill -9 ${existing.pid}`.quiet();
    }
  } catch (e) {
    console.log(`❌ Failed to stop: ${e}`);
  }
}

async function proxyStatus(): Promise<void> {
  const existing = await getProxyProcess();
  
  console.log("\n📊 LLM Proxy Status\n");
  
  if (existing) {
    console.log(`  Status: ✅ Running`);
    console.log(`  PID: ${existing.pid}`);
    console.log(`  Port: ${PROXY_PORT}`);
    console.log(`  URL: http://127.0.0.1:${PROXY_PORT}/v1`);
  } else {
    console.log(`  Status: ❌ Not running`);
    console.log(`  Port: ${PROXY_PORT} (available)`);
  }
  
  console.log("");
}

async function toggleProxy(): Promise<void> {
  const existing = await getProxyProcess();
  if (existing) {
    await stopProxy();
  } else {
    await startProxy();
  }
}

function printUsage(): void {
  console.log(`
📊 LLM Proxy Manager

Usage:
  bun run proxy-manager.ts <command>

Commands:
  start     Start the SSE proxy
  stop      Stop the SSE proxy
  status    Check proxy status
  toggle    Toggle proxy on/off

Examples:
  bun run proxy-manager.ts start
  bun run proxy-manager.ts stop
  bun run proxy-manager.ts status
  bun run proxy-manager.ts toggle
`);
}

const [,, command] = process.argv;

switch (command) {
  case "start":
    await startProxy();
    break;
  case "stop":
    await stopProxy();
    break;
  case "status":
    await proxyStatus();
    break;
  case "toggle":
    await toggleProxy();
    break;
  default:
    printUsage();
}
