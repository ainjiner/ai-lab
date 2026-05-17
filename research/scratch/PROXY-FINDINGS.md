# Baseten SSE Proxy — Temuan Testing

**Tanggal:** 2026-05-17  
**Tujuan:** Intercept raw SSE antara opencode dan Baseten inference untuk analisis doom scroll pada reasoning/thought stream GLM-5.

## Setup

- Proxy: `bun baseten-proxy.ts` di `http://127.0.0.1:9999`
- Target forward: `https://inference.baseten.co`
- Log: `baseten-sse.log`
- opencode.json `baseURL` diarahkan sementara ke proxy lokal

## Temuan Utama

**GLM-5 (`zai-org/GLM-5`) via Baseten tidak mengirim `reasoning_content` field.**

Semua response menggunakan field `content` biasa:

```
reasoning=0 text=2    (2+2)
reasoning=0 text=19   (17 sheep)
reasoning=0 text=28   (bubble sort)
reasoning=0 text=102  (3 boxes puzzle)
reasoning=0 text=46   (9.11 vs 9.9)
```

Tidak ada satu pun SSE chunk yang mengandung `reasoning_content` atau `reasoning` field.

## Implikasi

- "thought: ... thought: ..." yang terlihat di UI **bukan reasoning block opencode** — itu adalah teks biasa dari GLM-5 yang memang menulis proses berpikirnya di dalam `content` field.
- Doom scroll yang dilaporkan **bukan disebabkan oleh `reasoning_content` stream** — paling tidak tidak dari model GLM-5 di endpoint ini.
- Perlu investigasi lebih lanjut: model mana yang sebenarnya mengirim `reasoning_content`, atau apakah ada parameter untuk mengaktifkan thinking mode di GLM-5 via Baseten.

## Next Steps (untuk investigasi manual)

1. Cek apakah GLM-5 punya endpoint atau parameter khusus untuk thinking mode di Baseten
2. Test model lain yang diketahui punya native reasoning stream (misal DeepSeek-R1, Kimi-K2)
3. Konfirmasi field mana yang digunakan model tersebut (`reasoning_content` vs `reasoning` vs format lain)
4. Setelah confirmed model yang trigger doom scroll, baru tentukan fix yang tepat

## File Artifacts

- `baseten-proxy.ts` — proxy Bun, jalankan dengan `bun baseten-proxy.ts`
- `baseten-sse.log` — raw log dari sesi testing
