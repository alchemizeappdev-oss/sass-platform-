# Canonical execution primitives

Use these terms consistently in APIs, UI, docs, and Temporal workflows. **Do not introduce synonyms** (e.g. “job” vs “run”) without updating this page.

| Primitive | Definition | Owns state? | Example ID |
|-----------|------------|-------------|------------|
| **Agent** | Tenant-configured autonomous worker with tools, policies, and prompts | Config only | `agent_…` |
| **Workflow** | Durable definition: triggers, steps, compensations, human gates | Definition | `wf_…` |
| **Run** | Single execution instance of an agent or workflow for one tenant | **Yes** (lifecycle) | `run_…` |
| **Step** | Atomic unit inside a run (model call, connector action, approval wait) | Yes (per step) | `step_…` |
| **Event** | Immutable fact emitted during a run (audit + realtime) | Append-only | `evt_…` |
| **Artifact** | Durable output (reply draft, screenshot, diff, export) linked to a step | Blob metadata | `art_…` |
| **Policy** | Tenant rule: models, budgets, data sensitivity, tool allow-list | Config | `pol_…` |
| **Connector** | External system adapter (Zendesk, Slack, HubSpot) | Credentials + schema | `conn_…` |
| **Memory** | Reusable execution knowledge scoped to tenant/task pattern | Index | `mem_…` |

## Unit of execution

The **Run** is the canonical unit of execution.

- One user or system trigger → one **Run**
- A **Run** contains ordered **Steps**
- Every state change emits an **Event**
- Side effects produce **Artifacts**

```
Trigger → Run (queued → running → terminal)
            ├── Step 1 (e.g. triage.classify)
            ├── Step 2 (e.g. model.generate)
            ├── Step 3 (e.g. human.approval)   ← optional
            └── Step N (e.g. connector.reply)
```

## What we do *not* use as top-level concepts

| Avoid | Use instead |
|-------|-------------|
| Job | Run (BullMQ “jobs” are transport only) |
| Task (generic) | Step, or `taskClass` on a run for routing |
| Session | Run series grouped in UI, not a separate primitive |
| Execution graph | Run + Steps (graph is a view) |

## API mapping (MVP)

| HTTP / SSE | Primitive |
|------------|-----------|
| `POST /v1/runs` | Create **Run** |
| `GET /v1/runs/:id` | Read **Run** |
| `GET /v1/runs/:id/events` | Stream **Event**s |
| `POST /v1/agents` | Create **Agent** |
| `PUT /v1/provider-policies` | Upsert **Policy** |
