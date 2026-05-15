import { prisma, RunStatus } from "@ai-workforce/database";
import { emitRunEvent } from "./events.js";

const MODEL_ROUTER_URL =
  process.env.MODEL_ROUTER_URL ?? "http://localhost:4002";

export async function executeRun(runId: string): Promise<void> {
  const run = await prisma.run.findUniqueOrThrow({ where: { id: runId } });

  await prisma.run.update({
    where: { id: runId },
    data: { status: RunStatus.running, startedAt: new Date() },
  });
  await emitRunEvent(run.tenantId, runId, "run.started");

  const policy = await prisma.providerPolicy.findUnique({
    where: {
      tenantId_taskClass: {
        tenantId: run.tenantId,
        taskClass: run.taskClass ?? "general",
      },
    },
  });

  const input = (run.inputJson ?? {}) as Record<string, unknown>;
  const prompt =
    typeof input.prompt === "string"
      ? input.prompt
      : JSON.stringify(input);

  const response = await fetch(`${MODEL_ROUTER_URL}/v1/complete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tenantId: run.tenantId,
      runId,
      taskClass: run.taskClass ?? "general",
      prompt,
      maxTokens: policy?.maxTokens,
      timeoutMs: policy?.timeoutMs,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: RunStatus.failed,
        finishedAt: new Date(),
        errorCode: "MODEL_FAILED",
      },
    });
    await emitRunEvent(run.tenantId, runId, "run.failed", {
      error: errText,
    });
    return;
  }

  const result = (await response.json()) as { text: string };

  await prisma.runStep.create({
    data: {
      runId,
      stepType: "model.generate",
      status: "succeeded",
      inputJson: { prompt },
      outputJson: { text: result.text },
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });

  await prisma.run.update({
    where: { id: runId },
    data: { status: RunStatus.succeeded, finishedAt: new Date() },
  });
  await emitRunEvent(run.tenantId, runId, "run.succeeded", {
    text: result.text,
  });
}
