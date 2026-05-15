import "dotenv/config";
import Fastify from "fastify";
import { prisma } from "@ai-workforce/database";

const port = Number(process.env.REALTIME_SERVICE_PORT ?? 4003);
const POLL_MS = 500;

function formatSse(event: string, data: unknown, id?: string): string {
  const lines = [`event: ${event}`];
  if (id) lines.push(`id: ${id}`);
  lines.push(`data: ${JSON.stringify(data)}`);
  return `${lines.join("\n")}\n\n`;
}

async function main() {
  const app = Fastify({ logger: true });

  app.get("/healthz", async () => ({ status: "ok" }));

  app.get<{
    Params: { runId: string };
    Querystring: { tenantId?: string; cursor?: string };
  }>("/internal/runs/:runId/events", async (request, reply) => {
    const { runId } = request.params;
    const tenantId = request.query.tenantId;
    if (!tenantId) {
      return reply.code(400).send({ message: "tenantId required" });
    }

    const run = await prisma.run.findFirst({
      where: { id: runId, tenantId },
    });
    if (!run) {
      return reply.code(404).send({ message: "Run not found" });
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    let cursor = request.query.cursor;
    let closed = false;
    request.raw.on("close", () => {
      closed = true;
    });

    const terminal = new Set(["succeeded", "failed", "cancelled"]);

    while (!closed) {
      const events = await prisma.event.findMany({
        where: {
          runId,
          tenantId,
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      });

      for (const event of events) {
        reply.raw.write(
          formatSse("run.event", {
            type: event.type,
            payload: event.payloadJson,
            createdAt: event.createdAt,
          }, event.id),
        );
        cursor = event.id;
      }

      const latest = await prisma.run.findUnique({ where: { id: runId } });
      if (latest && terminal.has(latest.status)) {
        reply.raw.write(
          formatSse("run.terminal", { status: latest.status }, latest.id),
        );
        break;
      }

      await new Promise((r) => setTimeout(r, POLL_MS));
    }

    reply.raw.end();
    return reply;
  });

  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
