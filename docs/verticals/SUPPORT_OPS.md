# Reference vertical: Autonomous support operations

**One polished vertical beats fifteen half-dead modules.**

This is the canonical demo path for the platform. It exercises orchestration, human approval, realtime, provider routing, audit events, retries, and usage metering without CRM/marketing/codegen noise.

## Storyboard

```txt
Ticket ingested (webhook or manual)
  → Run created (kind: agent, taskClass: support.triage)
  → Step: classify + priority
  → Step: draft reply (model-router)
  → Step: human.approval (Temporal wait)
  → Step: connector.send (Zendesk/Intercom — Phase 2)
  → Run succeeded + audit trail
```

## MVP demo (local)

1. `docker compose up -d` (from repo root)
2. `pnpm db:migrate && node scripts/seed-dev.mjs`
3. Start gateway, orchestrator, model-router, realtime, web-app
4. Create agent: `POST /v1/agents` with `name: "Support Triage"`
5. Start run:

```bash
curl -X POST http://localhost:4000/v1/runs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: support-demo-1" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_dev",
    "taskClass": "support.triage",
    "input": { "prompt": "Customer cannot reset password; account email changed last week." }
  }'
```

6. Stream events: `GET /v1/runs/{runId}/events`
7. Confirm usage: `GET /v1/usage/summary`

## Service ownership (target)

| Concern | Service |
|---------|---------|
| Triage prompts / tools | `services/support-agent-service` |
| Lifecycle / retries | `services/agent-orchestrator` |
| Model choice | `services/model-router` |
| Approvals | Temporal + `apps/web-app` |
| Fanout | `services/realtime-service` |

## Deferred (explicitly)

- CRM sync, marketing campaigns, codegen, browser automation — see `docs/ROADMAP.md`
