-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE "RunKind" AS ENUM ('agent', 'workflow');
CREATE TYPE "RunStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');
CREATE TYPE "StepStatus" AS ENUM ('pending', 'running', 'succeeded', 'failed', 'skipped');
CREATE TYPE "PlanTier" AS ENUM ('free', 'pro', 'enterprise');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan_tier" "PlanTier" NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "auth_subject" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config_json" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "definition_json" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "kind" "RunKind" NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'queued',
    "task_class" TEXT,
    "input_json" JSONB,
    "error_code" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "run_steps" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "step_type" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'pending',
    "input_json" JSONB,
    "output_json" JSONB,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    CONSTRAINT "run_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "task_class" TEXT NOT NULL,
    "primary_model" TEXT NOT NULL,
    "fallback_chain_json" JSONB NOT NULL DEFAULT '[]',
    "max_tokens" INTEGER NOT NULL DEFAULT 4096,
    "timeout_ms" INTEGER NOT NULL DEFAULT 60000,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "provider_policies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usage_ledger" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "run_id" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input_tokens" INTEGER NOT NULL DEFAULT 0,
    "output_tokens" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_ledger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "idempotency_keys" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "status_code" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- Indexes & uniques
CREATE UNIQUE INDEX "users_auth_subject_key" ON "users"("auth_subject");
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE UNIQUE INDEX "memberships_tenant_id_user_id_key" ON "memberships"("tenant_id", "user_id");
CREATE INDEX "agents_tenant_id_idx" ON "agents"("tenant_id");
CREATE INDEX "workflows_tenant_id_idx" ON "workflows"("tenant_id");
CREATE INDEX "runs_tenant_id_status_idx" ON "runs"("tenant_id", "status");
CREATE INDEX "runs_tenant_id_created_at_idx" ON "runs"("tenant_id", "created_at");
CREATE INDEX "run_steps_run_id_idx" ON "run_steps"("run_id");
CREATE INDEX "events_run_id_created_at_idx" ON "events"("run_id", "created_at");
CREATE INDEX "events_tenant_id_created_at_idx" ON "events"("tenant_id", "created_at");
CREATE UNIQUE INDEX "provider_policies_tenant_id_task_class_key" ON "provider_policies"("tenant_id", "task_class");
CREATE INDEX "usage_ledger_tenant_id_created_at_idx" ON "usage_ledger"("tenant_id", "created_at");
CREATE UNIQUE INDEX "idempotency_keys_tenant_id_key_key" ON "idempotency_keys"("tenant_id", "key");
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

-- Foreign keys
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agents" ADD CONSTRAINT "agents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "runs" ADD CONSTRAINT "runs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "runs" ADD CONSTRAINT "runs_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_policies" ADD CONSTRAINT "provider_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
