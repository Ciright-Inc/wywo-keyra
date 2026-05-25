import type { IntrinsicIndexEntityKind, Prisma, PrismaClient } from "@prisma/client";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function seedAgentWorld(prisma: PrismaClient): Promise<{
  skipped: boolean;
  parentAgents: number;
  keyraAgents: number;
  agentWorlds: number;
  knowledgePacks: number;
  tenantInstances: number;
  graphEdges: number;
  indexEntries: number;
  deploymentEvents: number;
  integrations: number;
}> {
  const existing = await prisma.cirightParentAgent.count();
  if (existing > 0 && process.env.FORCE_AGENT_WORLD_SEED !== "1") {
    console.info("[seedAgentWorld] Agent world catalog already present — skipping.");
    return {
      skipped: true,
      parentAgents: existing,
      keyraAgents: await prisma.keyraDeploymentAgent.count(),
      agentWorlds: await prisma.agentWorld.count(),
      knowledgePacks: await prisma.knowledgePack.count(),
      tenantInstances: await prisma.tenantAgentInstance.count(),
      graphEdges: await prisma.operationalGraphEdge.count(),
      indexEntries: await prisma.intrinsicIndexEntry.count(),
      deploymentEvents: await prisma.agentDeploymentEvent.count(),
      integrations: await prisma.agentWorldIntegration.count(),
    };
  }

  if (existing > 0) {
    await prisma.agentDeploymentEvent.deleteMany();
    await prisma.operationalGraphEdge.deleteMany();
    await prisma.intrinsicIndexEntry.deleteMany();
    await prisma.agentOperationalTask.deleteMany();
    await prisma.agentWorldIntegration.deleteMany();
    await prisma.agentWorldKnowledgePack.deleteMany();
    await prisma.keyraAgentKnowledgePack.deleteMany();
    await prisma.tenantAgentInstance.deleteMany();
    await prisma.agentWorld.deleteMany();
    await prisma.keyraDeploymentAgent.deleteMany();
    await prisma.knowledgePack.deleteMany();
    await prisma.cirightParentAgent.deleteMany();
  }

  async function indexEntry(input: {
    entityKind: IntrinsicIndexEntityKind;
    entityRef: string;
    displayLabel: string;
    domainLayer?: "CIRIGHT_PARENT" | "KEYRA_BRIDGE" | "MARKETPLACE";
    agentWorldId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    await prisma.intrinsicIndexEntry.upsert({
      where: { entityKind_entityRef: { entityKind: input.entityKind, entityRef: input.entityRef } },
      create: {
        entityKind: input.entityKind,
        entityRef: input.entityRef,
        displayLabel: input.displayLabel,
        domainLayer: input.domainLayer ?? null,
        agentWorldId: input.agentWorldId ?? null,
        lineageOnly: true,
        metadataJson: input.metadata ?? {},
      },
      update: {
        displayLabel: input.displayLabel,
        domainLayer: input.domainLayer ?? null,
        agentWorldId: input.agentWorldId ?? null,
        metadataJson: input.metadata ?? {},
        indexedAt: new Date(),
      },
    });
  }

  async function graphEdge(input: {
    relation:
      | "INHERITS_FROM"
      | "DEPLOYED_TO"
      | "ATTACHED_TO"
      | "REGULATED_BY"
      | "CONNECTED_TO"
      | "CONTAINS";
    fromKind: IntrinsicIndexEntityKind;
    fromRef: string;
    toKind: IntrinsicIndexEntityKind;
    toRef: string;
    agentWorldId?: string;
  }) {
    await prisma.operationalGraphEdge.create({
      data: {
        relation: input.relation,
        fromKind: input.fromKind,
        fromRef: input.fromRef,
        toKind: input.toKind,
        toRef: input.toRef,
        agentWorldId: input.agentWorldId ?? null,
        lineageOnly: true,
      },
    });
  }

  const countryIndexDefs = [
    { iso2: "IE", label: "Ireland" },
    { iso2: "GB", label: "United Kingdom" },
    { iso2: "DE", label: "Germany" },
  ];

  for (const country of countryIndexDefs) {
    await indexEntry({
      entityKind: "COUNTRY",
      entityRef: country.iso2,
      displayLabel: country.label,
      domainLayer: "KEYRA_BRIDGE",
    });
  }

  const parentDefs = [
    {
      parentAgentId: "ciright-sim-monitoring-parent",
      name: "SIM Monitoring Parent Agent",
      operationalCategory: "Network Integrity",
      industryVertical: "TELECOM" as const,
      description:
        "Parent orchestration for SIM activation monitoring, swap detection, and subscriber identity integrity.",
    },
    {
      parentAgentId: "ciright-population-reporting-parent",
      name: "Population Reporting Parent Agent",
      operationalCategory: "Civil Registry",
      industryVertical: "GOVERNMENT" as const,
      description:
        "Parent design for birth/death reporting, census aggregation, and national population intelligence.",
    },
    {
      parentAgentId: "ciright-aml-compliance-parent",
      name: "AML Compliance Parent Agent",
      operationalCategory: "Financial Crime",
      industryVertical: "BANKING" as const,
      description:
        "Parent orchestration for AML review workflows, suspicious activity escalation, and regulatory reporting.",
    },
    {
      parentAgentId: "ciright-admissions-intelligence-parent",
      name: "Admissions Intelligence Parent Agent",
      operationalCategory: "Enrollment",
      industryVertical: "UNIVERSITY" as const,
      description:
        "Parent design for application monitoring, transcript verification, and provost intelligence dashboards.",
    },
  ];

  const parentBySlug = new Map<string, { id: string; parentAgentId: string; name: string }>();

  for (const [i, p] of parentDefs.entries()) {
    const created = await prisma.cirightParentAgent.create({
      data: {
        parentAgentId: p.parentAgentId,
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        operationalCategory: p.operationalCategory,
        industryVertical: p.industryVertical,
        isPublished: true,
        sortOrder: i,
      },
    });
    parentBySlug.set(created.slug, {
      id: created.id,
      parentAgentId: created.parentAgentId,
      name: created.name,
    });

    await indexEntry({
      entityKind: "PARENT_AGENT",
      entityRef: created.parentAgentId,
      displayLabel: created.name,
      domainLayer: "CIRIGHT_PARENT",
      metadata: { operationalCategory: p.operationalCategory },
    });
  }

  const packDefs = [
    {
      packId: "kp-telecom-intelligence",
      name: "Telecom Intelligence Pack",
      packCategory: "Telecom Intelligence Pack",
      industryVertical: "TELECOM" as const,
    },
    {
      packId: "kp-banking-compliance",
      name: "Banking Compliance Pack",
      packCategory: "Banking Compliance Pack",
      industryVertical: "BANKING" as const,
    },
    {
      packId: "kp-population-statistics",
      name: "Population Statistics Pack",
      packCategory: "Population Statistics Pack",
      industryVertical: "GOVERNMENT" as const,
    },
    {
      packId: "kp-university-admissions",
      name: "University Admissions Pack",
      packCategory: "University Admissions Pack",
      industryVertical: "UNIVERSITY" as const,
    },
    {
      packId: "kp-regulatory-ie",
      name: "Ireland Regulatory Pack",
      packCategory: "Regulatory Pack",
      industryVertical: "REGULATORY" as const,
      countryIso2: "IE",
    },
  ];

  const packBySlug = new Map<string, { id: string; packId: string; name: string }>();
  for (const [i, k] of packDefs.entries()) {
    const created = await prisma.knowledgePack.create({
      data: {
        packId: k.packId,
        name: k.name,
        slug: slugify(k.name),
        description: `${k.name} — approved knowledge, workflows, and compliance guidance.`,
        packCategory: k.packCategory,
        industryVertical: k.industryVertical,
        countryIso2: k.countryIso2 ?? null,
        isPublished: true,
        sortOrder: i,
      },
    });
    packBySlug.set(created.slug, { id: created.id, packId: created.packId, name: created.name });

    await indexEntry({
      entityKind: "KNOWLEDGE_PACK",
      entityRef: created.packId,
      displayLabel: created.name,
      domainLayer: "KEYRA_BRIDGE",
    });
  }

  const keyraDefs = [
    {
      keyraAgentId: "keyra-vodafone-sim-integrity",
      parentSlug: slugify("SIM Monitoring Parent Agent"),
      name: "Vodafone SIM Integrity Agent",
      industryVertical: "TELECOM" as const,
      countryIso2s: ["IE", "GB"],
      deploymentClassification: "Telco Production",
      subscriptionPackage: "Carrier Integrity Standard",
    },
    {
      keyraAgentId: "keyra-ireland-population-reporting",
      parentSlug: slugify("Population Reporting Parent Agent"),
      name: "Ireland Population Reporting Agent",
      industryVertical: "GOVERNMENT" as const,
      countryIso2s: ["IE"],
      deploymentClassification: "Government Sovereign",
      subscriptionPackage: "National Statistics",
    },
    {
      keyraAgentId: "keyra-trinity-admissions",
      parentSlug: slugify("Admissions Intelligence Parent Agent"),
      name: "Trinity Admissions Agent",
      industryVertical: "UNIVERSITY" as const,
      countryIso2s: ["IE"],
      deploymentClassification: "University Enrollment",
      subscriptionPackage: "Admissions Intelligence",
    },
    {
      keyraAgentId: "keyra-aml-review",
      parentSlug: slugify("AML Compliance Parent Agent"),
      name: "AML Review Agent",
      industryVertical: "BANKING" as const,
      countryIso2s: ["IE", "GB", "DE"],
      deploymentClassification: "Banking Compliance",
      subscriptionPackage: "Financial Crime Standard",
    },
    {
      keyraAgentId: "keyra-retail-banking-pilot",
      parentSlug: slugify("AML Compliance Parent Agent"),
      name: "Retail Banking Pilot Agent",
      industryVertical: "BANKING" as const,
      countryIso2s: ["IE"],
      deploymentClassification: "Banking Pilot",
      subscriptionPackage: "Financial Crime Pilot",
      deploymentReadiness: "PENDING_APPROVAL" as const,
      isMarketplaceApproved: false,
    },
  ];

  const keyraBySlug = new Map<string, { id: string; keyraAgentId: string; name: string }>();

  for (const [i, k] of keyraDefs.entries()) {
    const parentRecord = await prisma.cirightParentAgent.findUnique({ where: { slug: k.parentSlug } });
    if (!parentRecord) throw new Error(`Missing parent slug: ${k.parentSlug}`);

    const readiness = "deploymentReadiness" in k ? k.deploymentReadiness : "MARKETPLACE_READY";
    const marketplaceApproved = "isMarketplaceApproved" in k ? k.isMarketplaceApproved : true;

    const created = await prisma.keyraDeploymentAgent.create({
      data: {
        keyraAgentId: k.keyraAgentId,
        parentAgentId: parentRecord.id,
        name: k.name,
        slug: slugify(k.name),
        description: `${k.name} — Keyra deployment bridge inheriting trusted Ciright orchestration.`,
        industryVertical: k.industryVertical,
        deploymentClassification: k.deploymentClassification,
        subscriptionPackage: k.subscriptionPackage,
        countryIso2s: k.countryIso2s,
        deploymentReadiness: readiness,
        isMarketplaceApproved: marketplaceApproved,
        sortOrder: i,
      },
    });
    keyraBySlug.set(created.slug, {
      id: created.id,
      keyraAgentId: created.keyraAgentId,
      name: created.name,
    });

    await indexEntry({
      entityKind: "KEYRA_AGENT",
      entityRef: created.keyraAgentId,
      displayLabel: created.name,
      domainLayer: "KEYRA_BRIDGE",
      metadata: { parentAgentId: parentRecord.parentAgentId },
    });

    await graphEdge({
      relation: "INHERITS_FROM",
      fromKind: "KEYRA_AGENT",
      fromRef: created.keyraAgentId,
      toKind: "PARENT_AGENT",
      toRef: parentRecord.parentAgentId,
    });
  }

  const worldDefs = [
    {
      worldId: "world-vodafone-ie",
      name: "Vodafone Ireland World",
      worldType: "TELCO" as const,
      industryVertical: "TELECOM" as const,
      countryIso2: "IE",
      organizationName: "Vodafone Ireland",
      sovereignRegion: "EU-West",
      dataResidencyRule: "IE-only operational data",
    },
    {
      worldId: "world-ireland-population",
      name: "Ireland Population World",
      worldType: "GOVERNMENT" as const,
      industryVertical: "GOVERNMENT" as const,
      countryIso2: "IE",
      organizationName: "Central Statistics Office",
      sovereignRegion: "EU-West",
      dataResidencyRule: "Irish sovereign boundary",
    },
    {
      worldId: "world-trinity-admissions",
      name: "Trinity College Admissions World",
      worldType: "UNIVERSITY" as const,
      industryVertical: "UNIVERSITY" as const,
      countryIso2: "IE",
      organizationName: "Trinity College Dublin",
      sovereignRegion: "EU-West",
      dataResidencyRule: "Campus sovereign environment",
    },
    {
      worldId: "world-aml-banking-ie",
      name: "Ireland Banking Compliance World",
      worldType: "BANKING" as const,
      industryVertical: "BANKING" as const,
      countryIso2: "IE",
      organizationName: "National Banking Consortium",
      sovereignRegion: "EU-West",
      dataResidencyRule: "Financial regulatory boundary",
    },
  ];

  const worldBySlug = new Map<string, { id: string; worldId: string; name: string }>();

  for (const [i, w] of worldDefs.entries()) {
    const created = await prisma.agentWorld.create({
      data: {
        worldId: w.worldId,
        name: w.name,
        slug: slugify(w.name),
        description: `${w.name} — sovereign operational environment with governed digital workers.`,
        worldType: w.worldType,
        industryVertical: w.industryVertical,
        countryIso2: w.countryIso2,
        organizationName: w.organizationName,
        sovereignRegion: w.sovereignRegion,
        dataResidencyRule: w.dataResidencyRule,
        status: "ACTIVE",
        isActive: true,
        sortOrder: i,
      },
    });
    worldBySlug.set(created.slug, { id: created.id, worldId: created.worldId, name: created.name });

    await indexEntry({
      entityKind: "TENANT_WORLD",
      entityRef: created.worldId,
      displayLabel: created.name,
      domainLayer: "MARKETPLACE",
      agentWorldId: created.id,
    });

    await graphEdge({
      relation: "REGULATED_BY",
      fromKind: "TENANT_WORLD",
      fromRef: created.worldId,
      toKind: "COUNTRY",
      toRef: w.countryIso2,
      agentWorldId: created.id,
    });
  }

  const instanceDefs = [
    {
      instanceId: "tenant-vodafone-sim-prod-ie",
      keyraSlug: slugify("Vodafone SIM Integrity Agent"),
      worldSlug: slugify("Vodafone Ireland World"),
      displayName: "Vodafone Ireland Production Agent",
    },
    {
      instanceId: "tenant-ie-population-prod",
      keyraSlug: slugify("Ireland Population Reporting Agent"),
      worldSlug: slugify("Ireland Population World"),
      displayName: "CSO Daily Reporting Agent",
    },
    {
      instanceId: "tenant-trinity-admissions-prod",
      keyraSlug: slugify("Trinity Admissions Agent"),
      worldSlug: slugify("Trinity College Admissions World"),
      displayName: "Trinity Admissions Production Agent",
    },
    {
      instanceId: "tenant-aml-banking-prod-ie",
      keyraSlug: slugify("AML Review Agent"),
      worldSlug: slugify("Ireland Banking Compliance World"),
      displayName: "AML Review Production Agent",
    },
  ];

  for (const [i, inst] of instanceDefs.entries()) {
    const keyra = await prisma.keyraDeploymentAgent.findUnique({ where: { slug: inst.keyraSlug } });
    const world = await prisma.agentWorld.findUnique({ where: { slug: inst.worldSlug } });
    if (!keyra || !world) throw new Error(`Missing keyra/world for instance ${inst.instanceId}`);

    const created = await prisma.tenantAgentInstance.create({
      data: {
        instanceId: inst.instanceId,
        keyraAgentId: keyra.id,
        agentWorldId: world.id,
        displayName: inst.displayName,
        description: "Tenant operational instance — data remains inside sovereign world boundary.",
        status: "ACTIVE",
        deployedAt: new Date(),
        activatedAt: new Date(),
        sortOrder: i,
        lineageJson: {
          parentAgentId: keyra.parentAgentId,
          keyraAgentId: keyra.keyraAgentId,
          worldId: world.worldId,
        },
      },
    });

    await indexEntry({
      entityKind: "TENANT_AGENT",
      entityRef: created.instanceId,
      displayLabel: created.displayName,
      domainLayer: "MARKETPLACE",
      agentWorldId: world.id,
    });

    await graphEdge({
      relation: "DEPLOYED_TO",
      fromKind: "TENANT_AGENT",
      fromRef: created.instanceId,
      toKind: "TENANT_WORLD",
      toRef: world.worldId,
      agentWorldId: world.id,
    });

    await graphEdge({
      relation: "INHERITS_FROM",
      fromKind: "TENANT_AGENT",
      fromRef: created.instanceId,
      toKind: "KEYRA_AGENT",
      toRef: keyra.keyraAgentId,
      agentWorldId: world.id,
    });
  }

  const telecomPack = await prisma.knowledgePack.findUnique({
    where: { slug: slugify("Telecom Intelligence Pack") },
  });
  const populationPack = await prisma.knowledgePack.findUnique({
    where: { slug: slugify("Population Statistics Pack") },
  });
  const admissionsPack = await prisma.knowledgePack.findUnique({
    where: { slug: slugify("University Admissions Pack") },
  });
  const vodafoneWorld = await prisma.agentWorld.findUnique({
    where: { slug: slugify("Vodafone Ireland World") },
  });
  const ieWorld = await prisma.agentWorld.findUnique({
    where: { slug: slugify("Ireland Population World") },
  });
  const trinityWorld = await prisma.agentWorld.findUnique({
    where: { slug: slugify("Trinity College Admissions World") },
  });

  const bankingPack = await prisma.knowledgePack.findUnique({
    where: { slug: slugify("Banking Compliance Pack") },
  });
  const regulatoryPack = await prisma.knowledgePack.findUnique({
    where: { slug: slugify("Ireland Regulatory Pack") },
  });
  const vodafoneKeyra = await prisma.keyraDeploymentAgent.findUnique({
    where: { slug: slugify("Vodafone SIM Integrity Agent") },
  });
  const populationKeyra = await prisma.keyraDeploymentAgent.findUnique({
    where: { slug: slugify("Ireland Population Reporting Agent") },
  });
  const admissionsKeyra = await prisma.keyraDeploymentAgent.findUnique({
    where: { slug: slugify("Trinity Admissions Agent") },
  });
  const amlKeyra = await prisma.keyraDeploymentAgent.findUnique({
    where: { slug: slugify("AML Review Agent") },
  });
  const bankingWorld = await prisma.agentWorld.findUnique({
    where: { slug: slugify("Ireland Banking Compliance World") },
  });

  if (telecomPack && vodafoneWorld) {
    await prisma.agentWorldKnowledgePack.create({
      data: { agentWorldId: vodafoneWorld.id, knowledgePackId: telecomPack.id, attachedBy: "seed" },
    });
    await graphEdge({
      relation: "ATTACHED_TO",
      fromKind: "KNOWLEDGE_PACK",
      fromRef: telecomPack.packId,
      toKind: "TENANT_WORLD",
      toRef: vodafoneWorld.worldId,
      agentWorldId: vodafoneWorld.id,
    });
  }

  if (populationPack && ieWorld) {
    await prisma.agentWorldKnowledgePack.create({
      data: { agentWorldId: ieWorld.id, knowledgePackId: populationPack.id, attachedBy: "seed" },
    });
  }

  if (admissionsPack && trinityWorld) {
    await prisma.agentWorldKnowledgePack.create({
      data: { agentWorldId: trinityWorld.id, knowledgePackId: admissionsPack.id, attachedBy: "seed" },
    });
  }

  if (bankingPack && bankingWorld) {
    await prisma.agentWorldKnowledgePack.create({
      data: { agentWorldId: bankingWorld.id, knowledgePackId: bankingPack.id, attachedBy: "seed" },
    });
    if (regulatoryPack) {
      await prisma.agentWorldKnowledgePack.create({
        data: { agentWorldId: bankingWorld.id, knowledgePackId: regulatoryPack.id, attachedBy: "seed" },
      });
    }
  }

  const keyraPackLinks: Array<{ keyra: typeof vodafoneKeyra; pack: typeof telecomPack }> = [
    { keyra: vodafoneKeyra, pack: telecomPack },
    { keyra: populationKeyra, pack: populationPack },
    { keyra: admissionsKeyra, pack: admissionsPack },
    { keyra: amlKeyra, pack: bankingPack },
  ];

  for (const link of keyraPackLinks) {
    if (!link.keyra || !link.pack) continue;
    await prisma.keyraAgentKnowledgePack.create({
      data: { keyraAgentId: link.keyra.id, knowledgePackId: link.pack.id },
    });
    await graphEdge({
      relation: "ATTACHED_TO",
      fromKind: "KNOWLEDGE_PACK",
      fromRef: link.pack.packId,
      toKind: "KEYRA_AGENT",
      toRef: link.keyra.keyraAgentId,
    });
  }

  if (vodafoneWorld) {
    await prisma.agentWorldIntegration.create({
      data: {
        integrationId: "int-vodafone-hlr-ie",
        agentWorldId: vodafoneWorld.id,
        name: "HLR Subscriber API",
        integrationType: "telco_hlr",
        status: "ACTIVE",
      },
    });
  }

  if (bankingWorld) {
    await prisma.agentWorldIntegration.create({
      data: {
        integrationId: "int-banking-swift-ie",
        agentWorldId: bankingWorld.id,
        name: "SWIFT Compliance Feed",
        integrationType: "banking_swift",
        status: "ACTIVE",
      },
    });
  }

  await prisma.agentDeploymentEvent.createMany({
    data: [
      {
        eventType: "parent_agent.published",
        domainLayer: "CIRIGHT_PARENT",
        entityKind: "PARENT_AGENT",
        entityId: "ciright-sim-monitoring-parent",
        status: "APPROVED",
      },
      {
        eventType: "parent_agent.published",
        domainLayer: "CIRIGHT_PARENT",
        entityKind: "PARENT_AGENT",
        entityId: "ciright-aml-compliance-parent",
        status: "APPROVED",
      },
      {
        eventType: "marketplace.approved",
        domainLayer: "KEYRA_BRIDGE",
        entityKind: "KEYRA_AGENT",
        entityId: "keyra-vodafone-sim-integrity",
        status: "MARKETPLACE_READY",
      },
      {
        eventType: "marketplace.approved",
        domainLayer: "KEYRA_BRIDGE",
        entityKind: "KEYRA_AGENT",
        entityId: "keyra-aml-review",
        status: "MARKETPLACE_READY",
      },
      {
        eventType: "marketplace.pending",
        domainLayer: "KEYRA_BRIDGE",
        entityKind: "KEYRA_AGENT",
        entityId: "keyra-retail-banking-pilot",
        status: "PENDING_APPROVAL",
      },
      {
        eventType: "world.activated",
        domainLayer: "MARKETPLACE",
        entityKind: "TENANT_WORLD",
        entityId: "world-vodafone-ie",
        agentWorldId: vodafoneWorld?.id,
        status: "ACTIVE",
      },
      {
        eventType: "world.activated",
        domainLayer: "MARKETPLACE",
        entityKind: "TENANT_WORLD",
        entityId: "world-aml-banking-ie",
        agentWorldId: bankingWorld?.id,
        status: "ACTIVE",
      },
      {
        eventType: "tenant_instance.deployed",
        domainLayer: "MARKETPLACE",
        entityKind: "TENANT_AGENT",
        entityId: "tenant-vodafone-sim-prod-ie",
        agentWorldId: vodafoneWorld?.id,
        status: "ACTIVE",
      },
      {
        eventType: "knowledge_pack.attached",
        domainLayer: "MARKETPLACE",
        entityKind: "KNOWLEDGE_PACK",
        entityId: "kp-telecom-intelligence",
        agentWorldId: vodafoneWorld?.id,
        status: "ACTIVE",
      },
      {
        eventType: "graph.edge.indexed",
        domainLayer: "KEYRA_BRIDGE",
        entityKind: "KEYRA_AGENT",
        entityId: "keyra-vodafone-sim-integrity",
        status: "ACTIVE",
      },
    ],
  });

  console.info("[seedAgentWorld] Agent world catalog seeded.");

  return {
    skipped: false,
    parentAgents: await prisma.cirightParentAgent.count(),
    keyraAgents: await prisma.keyraDeploymentAgent.count(),
    agentWorlds: await prisma.agentWorld.count(),
    knowledgePacks: await prisma.knowledgePack.count(),
    tenantInstances: await prisma.tenantAgentInstance.count(),
    graphEdges: await prisma.operationalGraphEdge.count(),
    indexEntries: await prisma.intrinsicIndexEntry.count(),
    deploymentEvents: await prisma.agentDeploymentEvent.count(),
    integrations: await prisma.agentWorldIntegration.count(),
  };
}
