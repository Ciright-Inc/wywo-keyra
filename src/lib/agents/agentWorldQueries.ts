import prisma from "@/lib/prisma";

export async function getAgentWorldControlCenterMetrics() {
  const [
    parentAgents,
    keyraAgents,
    worlds,
    tenantInstances,
    knowledgePacks,
    activeWorlds,
    activeInstances,
    pendingApprovals,
    graphEdges,
    indexEntries,
    recentEvents,
  ] = await Promise.all([
    prisma.cirightParentAgent.count(),
    prisma.keyraDeploymentAgent.count(),
    prisma.agentWorld.count(),
    prisma.tenantAgentInstance.count(),
    prisma.knowledgePack.count(),
    prisma.agentWorld.count({ where: { isActive: true } }),
    prisma.tenantAgentInstance.count({ where: { status: "ACTIVE" } }),
    prisma.keyraDeploymentAgent.count({ where: { deploymentReadiness: "PENDING_APPROVAL" } }),
    prisma.operationalGraphEdge.count(),
    prisma.intrinsicIndexEntry.count(),
    prisma.agentDeploymentEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const worldsByType = await prisma.agentWorld.groupBy({
    by: ["worldType"],
    _count: { _all: true },
  });

  const agentsByIndustry = await prisma.keyraDeploymentAgent.groupBy({
    by: ["industryVertical"],
    _count: { _all: true },
  });

  return {
    parentAgents,
    keyraAgents,
    worlds,
    tenantInstances,
    knowledgePacks,
    activeWorlds,
    activeInstances,
    pendingApprovals,
    graphEdges,
    indexEntries,
    recentEvents,
    worldsByType,
    agentsByIndustry,
  };
}

export async function listAgentWorldsWithCounts() {
  return prisma.agentWorld.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          tenantInstances: true,
          knowledgePackLinks: true,
          integrations: true,
        },
      },
    },
  });
}

export async function listParentAgentsWithKeyraCount() {
  return prisma.cirightParentAgent.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { keyraAgents: true } } },
  });
}

export async function listKeyraAgentsWithRelations() {
  return prisma.keyraDeploymentAgent.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parentAgent: { select: { parentAgentId: true, name: true, slug: true } },
      _count: { select: { tenantInstances: true, knowledgePackLinks: true } },
    },
  });
}

export async function listKnowledgePacksWithCounts() {
  return prisma.knowledgePack.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { worldLinks: true, keyraAgentLinks: true } },
    },
  });
}

export async function listTenantInstancesWithLineage() {
  return prisma.tenantAgentInstance.findMany({
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    include: {
      agentWorld: { select: { worldId: true, name: true, worldType: true } },
      keyraAgent: {
        select: {
          keyraAgentId: true,
          name: true,
          parentAgent: { select: { parentAgentId: true, name: true } },
        },
      },
    },
  });
}
