import { z } from "zod";

export const modelRequestSchema = z.object({
  tenantId: z.string(),
  runId: z.string(),
  taskClass: z.string(),
  prompt: z.string(),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
  jsonMode: z.boolean().default(false),
});

export type ModelRequest = z.infer<typeof modelRequestSchema>;

export interface ModelUsage {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface ModelResponse {
  text: string;
  usage: ModelUsage;
  provider: string;
  model: string;
}

export interface ModelAdapter {
  readonly provider: string;
  generateText(input: {
    model: string;
    prompt: string;
    systemPrompt?: string;
    maxTokens: number;
    timeoutMs: number;
  }): Promise<ModelResponse>;
}
