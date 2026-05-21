# Changelog

All notable changes to the **AI Lab** platform will be documented in this file.

---

## [0.1.0] — 2026-05-17 (First Stable Release)

This is the first official stable release of **AI Lab** (previously `ML Engine`) — a local-first, desktop-native ML/LLM engineering platform. It features complete provider registries, automatic model scanning, instant AI editor config synchronization, interactive prompt experiments, detailed spending cost/token observabilities, and full OMO/Obra agent switchers.

### Added

#### 1. Core Architecture & Storage
- **Local-first SQLite Store:** Multi-migration database engine mapping provider metadata, api credentials, scanned models, alias bindings, experimental results, and spending budgets.
- **Auto-Environment Key Import:** Seamless environment variable scanner (`PROVIDER_*_API_KEY`) to auto-populate registries on initial start.
- **Graceful Termination Signals:** Native `SIGINT` / `SIGTERM` process listeners on the Hono server to safely close active SQLite connection pools.

#### 2. Provider & Model Catalogs
- **Ten Built-in Providers:** Ready-made connections supporting Baseten, OpenRouter, Together, Fireworks, Groq, Anthropic, OpenAI, Google, DeepSeek, and Ollama.
- **Interactive Scanners:** Automatic model discoverer querying provider APIs and registering exact pricing structure, capability tags, and context bounds.
- **Model Comparison Diff Table:** Interactive comparison matrix detailing cost ratios, pricing splits, capacity multipliers, and capability benchmarks.
- **Model Alias bindings:** Create custom mappings to assign custom aliases to models dynamically.

#### 3. Single-Command Configuration Syncs
- **AI Editor Integrations:** programmatically generated target configurations mapping to OpenCode, Cursor, Continue, and Aider formats.
- **Secure Validations:** Added validation tests (`POST /config/targets/:id/validate`) verifying target schema formats.
- **Configuration Preview Overlay:** monospaced modal diff rendering masked credentials and proposed target JSON modifications.
- **Audit Sync History:** Persisted timestamps (`lastSynced`) mapping every successful sync.

#### 4. Observation Logs & Observability
- **Premium observational request tracing log:** Renders latency records, prompt/completion splits, exact spending costs, and full JSON metadata trees.
- **Trace Accordion Drawer:** Expandable accordions detailing custom api headers and deep linkbacks straight to active experiments.
- **Client-side JSON and CSV Exports:** High-speed CSV/JSON exports built purely client-side using JavaScript `Blob` data streams.

#### 5. Cost Analytics & Spending Budgets
- **Visual Pill Period Selectors:** Dynamic selectors adjusting charts and spent tracking by Daily, Weekly, and Monthly scopes.
- **Proportional Pure CSS Bar Charts:** Responsive bar metrics showing model and provider spend distributions using relative width styling—avoiding heavy chart libraries.
- **Spend Trend Indicators:** Colorful caret indicator metrics comparing current spend to prior periods.
- **Budget Creator Wizard:** Visual lists with custom status progress bars (emerald under 80%, orange 80-100%, red over 100%).

#### 6. Dynamic Orchestrator Command Center (OMO & Obra)
- **Automatic Detections:** Real-time files scanner detecting superpower agents (`oh-my-openagent.json`, `superpower.json`, `obra.json`).
- **Config Swapping engine:** Interactive switcher allowing developers to swap agents and skills on the fly (`POST /orchestration/switch`) with automated backups.
- **Interactive Agent CRUD:** Visual control interface to register, modify, type-select, model-bind, and delete agent profiles.

### Security
- Monospaced JSON code blocks and previews mask api credentials and keys (`${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`) for privacy.
- Application binds strictly to local interfaces (`localhost`) out-of-the-box.

### Contributors
- **sandikodev** and the AI Lab open-source community.
