-- Authentication feed: admin-configured demo data + server-side session batches for keyra.ie

CREATE TABLE "AuthenticationCountry" (
    "id" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "iso2" VARCHAR(2) NOT NULL,
    "region" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "percentageWeight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "displayPriority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthenticationCountry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthenticationCountry_iso2_key" ON "AuthenticationCountry"("iso2");
CREATE INDEX "AuthenticationCountry_active_region_idx" ON "AuthenticationCountry"("active", "region");
CREATE INDEX "AuthenticationCountry_displayPriority_idx" ON "AuthenticationCountry"("displayPriority");

CREATE TABLE "SatProtocol" (
    "id" TEXT NOT NULL,
    "protocolName" TEXT NOT NULL,
    "protocolCode" TEXT NOT NULL,
    "protocolCategory" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "percentageWeight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "protocolMemo" TEXT NOT NULL DEFAULT '',
    "protocolUrlEnabled" BOOLEAN NOT NULL DEFAULT false,
    "protocolUrl" TEXT,
    "allowProtocolLink" BOOLEAN NOT NULL DEFAULT false,
    "homePercentage" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "roamingPercentage" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SatProtocol_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SatProtocol_protocolCode_key" ON "SatProtocol"("protocolCode");
CREATE INDEX "SatProtocol_active_idx" ON "SatProtocol"("active");

CREATE TABLE "AuthenticationFeedSetting" (
    "id" TEXT NOT NULL,
    "feedEnabled" BOOLEAN NOT NULL DEFAULT true,
    "initialRecordsCount" INTEGER NOT NULL DEFAULT 50,
    "batchSize" INTEGER NOT NULL DEFAULT 50,
    "fetchThreshold" INTEGER NOT NULL DEFAULT 30,
    "sessionUniquenessLimit" INTEGER NOT NULL DEFAULT 2000,
    "maskingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "obfuscationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxRecordsPerSession" INTEGER NOT NULL DEFAULT 50000,
    "animationSpeedMs" INTEGER NOT NULL DEFAULT 400,
    "refreshBehavior" TEXT NOT NULL DEFAULT 'append',
    "defaultRegionWeightPreset" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthenticationFeedSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthenticationFeedSession" (
    "id" TEXT NOT NULL,
    "sessionUuid" TEXT NOT NULL,
    "userFingerprintHash" TEXT,
    "renderedCount" INTEGER NOT NULL DEFAULT 0,
    "uniquenessEpoch" INTEGER NOT NULL DEFAULT 0,
    "pairsUsedJson" JSONB NOT NULL DEFAULT '[]',
    "rngNonce" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthenticationFeedSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthenticationFeedSession_sessionUuid_key" ON "AuthenticationFeedSession"("sessionUuid");
CREATE INDEX "AuthenticationFeedSession_expiresAt_idx" ON "AuthenticationFeedSession"("expiresAt");

INSERT INTO "AuthenticationFeedSetting" ("id", "feedEnabled", "initialRecordsCount", "batchSize", "fetchThreshold", "sessionUniquenessLimit", "maskingEnabled", "obfuscationEnabled", "maxRecordsPerSession", "animationSpeedMs", "refreshBehavior", "createdAt", "updatedAt")
VALUES ('default', true, 50, 50, 30, 2000, true, false, 50000, 400, 'append', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
