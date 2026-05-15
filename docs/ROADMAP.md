# Roadmap

Ordered for **executable → opinionated → demoable → composable**.

## Now (Phase 1 — in repo)

- [x] Monorepo spine (`apps`, `services`, `packages`, `infrastructure`, `docs`)
- [x] Canonical primitives doc
- [x] Support ops as reference vertical (API demo path)
- [x] `docker compose up` local stack
- [ ] Supabase Auth wired in `web-app`
- [ ] Human approval step in Temporal workflow
- [ ] `support-agent-service` first activity handlers

## Next (Phase 2)

- [ ] Planner service split from orchestrator
- [ ] Operator console APIs (`docs/OPERATOR_CONSOLE.md`)
- [ ] Execution replay (`docs/EXECUTION_REPLAY.md`)
- [ ] Connector SDK + Zendesk adapter
- [ ] Redis Streams event bus
- [ ] OpenTelemetry baseline

## Later (Phase 3+)

- [ ] Extension modules (CRM, marketing, codegen, browser) behind feature flags
- [ ] Helm chart (`infrastructure/helm`)
- [ ] Enterprise SSO / SCIM

## Anti-goals (avoid empty-repo syndrome)

- No new vertical until Support Ops demo is **recordable in < 5 minutes**
- No Terraform-first onboarding
- No duplicate terminology in APIs (enforce `docs/PRIMITIVES.md`)
