-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "scopeJson" JSON,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "continentCode" TEXT NOT NULL,
    "subregionCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mapKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CountryDeployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "flagAssetKey" TEXT NOT NULL,
    "population" INTEGER,
    "populationDisplay" TEXT,
    "countrySubdomain" TEXT NOT NULL,
    "officialReferenceDomain" TEXT,
    "status" TEXT NOT NULL,
    "statusNote" TEXT,
    "sourceLabel" TEXT,
    "sourceUrl" TEXT,
    "sourceVerifiedAt" DATETIME,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CountryDeployment_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TelcoDeployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subscribers" INTEGER,
    "subscribersDisplay" TEXT,
    "telcoSubdomain" TEXT NOT NULL,
    "officialDomain" TEXT,
    "status" TEXT NOT NULL,
    "statusNote" TEXT,
    "sourceLabel" TEXT,
    "sourceUrl" TEXT,
    "sourceVerifiedAt" DATETIME,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TelcoDeployment_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryDeployment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServerNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "fqdn" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "healthcheckUrl" TEXT,
    "status" TEXT NOT NULL,
    "lastHeartbeatAt" DATETIME,
    "metadataJson" JSON,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AccessDomainRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "allowedEmailDomain" TEXT NOT NULL,
    "verificationMethod" TEXT NOT NULL DEFAULT 'EMAIL_OTP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServerAccessRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "employeeType" TEXT NOT NULL DEFAULT 'TYPE_1',
    "requestReason" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationTokenHash" TEXT,
    "verificationExpiresAt" DATETIME,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectedBy" TEXT,
    "rejectedAt" DATETIME,
    "rejectionReason" TEXT,
    "auditRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "previousStatus" TEXT,
    "nextStatus" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "actorRole" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payloadJson" JSON,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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

