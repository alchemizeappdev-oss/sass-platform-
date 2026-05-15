# Operator console

Every serious agent platform becomes an **operations company**. The console is not only a builder UI—it is how humans run production.

## MVP (today)

| Capability | Status | Surface |
|------------|--------|---------|
| View run status | Shipped | `GET /v1/runs/:id`, SSE events |
| Usage summary | Shipped | `GET /v1/usage/summary` |
| Provider policies | Shipped | `PUT /v1/provider-policies` |
| Support ops home | Shell | `apps/web-app` → `/support` |

## Phase 2 operator controls

| Control | Purpose |
|---------|---------|
| **Suspend tenant** | Stop all new runs; drain in-flight |
| **Replay failed run** | New run with same input graph + idempotency guard |
| **Inspect queue** | Depth, age, per-tenant concurrency |
| **Revoke provider** | Disable model key / route for tenant |
| **Pause workflows** | Halt template class without killing orchestrator |
| **Replay DLQ** | Re-enqueue failed BullMQ / Temporal activities |
| **Inspect traces** | `traceId` + `runId` in OpenTelemetry |
| **Cost anomaly alerts** | Token burn rate vs baseline |

## API sketch (not implemented)

```http
POST /v1/operator/tenants/{tenantId}/suspend
POST /v1/operator/runs/{runId}/replay
GET  /v1/operator/queues/{name}
POST /v1/operator/dlq/replay
```

All operator routes require elevated scope (`operator:write`) distinct from tenant admin.

## UI zones (planned)

```txt
/support          ← reference vertical (triage, approvals)
/operations       ← queues, DLQ, tenant health
/observability    ← traces, cost, provider SLOs
/settings         ← policies, connectors, seats
```

See `apps/web-app` — navigation will gain `/operations` when backend endpoints land.
