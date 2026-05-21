import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", cors());

const PORT = parseInt(process.env.PORT || "4322");

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  source: "arxiv" | "huggingface" | "semantic-scholar";
  published: string;
  categories: string[];
  indexed_at: string;
}

let papers: Paper[] = [];

function paperId(source: string, rawId: string): string {
  return `${source}:${rawId}`;
}

async function indexArxiv(): Promise<Paper[]> {
  const feeds = ["cs.AI", "cs.CL", "cs.LG", "stat.ML"];
  const results: Paper[] = [];

  for (const cat of feeds) {
    try {
      const url = `https://export.arxiv.org/api/query?search_query=cat:${cat}&sortBy=submittedDate&sortOrder=descending&max_results=10`;
      const res = await fetch(url);
      const xml = await res.text();

      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      while ((match = entryRegex.exec(xml)) !== null) {
        const entry = match[1];
        const id = extractTag(entry, "id")?.replace("http://arxiv.org/abs/", "") || "";
        const title = extractTag(entry, "title")?.trim() || "";
        const abstract = extractTag(entry, "summary")?.trim() || "";
        const published = extractTag(entry, "published") || "";

        const authorRegex = /<name>(.*?)<\/name>/g;
        const authors: string[] = [];
        let am;
        while ((am = authorRegex.exec(entry)) !== null) {
          authors.push(am[1].trim());
        }

        const catRegex = /term="([^"]+)"/g;
        const categories: string[] = [];
        let cm;
        while ((cm = catRegex.exec(entry)) !== null) {
          categories.push(cm[1]);
        }

        if (id && title) {
          results.push({
            id: paperId("arxiv", id),
            title,
            authors: authors.slice(0, 10),
            abstract: abstract.slice(0, 2000),
            url: `https://arxiv.org/abs/${id}`,
            source: "arxiv",
            published,
            categories,
            indexed_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error(`[lens] Arxiv fetch failed for ${cat}:`, (e as Error).message);
    }
  }
  return results;
}

async function indexHuggingFace(): Promise<Paper[]> {
  try {
    const res = await fetch("https://huggingface.co/api/daily_papers");
    if (!res.ok) return [];
    const data = (await res.json()) as any[];

    return data.slice(0, 20).map((p: any) => ({
      id: paperId("huggingface", p.paper?.id || String(Date.now())),
      title: p.paper?.title || p.title || "",
      authors: (p.paper?.authors || []).slice(0, 10),
      abstract: (p.paper?.summary || "").slice(0, 2000),
      url: `https://huggingface.co/papers/${p.paper?.id || ""}`,
      source: "huggingface" as const,
      published: p.paper?.publishedAt || p.publishedAt || new Date().toISOString(),
      categories: ["daily-paper"],
      indexed_at: new Date().toISOString(),
    }));
  } catch (e) {
    console.error("[lens] HuggingFace fetch failed:", (e as Error).message);
    return [];
  }
}

function extractTag(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"') : undefined;
}

async function indexAll(): Promise<void> {
  console.log("[lens] Indexing papers...");
  const [arxiv, hf] = await Promise.all([indexArxiv(), indexHuggingFace()]);
  const all = [...arxiv, ...hf];

  const seen = new Set(papers.map((p) => p.id));
  const fresh = all.filter((p) => !seen.has(p.id));

  if (fresh.length > 0) {
    papers = [...fresh, ...papers].slice(0, 500);
    console.log(`[lens] Indexed ${fresh.length} new papers (total: ${papers.length})`);
  } else {
    console.log(`[lens] No new papers. Total: ${papers.length}`);
  }
}

app.get("/", (c) => c.json({ name: "Lens", description: "AI Research Paper Indexer", status: "running", paperCount: papers.length }));

app.get("/papers", (c) => {
  const source = c.req.query("source");
  const category = c.req.query("category");
  const search = c.req.query("search")?.toLowerCase();
  const limit = Math.min(parseInt(c.req.query("limit") || "50"), 200);

  let result = papers;

  if (source) result = result.filter((p) => p.source === source);
  if (category) result = result.filter((p) => p.categories.some((c) => c.toLowerCase().includes(category.toLowerCase())));
  if (search) {
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.abstract.toLowerCase().includes(search) ||
        p.authors.some((a) => a.toLowerCase().includes(search)),
    );
  }

  return c.json({ papers: result.slice(0, limit), total: result.length });
});

app.get("/papers/:id", (c) => {
  const paper = papers.find((p) => p.id === c.req.param("id"));
  if (!paper) return c.json({ error: "Not found" }, 404);
  return c.json({ paper });
});

app.get("/stats", (c) => {
  const sources = { arxiv: 0, huggingface: 0, "semantic-scholar": 0 };
  for (const p of papers) sources[p.source]++;

  const allCategories = new Set<string>();
  for (const p of papers) p.categories.forEach((c) => allCategories.add(c));

  return c.json({
    totalPapers: papers.length,
    bySource: sources,
    categories: allCategories.size,
    lastIndexed: papers[0]?.indexed_at || null,
  });
});

app.post("/index", async (c) => {
  await indexAll();
  return c.json({ indexed: papers.length, lastRun: new Date().toISOString() });
});

console.log(`\n🔬 Lens — AI Research Indexer`);
console.log(`   Port: ${PORT}`);
console.log(`   Sources: Arxiv (cs.AI, cs.CL, cs.LG, stat.ML), HuggingFace Daily Papers`);

indexAll();
setInterval(indexAll, 60 * 60 * 1000);

export default { port: PORT, fetch: app.fetch };

if (import.meta.main) {
  Bun.serve({ port: PORT, fetch: app.fetch });
  console.log(`   Ready: http://localhost:${PORT}`);
}
