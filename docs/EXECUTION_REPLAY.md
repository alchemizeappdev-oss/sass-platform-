# Provider-agnostic execution replay

## Problem

Enterprises need to compare **the same run graph** across models and providers as the market commoditizes—without re-authoring workflows.

## Design

1. Persist an immutable **run graph snapshot** at plan time:
   - steps, inputs (redacted), tool choices, policy version
2. On replay, create a new `Run` linked to `replayOfRunId`
3. Re-execute steps with `policy.overrideProvider` / `policy.overrideModel`
4. Record comparative metrics: latency, tokens, cost, quality score (human or rubric)

```txt
Original Run ──snapshot──► RunGraph v3
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
      Replay (gpt-4o)    Replay (claude)     Replay (kimi)
            │                   │                   │
            └───────────────────┴───────────────────┘
                                ▼
                      Comparison Report (Artifact)
```

## API sketch

```http
POST /v1/runs/{runId}/replay
{
  "providerOverrides": { "model.generate": "anthropic/claude-sonnet-4" },
  "compare": true
}
```

## MVP status

**Not implemented.** Primitives (`Run`, `Step`, `Event`, `Policy`) and usage ledger are in place to support this in Phase 2.

## Why it matters strategically

This is rare in OSS agent stacks and aligns with enterprise procurement: *prove* vendor independence before contracts renew.
