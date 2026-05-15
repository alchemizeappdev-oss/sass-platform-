import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { Redis } from "ioredis";
import { ApiError, toErrorBody } from "@ai-workforce/shared";
import { createRequestId } from "./lib/request-id.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerV1Routes } from "./routes/v1.js";

const port = Number(process.env.API_GATEWAY_PORT ?? 4000);

async function main() {
  const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
  const app = Fastify({ logger: true, requestTimeout: 30_000 });

  await app.register(cors, { origin: true });

  app.addHook("onRequest", async (request) => {
    request.requestId = createRequestId();
  });

  app.setErrorHandler((error, request, reply) => {
    const requestId = request.requestId ?? createRequestId();
    if (error instanceof ApiError) {
      return reply
        .code(error.statusCode)
        .send(toErrorBody(error, requestId));
    }
    request.log.error(error);
    return reply
      .code(500)
      .send(toErrorBody(new ApiError(500, "INTERNAL", "Internal error"), requestId));
  });

  await registerHealthRoutes(app, redis);
  await registerV1Routes(app, {
    supabaseUrl: process.env.SUPABASE_URL!,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
    orchestratorUrl:
      process.env.AGENT_ORCHESTRATOR_URL ?? "http://localhost:4001",
    realtimeUrl: process.env.REALTIME_SERVICE_URL ?? "http://localhost:4003",
  });

  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
