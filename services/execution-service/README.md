# Execution service (Phase 2)

Coordinates worker pools: dequeue commands, invoke Temporal activities, connector runs, browser jobs.

Emits results to the event bus; does not own run state (orchestrator does).
