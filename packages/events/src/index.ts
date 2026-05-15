/** Immutable run event types — persisted to Postgres and streamed via SSE */

export const RunEventTypes = {
  QUEUED: "run.queued",
  STARTED: "run.started",
  STEP_STARTED: "run.step.started",
  STEP_SUCCEEDED: "run.step.succeeded",
  STEP_FAILED: "run.step.failed",
  APPROVAL_REQUIRED: "run.approval.required",
  APPROVAL_GRANTED: "run.approval.granted",
  SUCCEEDED: "run.succeeded",
  FAILED: "run.failed",
} as const;

export type RunEventType = (typeof RunEventTypes)[keyof typeof RunEventTypes];
