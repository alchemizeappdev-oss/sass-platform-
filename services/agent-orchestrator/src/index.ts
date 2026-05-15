import "dotenv/config";
import Fastify from "fastify";
import { z } from "zod";
import { prisma, RunKind, RunStatus, type Prisma } from "@ai-workforce/database";
import { emitRunEvent } from "./events.js";
import { enqueueRun, startRunWorker } from "./queue.js";
import { startRunWorkflow } from "./temporal.js";

const port = Number(process.env.AGENT_ORCHESTRATOR_PORT ?? 4001);

const createRunBody = z.object({
  tenantId: z.string(),
  agentId: z.string(),
  input: z.record(z.unknown()).default({}),
  taskClass: z.string().default("general"),
  userId: z.string().optional(),
});

async function main() {
  startRunWorker();

  const app = Fastify({ logger: true });

  app.get("/healthz", async () => ({ status: "ok" }));
  app.get("/readyz", async () => ({ status: "ready" }));

  app.post("/internal/execute/:runId", async (request) => {
    const { runId } = request.params as { runId: string };
    const { executeRun } = await import("./run-executor.js");
    await executeRun(runId);
    return { ok: true };
  });

  app.post("/internal/runs", async (request, reply) => {
    const body = createRunBody.parse(request.body);

    const run = await prisma.run.create({
      data: {
        tenantId: body.tenantId,
        agentId: body.agentId,
        kind: RunKind.agent,
        status: RunStatus.queued,
        taskClass: body.taskClass,
        inputJson: body.input as Prisma.InputJsonValue,
      },
    });

    await emitRunEvent(body.tenantId, run.id, "run.queued");

    const startedViaTemporal = await startRunWorkflow(run.id);
    if (!startedViaTemporal) {
      await enqueueRun(run.id);
    }

    return reply.code(202).send({ runId: run.id, status: run.status });
  });

  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
