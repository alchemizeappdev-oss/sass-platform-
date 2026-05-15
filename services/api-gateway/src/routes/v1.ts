import type { FastifyInstance } from "fastify";
import { prisma, type Prisma } from "@ai-workforce/database";
import {
  ApiError,
  createAgentSchema,
  createRunSchema,
  createWorkflowSchema,
  providerPolicySchema,
} from "@ai-workforce/shared";
import { createAuthHook, requireScope } from "../middleware/auth.js";
import { idempotencyHook } from "../middleware/idempotency.js";

async function orchestratorFetch(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${baseUrl.replace(/\/$/, "")}${path}`, init);
}

export async function registerV1Routes(
  app: FastifyInstance,
  options: {
    supabaseUrl: string;
    jwtSecret?: string;
    orchestratorUrl: string;
    realtimeUrl: string;
  },
): Promise<void> {
  const authHook = createAuthHook({
    supabaseUrl: options.supabaseUrl,
    jwtSecret: options.jwtSecret,
  });

  await app.register(
    async (v1) => {
      v1.addHook("preHandler", authHook);
      v1.addHook("preHandler", idempotencyHook);

      v1.post(
        "/runs",
        { preHandler: requireScope("runs:write") },
        async (request, reply) => {
          const body = createRunSchema.parse(request.body);
          const tenantId = request.auth!.tenant_id;

          const agent = await prisma.agent.findFirst({
            where: { id: body.agentId, tenantId },
          });
          if (!agent) {
            throw new ApiError(404, "NOT_FOUND", "Agent not found");
          }

          const response = await orchestratorFetch(
            options.orchestratorUrl,
            "/internal/runs",
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                tenantId,
                agentId: body.agentId,
                input: body.input,
                taskClass: body.taskClass,
                userId: request.auth!.sub,
              }),
            },
          );

          if (!response.ok) {
            const err = (await response.json().catch(() => ({}))) as {
              message?: string;
            };
            throw new ApiError(
              response.status as 400,
              "INTERNAL",
              err.message ?? "Orchestrator failed",
            );
          }

          const result = (await response.json()) as {
            runId: string;
            status: string;
          };
          return reply.code(202).send(result);
        },
      );

      v1.get(
        "/runs/:runId",
        { preHandler: requireScope("runs:read") },
        async (request) => {
          const { runId } = request.params as { runId: string };
          const run = await prisma.run.findFirst({
            where: { id: runId, tenantId: request.auth!.tenant_id },
          });
          if (!run) throw new ApiError(404, "NOT_FOUND", "Run not found");
          return {
            runId: run.id,
            status: run.status,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            errorCode: run.errorCode,
          };
        },
      );

      v1.get(
        "/runs/:runId/events",
        { preHandler: requireScope("runs:read") },
        async (request, reply) => {
          const { runId } = request.params as { runId: string };
          const tenantId = request.auth!.tenant_id;
          const run = await prisma.run.findFirst({
            where: { id: runId, tenantId },
          });
          if (!run) throw new ApiError(404, "NOT_FOUND", "Run not found");

          const cursor = (request.query as { cursor?: string }).cursor;
          const streamUrl = new URL(
            `${options.realtimeUrl.replace(/\/$/, "")}/internal/runs/${runId}/events`,
          );
          if (cursor) streamUrl.searchParams.set("cursor", cursor);
          streamUrl.searchParams.set("tenantId", tenantId);

          const streamResponse = await fetch(streamUrl);
          if (!streamResponse.ok || !streamResponse.body) {
            throw new ApiError(409, "CONFLICT", "Unable to open event stream");
          }

          reply.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });

          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder();

          const pump = async () => {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              reply.raw.write(decoder.decode(value));
            }
            reply.raw.end();
          };

          request.raw.on("close", () => {
            void reader.cancel();
          });

          void pump();
          return reply;
        },
      );

      v1.post(
        "/agents",
        { preHandler: requireScope("agents:write") },
        async (request, reply) => {
          const body = createAgentSchema.parse(request.body);
          const agent = await prisma.agent.create({
            data: {
              tenantId: request.auth!.tenant_id,
              name: body.name,
              configJson: body.config as Prisma.InputJsonValue,
            },
          });
          return reply.code(201).send({
            agentId: agent.id,
            createdAt: agent.createdAt,
          });
        },
      );

      v1.post(
        "/workflows",
        { preHandler: requireScope("workflows:write") },
        async (request, reply) => {
          const body = createWorkflowSchema.parse(request.body);
          const workflow = await prisma.workflow.create({
            data: {
              tenantId: request.auth!.tenant_id,
              name: body.name,
              triggerType: body.triggerType,
              definitionJson: body.definition as Prisma.InputJsonValue,
            },
          });
          return reply.code(201).send({
            workflowId: workflow.id,
            createdAt: workflow.createdAt,
          });
        },
      );

      v1.put(
        "/provider-policies",
        { preHandler: requireScope("admin:write") },
        async (request) => {
          const body = providerPolicySchema.parse(request.body);
          const policy = await prisma.providerPolicy.upsert({
            where: {
              tenantId_taskClass: {
                tenantId: request.auth!.tenant_id,
                taskClass: body.taskClass,
              },
            },
            create: {
              tenantId: request.auth!.tenant_id,
              taskClass: body.taskClass,
              primaryModel: body.primaryModel,
              fallbackChainJson: body.fallbackChain,
              maxTokens: body.maxTokens,
              timeoutMs: body.timeoutMs,
            },
            update: {
              primaryModel: body.primaryModel,
              fallbackChainJson: body.fallbackChain,
              maxTokens: body.maxTokens,
              timeoutMs: body.timeoutMs,
            },
          });
          return { policyId: policy.id, updatedAt: policy.updatedAt };
        },
      );

      v1.get(
        "/usage/summary",
        { preHandler: requireScope("billing:read") },
        async (request) => {
          const tenantId = request.auth!.tenant_id;
          const query = request.query as { from?: string; to?: string };
          const from = query.from ? new Date(query.from) : undefined;
          const to = query.to ? new Date(query.to) : undefined;

          const rows = await prisma.usageLedger.findMany({
            where: {
              tenantId,
              ...(from || to
                ? {
                    createdAt: {
                      ...(from ? { gte: from } : {}),
                      ...(to ? { lte: to } : {}),
                    },
                  }
                : {}),
            },
          });

          const tokensIn = rows.reduce((sum, r) => sum + r.inputTokens, 0);
          const tokensOut = rows.reduce((sum, r) => sum + r.outputTokens, 0);
          const costUsd = rows.reduce(
            (sum, r) => sum + Number(r.costUsd),
            0,
          );

          return { tokensIn, tokensOut, costUsd };
        },
      );
    },
    { prefix: "/v1" },
  );
}
