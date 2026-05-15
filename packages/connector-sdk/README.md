# Connector SDK (Phase 2)

Shared contract for external systems. Extensions implement:

- `auth()`, `refreshToken()`
- `trigger()`, `sync()`, `executeAction()`
- `validateWebhook()`

Core services call connectors through Temporal activities — extensions never call each other directly.
