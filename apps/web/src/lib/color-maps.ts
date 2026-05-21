export const statusColors = {
  success: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  error: "bg-red-500/20 text-red-400",
  info: "bg-blue-500/20 text-blue-400",
  pending: "bg-gray-500/20 text-gray-400",
  default: "bg-surface-light text-text-muted",
} as const;

export const providerColors = {
  baseten: "bg-violet-500/20 text-violet-400",
  openrouter: "bg-blue-500/20 text-blue-400",
  together: "bg-red-500/20 text-red-400",
  fireworks: "bg-orange-500/20 text-orange-400",
  groq: "bg-pink-500/20 text-pink-400",
  anthropic: "bg-amber-500/20 text-amber-400",
  openai: "bg-emerald-500/20 text-emerald-400",
  google: "bg-teal-500/20 text-teal-400",
  deepseek: "bg-cyan-500/20 text-cyan-400",
  ollama: "bg-indigo-500/20 text-indigo-400",
} as const;

export const datasetTypeColors = {
  qa: "bg-blue-500/20 text-blue-400",
  code: "bg-green-500/20 text-green-400",
  reasoning: "bg-purple-500/20 text-purple-400",
  safety: "bg-red-500/20 text-red-400",
  custom: "bg-yellow-500/20 text-yellow-400",
  benchmark: "bg-purple-500/20 text-purple-400",
  evaluation: "bg-blue-500/20 text-blue-400",
  comparison: "bg-green-500/20 text-green-400",
} as const;

export const featureColors = {
  tools: "bg-blue-500/10 text-blue-400",
  vision: "bg-purple-500/10 text-purple-400",
  reasoning: "bg-amber-500/10 text-amber-400",
  json_mode: "bg-emerald-500/10 text-emerald-400",
  streaming: "bg-teal-500/10 text-teal-400",
  prompt_caching: "bg-cyan-500/10 text-cyan-400",
} as const;

export const hitRateColors = {
  high: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-red-500/20 text-red-400",
} as const;

export const budgetStatusColors = {
  under: "bg-green-500/20 text-green-400",
  near: "bg-yellow-500/20 text-yellow-400",
  over: "bg-red-500/20 text-red-400",
} as const;

export const trendColors = {
  up: "text-green-400",
  down: "text-red-400",
  neutral: "text-text-muted",
} as const;

export const chartColors = {
  primary: "bg-blue-500",
  secondary: "bg-purple-500",
  accent: "bg-teal-500",
  muted: "bg-gray-500",
} as const;

export const alertSeverityColors = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
  info: "bg-gray-500/20 text-gray-400",
} as const;

export const scopeColors = {
  read: "bg-blue-500/20 text-blue-400",
  write: "bg-green-500/20 text-green-400",
  admin: "bg-purple-500/20 text-purple-400",
} as const;

export const reportTypeColors = {
  performance: "bg-blue-500/20 text-blue-400",
  cost: "bg-green-500/20 text-green-400",
  quality: "bg-purple-500/20 text-purple-400",
  security: "bg-red-500/20 text-red-400",
} as const;

export const experimentStatusColors = {
  pending: "bg-gray-500/20 text-gray-400",
  running: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
} as const;

export const fineTuningColors = {
  pending: "bg-gray-500/20 text-gray-400",
  queued: "bg-blue-500/20 text-blue-400",
  running: "bg-amber-500/20 text-amber-400",
  completed: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-400",
} as const;

export const teamRoleColors = {
  owner: "bg-purple-500/20 text-purple-400",
  admin: "bg-blue-500/20 text-blue-400",
  member: "bg-green-500/20 text-green-400",
  viewer: "bg-gray-500/20 text-gray-400",
} as const;

export const getProviderColor = (provider: string): string => {
  return providerColors[provider as keyof typeof providerColors] || statusColors.default;
};

export const getFeatureColor = (feature: string): string => {
  return featureColors[feature as keyof typeof featureColors] || statusColors.default;
};

export const getStatusColor = (status: string): string => {
  return statusColors[status as keyof typeof statusColors] || statusColors.default;
};