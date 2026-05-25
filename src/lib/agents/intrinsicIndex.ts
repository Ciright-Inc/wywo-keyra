import type {
  AgentDomainLayer,
  IntrinsicIndexEntityKind,
  OperationalGraphRelation,
  Prisma,
} from "@prisma/client";
import prisma from "@/lib/prisma";

export type IndexEntityInput = {
  entityKind: IntrinsicIndexEntityKind;
  entityRef: string;
  displayLabel: string;
  domainLayer?: AgentDomainLayer | null;
  agentWorldId?: string | null;
  lineageOnly?: boolean;
  metadata?: Record<string, unknown>;
};

export type GraphEdgeInput = {
  relation: OperationalGraphRelation;
  fromKind: IntrinsicIndexEntityKind;
  fromRef: string;
  toKind: IntrinsicIndexEntityKind;
  toRef: string;
  agentWorldId?: string | null;
  lineageOnly?: boolean;
  metadata?: Record<string, unknown>;
};

export async function upsertIntrinsicIndexEntry(input: IndexEntityInput) {
  const metadataJson = (input.metadata ?? {}) as Prisma.InputJsonValue;
  return prisma.intrinsicIndexEntry.upsert({
    where: {
      entityKind_entityRef: {
        entityKind: input.entityKind,
        entityRef: input.entityRef,
      },
    },
    create: {
      entityKind: input.entityKind,
      entityRef: input.entityRef,
      displayLabel: input.displayLabel,
      domainLayer: input.domainLayer ?? null,
      agentWorldId: input.agentWorldId ?? null,
      lineageOnly: input.lineageOnly ?? true,
      metadataJson,
    },
    update: {
      displayLabel: input.displayLabel,
      domainLayer: input.domainLayer ?? null,
      agentWorldId: input.agentWorldId ?? null,
      lineageOnly: input.lineageOnly ?? true,
      metadataJson,
      indexedAt: new Date(),
    },
  });
}

export async function createGraphEdge(input: GraphEdgeInput) {
  return prisma.operationalGraphEdge.create({
    data: {
      relation: input.relation,
      fromKind: input.fromKind,
      fromRef: input.fromRef,
      toKind: input.toKind,
      toRef: input.toRef,
      agentWorldId: input.agentWorldId ?? null,
      lineageOnly: input.lineageOnly ?? true,
      metadataJson: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function getOperationalGraphSummary(agentWorldId?: string) {
  const where = agentWorldId ? { agentWorldId } : {};
  const [nodes, edges, indexCount] = await Promise.all([
    prisma.intrinsicIndexEntry.findMany({
      where: agentWorldId ? { agentWorldId } : undefined,
      orderBy: [{ entityKind: "asc" }, { displayLabel: "asc" }],
      take: 200,
    }),
    prisma.operationalGraphEdge.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.intrinsicIndexEntry.count({
      where: agentWorldId ? { agentWorldId } : undefined,
    }),
  ]);
  return { nodes, edges, indexCount };
}

export async function getInheritanceChain(tenantInstanceId: string) {
  const instance = await prisma.tenantAgentInstance.findUnique({
    where: { instanceId: tenantInstanceId },
    include: {
      keyraAgent: { include: { parentAgent: true } },
      agentWorld: true,
    },
  });
  if (!instance) return null;

  return {
    tenant: {
      instanceId: instance.instanceId,
      displayName: instance.displayName,
      status: instance.status,
    },
    world: {
      worldId: instance.agentWorld.worldId,
      name: instance.agentWorld.name,
      worldType: instance.agentWorld.worldType,
    },
    keyra: {
      keyraAgentId: instance.keyraAgent.keyraAgentId,
      name: instance.keyraAgent.name,
    },
    parent: {
      parentAgentId: instance.keyraAgent.parentAgent.parentAgentId,
      name: instance.keyraAgent.parentAgent.name,
    },
  };
}
