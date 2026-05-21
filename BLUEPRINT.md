# BLUEPRINT.md — AI Lab: The Giant Brain

> **Dokumen ini adalah cetak biru utama.** Semua keputusan strategis, arsitektur, dan rencana pengembangan AI Lab terdokumentasi di sini.
>
> Dibuat dari percakapan 21 Mei 2026. Terakhir diperbarui: 21 Mei 2026.

---

## Daftar Isi

1. [Prolog: Percakapan yang Melahirkan Dokumen Ini](#1-prolog)
2. [Tiga Opsi Strategis](#2-tiga-opsi-strategis)
3. [Visi: AI Knowledge + Talent Graph](#3-visi)
4. [Arsitektur Hybrid: Local + Edge Cloud](#4-arsitektur)
5. [Peta Fase Pengembangan](#5-peta-fase)
6. [Kondisi Saat Ini](#6-kondisi-saat-ini)
7. [Cetak Biru Teknis per Komponen](#7-cetak-biru-teknis)
8. [Prinsip yang Tidak Boleh Dilanggar](#8-prinsip)
9. [Lampiran](#9-lampiran)

---

## 1. Prolog: Percakapan yang Melahirkan Dokumen Ini

### 1.1. Kronologi

Percakapan 21 Mei 2026 dimulai dari sesi pengembangan rutin — audit dan perbaikan UI. Namun berkembang menjadi diskusi strategis yang mendefinisikan ulang arah proyek ini.

**Fase Teknis (awal sesi):**
- Audit dan perbaiki layout playground (sidebar sticky fix)
- Unstage file-file yang diregresi (`useVisibleTask$` → `useTask$`)
- Commit strategis: 6 commit dalam grouping yang rapi (design system, backend API, route pages, layout, route enhancements, config)
- Push ke origin

**Fase Ekspansi (pertengahan sesi):**
- Bangun halaman Explorer: portal kurasi 7 kategori untuk resource AI/ML (Communities, Essential Repos, Research, Competitions, News & Media, Learning, Platforms)
- Bangun halaman Marketplace: direktori 7 kategori tool & aplikasi AI (Fine-Tuning, Inference Engines, Agent Frameworks, RAG, Evaluation, Open Web UIs, One-Click Deploy)
- Tambah "Discover" nav section di sidebar
- Buat PHILOSOPHY.md — dokumen penjelasan untuk newcomer

**Fase Strategis (akhir sesi):**
- Diskusi mendalam tentang positioning AI Lab
- Identifikasi gap antara researcher dan engineer
- Analogi era crypto: siapa pun bisa berkontribusi tanpa kredensial formal
- Keputusan: AI Lab akan berkembang dari LLM Ops dashboard (Opsi A) menjadi AI Knowledge + Talent Graph (Opsi B)
- Definisi arsitektur hybrid: local SQLite untuk data pribadi + Edge Cloud 24/7 untuk data publik

### 1.2. Insight Kunci

> "Saya melihat gaps yang cukup signifikan di antara researcher yang release paper/jurnal di arxiv, researchgate, atau apapun itu tapi mereka juga kesulitan menemukan sumber daya yang bisa mereka rekrut, sedangkan realita teknis lapangan sebenarnya banyak sekali engineer/developer namun juga belum sepenuhnya adopt AI/ML/LLM engineering sebagai fokus pencaharian utama atau lebih sering untuk research sendiri/hobi/passion tapi juga bingung mau menjualkannya kemana."

> "Saya ingin masuk ke industri ini, tapi saya sendiri juga bingung tentang bagaimana prospek pekerjaannya, bagaimana cara membangun resume dan portfolionya."

> "Setiap orang bisa melihat paper/research terkini untuk kita semua dapat membangunnya bersama-sama dengan author/credit tetap pada penulis paper/jurnal tersebut dan setiap penelitian baik yang tertulis maupun dari yang engineering semuanya dapat terlacak. Ini seperti sistem otak besar dari semua engineer dan semua peneliti yang saling terhubung."

---

## 2. Tiga Opsi Strategis

### 2.1. Opsi A: LLM Ops Dashboard (Fondasi)

```
Posisi: OpenCode-native LLM Ops dashboard
Target: AI engineer yang pakai OpenCode
Nilai: Self-hosted, gratis, satu dashboard gantiin 5+ tools
```

**Status: INI FONDASI YANG SEDANG DIBANGUN.** Harus solid sebelum naik ke Opsi B.

| Fitur | Status |
|-------|--------|
| Provider Management (10 provider, multi-instance) | ✅ |
| Model Catalog (search, compare, aliases) | ✅ |
| Config Sync (OpenCode, Cursor, Continue, Aider) | ✅ |
| Cost Analytics (breakdown, projection, budgets) | ✅ |
| Experiment Tracking (create, run, compare) | ✅ |
| Tracing (request logs, latency, tokens) | ✅ |
| Orchestration Dashboard (OMO agents/skills) | ✅ |
| Playground (chat UI) | ✅ UI, ⬜ real streaming |
| Prompts Management (CRUD templates) | ⬜ |
| Evaluation (scoring, regression detection) | ⬜ |

### 2.2. Opsi B: AI Knowledge + Talent Graph (Target)

```
Posisi: Platform yang menghubungkan researcher dan engineer
Target: Researcher yang butuh talent + Engineer yang mau professionalize
Nilai: Research + Engineering terlacak, skill terverifikasi, job matching akurat

Tiga layer:
  Layer 1 — Research Graph: Paper, author, citation, implementation
  Layer 2 — Talent Graph: Engineer, skill, portfolio, experiment
  Layer 3 — Connection Engine: Matching, notification, credit tracking
```

**Status: INI ARAH JANGKA PANJANG.** Mulai dibangun setelah Opsi A solid.

### 2.3. Opsi C: AI Education OS

```
Posisi: AI Lab + 2USE sebagai platform pendidikan AI
Target: Institusi pendidikan, bootcamp, corporate training
Nilai: Learn → Build → Showcase → Get Hired
```

**Status: DIPERTIMBANGKAN UNTUK INTEGRASI 2USE.** Bisa jadi pivot terpisah atau complementary product.

### 2.4. Keputusan

**Arah: Opsi A → Opsi B.** Fondasi LLM Ops dibangun dulu sebagai daily driver yang usable. Lalu bertahap berkembang menjadi AI Knowledge + Talent Graph. Opsi C (2USE) jalan paralel sebagai produk terpisah yang consume AI Lab API.

---

## 3. Visi: AI Knowledge + Talent Graph

### 3.1. "The Giant Brain"

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AI LAB — Giant Brain                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ LAYER 1: RESEARCH GRAPH                                      │   │
│  │                                                               │   │
│  │  Arxiv ──→ Paper ──→ Author ──→ Citation Network             │   │
│  │  HuggingFace ──→ Daily Papers ──→ Trending Research          │   │
│  │  Semantic Scholar ──→ Full-text Search ──→ Related Work      │   │
│  │  GitHub ──→ Implementation ──→ Verified Benchmark            │   │
│  │                                                               │   │
│  │  Setiap paper punya:                                          │   │
│  │  • Author (credit tidak diambil alih)                        │   │
│  │  • Status implementasi (belum/sedang/sudah diverifikasi)     │   │
│  │  • Engineer yang mengimplementasi (link ke Talent Graph)     │   │
│  │  • Benchmark result dari implementasi                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↕                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ LAYER 2: TALENT GRAPH                                        │   │
│  │                                                               │   │
│  │  Engineer ──→ Skill Profile (auto-generated dari activity)   │   │
│  │           ──→ Portfolio (experiments, models, papers)        │   │
│  │           ──→ Verified Benchmarks (teruji, reproducible)     │   │
│  │           ──→ Reputation Score (kontribusi, kualitas)        │   │
│  │                                                               │   │
│  │  Researcher ──→ Published Papers ──→ Butuh Implementor       │   │
│  │                                                               │   │
│  │  Company ──→ Job Listing (spesifikasi skill detail)          │   │
│  │         ──→ Platform Listing (Kaggle, HF, freelance)         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↕                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ LAYER 3: CONNECTION ENGINE                                   │   │
│  │                                                               │   │
│  │  Paper X diimplementasi Engineer Y ──→ tercatat, terverifikasi│   │
│  │  Engineer Y skill match Job Z ──→ rekomendasi otomatis       │   │
│  │  Researcher A lihat siapa implement paper-nya ──→ rekrut     │   │
│  │  Paper baru di Arxiv ──→ notifikasi: "match skill kamu"     │   │
│  │  Setiap kontribusi (research + engineering) ──→ terlacak     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2. Nilai Ekonomi

| Stakeholder | Value |
|-------------|-------|
| **AI Engineer** | Portfolio auto-generated, skill terverifikasi, job matching akurat, bisa dapat bayaran dari implementasi paper |
| **Researcher** | Temukan engineer untuk implementasi paper, rekrut talent, paper lebih impactful karena ada implementasi konkret |
| **Company/Startup** | Cari AI talent dengan bukti skill konkret (bukan cuma resume), hiring lebih presisi |
| **Platform (AI Lab)** | Job matching fee, verified profile (freemium), enterprise tier untuk company |

### 3.3. Apa yang Membuat Ini Berbeda

Tidak ada platform yang menghubungkan ketiga elemen ini dalam satu sistem:

| Existing Platform | Apa yang Mereka Lakukan | Apa yang Tidak Mereka Lakukan |
|-------------------|------------------------|-------------------------------|
| **Kaggle** | Kompetisi ML | Tidak ada job matching, tidak ada paper-implementation link |
| **HuggingFace** | Model hub, datasets, papers | Tidak ada talent profile, tidak ada hiring |
| **GitHub** | Code hosting | Tidak ada skill AI spesifik, tidak ada paper connection |
| **LinkedIn** | Professional networking | Tidak ada verifikasi skill AI, self-reported semua |
| **Arxiv/Semantic Scholar** | Paper search | Tidak ada link ke implementasi atau engineer |
| **Helicone/LangFuse** | LLM observability | Tidak ada talent/research layer |

---

## 4. Arsitektur: Hybrid Local + Edge Cloud

### 4.1. Kenapa Hybrid + Desktop?

Visi "Giant Brain" tidak bisa purely local. Paper indexing, job matching, notification — semua butuh layanan yang jalan 24/7. Tapi data sensitif (API keys, usage, eksperimen pribadi) harus tetap di mesin lokal user.

Dan soal "local": ini bukan self-hosted web app. **Arah jangka panjangnya adalah Tauri desktop app** — performa native, akses filesystem, system tray. Arsitektur yang sama (REST API + Web frontend) tinggal dibungkus Tauri.

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI LAB — Hybrid Architecture                 │
│                                                                  │
│  ┌──────────────────────────┐    ┌──────────────────────────┐   │
│  │    DESKTOP (Tauri)       │    │   EDGE CLOUD (24/7)      │   │
│  │                          │    │                           │   │
│  │  • API keys              │    │  • Paper indexer          │   │
│  │  • Usage history         │◄──►│  • Research graph         │   │
│  │  • Experiments           │ API│  • Job listings           │   │
│  │  • Cost data             │    │  • Skill matching engine  │   │
│  │  • Private models        │    │  • Notification system    │   │
│  │  • Config files          │    │  • Reputation engine      │   │
│  │  • System tray           │    │  • Public profiles        │   │
│  │  • Filesystem access     │    │                           │   │
│  │                          │    │  Stack:                   │   │
│  │  Stack:                  │    │  Bun + Hono + PostgreSQL  │   │
│  │  Tauri + Qwik + Hono     │    │  + pgvector + Redis       │   │
│  │  + Bun + SQLite          │    │                           │   │
│  └──────────────────────────┘    └──────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. Tauri Desktop App (Cross-Cutting)

Tauri bukan fase terpisah — ini **cross-cutting upgrade** yang bisa dimulai kapan saja begitu ada kontributor yang mau maintain. Arsitektur yang sama tidak berubah: REST API + Web frontend, dibungkus Tauri shell.

```
┌─────────────────────────────────────────────┐
│              TAURI DESKTOP APP               │
│                                              │
│  ┌────────────────┐  ┌──────────────────┐   │
│  │  WebView       │  │  Rust Backend    │   │
│  │  (Qwik UI)     │  │  (Tauri Commands)│   │
│  │                │  │                  │   │
│  │  localhost:    │  │  • Filesystem    │   │
│  │  5173          │  │  • System tray   │   │
│  │                │  │  • Auto-start    │   │
│  └───────┬────────┘  │  • Notifications │   │
│          │           │  • Process mgmt  │   │
│          ↓           └────────┬─────────┘   │
│  ┌────────────────────────────┐             │
│  │     Bun Backend            │             │
│  │     (Hono API :4321)       │             │
│  │     + SQLite               │             │
│  └────────────────────────────┘             │
│                                              │
└─────────────────────────────────────────────┘
```

**Keuntungan Tauri vs Browser Tab:**

| Aspek | Browser Tab | Tauri Desktop |
|-------|------------|---------------|
| Memory | ~200-400MB | ~50-100MB |
| Startup | Manual (buka browser) | Auto-start with OS |
| Filesystem | Terbatas (Web API) | Full access (Rust) |
| System tray | Tidak ada | Quick access, background |
| Offline | Tergantung browser cache | Native offline |
| Update | Manual git pull | Auto-update via Tauri |
| Distribusi | `git clone && bun install` | Single binary download |

**Status:** Planned. Menunggu kontributor Tauri. Kalau ada yang mau maintain layer Tauri (`src-tauri/`), kita langsung porting.

### 4.3. Pembagian Tanggung Jawab

| Data | Tempat | Alasan |
|------|--------|--------|
| API keys provider | **Desktop only** | Kredensial sensitif, tidak pernah dikirim ke cloud |
| Usage history | **Desktop** | Data pribadi, tapi bisa di-share opsional untuk portfolio |
| Experiments | **Desktop** | Hasil eksperimen privat, publish opsional |
| Cost data | **Desktop** | Tracking budget personal |
| ──────── | ──── | ──── |
| Paper metadata | **Cloud** | Data publik, perlu di-crawl 24/7 |
| Citation graph | **Cloud** | Data publik, komputasi berat |
| Job listings | **Cloud** | Agregasi dari berbagai sumber |
| Public profiles | **Cloud** | Engineer/researcher profile publik |
| Skill embeddings | **Cloud** | Vector search butuh GPU/API |
| Reputation scores | **Cloud** | Komputasi aggregate lintas user |
| Notifications | **Cloud** | Push event ke user |

### 4.4. Edge Cloud Infrastructure (Minimal Viable)

Untuk early stage, edge cloud cukup 1 VPS:

```yaml
Compute: 1 VPS (4 vCPU, 8GB RAM, 80GB SSD) — ~$20-40/bulan
Database: PostgreSQL + pgvector (untuk embedding search)
Cache: Redis (untuk rate limiting + job queue)
Cron: Bun scripts untuk:
  - Arxiv RSS crawler (setiap jam)
  - HF Daily Papers API (setiap hari)
  - Semantic Scholar citation sync (setiap minggu)
  - Job board scraper (setiap 6 jam)
Deploy: Docker Compose di VPS, atau Railway/Render untuk simplicity
```

---

## 5. Peta Fase Pengembangan

### Fase 0: Fondasi LLM Ops (Q2 2026) — **SEDANG BERJALAN**

**Tujuan:** AI Lab menjadi daily driver yang usable untuk AI engineer.

| ID | Item | Status | Prioritas |
|----|------|--------|-----------|
| F0.1 | Provider management (add, test, scan, remove) | ✅ Done | P0 |
| F0.2 | Model catalog (search, compare, aliases) | ✅ Done | P0 |
| F0.3 | Config sync (OpenCode, Cursor, Continue, Aider) | ✅ Done | P0 |
| F0.4 | Cost analytics (breakdown, projection, budgets) | ✅ Done | P0 |
| F0.5 | Experiment tracking (create, run, compare) | ✅ Done | P0 |
| F0.6 | Tracing (request logs) | ✅ Done | P0 |
| F0.7 | Orchestration dashboard (agents, skills) | ✅ Done | P0 |
| F0.8 | Design system (31 components) | ✅ Done | P0 |
| F0.9 | Root layout (sidebar, navigation, command palette) | ✅ Done | P0 |
| F0.10 | 13 route pages (all sections) | ✅ Done | P0 |
| F0.11 | Skeleton loaders + error handling di semua page | ✅ Done | P0 |
| F0.12 | Explorer page (static curated) | ✅ Done | P1 |
| F0.13 | Marketplace page (static curated) | ✅ Done | P1 |
| F0.14 | Playground — real SSE streaming | ✅ Done | P0 |
| F0.15 | Prompts — template CRUD | ✅ Done | P1 |
| F0.16 | Evaluation — scoring, regression detection | ⬜ Todo | P2 |

### Fase 1: Live Explorer + Paper Indexer (Q3 2026)

**Tujuan:** Explorer berubah dari static curated menjadi live research feed. Edge cloud pertama kali dihidupkan.

| ID | Item | Dependensi |
|----|------|------------|
| F1.1 | Edge cloud infra (1 VPS, PostgreSQL, Redis) | — |
| F1.2 | Arxiv RSS crawler (cron, simpan ke DB) | F1.1 |
| F1.3 | HuggingFace Daily Papers API → auto-populate Explorer | F1.1 |
| F1.4 | Semantic Scholar citation graph sync | F1.1 |
| F1.5 | Explorer UI: dynamic (API-driven, bukan static data) | F1.2, F1.3 |
| F1.6 | Paper detail page (`/papers/:id`) | F1.2 |
| F1.7 | "Implement Paper" button → linked ke experiment tracker | F0.5 |
| F1.8 | Public API: `/api/v1/papers`, `/api/v1/papers/:id` | F1.2-F1.4 |

### Fase 2: Talent Profile + Portfolio Builder (Q4 2026)

**Tujuan:** Setiap activity di AI Lab (experiments, models, paper implementations) otomatis membangun portfolio engineer.

| ID | Item | Dependensi |
|----|------|------------|
| F2.1 | User identity system (anon by default, opsional verified) | F1.1 |
| F2.2 | Engineer profile page (`/profile/:username`) | F2.1 |
| F2.3 | Auto-generated portfolio dari experiments + models | F0.5 |
| F2.4 | Paper implementation claim + verification flow | F1.7 |
| F2.5 | Skill extraction dari activity (NLP dari experiment metadata) | F1.1 |
| F2.6 | Public profile publish (opsional) | F2.2 |
| F2.7 | Researcher profile (dari paper authorship) | F1.4 |

### Fase 3: Connection Engine — Matching (2027)

**Tujuan:** Sistem mulai menghubungkan researcher, engineer, dan company.

| ID | Item | Dependensi |
|----|------|------------|
| F3.1 | Vector embeddings untuk skill ↔ paper matching | F2.5, F1.1 |
| F3.2 | Skill ↔ Job matching engine | F3.1 |
| F3.3 | Paper ↔ Engineer matching ("paper ini cocok buat kamu") | F3.1 |
| F3.4 | Job listing aggregator (scraping + manual kurasi) | F1.1 |
| F3.5 | Notification system (email + in-app) | F1.1 |
| F3.6 | Researcher → Engineer rekrut flow | F2.7, F2.2 |

### Fase 4: Reputation + Economy (2027+)

**Tujuan:** Sistem reputasi dan ekonomi yang memberi nilai pada kontribusi.

| ID | Item | Dependensi |
|----|------|------------|
| F4.1 | Reputation engine (kontribusi, kualitas, community trust) | F2.4 |
| F4.2 | Verified benchmark system | F0.16 |
| F4.3 | Bounty system (researcher kasih bounty untuk implementasi paper) | F2.7 |
| F4.4 | Job matching marketplace (fee-based) | F3.2 |
| F4.5 | Enterprise tier (company dashboard, team management) | F2.2 |

---

## 6. Kondisi Saat Ini

### 6.1. Yang Sudah Ada (per 21 Mei 2026)

```
apps/web/src/routes/
├── layout.tsx          ✅ Root layout (sidebar, nav, command palette)
├── index.tsx           ✅ Dashboard
├── models/             ✅ Model catalog
├── playground/         ✅ Chat UI (mock response, belum streaming)
├── explorer/           ✅ Portal resource AI/ML (static curated)
├── marketplace/        ✅ Direktori tools AI (static curated)
├── experiments/        ✅ Experiment tracking
├── cost/               ✅ Cost analytics
├── tokens/             ✅ Token usage
├── tracing/            ✅ Request logs
├── orchestration/      ✅ OMO agents/skills
├── integrations/       ✅ Provider management
├── settings/           ✅ Platform settings
├── datasets/           ✅ Dataset management
├── agents/             ✅ Agent dashboard
├── alerts/             ✅ Alert manager
├── annotations/        ✅ Annotations viewer
├── api-keys/           ✅ API key management
├── cache/              ✅ Cache viewer
├── embeddings/         ✅ Embeddings viewer
├── fine-tuning/        ✅ Fine-tuning jobs
├── playbooks/          ✅ Playbook editor
├── prompts/            ✅ Prompt viewer (belum CRUD)
├── reports/            ✅ Reports viewer
├── teams/              ✅ Teams manager
├── 404.tsx             ✅ Not found page
└── evaluations/        ✅ Evaluation viewer

packages/
├── core/               ✅ Provider registry, model catalog, config, analytics, experiments
├── api/                ✅ 65+ REST endpoints
├── cli/                ✅ 30+ CLI commands
└── openai-compatible/  ✅ Forked AI SDK

Design System: 31 UI components + barrel exports ✅
PHILOSOPHY.md: Dokumentasi untuk newcomer ✅
BLUEPRINT.md: Dokumen ini ✅
```

### 6.2. Yang Paling Mendesak (Next Actions)

| # | Item | Kenapa penting |
|---|------|---------------|
| 1 | **Playground streaming** | Fitur paling visible, paling sering dipakai user, masih mock response |
| 2 | **Prompts CRUD** | Fondasi untuk prompt engineering workflow |
| 3 | **Backend API untuk prompts, embeddings, fine-tuning** | 6 halaman sudah ada UI-nya, masih mock data |

---

## 7. Cetak Biru Teknis per Komponen

### 7.1. Paper Indexer (Fase 1)

```
┌──────────────────────────────────────────────────────────┐
│                  Paper Indexer Architecture                │
│                                                           │
│  Sources:                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │
│  │ Arxiv    │  │ HF Daily │  │ Semantic Scholar │       │
│  │ RSS Feed │  │ Papers   │  │ API              │       │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘       │
│       │              │                 │                  │
│       └──────────────┼─────────────────┘                  │
│                      ↓                                    │
│              ┌──────────────┐                             │
│              │   Ingestor   │  (Bun cron, tiap jam)       │
│              │  normalize   │                             │
│              │  deduplicate │                             │
│              │  enrich      │                             │
│              └──────┬───────┘                             │
│                     ↓                                     │
│              ┌──────────────┐                             │
│              │  PostgreSQL  │                             │
│              │  ┌─────────┐ │                             │
│              │  │ papers  │ │  id, title, abstract,       │
│              │  │         │ │  authors, url, published,   │
│              │  │         │ │  source, citations,         │
│              │  │         │ │  embedding                  │
│              │  ├─────────┤ │                             │
│              │  │ authors │ │  id, name, affiliations,    │
│              │  │         │ │  paper_count                │
│              │  ├─────────┤ │                             │
│              │  │implement│ │  paper_id, engineer_id,     │
│              │  │         │ │  repo_url, benchmark,       │
│              │  │         │ │  verified, score            │
│              │  └─────────┘ │                             │
│              └──────────────┘                             │
│                     ↓                                     │
│              ┌──────────────┐                             │
│              │  REST API    │  GET /api/v1/papers         │
│              │  (public)    │  GET /api/v1/papers/:id     │
│              │              │  GET /api/v1/papers/search  │
│              └──────────────┘                             │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 7.2. Talent Profile (Fase 2)

```
┌──────────────────────────────────────────────────────────┐
│                Talent Profile Architecture                 │
│                                                           │
│  Data Sources (auto-collected):                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │  LOCAL (AI Lab user)                             │    │
│  │  • Experiments run                               │    │
│  │  • Models built/fine-tuned                       │    │
│  │  • Papers implemented                            │    │
│  │  • Benchmarks achieved                           │    │
│  │  • Providers configured                          │    │
│  │  • Cost efficiency metrics                       │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       ↓ (opt-in publish)                  │
│              ┌──────────────────┐                         │
│              │  Profile Engine  │                         │
│              │  ┌─────────────┐ │                         │
│              │  │ Skill       │ │  NLP extraction from    │
│              │  │ Extraction  │ │  experiment metadata    │
│              │  ├─────────────┤ │                         │
│              │  │ Portfolio   │ │  Auto-generated dari    │
│              │  │ Builder     │ │  activity → showcase    │
│              │  ├─────────────┤ │                         │
│              │  │ Reputation  │ │  Weighted score:        │
│              │  │ Engine      │ │  implementations,       │
│              │  │             │ │  benchmarks, community   │
│              │  └─────────────┘ │                         │
│              └──────────────────┘                         │
│                       ↓                                   │
│              ┌──────────────────┐                         │
│              │  Public Profile  │  /profile/:username     │
│              │  • Skill tags    │  • Experiments list     │
│              │  • Portfolio     │  • Implemented papers   │
│              │  • Rep score     │  • Verified benchmarks  │
│              └──────────────────┘                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 7.3. Matching Engine (Fase 3)

```
┌──────────────────────────────────────────────────────────┐
│                 Matching Engine Architecture               │
│                                                           │
│  ┌─────────────────┐     ┌─────────────────┐             │
│  │  Paper Graph    │     │  Talent Graph   │             │
│  │  • topic        │     │  • skill tags   │             │
│  │  • complexity   │     │  • experience   │             │
│  │  • requirements │     │  • availability  │             │
│  └────────┬────────┘     └────────┬────────┘             │
│           │                       │                       │
│           └───────────┬───────────┘                       │
│                       ↓                                   │
│              ┌──────────────────┐                         │
│              │ Vector Embedding │  text-embedding-3-small │
│              │ (pgvector)       │  atau bge-large-en      │
│              └────────┬─────────┘                         │
│                       ↓                                   │
│              ┌──────────────────┐                         │
│              │  Match Scoring   │  cosine similarity +    │
│              │                  │  weighted boost:        │
│              │                  │  • benchmark score      │
│              │                  │  • implementation count │
│              │                  │  • community trust      │
│              └────────┬─────────┘                         │
│                       ↓                                   │
│         ┌─────────────┼─────────────┐                     │
│         ↓             ↓             ↓                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐              │
│  │ Paper→Eng │ │ Skill→Job │ │ Researcher│              │
│  │ Match     │ │ Match     │ │ → Engineer│              │
│  │           │ │           │ │ Rekrut    │              │
│  └───────────┘ └───────────┘ └───────────┘              │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 7.4. Data Flow: Paper → Implementation → Portfolio

```
1. Researcher publish paper di Arxiv
       ↓
2. Paper Indexer auto-ingest ke AI Lab Cloud
       ↓
3. Engineer lihat paper di Explorer → "Interesting, I'll implement this"
       ↓
4. Engineer klik "Implement Paper" → bikin experiment di AI Lab lokal
       ↓
5. Experiment selesai, benchmark result tercatat
       ↓
6. Engineer submit "Implementation Claim" dengan repo link + benchmark
       ↓
7. Community/reviewer verifikasi implementasi (reproduce benchmark)
       ↓
8. Verified → Implementation tercatat di paper + engineer portfolio
       ↓
9. Author paper dapat notifikasi: "Paper kamu diimplementasi oleh X dengan score Y"
       ↓
10. Author bisa reach out ke engineer untuk kolaborasi/rekrut
```

---

## 8. Prinsip yang Tidak Boleh Dilanggar

### 8.1. Prinsip Teknis

1. **Config JSON selalu digenerate, tidak pernah diedit manual.** `syncToTarget()` yang nulis.
2. **Web UI tidak import `@ml-engine/core` langsung.** Semua data lewat REST API.
3. **Tidak ada chart library eksternal.** Pure CSS untuk visualisasi.
4. **Local-first, desktop-native.** Data sensitif (API keys) tidak pernah dikirim ke cloud. Arah: Tauri desktop app untuk performa native.
5. **Backward compat `ml-engine` binary.**
6. **Tidak ada `as any` atau `@ts-ignore`.**
7. **Tidak ada `require()` di ESM.**
8. **Zero dependency creep.**

### 8.2. Prinsip Strategis

9. **Fondasi dulu, ekspansi kemudian.** Opsi A harus solid sebelum naik ke Opsi B.
10. **Credit tidak pernah diambil alih.** Author paper tetap tercatat, engineer yang implementasi dapat credit terpisah.
11. **All contributions are traceable.** Setiap paper, implementasi, benchmark — semua punya audit trail.
12. **Opt-in privacy.** Engineer pilih sendiri apa yang di-publish ke profil publik.

---

## 9. Lampiran

### 9.1. Referensi Teknis

| Resource | URL | Digunakan Untuk |
|----------|-----|-----------------|
| Arxiv API | https://info.arxiv.org/help/api/ | Paper crawling |
| HuggingFace Daily Papers | https://huggingface.co/api/daily_papers | Trending research |
| Semantic Scholar API | https://api.semanticscholar.org/ | Citation graph |
| pgvector | https://github.com/pgvector/pgvector | Vector similarity search |
| Bun | https://bun.sh | Runtime utama |
| Qwik | https://qwik.dev/ | Web UI framework |
| Hono | https://hono.dev/ | REST API framework |
| SQLite (bun:sqlite) | https://bun.sh/docs/api/sqlite | Local database |

### 9.2. Proyek Terkait

| Proyek | URL | Hubungan dengan AI Lab |
|--------|-----|----------------------|
| 2USE | https://github.com/ainjiner/2USE | AI untuk pendidikan — potential consumer AI Lab API |
| Ainjiner | https://github.com/ainjiner | Organisasi induk — kolektif open-source AI engineering Indonesia |

### 9.3. Dokumen Pendukung

| Dokumen | Deskripsi |
|---------|-----------|
| [PHILOSOPHY.md](./PHILOSOPHY.md) | Penjelasan untuk newcomer: apa, kenapa, bagaimana |
| [README.md](./README.md) | Dokumentasi teknis, cara install, API reference |
| `packages/core/src/analytics/index.ts` | Analytics tracker — cost, usage, projections |
| `packages/api/src/routes/index.ts` | 65+ REST API endpoints |
| `apps/web/src/routes/layout.tsx` | Root layout — sidebar, navigation, command palette |

### 9.4. Log Perubahan

| Tanggal | Perubahan |
|---------|-----------|
| 2026-05-21 | Dokumen dibuat. Mencakup seluruh diskusi strategis sesi ini. |

---

> **"Kita seperti membangun sebuah karya seni yang monumental sebagaimana patung yang dipahat secara tepat dan bertahap namun wireframing dan blueprint memang harus didefinisikan selingkup dan semenyeluruh mungkin baru nanti satu persatu didetailkan atau dibuang jika memang tidak perlu untuk hasil yang lebih optimal."**
>
> — Percakapan 21 Mei 2026

---

*Dokumen ini hidup. Setiap perubahan arah strategis harus tercatat di sini. Setiap fase yang selesai harus diupdate statusnya.*
