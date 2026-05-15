import type { FastifyInstance } from "fastify";
import { prisma } from "@ai-workforce/database";
import type { Redis } from "ioredis";

export async function registerHealthRoutes(
  app: FastifyInstance,
  redis: Redis,
): Promise<void> {
  app.get("/healthz", async () => ({ status: "ok" }));

  app.get("/readyz", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const pong = await redis.ping();
      if (pong !== "PONG") throw new Error("Redis not ready");
      return { status: "ready" };
    } catch {
      return reply.code(503).send({ status: "not_ready" });
    }
  });
}
