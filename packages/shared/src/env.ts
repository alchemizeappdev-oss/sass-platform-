import { z } from "zod";

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),
  TEMPORAL_ADDRESS: z.string().default("localhost:7233"),
  TEMPORAL_NAMESPACE: z.string().default("default"),
  TEMPORAL_TASK_QUEUE: z.string().default("ai-workforce-runs"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  KIMI_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().optional(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export function loadEnv<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): z.infer<typeof schema> {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment:\n${message}`);
  }
  return parsed.data;
}

export function loadBaseEnv(): BaseEnv {
  return loadEnv(baseEnvSchema);
}
