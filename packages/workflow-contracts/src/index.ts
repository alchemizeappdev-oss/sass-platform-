/** Canonical execution primitives — keep in sync with docs/PRIMITIVES.md */

export type RunStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type StepStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped";

export interface RunRef {
  id: string;
  tenantId: string;
  kind: "agent" | "workflow";
  status: RunStatus;
  taskClass?: string;
}

export interface StepRef {
  id: string;
  runId: string;
  stepType: string;
  status: StepStatus;
}

export interface DomainEvent<T extends string = string, P = unknown> {
  id: string;
  tenantId: string;
  runId: string;
  type: T;
  payload: P;
  createdAt: string;
}
