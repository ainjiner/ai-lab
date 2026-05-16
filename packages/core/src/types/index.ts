export interface Provider {
  id: string;
  name: string;
  type: "inference" | "gateway" | "local";
  baseUrl: string;
  authMethod: "api_key" | "oauth" | "none";
  features: {
    streaming: boolean;
    vision: boolean;
    tools: boolean;
    reasoning: boolean;
    json_mode: boolean;
    prompt_caching: boolean;
  };
  rateLimits?: { rpm?: number; tpm?: number; concurrent?: number };
  pricing?: { markup?: number };
  documentation?: string;
  description?: string;
}

export interface ProviderInstance {
  id: string;
  providerId: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  priority: number;
  labels: string[];
  modelsCount?: number;
  lastScan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutput: number;
  capabilities: {
    vision: boolean;
    tools: boolean;
    reasoning: boolean;
    json_mode: boolean;
    streaming: boolean;
    prompt_caching: boolean;
    fine_tuning: boolean;
  };
  pricing?: { prompt: number; completion: number; cached?: number; image?: number };
  availability?: { status: "available" | "deprecated" | "beta" | "private"; regions?: string[] };
  metadata?: { releaseDate?: string; deprecationDate?: string; paper?: string; license?: string; description?: string };
}

export interface ModelAlias {
  alias: string;
  modelId: string;
  providerId: string;
  fallback?: ModelAlias;
}

export interface ConfigTarget {
  id: string;
  name: string;
  configPath: string;
  authPath?: string;
  enabled: boolean;
}

export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  reasoning_effort?: "low" | "medium" | "high";
  stop?: string[];
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "running" | "completed" | "failed" | "archived";
  prompt: { system?: string; user: string; variables?: Record<string, string> };
  model: { provider: string; model: string; params: ModelParams };
  results?: {
    output: string;
    tokens: { prompt: number; completion: number; total: number };
    latency: number;
    cost: number;
    reasoning?: string;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    tags: string[];
    rating?: number;
    notes?: string;
  };
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  tokens: { prompt: number; completion: number; cached?: number };
  cost: { prompt: number; completion: number; total: number };
  latency: number;
  context?: { experimentId?: string; projectId?: string; agentId?: string };
}

export interface Budget {
  id: string;
  name: string;
  limit: number;
  period: "daily" | "weekly" | "monthly";
  alerts: Array<{ threshold: number; action: "notify" | "disable" }>;
  scope?: { providers?: string[]; models?: string[]; projects?: string[] };
  enabled: boolean;
}

export interface OrchestrationConfig {
  enabled: boolean;
  type: "omo" | "obra" | "custom";
  version?: string;
  agents?: AgentConfig[];
  skills?: SkillConfig[];
  plugins?: string[];
  permissions?: Record<string, boolean>;
}

export interface AgentConfig {
  id: string;
  name: string;
  type: "build" | "explore" | "oracle" | "librarian" | "metis" | "momus" | "custom";
  model?: string;
  systemPrompt?: string;
  tools?: string[];
  enabled: boolean;
}

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  enabled: boolean;
  path?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: Array<{ name: string; type: "string" | "number" | "boolean"; required: boolean; default?: unknown }>;
  tags: string[];
  version: number;
}
