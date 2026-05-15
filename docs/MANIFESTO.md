# Why planning, orchestration, and execution must stay separate

Most “AI agent” repos collapse three different problems into one service:

1. **Planning** — non-deterministic reasoning (“what should we do?”)
2. **Orchestration** — deterministic control (“what state are we in, what’s next?”)
3. **Execution** — side effects (“call the model, post the reply, charge the meter”)

When these layers share a process, **provider latency and hallucinations become workflow bugs**. Retries corrupt state. Cost spikes have no choke point. Auditors cannot reconstruct who decided what.

This platform treats agentic systems like **infrastructure**, not prompts wrapped in cron.

## Principles

**Orchestration must stay fast and boring.**  
The orchestrator advances `Run` / `Step` state, enforces idempotency, and signals Temporal. It does not call LLMs on the hot path in production topology.

**Planning is replaceable.**  
Swap planners, prompts, or models without rewriting durable workflows. Plans are artifacts attached to a run, not the source of truth for lifecycle.

**Execution is sandboxed.**  
Models, browsers, and connectors run behind budgets, allow-lists, and per-tenant isolation. Failures degrade through a **deterministic fallback chain**, not silent partial success.

**Events are facts.**  
Every transition emits an immutable `Event`. Realtime UI and compliance timelines are projections of the same log—not separate stories.

**Extensions never call extensions.**  
CRM, support, and marketing modules integrate through core contracts (gateway, orchestrator, event bus). That prevents “AI soup” and keeps the kernel small.

## What we are building

Not another LangChain wrapper.  
An **execution fabric** for multi-tenant agentic operations—closer to *Stripe-for-agents* than *SaaS boilerplate*.

The first proof is **autonomous support operations**: triage → draft → human approval → send → audit, with provider routing and usage metering visible end-to-end.

## What we are not optimizing for (yet)

- Kubernetes-first onboarding (use `docker compose up`)
- Fifteen half-built verticals
- Framework lock-in to a single model vendor

We optimize for **executable, opinionated, demoable, composable**—in that order.
