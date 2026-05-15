import "dotenv/config";
import Fastify from "fastify";
import { z } from "zod";
import { prisma } from "@ai-workforce/database";
import { routeAndComplete } from "./router.js";

const port = Number(process.env.MODEL_ROUTER_PORT ?? 4002);

const completeSchema = z.object({
  tenantId: z.string(),
  runId: z.string(),
  taskClass: z.string().default("general"),
  prompt: z.string(),
  maxTokens: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

const MONTHLY_TOKEN_BUDGET = Number(
  process.env.DEFAULT_MONTHLY_TOKEN_BUDGET ?? 1_000_000,
);

async function assertWithinBudget(tenantId: string): Promise<void> {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const rows = await prisma.usageLedger.findMany({
    where: { tenantId, createdAt: { gte: startOfMonth } },
  });
  const tokens = rows.reduce(
    (sum, r) => sum + r.inputTokens + r.outputTokens,
    0,
  );
  if (tokens >= MONTHLY_TOKEN_BUDGET) {
    const err = new Error("Monthly token budget exceeded");
    (err as Error & { statusCode: number }).statusCode = 429;
    throw err;
  }
}

async function main() {
  const app = Fastify({ logger: true });

  app.get("/healthz", async () => ({ status: "ok" }));

  app.post("/v1/complete", async (request, reply) => {
    const body = completeSchema.parse(request.body);
    await assertWithinBudget(body.tenantId);

    try {
      const result = await routeAndComplete(body);
      return { text: result.text, provider: result.provider, model: result.model };
    } catch (err) {
      const statusCode =
        (err as Error & { statusCode?: number }).statusCode ?? 502;
      return reply.code(statusCode).send({
        message: err instanceof Error ? err.message : "Provider failure",
      });
    }
  });

  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
