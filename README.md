# sass-platform-

**Agentic execution fabric** for multi-tenant operations — not a LangChain wrapper.

The first reference vertical is **autonomous support operations** (triage → draft → approve → send → audit). Other modules (CRM, marketing, codegen) are intentionally deferred.

> **Naming:** GitHub repo is `sass-platform-` under `alchemizeappdev-oss`. Package scope `@ai-workforce/*` avoids collision with unrelated “Alchemize/Alchemy” projects on GitHub.

## Start here

| Doc | Purpose |
|-----|---------|
| [docs/MANIFESTO.md](docs/MANIFESTO.md) | Why planning ≠ orchestration ≠ execution |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Canonical execution diagram |
| [docs/PRIMITIVES.md](docs/PRIMITIVES.md) | Run, Step, Event — do not rename these |
| [docs/verticals/SUPPORT_OPS.md](docs/verticals/SUPPORT_OPS.md) | **Demo this first** |
| [docs/REPO_LAYOUT.md](docs/REPO_LAYOUT.md) | Monorepo map |
| [docs/ROADMAP.md](docs/ROADMAP.md) | What ships when |

## Quick start

```bash
cp .env.example .env
docker compose up -d          # postgres, redis, temporal, n8n
pnpm install
pnpm db:generate && pnpm db:migrate
node scripts/seed-dev.mjs

pnpm --filter @ai-workforce/api-gateway dev
pnpm --filter @ai-workforce/agent-orchestrator dev
pnpm --filter @ai-workforce/model-router dev
pnpm --filter @ai-workforce/realtime-service dev
pnpm --filter @ai-workforce/web-app dev
```

Dev JWT: `node scripts/generate-dev-jwt.mjs` (set `SUPABASE_JWT_SECRET=dev-jwt-secret-change-me`).

## Layout (spine)

```txt
apps/           web-app, api-gateway
services/       orchestrator, model-router, realtime, temporal-worker, support-agent (vertical)
packages/       database, shared, workflow-contracts, events, …
infrastructure/ docker/ (compose), helm/, terraform/ (stubs)
docs/           architecture, primitives, operator console, verticals
```

## What runs today

- Tenant-scoped `/v1/runs` with idempotency
- Run state machine + BullMQ (Temporal when available)
- Model router with fallback + usage ledger
- SSE run events
- Operator console shell at http://localhost:3000/support

## Strategic bets (documented, building next)

- [Operator controls](docs/OPERATOR_CONSOLE.md) — suspend, replay, DLQ
- [Execution replay](docs/EXECUTION_REPLAY.md) — same graph, different providers
- Planner / execution split per [manifesto](docs/MANIFESTO.md)

## Anti-patterns we avoid

- Fifteen half-built verticals before one works
- Kubernetes-first onboarding
- Synonym sprawl (`job` vs `run`) — see [PRIMITIVES](docs/PRIMITIVES.md)
