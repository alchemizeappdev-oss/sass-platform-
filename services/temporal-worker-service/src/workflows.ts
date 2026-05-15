import { proxyActivities, ApplicationFailure } from "@temporalio/workflow";
import type * as activities from "./activities.js";

const { executeRunActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: "10 minutes",
  retry: {
    maximumAttempts: 3,
    initialInterval: "1s",
    backoffCoefficient: 2,
  },
});

export async function runLifecycleWorkflow(runId: string): Promise<void> {
  try {
    await executeRunActivity(runId);
  } catch (err) {
    throw ApplicationFailure.nonRetryable(
      err instanceof Error ? err.message : "Run failed",
    );
  }
}
