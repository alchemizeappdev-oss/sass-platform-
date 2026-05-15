import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@ai-workforce/database";
import { ApiError } from "@ai-workforce/shared";

const TTL_MS = 24 * 60 * 60 * 1000;

export async function idempotencyHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!["POST", "PUT", "PATCH"].includes(request.method)) return;
  if (!request.auth) return;

  const key = request.headers["idempotency-key"];
  if (!key || typeof key !== "string") {
    throw new ApiError(400, "BAD_REQUEST", "Idempotency-Key header is required");
  }

  const existing = await prisma.idempotencyKey.findUnique({
    where: {
      tenantId_key: {
        tenantId: request.auth.tenant_id,
        key,
      },
    },
  });

  if (existing) {
    if (existing.expiresAt < new Date()) {
      await prisma.idempotencyKey.delete({ where: { id: existing.id } });
    } else {
      reply
        .code(existing.statusCode)
        .send(existing.response as Record<string, unknown>);
      return reply;
    }
  }

  const originalSend = reply.send.bind(reply);
  reply.send = function wrappedSend(payload: unknown) {
    void prisma.idempotencyKey
      .create({
        data: {
          tenantId: request.auth!.tenant_id,
          key,
          method: request.method,
          path: request.url,
          response: payload as object,
          statusCode: reply.statusCode,
          expiresAt: new Date(Date.now() + TTL_MS),
        },
      })
      .catch(() => undefined);
    return originalSend(payload);
  };
}
