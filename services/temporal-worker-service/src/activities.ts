export async function executeRunActivity(runId: string): Promise<void> {
  const orchestratorUrl =
    process.env.AGENT_ORCHESTRATOR_URL ?? "http://localhost:4001";

  const response = await fetch(`${orchestratorUrl}/internal/execute/${runId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Run execution failed: ${response.status}`);
  }
}
