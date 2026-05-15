# Repository layout

This monorepo is organized as an **execution operating platform**, not a SaaS starter kit.

```txt
apps/                          # User-facing and edge APIs
  web-app/                     # Operator console (Next.js)
  api-gateway/                 # Public /v1 API + auth boundary

services/                      # Control + execution plane
  agent-orchestrator/          # Run state machine, enqueue, signals
  planner-service/             # LLM planning (Phase 2 — stub)
  model-router/                # Provider routing + fallback
  realtime-service/            # SSE / WebSocket fanout
  execution-service/           # Worker pool coordinator (Phase 2 — stub)
  temporal-worker-service/     # Durable workflows
  support-agent-service/       # Reference vertical: autonomous support ops

packages/
  database/                    # Prisma schema + client
  shared/                      # Auth, contracts, errors (→ shared-types)
  workflow-contracts/          # Canonical Run/Step/Event types
  events/                      # Domain event names + payloads
  connector-sdk/               # Connector runtime contract (Phase 2)
  observability/               # Trace/metric helpers (Phase 2)

infrastructure/
  docker/                      # Local stack (postgres, redis, temporal, n8n)
  helm/                        # Production K8s charts (Phase 2)
  terraform/                   # Cloud IaC (Phase 2)

docs/                          # Architecture, primitives, verticals
scripts/                       # Dev JWT, seed data
```

## Naming note

The GitHub repo is `sass-platform-` under `alchemizeappdev-oss`. Product code uses `@ai-workforce/*` package scope to avoid collision with unrelated “Alchemize/Alchemy” projects on GitHub. Rename the scope when the public product name is finalized.
