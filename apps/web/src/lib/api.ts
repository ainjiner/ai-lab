const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.PUBLIC_API_URL || import.meta.env.VITE_API_URL || import.meta.env.API_URL)) ||
  (typeof process !== "undefined" && process.env ? process.env.API_URL : undefined) ||
  "http://localhost:4321/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, statusText: string) {
    super(`API error: ${status} ${statusText}`);
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor() {
    super("Network unreachable — API is offline");
  }
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw new NetworkError();
  }
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return res.json();
}

export const api = {
  get: <T>(path: string) =>
    request<T>(`${API_BASE}${path}`),

  post: <T>(path: string, body?: unknown) =>
    request<T>(`${API_BASE}${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    request<T>(`${API_BASE}${path}`, { method: "DELETE" }),
};

export const PROVIDER_FEATURES = [
  { field: "tools" as const,     label: "tools",   color: "bg-blue-500/10 text-blue-400" },
  { field: "vision" as const,    label: "vision",  color: "bg-purple-500/10 text-purple-400" },
  { field: "reasoning" as const, label: "reasoning", color: "bg-amber-500/10 text-amber-400" },
  { field: "json_mode" as const, label: "json",    color: "bg-emerald-500/10 text-emerald-400" },
  { field: "streaming" as const, label: "stream",  color: "bg-teal-500/10 text-teal-400" },
];
