# Contributing to AI Lab

Thank you for your interest in contributing to AI Lab! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## Getting Started

### Prerequisites

- **Bun** >= 1.2 (runtime + package manager)
- **Node** >= 22 (for compatibility with some tools)
- **TypeScript** 5.x

### Development Setup

```bash
# Clone the repo
git clone https://github.com/ainjiner/ai-lab.git
cd ai-lab

# Install all dependencies
bun install

# Build core engine (required before running anything)
bun run build:core

# Start API server (port 4321)
bun run api

# Start Web UI (separate terminal, port 5173)
bun run dev:web
```

### Package Structure

```
packages/
├── core/                  # @ml-engine/core — engine with all business logic
│   ├── src/
│   │   ├── provider-registry/  # 10 built-in providers, instance management
│   │   ├── model-catalog/      # Model discovery, search, compare, recommend
│   │   ├── config-manager/     # Config sync to OpenCode, Cursor, Continue, Aider
│   │   ├── experiments/        # Experiment CRUD and comparison
│   │   ├── analytics/          # Usage tracking, cost projections, budgets
│   │   ├── orchestration/      # OMO agent/skill reader
│   │   ├── store/              # SQLite persistence (bun:sqlite)
│   │   └── utils/              # Env import, export/import
│   └── dist/                   # Built output (run build:core first)
│
├── api/                   # @ml-engine/api — Hono REST API server
│   └── src/routes/        # All API route handlers
│
├── cli/                   # @ml-engine/cli — CLI tool (30+ commands)
│   └── src/               # Single-file CLI with all command handlers
│
├── openai-compatible/     # @ai-lab/openai-compatible — forked AI SDK
│   └── src/               # Forked @ai-sdk/openai-compatible with minChunkSize fix
│
└── sse-proxy/             # DEPRECATED — legacy SSE proxy, kept for reference

apps/
└── web/                  # @ml-engine/web — Web UI (Qwik + Tailwind)
    └── src/
        ├── components/   # Reusable Qwik components (31 UI components + Logo)
        ├── routes/       # 28 page routes (dashboard, models, playground, explorer, marketplace, ...)
        ├── routes/layout.tsx  # Root layout (sidebar, nav, command palette)
        └── lib/          # API client, hooks, types, color-maps

src-tauri/                # PLANNED — Tauri desktop shell (waiting for contributor)
```

### Dependency Order

When making changes, build packages in this order:

```bash
# 1. Core must build first (everything depends on it)
bun run build:core

# 2. CLI and API depend on core
# (they reference @ml-engine/core which resolves to dist/)

# 3. Web UI uses API via HTTP — no direct dependency on core
```

## Development Workflow

### Making Changes

1. **Find an issue** — Check the [Issues](https://github.com/ainjiner/ai-lab/issues) tab
2. **Fork the repo** — Create your own fork
3. **Create a branch** — `git checkout -b feat/your-feature` or `fix/your-fix`
4. **Make changes** — Follow the code style guide below
5. **Test your changes** — See Testing section
6. **Submit a PR** — Open a pull request with a clear description

### Areas We Need Help

- 🖥️ **Tauri Desktop App** — Port Web UI to Tauri for native performance, filesystem access, system tray
- 🔌 **Provider integration** — Add support for new AI providers
- 🎨 **Web UI enhancement** — New components, pages, UX improvements
- 📊 **Analytics visualization** — New cost/token/tracing charts
- 📖 **Documentation & tutorials**
- 🧪 **Test coverage**

### Code Style

- **TypeScript** — Strict mode. No `any` unless absolutely necessary.
- **No Zod** — Core engine uses pure TypeScript interfaces. Do not add Zod to core packages.
- **No CommonJS** — ESM only (`import`/`export`). No `require()`, no `module.exports`.
- **Formatting** — Use consistent indentation (2 spaces). Follow existing patterns.
- **Imports** — Group and order: built-in → npm packages → local imports.
- **Naming** — camelCase for variables/functions, PascalCase for classes/types, kebab-case for files.
- **Comments** — Minimal. Code should be self-documenting. Only add comments for non-obvious logic.

### Commit Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add model recommendation by task type
fix: correct route ordering for compare endpoints
docs: update README with OpenCode-native section
refactor: extract provider scanning to separate method
chore: update dependencies
```

### Testing

```bash
# Run all tests
bun test

# Run tests for a specific package
bun run --filter '@ml-engine/core' test

# Test the API locally
bun run api &
curl http://localhost:4321/api/health
kill %1

# Test the CLI
bun run cli provider list
bun run cli model list
```

## Pull Request Process

1. **Ensure your branch is up to date** with main
2. **Run all tests** — `bun test`
3. **Build** — `bun run build` (verifies all packages compile)
4. **Describe your changes** — What, why, and how to test
5. **Add screenshots** if your change affects the Web UI

### PR Template

```markdown
## Description
Brief description of the change.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring
- [ ] Other

## Testing
How was this tested?

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style
- [ ] Tests pass
- [ ] Documentation updated
```

## Reporting Issues

When reporting bugs, include:

1. **Environment** — OS, Bun version, Node version
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Relevant logs or output**

## Feature Requests

Open an issue with:

1. **Clear title** describing the feature
2. **Use case** — Why is this valuable?
3. **Proposed solution** — How should it work?
4. **Alternatives considered** — What else could work?

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
