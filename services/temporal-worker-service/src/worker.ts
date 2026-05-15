import "dotenv/config";
import { fileURLToPath } from "node:url";
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities.js";

async function main() {
  const address = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE ?? "ai-workforce-runs";

  const connection = await NativeConnection.connect({ address });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
    taskQueue,
    workflowsPath: fileURLToPath(new URL("./workflows.ts", import.meta.url)),
    activities,
  });

  console.log(`Temporal worker listening on queue: ${taskQueue}`);
  await worker.run();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
