import { prisma, type Prisma } from "@ai-workforce/database";

export async function emitRunEvent(
  tenantId: string,
  runId: string,
  type: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  await prisma.event.create({
    data: {
      tenantId,
      runId,
      type,
      payloadJson: payload as Prisma.InputJsonValue,
    },
  });
}
