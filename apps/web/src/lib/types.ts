import type { QRL } from "@builder.io/qwik";

export type FormDataRecord = Record<string, string>;
export type FormDataWithNumbers = Record<string, string | number>;

export interface ProviderFormData {
  providerId: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
}

export interface AliasFormData {
  alias: string;
  providerId: string;
  modelId: string;
}

export interface ExperimentFormData {
  name: string;
  description?: string;
  tags?: string;
  providerId: string;
  modelId: string;
  temperature?: string;
  maxTokens?: string;
  systemPrompt?: string;
  userPrompt: string;
}

export interface ApiKeyFormData {
  name: string;
  scope: "read" | "write" | "admin";
  expiry?: string;
}

export interface BudgetFormData {
  name: string;
  limit: string;
  period: "daily" | "weekly" | "monthly";
}

export interface AgentFormData {
  id: string;
  name: string;
  type: "build" | "explore" | "oracle" | "librarian" | "metis" | "momus" | "custom";
  model: string;
  systemPrompt?: string;
  enabled: boolean;
}

export interface SettingsFormData {
  minChunkSize: string;
  timeout: string;
  retries: string;
}

export type ErrorFallbackRenderFn = (error: Error, reset: () => void) => unknown;

export interface ErrorBoundaryProps {
  fallback?: ErrorFallbackRenderFn | unknown;
  class?: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
