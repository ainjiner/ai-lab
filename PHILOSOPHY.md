# PHILOSOPHY.md — Mengapa AI Lab Ada

> **Dokumen ini menjawab pertanyaan paling dasar: "ini apa?", "kenapa bikin ini?", dan "kenapa OpenCode?"**
>
> Jika kamu baru masuk ke repo ini, baca ini dulu. Baru baca README.

---

## 1. Apa Ini?

AI Lab adalah **ML/LLM Engineering Platform** — sebuah dasbor self-hosted yang menyatukan semua yang dibutuhkan AI engineer dalam satu tempat.

Bukan SaaS. Bukan plugin. Bukan wrapper. Ini **platform mandiri** yang jalan di localhost kamu: Web UI di port 5173, REST API di port 4321, SQLite sebagai database, dan CLI binary `ml-engine` untuk otomatisasi.

### Satu kalimat:

> **"Satu platform. Sepuluh provider. Nol friksi."**

---

## 2. Masalah yang Diselesaikan

### Sebelum AI Lab, workflow AI engineer kira-kira begini:

```
Buka Helicone → cek usage & cost
Buka LangFuse → cek tracing
Buka W&B → cek experiment results  
Buka terminal → edit opencode.json manual (capek banget)
Buka spreadsheet → tracking budget provider
Buka GitHub → cari model yang cocok buat task tertentu
```

**6 tools. 6 tab. 6 konteks berbeda.** Data terfragmentasi. Cost tracking nggak akurat. Config sync manual. Engineer habiskan waktu untuk *tool juggling*, bukan *building*.

### Setelah AI Lab:

```
Buka localhost:5173 → semuanya di satu dasbor.
```

- Provider management → lihat semua provider, test koneksi, scan model
- Model catalog → search, compare, rekomendasi berdasarkan task & budget
- Cost analytics → real-time usage, proyeksi, budget alert
- Experiment tracking → create, run, compare results
- Tracing → lihat setiap request: latency, tokens, cost
- Config sync → `config sync opencode` → opencode.json terisi otomatis
- Playground → test prompt tanpa buka terminal

**1 dasbor. 1 konteks. 0 konteks switch.**

---

## 3. Kenapa OpenCode?

### Ini pertanyaan paling penting.

OpenCode adalah AI coding companion — seperti Cursor atau Copilot, tapi open-source dan self-hosted. AI Lab tidak "terintegrasi" dengan OpenCode dalam arti plugin. AI Lab **native** ke OpenCode.

### AI Lab melakukan dua hal yang tidak dilakukan tools lain:

#### A. Config Sync — zero-touch

OpenCode butuh `opencode.json` yang berisi konfigurasi provider dan model. Biasanya kamu harus:
1. Baca dokumentasi format JSON OpenCode
2. Cari API key masing-masing provider
3. Tulis manual puluhan baris JSON
4. Kalau ganti provider → edit lagi

Dengan AI Lab:
```
ml-engine config sync opencode
```
Done. `opencode.json` dan `auth.json` terisi otomatis. Config dibaca dari SQLite, bukan ditulis manual. **Config JSON tidak pernah diedit tangan manusia.**

#### B. Orchestration Dashboard — baca, bukan tulis

AI Lab membaca struktur OpenCode: agent-agent di `~/.config/opencode/agents/`, skill-skill di `~/.config/opencode/skills/`. Hasilnya: dasbor yang menampilkan seluruh setup orchestration OpenCode kamu — agent apa yang aktif, skill apa yang terpasang, config provider apa yang tersedia.

### Intinya:

**AI Lab adalah "control panel"-nya OpenCode.** OpenCode adalah editor AI-mu. AI Lab adalah dasbor yang mengelola semua infrastruktur di belakang editor itu.

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   OpenCode (editor)                              │
│   Tempat kamu ngoding + ngobrol sama AI          │
│                                                  │
│              ↓ config sync ↓                     │
│                                                  │
│   AI Lab (control panel)                         │
│   Tempat kamu ngelola provider, model,           │
│   cost, experiments, traces, agents              │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4. Filosofi Inti

### 4.1. Local-First, Always

AI Lab jalan di mesin kamu. Data di SQLite lokal (`~/.local/share/ml-engine/engine.db`). Tidak ada cloud dependency. Tidak ada telemetry. Tidak ada vendor lock-in.

Kenapa? Karena **data engineering kamu adalah milik kamu**. Provider API keys, usage history, experiment results — semua sensitif. Harus tetap di mesin lokal.

### 4.2. Self-Hosted, Free Forever

MIT license. Bukan open-core (feature premium dikunci). Bukan freemium (user terbatas). **Semua fitur, semua user, gratis, selamanya.**

Kenapa? Karena kami percaya tools fundamental untuk AI engineering harus bisa diakses semua orang — dari solo dev di Indonesia sampai startup di Silicon Valley.

### 4.3. Platform > Tools

AI Lab bukan koleksi tools yang di-gabung. AI Lab adalah **platform** — setiap fitur didesain untuk bekerja bersama:

- Provider yang kamu tambahkan → otomatis muncul di model catalog
- Model yang kamu pilih → otomatis muncul di experiment tracker
- Experiment yang kamu jalanin → otomatis tercatat di cost analytics
- Cost yang membengkak → otomatis trigger budget alert
- Budget alert → kamu ganti provider → config sync otomatis ke OpenCode

Tidak ada data yang dimasukkan dua kali. Semuanya mengalir.

### 4.4. CLI + Web = Satu Kesatuan

Semua yang bisa kamu lakukan di Web UI, bisa juga lewat CLI. Semua yang kamu lakukan di CLI, langsung muncul di Web UI.

```
Web UI  ←→  REST API  ←→  Core Engine (SQLite)  ←→  CLI
```

Tidak ada "CLI mode" vs "Web mode" — dua-duanya interface ke engine yang sama.

### 4.5. Konvensi, Bukan Konfigurasi

AI Lab tahu di mana file-file OpenCode berada. Tahu format JSON-nya. Tahu cara membaca agent dan skill. Kamu tidak perlu konfigurasi apa pun — AI Lab mendeteksi sendiri.

Satu-satunya yang kamu butuhkan: API key dari provider yang mau kamu pakai.

---

## 5. Untuk Siapa Ini?

### AI Lab adalah untuk:

| Profil | Kenapa perlu AI Lab |
|--------|-------------------|
| **AI Engineer solo** | Gak mau bayar Helicone $79/bulan cuma buat tracking cost |
| **Startup AI 3-10 orang** | Butuh shared dashboard tanpa per-seat pricing |
| **OpenCode power user** | Capek edit JSON manual tiap ganti model |
| **ML researcher** | Butuh experiment tracking yang terintegrasi dengan provider |
| **Indie hacker Indonesia** | Gratis, self-hosted, gak perlu kartu kredit |

### AI Lab BUKAN untuk:

| Profil | Kenapa |
|--------|--------|
| **Enterprise 1000+ user** | Belum ada RBAC, SSO, audit log |
| **Yang maunya SaaS tinggal login** | Harus self-hosted (bisa jalan di VPS kok) |
| **Yang butuh real-time collaboration** | Single-user/localhost (untuk sekarang) |

---

## 6. Kenapa Nggak Pakai yang Sudah Ada?

| Tools | Masalah |
|-------|---------|
| **Helicone** | $79/bulan buat pro plan. Gak ada model catalog. Gak ada provider management. |
| **LangFuse** | $59/bulan. Prompt management bagus, tapi gak ada config sync ke OpenCode. |
| **LangSmith** | $39/seat. Gak self-hosted. Vendor lock-in ke ekosistem LangChain. |
| **W&B** | $50+/bulan. Experiments bagus, tapi gak ada provider management atau config sync. |
| **Arize Phoenix** | Gratis & self-hosted. Tapi tracing + eval doang. Gak ada model catalog, gak ada cost projection. |

**Tidak ada satu pun tools yang ngasih: provider management + model catalog + cost analytics + experiments + config sync → dalam satu self-hosted dasbor gratis.**

AI Lab mengisi celah itu.

---

## 7. Tech Stack & Kenapa

| Pilihan | Alasan |
|---------|--------|
| **Bun** | Runtime JS tercepat. Built-in SQLite. Monorepo-native. |
| **TypeScript** | Type safety end-to-end. Dari core engine sampai Web UI. |
| **Qwik** | Resumable framework. SSR tanpa hydration overhead. Cocok buat dasbor data-heavy. |
| **Hono** | Web framework ringan untuk REST API. Bun-native. |
| **SQLite** | Zero-config database. File-based. Backup tinggal copy file. |
| **Tailwind CSS v4** | Utility-first. Gak ada CSS framework lain. Bundle minimal. |
| **OpenCode Agentic Framework** | Agent + skill system buat orchestration dashboard. |

**Yang sengaja tidak dipakai:** React (hydration lambat), Next.js (overkill untuk dasbor), PostgreSQL (config ribet), Prisma (ORM berat), chart libraries (pure CSS bars).

---

## 8. Roadmap Mental Model

Bayangkan AI Lab sebagai **OS untuk AI Engineering**:

```
v0.1 (sekarang)     →  Foundation: provider, model, config, cost, experiments
v0.2 (mendatang)    →  Playground streaming, prompts management, evaluations
v0.3                →  RAG/CAG, vector store, document chunking
v0.4                →  Agent tracing, multi-agent debugging
v0.5                →  Fine-tuning pipeline, dataset curation
v1.0                →  Tim kolaborasi, RBAC, remote deployment
```

---

## 9. Bagaimana Berkontribusi?

AI Lab dibangun oleh [Ainjiner](https://github.com/ainjiner) — kolektif open-source AI engineering dari Indonesia.

Area yang paling butuh bantuan:
- 🔌 Provider integration baru
- 🎨 Web UI enhancement
- 📊 Analytics visualization baru
- 📖 Dokumentasi & tutorial
- 🧪 Test coverage

**Semua kontribusi welcome.** Gak perlu izin. Gak perlu "assignment". Lihat issue yang ada, atau bikin issue baru, atau langsung kirim PR.

---

## 10. Prinsip yang Tidak Boleh Dilanggar

1. **Config JSON selalu digenerate, tidak pernah diedit manual.** `syncToTarget()` yang nulis, user gak pernah buka file.
2. **Web UI tidak import `@ml-engine/core` langsung.** Qwik SSR inkompatibel dengan `bun:sqlite`. Semua data lewat REST API.
3. **Tidak ada chart library eksternal.** Pure CSS untuk visualisasi. Bundle harus tetap kecil.
4. **Tidak ada authentication.** Local-first. API bind ke localhost aja.
5. **Backward compat `ml-engine` binary.** Kalau ganti nama, alias harus tetap jalan.
6. **Tidak ada `as any` atau `@ts-ignore`.** TypeScript strict non-negotiable.
7. **Tidak ada `require()` di ESM.** Semua import top-level ESM.
8. **Zero dependency creep.** Setiap dependensi baru harus dijustifikasi.

---

> **AI Lab tidak mencoba jadi segalanya. AI Lab mencoba jadi *satu hal* dengan sempurna: control panel yang bikin AI engineer bisa fokus ke yang penting — building, bukan tool juggling.**

---

*Dokumen ini hidup. Kalau ada yang kurang jelas atau perlu ditambah, kirim PR.*
