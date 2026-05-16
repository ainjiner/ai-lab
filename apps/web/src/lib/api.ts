const API_BASE = process.env.API_URL || "http://localhost:4321/api";

export const api = {
  get: async <T>(path: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
  },
  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
  },
  patch: async <T>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
  },
  delete: async <T>(path: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
  },
};

export const PROVIDER_FEATURES = [
  { field: "tools" as const, label: "tools", color: "bg-blue-500/10 text-blue-400" },
  { field: "vision" as const, label: "vision", color: "bg-purple-500/10 text-purple-400" },
  { field: "reasoning" as const, label: "reasoning", color: "bg-amber-500/10 text-amber-400" },
  { field: "json_mode" as const, label: "json", color: "bg-emerald-500/10 text-emerald-400" },
  { field: "streaming" as const, label: "stream", color: "bg-teal-500/10 text-teal-400" },
];
