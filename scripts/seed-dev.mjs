import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tenantId = process.env.DEV_TENANT_ID ?? "tenant_dev";

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      name: "Dev Tenant",
    },
  });

  const user = await prisma.user.upsert({
    where: { authSubject: "user_dev" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "dev@example.com",
      authSubject: "user_dev",
    },
  });

  await prisma.membership.upsert({
    where: {
      tenantId_userId: { tenantId: tenant.id, userId: user.id },
    },
    update: { role: "owner" },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: "owner",
    },
  });

  const agent = await prisma.agent.upsert({
    where: { id: "agent_dev" },
    update: {},
    create: {
      id: "agent_dev",
      tenantId: tenant.id,
      name: "Dev Agent",
      configJson: {},
    },
  });

  await prisma.providerPolicy.upsert({
    where: {
      tenantId_taskClass: { tenantId: tenant.id, taskClass: "general" },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      taskClass: "general",
      primaryModel: "mock/default",
      fallbackChainJson: ["openai/gpt-4o-mini"],
    },
  });

  console.log(JSON.stringify({ tenantId: tenant.id, agentId: agent.id }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
