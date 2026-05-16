export type TelemetryContext = {
  requestId?: string;
  tenantId?: string;
  runId?: string;
  workflowId?: string;
  provider?: string;
};

export function createTelemetryEvent(
  event: string,
  context: TelemetryContext = {},
): Record<string, unknown> {
  return {
    event,
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    tenantId: context.tenantId,
    runId: context.runId,
    workflowId: context.workflowId,
    provider: context.provider,
  };
}

export function emitTelemetry(
  event: string,
  context: TelemetryContext = {},
): void {
  const payload = createTelemetryEvent(event, context);

  console.log(JSON.stringify({
    type: "telemetry",
    ...payload,
  }));
}
