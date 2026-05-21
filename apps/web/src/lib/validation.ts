import { z } from "zod";

export const createProviderSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  name: z.string().min(1, "Instance name is required").max(50, "Name too long"),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required").max(100, "Name too long"),
  limit: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Limit must be a positive number"),
  period: z.enum(["daily", "weekly", "monthly"]),
});

export const createAgentSchema = z.object({
  id: z.string()
    .min(1, "Agent ID is required")
    .max(50, "ID too long")
    .regex(/^[a-z0-9-]+$/, "ID must be lowercase letters, numbers, and hyphens"),
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long"),
  type: z.enum(["build", "explore", "oracle", "librarian", "metis", "momus", "custom"]),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().max(5000, "System prompt too long").optional(),
  enabled: z.boolean(),
});

export const createExperimentSchema = z.object({
  name: z.string().min(1, "Experiment name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  tags: z.string().optional(),
  providerId: z.string().min(1, "Provider instance is required"),
  modelId: z.string().min(1, "Model is required"),
  temperature: z.string().optional(),
  maxTokens: z.string().optional(),
  systemPrompt: z.string().max(10000, "System prompt too long").optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export const createAliasSchema = z.object({
  alias: z.string()
    .min(1, "Alias name is required")
    .max(50, "Alias too long")
    .regex(/^[a-z0-9-_.]+$/, "Alias must be lowercase letters, numbers, hyphens, underscores, and dots"),
  providerId: z.string().min(1, "Provider instance is required"),
  modelId: z.string().min(1, "Target model is required"),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1, "Key name is required").max(50, "Name too long"),
  scope: z.enum(["read", "write", "admin"]),
  expiry: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  minChunkSize: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num <= 10000;
  }, "Min chunk size must be between 1 and 10000"),
  timeout: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1000 && num <= 300000;
  }, "Timeout must be between 1000ms and 300000ms"),
  retries: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 0 && num <= 10;
  }, "Retries must be between 0 and 10"),
});

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  // Zod v4 uses .issues not .errors
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  }
  
  return { success: false, errors };
}

export function getFieldError(errors: Record<string, string> | null, field: string): string | undefined {
  if (!errors) return undefined;
  return errors[field];
}
