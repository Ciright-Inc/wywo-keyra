-- Global Agent World Architecture

CREATE TYPE "AgentDomainLayer" AS ENUM ('CIRIGHT_PARENT', 'KEYRA_BRIDGE', 'MARKETPLACE');
CREATE TYPE "AgentWorldType" AS ENUM ('TELCO', 'GOVERNMENT', 'UNIVERSITY', 'BANKING', 'ENTERPRISE', 'HEALTHCARE');
CREATE TYPE "AgentOperationalStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'MARKETPLACE_READY', 'SUBSCRIBED', 'DEPLOYING', 'ACTIVE', 'SUSPENDED', 'REVOKED');
CREATE TYPE "AgentIndustryVertical" AS ENUM ('TELECOM', 'GOVERNMENT', 'BANKING', 'UNIVERSITY', 'HEALTHCARE', 'ENTERPRISE', 'INFRASTRUCTURE', 'REGULATORY');
CREATE TYPE "IntrinsicIndexEntityKind" AS ENUM ('PERSON', 'IDENTITY', 'DEVICE', 'SIM', 'SUBSCRIBER', 'AGENT', 'TASK', 'ORGANIZATION', 'TENANT_WORLD', 'COUNTRY', 'REGULATORY_BOUNDARY', 'KNOWLEDGE_PACK', 'INTEGRATION', 'PARENT_AGENT', 'KEYRA_AGENT', 'TENANT_AGENT');
CREATE TYPE "OperationalGraphRelation" AS ENUM ('INHERITS_FROM', 'DEPLOYED_TO', 'ATTACHED_TO', 'CONNECTED_TO', 'GOVERNS', 'EXECUTES', 'AUDITS', 'CONTAINS', 'BELONGS_TO', 'REGULATED_BY');

CREATE TABLE "CirightParentAgent" (
    "id" TEXT NOT NULL,
    "parentAgentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "operationalCategory" TEXT NOT NULL,
    "industryVertical" "AgentIndustryVertical" NOT NULL,
    "workflowDefinitionJson" JSONB,
    "orchestrationLogicJson" JSONB,
    "policyEngineJson" JSONB,
    "permissionStructureJson" JSONB,
    "executionTemplateJson" JSONB,
    "deploymentStandardJson" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CirightParentAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KeyraDeploymentAgent" (
    "id" TEXT NOT NULL,
    "keyraAgentId" TEXT NOT NULL,
    "parentAgentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domainLayer" "AgentDomainLayer" NOT NULL DEFAULT 'KEYRA_BRIDGE',
    "industryVertical" "AgentIndustryVertical" NOT NULL,
    "deploymentClassification" TEXT,
    "subscriptionPackage" TEXT,
    "countryIso2s" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deploymentReadiness" "AgentOperationalStatus" NOT NULL DEFAULT 'DRAFT',
    "isMarketplaceApproved" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KeyraDeploymentAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentWorld" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "worldType" "AgentWorldType" NOT NULL,
    "industryVertical" "AgentIndustryVertical" NOT NULL,
    "countryIso2" TEXT,
    "organizationName" TEXT,
    "sovereignRegion" TEXT,
    "dataResidencyRule" TEXT,
    "complianceControlsJson" JSONB,
    "governanceStructureJson" JSONB,
    "operationalRulesJson" JSONB,
    "regionalBoundariesJson" JSONB,
    "status" "AgentOperationalStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "countryDeploymentId" TEXT,
    "telcoDeploymentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgentWorld_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TenantAgentInstance" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "keyraAgentId" TEXT NOT NULL,
    "agentWorldId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "status" "AgentOperationalStatus" NOT NULL DEFAULT 'DEPLOYING',
    "permissionsJson" JSONB,
    "lineageJson" JSONB,
    "deployedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TenantAgentInstance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgePack" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "packCategory" TEXT NOT NULL,
    "industryVertical" "AgentIndustryVertical",
    "countryIso2" TEXT,
    "approvedKnowledgeJson" JSONB,
    "workflowStructuresJson" JSONB,
    "promptStructuresJson" JSONB,
    "operationalRulesJson" JSONB,
    "integrationMappingsJson" JSONB,
    "complianceGuidanceJson" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgePack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentWorldKnowledgePack" (
    "id" TEXT NOT NULL,
    "agentWorldId" TEXT NOT NULL,
    "knowledgePackId" TEXT NOT NULL,
    "attachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachedBy" TEXT,
    CONSTRAINT "AgentWorldKnowledgePack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KeyraAgentKnowledgePack" (
    "id" TEXT NOT NULL,
    "keyraAgentId" TEXT NOT NULL,
    "knowledgePackId" TEXT NOT NULL,
    "attachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KeyraAgentKnowledgePack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentWorldIntegration" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "agentWorldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "integrationType" TEXT NOT NULL,
    "endpointUrl" TEXT,
    "status" "AgentOperationalStatus" NOT NULL DEFAULT 'DRAFT',
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgentWorldIntegration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentOperationalTask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "tenantAgentInstanceId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lineageRef" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentOperationalTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntrinsicIndexEntry" (
    "id" TEXT NOT NULL,
    "entityKind" "IntrinsicIndexEntityKind" NOT NULL,
    "entityRef" TEXT NOT NULL,
    "displayLabel" TEXT NOT NULL,
    "domainLayer" "AgentDomainLayer",
    "lineageOnly" BOOLEAN NOT NULL DEFAULT true,
    "agentWorldId" TEXT,
    "metadataJson" JSONB,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntrinsicIndexEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalGraphEdge" (
    "id" TEXT NOT NULL,
    "relation" "OperationalGraphRelation" NOT NULL,
    "fromKind" "IntrinsicIndexEntityKind" NOT NULL,
    "fromRef" TEXT NOT NULL,
    "toKind" "IntrinsicIndexEntityKind" NOT NULL,
    "toRef" TEXT NOT NULL,
    "agentWorldId" TEXT,
    "lineageOnly" BOOLEAN NOT NULL DEFAULT true,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperationalGraphEdge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentDeploymentEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "domainLayer" "AgentDomainLayer" NOT NULL,
    "entityKind" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "agentWorldId" TEXT,
    "status" "AgentOperationalStatus",
    "payloadJson" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentDeploymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CirightParentAgent_parentAgentId_key" ON "CirightParentAgent"("parentAgentId");
CREATE UNIQUE INDEX "CirightParentAgent_slug_key" ON "CirightParentAgent"("slug");
CREATE INDEX "CirightParentAgent_industryVertical_idx" ON "CirightParentAgent"("industryVertical");
CREATE INDEX "CirightParentAgent_operationalCategory_idx" ON "CirightParentAgent"("operationalCategory");

CREATE UNIQUE INDEX "KeyraDeploymentAgent_keyraAgentId_key" ON "KeyraDeploymentAgent"("keyraAgentId");
CREATE UNIQUE INDEX "KeyraDeploymentAgent_slug_key" ON "KeyraDeploymentAgent"("slug");
CREATE INDEX "KeyraDeploymentAgent_parentAgentId_idx" ON "KeyraDeploymentAgent"("parentAgentId");
CREATE INDEX "KeyraDeploymentAgent_industryVertical_idx" ON "KeyraDeploymentAgent"("industryVertical");
CREATE INDEX "KeyraDeploymentAgent_deploymentReadiness_idx" ON "KeyraDeploymentAgent"("deploymentReadiness");

CREATE UNIQUE INDEX "AgentWorld_worldId_key" ON "AgentWorld"("worldId");
CREATE UNIQUE INDEX "AgentWorld_slug_key" ON "AgentWorld"("slug");
CREATE INDEX "AgentWorld_worldType_idx" ON "AgentWorld"("worldType");
CREATE INDEX "AgentWorld_industryVertical_idx" ON "AgentWorld"("industryVertical");
CREATE INDEX "AgentWorld_countryIso2_idx" ON "AgentWorld"("countryIso2");
CREATE INDEX "AgentWorld_status_idx" ON "AgentWorld"("status");

CREATE UNIQUE INDEX "TenantAgentInstance_instanceId_key" ON "TenantAgentInstance"("instanceId");
CREATE INDEX "TenantAgentInstance_keyraAgentId_idx" ON "TenantAgentInstance"("keyraAgentId");
CREATE INDEX "TenantAgentInstance_agentWorldId_idx" ON "TenantAgentInstance"("agentWorldId");
CREATE INDEX "TenantAgentInstance_status_idx" ON "TenantAgentInstance"("status");

CREATE UNIQUE INDEX "KnowledgePack_packId_key" ON "KnowledgePack"("packId");
CREATE UNIQUE INDEX "KnowledgePack_slug_key" ON "KnowledgePack"("slug");
CREATE INDEX "KnowledgePack_packCategory_idx" ON "KnowledgePack"("packCategory");
CREATE INDEX "KnowledgePack_industryVertical_idx" ON "KnowledgePack"("industryVertical");

CREATE UNIQUE INDEX "AgentWorldKnowledgePack_agentWorldId_knowledgePackId_key" ON "AgentWorldKnowledgePack"("agentWorldId", "knowledgePackId");
CREATE UNIQUE INDEX "KeyraAgentKnowledgePack_keyraAgentId_knowledgePackId_key" ON "KeyraAgentKnowledgePack"("keyraAgentId", "knowledgePackId");

CREATE UNIQUE INDEX "AgentWorldIntegration_integrationId_key" ON "AgentWorldIntegration"("integrationId");
CREATE INDEX "AgentWorldIntegration_agentWorldId_idx" ON "AgentWorldIntegration"("agentWorldId");

CREATE UNIQUE INDEX "AgentOperationalTask_taskId_key" ON "AgentOperationalTask"("taskId");
CREATE INDEX "AgentOperationalTask_tenantAgentInstanceId_idx" ON "AgentOperationalTask"("tenantAgentInstanceId");
CREATE INDEX "AgentOperationalTask_status_idx" ON "AgentOperationalTask"("status");

CREATE UNIQUE INDEX "IntrinsicIndexEntry_entityKind_entityRef_key" ON "IntrinsicIndexEntry"("entityKind", "entityRef");
CREATE INDEX "IntrinsicIndexEntry_entityKind_idx" ON "IntrinsicIndexEntry"("entityKind");
CREATE INDEX "IntrinsicIndexEntry_domainLayer_idx" ON "IntrinsicIndexEntry"("domainLayer");
CREATE INDEX "IntrinsicIndexEntry_agentWorldId_idx" ON "IntrinsicIndexEntry"("agentWorldId");

CREATE INDEX "OperationalGraphEdge_fromKind_fromRef_idx" ON "OperationalGraphEdge"("fromKind", "fromRef");
CREATE INDEX "OperationalGraphEdge_toKind_toRef_idx" ON "OperationalGraphEdge"("toKind", "toRef");
CREATE INDEX "OperationalGraphEdge_agentWorldId_idx" ON "OperationalGraphEdge"("agentWorldId");
CREATE INDEX "OperationalGraphEdge_relation_idx" ON "OperationalGraphEdge"("relation");

CREATE INDEX "AgentDeploymentEvent_eventType_idx" ON "AgentDeploymentEvent"("eventType");
CREATE INDEX "AgentDeploymentEvent_agentWorldId_idx" ON "AgentDeploymentEvent"("agentWorldId");
CREATE INDEX "AgentDeploymentEvent_domainLayer_idx" ON "AgentDeploymentEvent"("domainLayer");
CREATE INDEX "AgentDeploymentEvent_createdAt_idx" ON "AgentDeploymentEvent"("createdAt");

ALTER TABLE "KeyraDeploymentAgent" ADD CONSTRAINT "KeyraDeploymentAgent_parentAgentId_fkey" FOREIGN KEY ("parentAgentId") REFERENCES "CirightParentAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TenantAgentInstance" ADD CONSTRAINT "TenantAgentInstance_keyraAgentId_fkey" FOREIGN KEY ("keyraAgentId") REFERENCES "KeyraDeploymentAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TenantAgentInstance" ADD CONSTRAINT "TenantAgentInstance_agentWorldId_fkey" FOREIGN KEY ("agentWorldId") REFERENCES "AgentWorld"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentWorldKnowledgePack" ADD CONSTRAINT "AgentWorldKnowledgePack_agentWorldId_fkey" FOREIGN KEY ("agentWorldId") REFERENCES "AgentWorld"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentWorldKnowledgePack" ADD CONSTRAINT "AgentWorldKnowledgePack_knowledgePackId_fkey" FOREIGN KEY ("knowledgePackId") REFERENCES "KnowledgePack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KeyraAgentKnowledgePack" ADD CONSTRAINT "KeyraAgentKnowledgePack_keyraAgentId_fkey" FOREIGN KEY ("keyraAgentId") REFERENCES "KeyraDeploymentAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KeyraAgentKnowledgePack" ADD CONSTRAINT "KeyraAgentKnowledgePack_knowledgePackId_fkey" FOREIGN KEY ("knowledgePackId") REFERENCES "KnowledgePack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentWorldIntegration" ADD CONSTRAINT "AgentWorldIntegration_agentWorldId_fkey" FOREIGN KEY ("agentWorldId") REFERENCES "AgentWorld"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentOperationalTask" ADD CONSTRAINT "AgentOperationalTask_tenantAgentInstanceId_fkey" FOREIGN KEY ("tenantAgentInstanceId") REFERENCES "TenantAgentInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalGraphEdge" ADD CONSTRAINT "OperationalGraphEdge_agentWorldId_fkey" FOREIGN KEY ("agentWorldId") REFERENCES "AgentWorld"("id") ON DELETE SET NULL ON UPDATE CASCADE;
