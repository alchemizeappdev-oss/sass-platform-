# Support agent service

Reference vertical for **autonomous support operations**.

Owns support-specific prompts, triage classifiers, and connector actions (Zendesk, Intercom, etc.).

Integrates only through:

- `agent-orchestrator` (run signals)
- `model-router` (inference)
- `workflow-contracts` / `events` packages

Demo path: `docs/verticals/SUPPORT_OPS.md`
