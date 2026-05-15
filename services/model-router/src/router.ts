import { prisma } from "@ai-workforce/database";
import type { ModelAdapter } from "@ai-workforce/shared";
import { MockAdapter } from "./adapters/mock.js";
import { OpenAIAdapter } from "./adapters/openai.js";

const circuitState = new Map<string, { failures: number; openUntil: number }>();

function circuitKey(provider: string, model: string): string {
  return `${provider}:${model}`;
}

function isCircuitOpen(provider: string, model: string): boolean {
  const state = circuitState.get(circuitKey(provider, model));
  if (!state) return false;
  return Date.now() < state.openUntil;
}

function recordFailure(provider: string, model: string): void {
  const key = circuitKey(provider, model);
  const state = circuitState.get(key) ?? { failures: 0, openUntil: 0 };
  state.failures += 1;
  if (state.failures >= 3) {
    state.openUntil = Date.now() + 60_000;
    state.failures = 0;
  }
  circuitState.set(key, state);
}

function recordSuccess(provider: string, model: string): void {
  circuitState.delete(circuitKey(provider, model));
}

function parseModelRef(ref: string): { provider: string; model: string } {
  const [provider, ...rest] = ref.split("/");
  return { provider: provider!, model: rest.join("/") || "default" };
}

export function buildAdapters(): Map<string, ModelAdapter> {
  const adapters = new Map<string, ModelAdapter>();
  adapters.set("mock", new MockAdapter());

  if (process.env.OPENAI_API_KEY) {
    adapters.set("openai", new OpenAIAdapter(process.env.OPENAI_API_KEY));
  }

  return adapters;
}

export async function routeAndComplete(input: {
  tenantId: string;
  runId: string;
  taskClass: string;
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<{ text: string; provider: string; model: string }> {
  const policy = await prisma.providerPolicy.findUnique({
    where: {
      tenantId_taskClass: {
        tenantId: input.tenantId,
        taskClass: input.taskClass,
      },
    },
  });

  const chain = [
    policy?.primaryModel ?? "mock/default",
    ...((policy?.fallbackChainJson as string[] | undefined) ?? []),
    "mock/default",
  ];

  const adapters = buildAdapters();
  const maxTokens = input.maxTokens ?? policy?.maxTokens ?? 4096;
  const timeoutMs = input.timeoutMs ?? policy?.timeoutMs ?? 60_000;

  let lastError: Error | null = null;

  for (const ref of chain) {
    const { provider, model } = parseModelRef(ref);
    if (isCircuitOpen(provider, model)) continue;

    const adapter = adapters.get(provider);
    if (!adapter) {
      lastError = new Error(`No adapter for provider: ${provider}`);
      continue;
    }

    try {
      const response = await adapter.generateText({
        model,
        prompt: input.prompt,
        maxTokens,
        timeoutMs,
      });
      recordSuccess(provider, model);

      await prisma.usageLedger.create({
        data: {
          tenantId: input.tenantId,
          runId: input.runId,
          provider: response.usage.provider,
          model: response.usage.model,
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
          costUsd: response.usage.costUsd,
        },
      });

      return {
        text: response.text,
        provider: response.provider,
        model: response.model,
      };
    } catch (err) {
      recordFailure(provider, model);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("All providers failed");
}
