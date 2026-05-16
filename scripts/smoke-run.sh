#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
JWT="${JWT:-}"
AGENT_ID="${AGENT_ID:-}"

if [[ -z "$JWT" ]]; then
  echo "JWT env var required"
  exit 1
fi

if [[ -z "$AGENT_ID" ]]; then
  echo "AGENT_ID env var required"
  exit 1
fi

echo "== Health checks =="
curl -fsS "$BASE_URL/healthz"
curl -fsS "$BASE_URL/readyz"

echo "== Create run =="
RUN_RESPONSE=$(curl -fsS -X POST "$BASE_URL/v1/runs" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: smoke-test-001" \
  -d "{\"agentId\":\"$AGENT_ID\",\"taskClass\":\"support\",\"input\":{\"message\":\"smoke test\"}}")

echo "$RUN_RESPONSE"

RUN_ID=$(echo "$RUN_RESPONSE" | sed -n 's/.*"runId":"\([^"]*\)".*/\1/p')

if [[ -z "$RUN_ID" ]]; then
  echo "Failed to parse run ID"
  exit 1
fi

echo "== Fetch run =="
curl -fsS "$BASE_URL/v1/runs/$RUN_ID" \
  -H "Authorization: Bearer $JWT"

echo "== Usage summary =="
curl -fsS "$BASE_URL/v1/usage/summary" \
  -H "Authorization: Bearer $JWT"

echo "Smoke run complete"
