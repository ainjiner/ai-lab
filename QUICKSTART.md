# AI Lab — 5-Minute Quick Start Guide

Welcome to **AI Lab**! Follow this step-by-step guide to get from a fresh clone to a running, synced local playground in under 5 minutes.

---

## 🚀 Step 1: Clone and Install

Ensure you have [Bun](https://bun.sh) (v1.2 or higher) installed on your system.

```bash
# 1. Clone the repository
git clone https://github.com/ainjiner/ai-lab.git
cd ai-lab

# 2. Install monorepo dependencies
bun install

# 3. Build the core package
bun run build:core
```

---

## 🔌 Step 2: Configure Your First Provider

Add your favorite LLM provider using the unified CLI tool. We will use Anthropic as our baseline provider:

```bash
# Add Anthropic instance
bun run cli provider add anthropic personal YOUR_ANTHROPIC_API_KEY
```

> **Note:** Replace `YOUR_ANTHROPIC_API_KEY` with your actual Anthropic console API key.

---

## 🔍 Step 3: Scan Available Models

Instruct the platform to scan the connection target and discover active models automatically:

```bash
# Automatically discover and import provider models
bun run cli provider scan anthropic-personal
```

---

## 🎭 Step 4: Sync Instantly with Your AI Editor

Sync your discovered models and credentials seamlessly to **OpenCode**, Cursor, Aider, or Continue in a single command, without ever editing configurations by hand:

```bash
# Synchronize models and auth credentials directly to OpenCode
bun run cli config sync opencode
```

---

## 🖥️ Step 5: Start the Platform

Run both the REST API server and the beautiful graphical dashboard simultaneously:

```bash
# Start API (port 4321) and Qwik Web UI (port 5173) concurrently
bun run dev
```

---

## 🎯 Verification Links

Once the servers are online, you can immediately verify health metrics and browse the platform:

- 📊 **Observability API Health Check:** [http://localhost:4321/api/health](http://localhost:4321/api/health)
- 🖥️ **Graphical Dashboard Panel:** [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Available CLI Command Reference

Manage your platform resources easily directly from the command line:

```bash
# List all configured instances
bun run cli provider instances

# Test api connection
bun run cli provider test anthropic-personal

# List all discovered models
bun run cli model list

# Sync all enabled editor configurations
bun run cli config sync --all
```

You are now fully set up! Browse your models, benchmark prompt latency via Experiments, and track your local spending and tokens analytics in one unified dashboard.
