import { Connection, Client } from "@temporalio/client";

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client | null> {
  if (client) return client;
  const address = process.env.TEMPORAL_ADDRESS;
  if (!address) return null;

  try {
    const connection = await Connection.connect({ address });
    client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
    });
    return client;
  } catch {
    return null;
  }
}

export async function startRunWorkflow(runId: string): Promise<boolean> {
  const temporal = await getTemporalClient();
  if (!temporal) return false;

  await temporal.workflow.start("runLifecycleWorkflow", {
    taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "ai-workforce-runs",
    workflowId: `run-${runId}`,
    args: [runId],
  });
  return true;
}
