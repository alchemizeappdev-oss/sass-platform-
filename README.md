# AI Workforce Platform

Production-oriented monorepo for a multi-tenant AI workforce control plane (Phase 1 MVP).

## Stack

- **Experience**: Next.js App Router + Tailwind (`apps/web-app`)
- **Control plane**: Fastify services (`services/api-gateway`, `agent-orchestrator`, `model-router`, `realtime-service`)
- **Data**: PostgreSQL + Prisma (`packages/database`), Redis + BullMQ
- **Orchestration**: Temporal worker (`services/temporal-worker-service`), n8n (compose only in Phase 1)

## Quick start

```bash
cp .env.example .env
docker compose up -d postgres redis temporal temporal-ui n8n
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm --filter @ai-workforce/api-gateway dev
pnpm --filter @ai-workforce/agent-orchestrator dev
pnpm --filter @ai-workforce/model-router dev
pnpm --filter @ai-workforce/realtime-service dev
pnpm --filter @ai-workforce/web-app dev
```

Set `SUPABASE_JWT_SECRET=dev-jwt-secret-change-me` in `.env` for local HS256 tokens.

### Dev JWT + smoke test

```bash
node scripts/generate-dev-jwt.mjs
```

Seed tenant/agent (via `psql` or Prisma Studio), then:

```bash
curl http://localhost:4000/healthz
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: agent-1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Support Agent","config":{}}'
```

## Architecture alignment

| Spec area | Repo location |
|-----------|----------------|
| API gateway + `/v1/*` | `services/api-gateway` |
| Run state machine | `services/agent-orchestrator` |
| Model routing + fallback | `services/model-router` |
| SSE run events | `services/realtime-service` |
| Temporal lifecycle | `services/temporal-worker-service` |
| Prisma MVP schema | `packages/database/prisma/schema.prisma` |
| Shared contracts/auth | `packages/shared` |

## Phase 1 gaps (intentional)

- Claude/Kimi/Ollama adapters stubbed beyond OpenAI + mock
- Supabase RLS policies live in migrations (add `supabase/migrations` next)
- n8n templates not wired until Phase 2 connector framework
- Enterprise SAML/SCIM deferred
