import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { executeRun } from "./run-executor.js";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const agentTasksQueue = new Queue("agent.tasks", { connection });

export function startRunWorker(): Worker {
  return new Worker(
    "agent.tasks",
    async (job) => {
      await executeRun(job.data.runId as string);
    },
    {
      connection,
      concurrency: Number(process.env.AGENT_WORKER_CONCURRENCY ?? 5),
    },
  );
}

export async function enqueueRun(runId: string): Promise<void> {
  await agentTasksQueue.add(
    "execute-run",
    { runId },
    {
      jobId: runId,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
}
