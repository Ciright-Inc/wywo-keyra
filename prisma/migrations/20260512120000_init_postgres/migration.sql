-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('IDENTIFIED', 'INSTITUTIONAL_AWARENESS', 'TVIP', 'OPERATIONAL');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('COUNTRY', 'TELCO');

-- CreateEnum
CREATE TYPE "ServerEnvironment" AS ENUM ('PROD', 'STAGE', 'TEST');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('EMAIL_OTP', 'SSO', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('TYPE_1');

-- CreateEnum
CREATE TYPE "RequestVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "RequestApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StatusHistoryTargetType" AS ENUM ('REGION', 'COUNTRY', 'TELCO', 'SERVER_NODE');

-- CreateEnum
CREATE TYPE "DeploymentAdminRole" AS ENUM ('GLOBAL_ADMIN', 'REGIONAL_ADMIN', 'COUNTRY_ADMIN', 'TELCO_ADMIN', 'COMPLIANCE_REVIEWER', 'READ_ONLY');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "DeploymentAdminRole" NOT NULL,
    "scopeJson" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "continentCode" TEXT NOT NULL,
    "subregionCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mapKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryDeployment" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "flagAssetKey" TEXT NOT NULL,
    "population" INTEGER,
    "populationDisplay" TEXT,
    "countrySubdomain" TEXT NOT NULL,
    "officialReferenceDomain" TEXT,
    "status" "DeploymentStatus" NOT NULL,
    "statusNote" TEXT,
    "sourceLabel" TEXT,
    "sourceUrl" TEXT,
    "sourceVerifiedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelcoDeployment" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subscribers" INTEGER,
    "subscribersDisplay" TEXT,
    "telcoSubdomain" TEXT NOT NULL,
    "officialDomain" TEXT,
    "status" "DeploymentStatus" NOT NULL,
    "statusNote" TEXT,
    "sourceLabel" TEXT,
    "sourceUrl" TEXT,
    "sourceVerifiedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelcoDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerNode" (
    "id" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "fqdn" TEXT NOT NULL,
    "environment" "ServerEnvironment" NOT NULL,
    "healthcheckUrl" TEXT,
    "status" "DeploymentStatus" NOT NULL,
    "lastHeartbeatAt" TIMESTAMP(3),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessDomainRule" (
    "id" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "allowedEmailDomain" TEXT NOT NULL,
    "verificationMethod" "VerificationMethod" NOT NULL DEFAULT 'EMAIL_OTP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessDomainRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerAccessRequest" (
    "id" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "employeeType" "EmployeeType" NOT NULL DEFAULT 'TYPE_1',
    "requestReason" TEXT,
    "verificationStatus" "RequestVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationTokenHash" TEXT,
    "verificationExpiresAt" TIMESTAMP(3),
    "approvalStatus" "RequestApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "auditRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "targetType" "StatusHistoryTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "previousStatus" "DeploymentStatus",
    "nextStatus" "DeploymentStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE INDEX "CountryDeployment_regionId_idx" ON "CountryDeployment"("regionId");

-- CreateIndex
CREATE INDEX "CountryDeployment_iso2_idx" ON "CountryDeployment"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "CountryDeployment_countrySubdomain_key" ON "CountryDeployment"("countrySubdomain");

-- CreateIndex
CREATE INDEX "TelcoDeployment_countryId_idx" ON "TelcoDeployment"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "TelcoDeployment_countryId_slug_key" ON "TelcoDeployment"("countryId", "slug");

-- CreateIndex
CREATE INDEX "ServerNode_targetType_targetId_idx" ON "ServerNode"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AccessDomainRule_targetType_targetId_idx" ON "AccessDomainRule"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ServerAccessRequest_targetType_targetId_idx" ON "ServerAccessRequest"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ServerAccessRequest_workEmail_idx" ON "ServerAccessRequest"("workEmail");

-- CreateIndex
CREATE INDEX "StatusHistory_targetType_targetId_idx" ON "StatusHistory"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "CountryDeployment" ADD CONSTRAINT "CountryDeployment_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelcoDeployment" ADD CONSTRAINT "TelcoDeployment_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryDeployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

