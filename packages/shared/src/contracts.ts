import { z } from "zod";

export const createRunSchema = z.object({
  agentId: z.string().cuid(),
  input: z.record(z.unknown()).default({}),
  taskClass: z.string().min(1).default("general"),
});

export const createAgentSchema = z.object({
  name: z.string().min(1).max(120),
  config: z.record(z.unknown()).default({}),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(120),
  triggerType: z.string().min(1),
  definition: z.record(z.unknown()).default({}),
});

export const providerPolicySchema = z.object({
  taskClass: z.string().min(1),
  primaryModel: z.string().min(1),
  fallbackChain: z.array(z.string()).default([]),
  maxTokens: z.number().int().positive().max(200_000),
  timeoutMs: z.number().int().positive().max(600_000),
});

export type CreateRunInput = z.infer<typeof createRunSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type ProviderPolicyInput = z.infer<typeof providerPolicySchema>;
